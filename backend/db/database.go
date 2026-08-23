package db

import (
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
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
	)
	if err != nil {
		log.Fatal("Fallo en la migración de las tablas:", err)
	}

	// 1. Encriptamos la contraseña ANTES de asignarla
	hashedPassword, err := HashPassword("123")
	if err != nil {
		log.Fatal("Fallo al encriptar la contraseña del admin:", err)
	}

	admin := Usuario{
		Nombre:   "admin",
		Password: hashedPassword,
		Rol:      RolDirector, // Asumo que esto es una constante definida en otro lugar
	}

	// 2. Usamos FirstOrCreate buscando por el "Nombre".
	// Si "admin" ya existe, no hace nada. Si no existe, lo crea con la contraseña hasheada.
	result := db.Where(Usuario{Nombre: "admin"}).FirstOrCreate(&admin)
	if result.Error != nil {
		log.Fatal("Fallo al inicializar al Admin:", result.Error)
	}

	fmt.Println("Admin inicializado correctamente (si no existía, fue creado).")

	return db
}

func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	// 3. Retornamos el string directamente, sin instanciar un struct Usuario
	return string(hash), nil
}
