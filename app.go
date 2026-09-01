package main

import (
	"context"
	"fmt"
	"sistema-andres-bello/backend/admin"
	"sistema-andres-bello/backend/auth"
	"sistema-andres-bello/backend/db"
	"sistema-andres-bello/backend/reportes"
	"strings"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/xuri/excelize/v2"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type App struct {
	ctx           context.Context
	dbConn        *gorm.DB
	adminSvc      *admin.Service
	usuarioActivo *db.Usuario
}

func NewApp(database *gorm.DB) *App {
	// CORRECCIÓN: Ya no necesitamos extraer sqlDB. Pasamos 'database' (*gorm.DB)
	// directamente al nuevo constructor del servicio de administración.
	return &App{
		dbConn:   database,
		adminSvc: admin.NewService(database),
	}
}

func (a *App) CheakAdminExists() (bool, error) {
	return admin.CheakAdmin(a.dbConn)
}

func (a *App) CreatefirstAdmin(nombre, password string) error {
	return admin.CreateAdmin(a.dbConn, nombre, password)
}

func (a *App) verificarRol(rolespermitidos ...string) error {
	if a.usuarioActivo == nil {
		return fmt.Errorf("sesión no iniciada")
	}
	for _, rol := range rolespermitidos {
		if a.usuarioActivo.Rol == rol {
			return nil
		}
	}
	return fmt.Errorf("acceso denegado: Permisos Insuficientes")
}

// SelectExcelFile abre un explorador de archivos nativo para seleccionar un Excel
func (a *App) SelectExcelFile() (string, error) {
	return runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Seleccionar archivo Excel de libros",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Archivos Excel",
				Pattern:     "*.xlsx;*.xls",
			},
		},
	})
}

func (a *App) ImportarLibrosExcel(filepath string) error {
	f, err := excelize.OpenFile(filepath)
	if err != nil {
		return fmt.Errorf("error al abrir el archivo Excel: %w", err)
	}
	defer f.Close()

	rows, err := f.GetRows(f.GetSheetName(0))
	if err != nil {
		return fmt.Errorf("error al leer las filas: %v", err)
	}

	if len(rows) <= 1 {
		return fmt.Errorf("el archivo excel está vacío o solo contiene la cabecera")
	}

	tx := a.dbConn.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Sincronizar las secuencias de PostgreSQL para evitar conflictos de llave primaria duplicada
	tx.Exec("SELECT setval(pg_get_serial_sequence('asignaturas', 'id'), COALESCE((SELECT MAX(id) FROM asignaturas), 1), true)")
	tx.Exec("SELECT setval(pg_get_serial_sequence('grados', 'id'), COALESCE((SELECT MAX(id) FROM grados), 1), true)")
	tx.Exec("SELECT setval(pg_get_serial_sequence('nivel_academicos', 'id'), COALESCE((SELECT MAX(id) FROM nivel_academicos), 1), true)")

	var errores []string

	for i, row := range rows {
		if i == 0 {
			continue // Omitir cabecera
		}
		if len(row) < 5 {
			errores = append(errores, fmt.Sprintf("Fila %d: Faltan columnas obligatorias (Título, Asignatura, Grado, Nivel, Cantidad)", i+1))
			continue
		}

		titulo := strings.TrimSpace(row[0])
		nombreAsignatura := strings.TrimSpace(row[1])
		nombreGrado := strings.TrimSpace(row[2])
		nombreNivel := strings.TrimSpace(row[3])

		var cantidad int
		if _, err := fmt.Sscanf(row[4], "%d", &cantidad); err != nil || cantidad < 0 {
			errores = append(errores, fmt.Sprintf("Fila %d (%s): Cantidad inválida '%s'", i+1, titulo, row[4]))
			continue
		}

		// 1. Buscar o crear la Asignatura usando FirstOrCreate
		var asignatura db.Asignatura
		if err := tx.Where("LOWER(nombre) = ?", strings.ToLower(nombreAsignatura)).
			FirstOrCreate(&asignatura, db.Asignatura{Nombre: nombreAsignatura}).Error; err != nil {
			errores = append(errores, fmt.Sprintf("Fila %d (%s): Error al procesar asignatura '%s' -> %v", i+1, titulo, nombreAsignatura, err))
			continue
		}

		// 2. Buscar o crear el Nivel Académico usando FirstOrCreate
		var nivel db.NivelAcademico
		if err := tx.Where("LOWER(nombre) = ?", strings.ToLower(nombreNivel)).
			FirstOrCreate(&nivel, db.NivelAcademico{Nombre: nombreNivel}).Error; err != nil {
			errores = append(errores, fmt.Sprintf("Fila %d (%s): Error al procesar nivel '%s' -> %v", i+1, titulo, nombreNivel, err))
			continue
		}

		// 3. Buscar o crear el Grado vinculado a su Nivel usando FirstOrCreate
		var grado db.Grado
		if err := tx.Where("LOWER(nombre) = ? AND nivel_id = ?", strings.ToLower(nombreGrado), nivel.Id).
			FirstOrCreate(&grado, db.Grado{
				Nombre:  nombreGrado,
				NivelID: uint(nivel.Id),
			}).Error; err != nil {
			errores = append(errores, fmt.Sprintf("Fila %d (%s): Error al procesar grado '%s' -> %v", i+1, titulo, nombreGrado, err))
			continue
		}

		// 4. Crear el libro relacionando los IDs correspondientes
		nuevoLibro := db.Libro{
			Titulo:       titulo,
			AsignaturaID: uint(asignatura.Id),
			GradoID:      uint(grado.Id),
			Cantidad:     cantidad,
		}

		if err := tx.Create(&nuevoLibro).Error; err != nil {
			errores = append(errores, fmt.Sprintf("Fila %d (%s): Error al guardar en BD -> %v", i+1, titulo, err))
			continue
		}
	}

	if len(errores) > 0 {
		tx.Rollback()
		return fmt.Errorf("la importación falló con los siguientes errores:\n- %s", strings.Join(errores, "\n- "))
	}

	return tx.Commit().Error
}

