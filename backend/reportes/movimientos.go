package reportes

import (
	"sistema-andres-bello/backend/db"

	"gorm.io/gorm"
)

func ObtenerEstadisticas(database *gorm.DB) db.EstadisticasDashboard {
	var stats db.EstadisticasDashboard

	// Contar préstamos totales registrados
	database.Model(&db.Movimiento{}).Where("tipo_operacion = ?", "PRÉSTAMO").Count(&stats.TotalPrestamos)

	// Contar libros activos en circulación
	database.Model(&db.Movimiento{}).Where("estado = ?", "ACTIVO").Count(&stats.Activos)

	// Contar entregas en estado moroso
	database.Model(&db.Movimiento{}).Where("estado = ?", "MOROSO").Count(&stats.Morosos)

	// Contar el fondo editorial total de libros en inventario
	database.Model(&db.Libro{}).Count(&stats.FondoEditorial)

	return stats
}

// ObtenerMovimientosRecientes extrae el historial para la tabla de auditoría
func ObtenerMovimientosRecientes(database *gorm.DB) ([]db.Movimiento, error) {
	var movimientos []db.Movimiento
	err := database.Order("fecha desc").Limit(50).Find(&movimientos).Error
	return movimientos, err
}
