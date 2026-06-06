package biblioteca

import (
	"database/sql"
	"sistema-andres-bello/backend/db" // Asegúrate de que la ruta coincida
)

type Service struct {
	database *sql.DB
}

func NewService(dbConn *sql.DB) *Service {
	return &Service{
		database: dbConn,
	}
}

// ObtenerLibros: Ahora con JOIN para traer Grado y Asignatura
func (s *Service) ObtenerLibros() ([]db.Libro, error) {
	// 1. La consulta ahora une las tablas para obtener los nombres
	// Nota: grado_id sustituye a nivel_academico_id
	query := `
		SELECT 
			l.id, l.titulo, l.cantidad,
			a.id, a.nombre,
			g.id, g.nombre, g.nivel_id
		FROM libros l
		LEFT JOIN asignaturas a ON l.asignatura_id = a.id
		LEFT JOIN grados g ON l.grado_id = g.id
	`

	rows, err := s.database.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var libros []db.Libro
	for rows.Next() {
		var l db.Libro
		// Escaneamos los datos del libro y de sus relaciones
		err := rows.Scan(
			&l.ID, &l.Titulo, &l.Cantidad,
			&l.Asignatura.Id, &l.Asignatura.Nombre,
			&l.Grado.Id, &l.Grado.Nombre, &l.Grado.NivelID,
		)
		if err != nil {
			return nil, err
		}

		// Lógica de disponibilidad basada en cantidad
		l.AsignaturaID = uint(l.Asignatura.Id)
		l.GradoID = uint(l.Grado.Id)

		libros = append(libros, l)
	}

	return libros, nil
}

// RegistrarLibro: Versión SQL para el nuevo esquema
func (s *Service) RegistrarLibro(titulo string, asigID uint, gradoID uint, cantidad int) error {
	query := `INSERT INTO libros (titulo, asignatura_id, grado_id, cantidad, created_at, updated_at) 
              VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`

	_, err := s.database.Exec(query, titulo, asigID, gradoID, cantidad)
	return err
}
