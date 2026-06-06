package db

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

// Solicitante representa a la persona que retira el material (Alumno o Docente)
type Solicitante struct {
	gorm.Model
	ID       uint    `gorm:"primaryKey" json:"id"`
	Cedula   *string `gorm:"unique;default:null" json:"cedula"` // Puede ser vacía para alumnos pequeños
	Nombre   string  `json:"nombre"`
	Apellido string  `json:"apellido"`
	Tipo     string  `json:"tipo"`     // "alumno" o "docente"
	GradoID  uint    `json:"grado_id"` // Grado/Sección al que pertenece o donde dará la clase
	Grado    Grado   `json:"grado" gorm:"foreignKey:GradoID"`
}

// Registro del Préstamo
type Prestamo struct {
	ID            uint        `gorm:"primaryKey" json:"id"`
	SolicitanteID uint        `json:"solicitante_id"`
	Solicitante   Solicitante `gorm:"foreignKey:SolicitanteID"`
	LibroID       uint        `json:"libro_id"`
	Libro         Libro       `gorm:"foreignKey:LibroID"`
	Cantidad      int         `json:"cantidad" gorm:"default:1"`
	FechaSalida   time.Time   `json:"fecha_salida"`
	FechaEntrega  time.Time   `json:"fecha_entrega"`
	Devuelto      bool        `json:"devuelto" gorm:"default:false"`
}

func RegistrarPrestamo(database *gorm.DB, sol Solicitante, libroID uint, cantidad int, fechaEntrega time.Time) error {
	return database.Transaction(func(tx *gorm.DB) error {
		var solicitanteExistente Solicitante
		var err error

		// 1. Búsqueda inteligente
		if sol.Cedula != nil && *sol.Cedula != "" {
			// Si tiene cédula física
			err = tx.Where("cedula = ?", sol.Cedula).First(&solicitanteExistente).Error
		} else {
			// Si es un alumno sin cédula, buscamos por nombre completo y grado real
			// IMPORTANTE: Asegúrate de que sol.GradoID no sea 0 desde el frontend
			err = tx.Where("nombre = ? AND apellido = ? AND grado_id = ?",
				sol.Nombre, sol.Apellido, sol.GradoID).First(&solicitanteExistente).Error

			// Si no tiene cédula, nos aseguramos de que se guarde como NULL en la BD
			sol.Cedula = nil
		}

		// 2. Gestión del Solicitante
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				// Es nuevo: nos aseguramos de que el ID sea 0 para que GORM inserte
				sol.ID = 0
				if err := tx.Create(&sol).Error; err != nil {
					return fmt.Errorf("error al crear solicitante: %v", err)
				}
			} else {
				return err
			}
		} else {
			// Ya existe: usamos el registro encontrado
			sol = solicitanteExistente
		}

		// 3. Validar Stock
		var libro Libro
		if err := tx.First(&libro, libroID).Error; err != nil {
			return err
		}
		if libro.Cantidad < cantidad {
			return fmt.Errorf("stock insuficiente: solo hay %d ejemplares", libro.Cantidad)
		}

		// 4. Crear el Préstamo vinculado al SolicitanteID
		nuevoPrestamo := Prestamo{
			SolicitanteID: sol.ID,
			LibroID:       libroID,
			Cantidad:      cantidad,
			FechaSalida:   time.Now(),
			FechaEntrega:  fechaEntrega,
			Devuelto:      false,
		}

		if err := tx.Create(&nuevoPrestamo).Error; err != nil {
			return err
		}

		// 5. Actualizar Stock en la tabla libros
		return tx.Model(&Libro{}).Where("id = ?", libroID).
			UpdateColumn("cantidad", gorm.Expr("cantidad - ?", cantidad)).Error
	})
}

func GetPrestamosActivos(database *gorm.DB) ([]Prestamo, error) {
	var prestamos []Prestamo
	err := database.Preload("Solicitante"). // Antes era "Estudiante"
						Preload("Solicitante.Grado"). // Antes era "Estudiante.Grado"
						Preload("Libro").
						Preload("Libro.Asignatura").
						Where("devuelto = ?", false).
						Find(&prestamos).Error
	return prestamos, err
}

func DevolverLibro(database *gorm.DB, prestamoID uint) error {
	return database.Transaction(func(tx *gorm.DB) error {
		var p Prestamo
		if err := tx.First(&p, prestamoID).Error; err != nil {
			return err
		}

		if p.Devuelto {
			return fmt.Errorf("este material ya fue marcado como devuelto")
		}

		// 1. Marcar como devuelto
		if err := tx.Model(&p).Update("devuelto", true).Error; err != nil {
			return err
		}

		// 2. Reponer stock exacto al libro
		return tx.Model(&Libro{}).Where("id = ?", p.LibroID).
			UpdateColumn("cantidad", gorm.Expr("cantidad + ?", p.Cantidad)).Error
	})
}
