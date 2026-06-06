package db

import (
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

// Quitamos la variable global para evitar confusiones de punteros nulos
func InitDB() *gorm.DB { // <--- Agregamos el tipo de retorno
	db, err := gorm.Open(sqlite.Open("andres_bello.db"), &gorm.Config{})
	if err != nil {
		panic("Fallo al conectar a la base de datos")
	}

	err = db.AutoMigrate(
		&Usuario{},
		&Asignatura{},
		&NivelAcademico{},
		&Libro{},
		&Solicitante{},
		&Prestamo{},
	)

	return db // <--- Retornamos la conexión real
}
