package db

import (
	"errors"

	"gorm.io/gorm"
)

type Asignatura struct {
	gorm.Model
	Id     int    `json:"id" gorm:"primaryKey"`
	Nombre string `json:"nombre"`
}

type NivelAcademico struct {
	gorm.Model
	Id     int     `json:"id" gorm:"primaryKey"`
	Nombre string  `json:"nombre"`
	Grados []Grado `json:"grados" gorm:"foreignKey:NivelID"` // Un nivel tiene muchos grados
}

type Grado struct {
	gorm.Model
	Id      int    `json:"id" gorm:"primaryKey"`
	Nombre  string `json:"nombre"`
	Seccion string `json:"seccion"`
	NivelID uint   `json:"nivel_id"`
	// ESTA ES LA LÍNEA QUE FALTA O ESTÁ MAL:
	Nivel NivelAcademico `json:"nivel" gorm:"foreignKey:NivelID"`
}

type Libro struct {
	gorm.Model
	Titulo       string     `json:"titulo"`
	AsignaturaID uint       `json:"asig_id"`
	Asignatura   Asignatura `json:"asignatura"`
	GradoID      uint       `json:"grado_id"` // Nueva relación
	Grado        Grado      `json:"grado"`    // Nueva relación
	Cantidad     int        `json:"cantidad"`
}

func AgregarLibroDB(database *gorm.DB, nuevo Libro) error {
	return database.Create(&nuevo).Error
}

func GetLibros(database *gorm.DB) ([]Libro, error) {
	var libros []Libro
	// IMPORTANTE: Para traer el Nivel, precargamos "Grado.Nivel" (anidado)
	// "NivelAcademico" no es un campo directo de Libro, por eso daba error antes.
	err := database.Preload("Asignatura").Preload("Grado.Nivel").Find(&libros).Error
	return libros, err
}

// Actualizar stock y disponibilidad (Versión GORM)
func ActualizarStockLibro(tx *gorm.DB, id uint, delta int) error {
	var libro Libro
	if err := tx.First(&libro, id).Error; err != nil {
		return err
	}

	nuevaCantidad := libro.Cantidad + delta
	if nuevaCantidad < 0 {
		return errors.New("no hay ejemplares suficientes")
	}

	return tx.Model(&libro).Updates(map[string]interface{}{
		"cantidad":   nuevaCantidad,
		"disponible": nuevaCantidad > 0,
	}).Error
}
