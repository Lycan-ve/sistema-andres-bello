package db

import (
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDB() *gorm.DB {
	dsn := "host=localhost user=postgres password=root dbname=sistema_andres_bello port=5432 sslmode=disable TimeZone=America/Santiago"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Fallo al conectar a la base de datos:", err) // Mejor usar log.Fatal en vez de panic
	}

	err = db.AutoMigrate(
		&Usuario{},
		&Asignatura{},
		&NivelAcademico{},
		&Libro{},
		&Solicitante{},
		&Prestamo{},
		&Grado{},
		&Movimiento{},
	)
	if err != nil {
		log.Fatal("Fallo en la migración de las tablas:", err)
	}

	return db
}
