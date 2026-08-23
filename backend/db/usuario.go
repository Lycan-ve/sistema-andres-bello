package db

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// 1. EL MODELO: Datos del usuario
type Usuario struct {
	gorm.Model
	// ANTES: gorm:"unique;not null"
	// AHORA: Creamos un índice único condicional (funciona en SQLite, Postgres y SQL Server)
	Nombre    string `json:"nombre" gorm:"uniqueIndex:idx_nombre_activo,where:deleted_at IS NULL;not null"`
	Password  string `json:"password,omitempty"`
	Rol       string `json:"rol"`
	NuevaPass string `json:"nueva_pass,omitempty" gorm:"-"`
}

// 2. LAS FUNCIONES: Acciones de usuario

// Login: Verifica si el usuario existe y la clave coincide (CORREGIDO)
func LoginUsuarioGorm(db *gorm.DB, user string, pass string) (*Usuario, error) {
	var u Usuario

	// Paso 1: Buscamos al usuario SÓLO por su nombre
	err := db.Where("nombre = ?", user).First(&u).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Mensaje genérico por seguridad (para no dar pistas si el usuario existe o no)
			return nil, errors.New("usuario o contraseña incorrectos")
		}
		return nil, err
	}

	// Paso 2: Comparamos el hash de la base de datos con la contraseña ingresada
	err = bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(pass))
	if err != nil {
		return nil, errors.New("usuario o contraseña incorrectos")
	}

	return &u, nil
}

// RegistrarUsuario: Unificado al ecosistema de GORM (CORREGIDO)
func RegistrarUsuario(db *gorm.DB, u Usuario) error {
	// Encriptamos la clave recibida
	hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	u.Password = string(hash)
	u.Rol = "docente_bibliotecario"

	// GORM se encarga de la inyección SQL, de asignar el ID,
	// y de crear la fecha en CreatedAt y UpdatedAt.
	return db.Create(&u).Error
}