// -----------------------------------------------------------------------------
// CICLO DE VIDA Y VENTANA (Wails)
// -----------------------------------------------------------------------------

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) FinalizarLogin() {
	runtime.WindowSetSize(a.ctx, 1024, 768)
	runtime.WindowCenter(a.ctx)
}

func (a *App) CerrarSesion() {
	a.usuarioActivo = nil
	runtime.WindowSetSize(a.ctx, 800, 450)
	runtime.WindowCenter(a.ctx)
}

// -----------------------------------------------------------------------------
// AUTENTICACIÓN Y SESIÓN
// -----------------------------------------------------------------------------

func (a *App) Login(username, password string) (*db.Usuario, error) {
	user, err := auth.ValidarCredenciales(a.dbConn, username, password)
	if err != nil {
		return nil, err
	}

	a.usuarioActivo = user
	a.FinalizarLogin()

	fmt.Printf("Sesión Iniciada: %s con rol %s\n", user.Nombre, user.Rol)
	return user, nil
}

func (a *App) ObtenerSesionActual() *db.Usuario {
	return a.usuarioActivo
}

// -----------------------------------------------------------------------------
// GESTIÓN DE USUARIOS / DOCENTES (Admin)
// -----------------------------------------------------------------------------

func (a *App) CrearDocente(nombre string, pass string) error {
	if err := a.verificarRol(db.RolDirector); err != nil {
		return err
	}

	// CORRECCIÓN: Encriptamos la contraseña antes de mandarla al servicio
	hash, err := bcrypt.GenerateFromPassword([]byte(pass), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("error al procesar la contraseña: %w", err)
	}

	nuevo := db.Usuario{
		Nombre:   nombre,
		Password: string(hash), // Guardamos el hash, no el texto plano
		Rol:      db.RolDocenteBibliotecario,
	}

	return a.adminSvc.RegistrarDocente(a.usuarioActivo.Rol, nuevo)
}

func (a *App) ListarDocentes() ([]db.Usuario, error) {
	if err := a.verificarRol(db.RolDirector); err != nil {
		return nil, err
	}
	return a.adminSvc.ObtenerDocentes(a.usuarioActivo.Rol)
}

