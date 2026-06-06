package auth

import (
	"errors"
	"sistema-andres-bello/backend/db"

	"gorm.io/gorm"
)

// ValidarCredenciales busca al usuario en SQLite
func ValidarCredenciales(database *gorm.DB, nombre string, password string) (*db.Usuario, error) {
	var usuario db.Usuario

	// Buscamos por nombre de usuario
	result := database.Where("nombre = ?", nombre).First(&usuario)
	if result.Error != nil {
		return nil, errors.New("Usuario no encontrado")
	}

	// Verificación simple (En producción deberías usar bcrypt)
	if usuario.Password != password {
		return nil, errors.New("Contraseña incorrecta")
	}

	return &usuario, nil
}

// EsDirector verifica si el usuario tiene rango administrativo alto
func EsDirector(u *db.Usuario) bool {
	return u.Rol == "director"
}
