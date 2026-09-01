package db

import (
	"time"
)

// Movimiento almacena el registro histórico en la base de datos
type Movimiento struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	TipoOperacion string    `gorm:"size:50;not null" json:"tipoOperacion"`
	Usuario       string    `gorm:"size:150;not null" json:"usuario"`
	Material      string    `gorm:"size:200;not null" json:"material"`
	Estado        string    `gorm:"size:50;not null" json:"estado"`
	Fecha         time.Time `gorm:"autoCreateTime" json:"fecha"`
}

// EstadisticasDashboard es una estructura virtual (no se migra a GORM)
type EstadisticasDashboard struct {
	TotalPrestamos int64 `json:"totalPrestamos"`
	Activos        int64 `json:"activos"`
	Morosos        int64 `json:"morosos"`
	FondoEditorial int64 `json:"fondoEditorial"`
}
