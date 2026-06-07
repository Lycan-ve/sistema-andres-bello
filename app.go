package main

import (
	"context"
	"fmt"
	"sistema-andres-bello/backend/admin"
	"sistema-andres-bello/backend/auth"
	"sistema-andres-bello/backend/db"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
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
	sqlDB, _ := database.DB()
	return &App{
		dbConn:   database,
		adminSvc: admin.NewService(sqlDB),
	}
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

	nuevo := db.Usuario{
		Nombre:   nombre,
		Password: pass,
		Rol:      "docente-bibliotecario",
	}

	return a.adminSvc.RegistrarDocente(a.usuarioActivo.Rol, nuevo)
}

func (a *App) ListarDocentes() ([]db.Usuario, error) {
	if err := a.verificarRol(db.RolDirector); err != nil {
		return nil, err
	}
	return a.adminSvc.ObtenerDocentes(a.usuarioActivo.Rol)
}

func (a *App) CambiarPasswordDocente(docenteID uint, nuevaPass string) error {
	if err := a.verificarRol(db.RolDirector); err != nil {
		return err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(nuevaPass), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	return a.dbConn.Model(&db.Usuario{}).
		Where("id = ? AND rol = ?", docenteID, db.RolDocenteBibliotecario).
		Update("password", string(hash)).Error
}

func (a *App) EliminarDocente(docenteID uint) error {
	if err := a.verificarRol(db.RolDirector); err != nil {
		return err
	}

	return a.dbConn.Delete(&db.Usuario{}, docenteID).Error
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