func (a *App) CambiarPasswordDocente(Id uint, nuevaPass string) error {
	if err := a.verificarRol(db.RolDirector); err != nil {
		return err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(nuevaPass), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	return a.dbConn.Model(&db.Usuario{}).
		Where("id = ? AND rol = ?", Id, db.RolDocenteBibliotecario).
		Update("password", string(hash)).Error
}

func (a *App) EliminarDocente(Id uint) error {
	if err := a.verificarRol(db.RolDirector); err != nil {
		return err
	}

	// AL AÑADIR .Unscoped(), GORM ejecutará un "DELETE FROM" real en lugar de un "UPDATE"
	return a.dbConn.Unscoped().Delete(&db.Usuario{}, Id).Error
}

// -----------------------------------------------------------------------------
// GESTIÓN DE GRADOS Y ESTRUCTURA ACADÉMICA
// -----------------------------------------------------------------------------

// ObtenerNiveles con sus grados asociados (Carga anidada)
func (a *App) ObtenerNivelesConGrados() ([]db.NivelAcademico, error) {
	var niveles []db.NivelAcademico
	// Preload("Grados") permite que cada nivel traiga su lista de secciones
	err := a.dbConn.Preload("Grados").Find(&niveles).Error
	return niveles, err
}

// Obtener solo los grados de un nivel específico
func (a *App) ObtenerGradosPorNivel(nivelID uint) ([]db.Grado, error) {
	var grados []db.Grado
	err := a.dbConn.Where("nivel_id = ?", nivelID).Find(&grados).Error
	return grados, err
}

// -----------------------------------------------------------------------------
// GESTIÓN DE LIBROS E INVENTARIO
// -----------------------------------------------------------------------------

func (a *App) RegistrarLibro(titulo string, asigID uint, gradoID uint, cantidad int) error {
	nuevoLibro := db.Libro{
		Titulo:       titulo,
		AsignaturaID: asigID,
		GradoID:      gradoID, // Usamos la nueva relación al Grado
		Cantidad:     cantidad,
		// Eliminamos NivelAcademicoID porque el nivel se obtiene a través del grado
	}
	return db.AgregarLibroDB(a.dbConn, nuevoLibro)
}

func (a *App) ObtenerLibros() ([]db.Libro, error) {
	var libros []db.Libro
	err := a.dbConn.
		Preload("Asignatura").
		Preload("Grado").
		Preload("Grado.Nivel").
		Find(&libros).Error
	return libros, err
}

func (a *App) ObtenerAsignaturas() ([]db.Asignatura, error) {
	var asignaturas []db.Asignatura
	err := a.dbConn.Find(&asignaturas).Error
	return asignaturas, err
}

func (a *App) ObtenerNiveles() ([]db.NivelAcademico, error) {
	var niveles []db.NivelAcademico
	// Preload("Grados") es VITAL para que el selector de React tenga datos
	err := a.dbConn.Preload("Grados").Find(&niveles).Error
	return niveles, err
}

// -----------------------------------------------------------------------------
// GESTIÓN DE ESTUDIANTES
// -----------------------------------------------------------------------------

func (a *App) ListarEstudiantes() ([]db.Solicitante, error) {
	var Sol []db.Solicitante
	// Preload("Grado") permite que el buscador no llegue vacío o con errores de nulos
	err := a.dbConn.Preload("Grado").Find(&Sol).Error
	return Sol, err
}

// -----------------------------------------------------------------------------
// GESTIÓN DE PRÉSTAMOS Y DEVOLUCIONES
// -----------------------------------------------------------------------------

func (a *App) RegistrarPrestamo(estudiante db.Solicitante, libroID uint, cantidad int, fechaEntrega time.Time) error {
	return db.RegistrarPrestamo(a.dbConn, estudiante, libroID, cantidad, fechaEntrega)
}

func (a *App) FinalizarPrestamo(prestamoID uint) error {
	return db.DevolverLibro(a.dbConn, prestamoID)
}

func (a *App) ObtenerPrestamos() ([]db.Prestamo, error) {
	var prestamos []db.Prestamo
	err := a.dbConn.
		Preload("Solicitante").
		Preload("Solicitante.Grado"). // <-- VITAL para mostrar el curso del alumno/profe
		Preload("Libro").
		Preload("Libro.Asignatura").
		Where("devuelto = ?", false).
		Find(&prestamos).Error
	return prestamos, err
}

// -----------------------------------------------------------------------------
// GESTIÓN DE SANCIONES Y EXPEDIENTES (Directorio Escolar)
// -----------------------------------------------------------------------------

// SancionarEstudiante permite bloquear o desbloquear a un solicitante (alumno/docente)
func (a *App) SancionarEstudiante(solicitanteID uint, sancionar bool, motivo string) error {
	if a.usuarioActivo == nil {
		return fmt.Errorf("sesión no iniciada")
	}

	updates := map[string]interface{}{
		"sancionado":     sancionar,
		"motivo_sancion": motivo,
	}
	if !sancionar {
		updates["motivo_sancion"] = ""
	}

	return a.dbConn.Model(&db.Solicitante{}).Where("id = ?", solicitanteID).Updates(updates).Error
}

// ObtenerExpedienteEstudiante recupera todo el historial de préstamos de un alumno específico
func (a *App) ObtenerExpedienteEstudiante(solicitanteID uint) ([]db.Prestamo, error) {
	if a.usuarioActivo == nil {
		return nil, fmt.Errorf("sesión no iniciada")
	}

	var prestamos []db.Prestamo
	err := a.dbConn.
		Preload("Libro").
		Preload("Libro.Asignatura").
		Where("solicitante_id = ?", solicitanteID).
		Order("created_at desc").
		Find(&prestamos).Error

	return prestamos, err
}

// -----------------------------------------------------------------------------
// GESTIÓN DE REPORTES Y ESTADÍSTICAS
// -----------------------------------------------------------------------------

func (a *App) ObtenerEstadisticasReporte() (db.EstadisticasDashboard, error) {
	// Opcional: Validar que exista una sesión activa
	if a.usuarioActivo == nil {
		return db.EstadisticasDashboard{}, fmt.Errorf("sesión no iniciada")
	}
	return reportes.ObtenerEstadisticas(a.dbConn), nil
}

func (a *App) ObtenerHistorialMovimientos() ([]db.Movimiento, error) {
	if a.usuarioActivo == nil {
		return nil, fmt.Errorf("sesión no iniciada")
	}
	return reportes.ObtenerMovimientosRecientes(a.dbConn)
}
