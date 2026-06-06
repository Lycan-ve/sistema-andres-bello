package db

import (
	"database/sql"
	"errors"

	"gorm.io/gorm"
)

// 1. EL MODELO: Datos del usuario
type Usuario struct {
	gorm.Model
	Id       int    `json:"id"`
	Nombre   string `json:"nombre" gorm:"unique;not null"`
	Password string `json:"password,omitempty"` // omitempty para no enviar la clave al frontend
	Rol      string `json:"rol"`                // "director" o "docente_bibliotecario"
}

// 2. LAS FUNCIONES: Acciones de usuario

// Login: Verifica si el usuario existe y la clave coincide
func LoginUsuarioGorm(db *gorm.DB, user string, pass string) (*Usuario, error) {
	var u Usuario
	// GORM se encarga de evitar inyecciones SQL y mapear los campos
	err := db.Where("nombre = ? AND password = ?", user, pass).First(&u).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("usuario o contraseña incorrectos")
		}
		return nil, err
	}
	return &u, nil
}

func RegistrarUsuario(database *sql.DB, u Usuario) error {
	// IMPORTANTE: Cambiamos "-" por "_" para que ListarDocentes lo encuentre
	u.Rol = "docente_bibliotecario"

	query := `INSERT INTO usuarios (nombre, password, rol) VALUES (?, ?, ?)`
	_, err := database.Exec(query, u.Nombre, u.Password, u.Rol)
	return err
}
