package auth

import (
	"database/sql"
	"errors"
	"sistema-andres-bello/backend/db"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func ValidarCredenciales(database *gorm.DB, nombre string, password string) (*db.Usuario, error) {
	var usuario db.Usuario
	result := database.Where("LOWER(nombre) = LOWER(?)", nombre).First(&usuario)
	if result.Error != nil {
		return nil, errors.New("usuario o contraseña incorrectos")
	}

	// bcrypt compara el hash con la contraseña ingresada
	err := bcrypt.CompareHashAndPassword([]byte(usuario.Password), []byte(password))
	if err != nil {
		return nil, errors.New("usuario o contraseña incorrectos")
	}
	return &usuario, nil
}

// backend/db/usuario.go — al registrar:
func RegistrarUsuario(database *sql.DB, u db.Usuario) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	query := `INSERT INTO usuarios (nombre, password, rol) VALUES (?, ?, ?)`
	_, err = database.Exec(query, u.Nombre, string(hash), "docente_bibliotecario")
	return err
}
