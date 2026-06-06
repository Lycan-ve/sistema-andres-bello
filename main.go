package main

import (
	"embed"
	"sistema-andres-bello/backend/db"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

var assets embed.FS

func main() {
	database := db.InitDB()

	// Create an instance of the app structure
	app := NewApp(database)

	// Create application with options
	err := wails.Run(&options.App{
		Title:         "Sistema Andres Bello - Gestion Bibliotecaria",
		Width:         800,
		Height:        450,
		DisableResize: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
