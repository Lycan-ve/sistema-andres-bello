package admin

import (
	"errors"
	"sistema-andres-bello/backend/db"

	"gorm.io/gorm"
)

type Service struct {
	// CORRECCIÓN: Actualizado a *gorm.DB para mantener consistencia con el resto del backend
	database *gorm.DB
}

func NewService(dbConn *gorm.DB) *Service {
	return &Service{
		database: dbConn,
	}
}

// RegistrarDocente: Valida que el ejecutor sea 'director' y crea el nuevo usuario
func (s *Service) RegistrarDocente(rolAdmin string, nuevo db.Usuario) error {
	// 1. Verificación de seguridad estricta
	if rolAdmin != "director" {
		return errors.New("acceso denegado: solo el director puede registrar personal")
	}

	// 2. Forzamos el rol exacto que vimos en la BD (con guion bajo)
	nuevo.Rol = "docente_bibliotecario"

	// 3. Insertamos usando la función que definimos en db/usuario.go
	// Ahora 's.database' es *gorm.DB, por lo que encaja perfectamente
	return db.RegistrarUsuario(s.database, nuevo)
}

// ObtenerDocentes: Permite al director listar a todo su personal bibliotecario
func (s *Service) ObtenerDocentes(rolAdmin string) ([]db.Usuario, error) {
	if rolAdmin != "director" {
		return nil, errors.New("acceso denegado: permisos insuficientes")
	}

	var docentes []db.Usuario

	// CORRECCIÓN: Usamos GORM en lugar de SQL crudo.
	// Esto garantiza que el filtro "deleted_at IS NULL" se aplique automáticamente.
	// Usamos Select para traer solo los campos necesarios, optimizando memoria al igual que en tu SQL original.
	err := s.database.
		Select("id", "nombre", "rol").
		Where("rol = ?", "docente_bibliotecario").
		Find(&docentes).Error

	if err != nil {
		return nil, err
	}

	return docentes, nil
}
