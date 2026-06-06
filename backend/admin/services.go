package admin

import (
	"database/sql"
	"errors"
	"sistema-andres-bello/backend/db"
)

type Service struct {
	database *sql.DB
}

func NewService(dbConn *sql.DB) *Service {
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
	return db.RegistrarUsuario(s.database, nuevo)
}

// ObtenerDocentes: Permite al director listar a todo su personal bibliotecario
func (s *Service) ObtenerDocentes(rolAdmin string) ([]db.Usuario, error) {
	if rolAdmin != "director" {
		return nil, errors.New("acceso denegado: permisos insuficientes")
	}

	// Buscamos específicamente el rol 'docente_bibliotecario'
	query := `SELECT id, nombre, rol FROM usuarios WHERE rol = 'docente_bibliotecario'`
	rows, err := s.database.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var docentes []db.Usuario
	for rows.Next() {
		var u db.Usuario
		// Importante: El orden en Scan debe ser igual al SELECT (id, nombre, rol)
		if err := rows.Scan(&u.Id, &u.Nombre, &u.Rol); err != nil {
			return nil, err
		}
		docentes = append(docentes, u)
	}
	return docentes, nil
}
