package admin

import (
	"errors"
	"sistema-andres-bello/backend/db"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func CheakAdmin(dbConn *gorm.DB) (bool, error) {
	var count int64
	err := dbConn.Model(&db.Usuario{}).Where("rol = ?", "director").Count(&count).Error
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func CreateAdmin(dbConn *gorm.DB, nombre, password string) error {

	existe, err := CheakAdmin(dbConn)
	if err != nil {
		return err
	}
	if existe {
		return errors.New("ya existe un Administrador en el Sistema")
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	admin := db.Usuario{
		Nombre:   nombre,
		Password: string(hashedPassword),
		Rol:      "director",
	}

	return dbConn.Create(&admin).Error

}
