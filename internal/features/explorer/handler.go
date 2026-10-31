package explorer

import (
	"io/fs"
	"log/slog"
	"net/http"

	"portfolio/internal/api"
	"portfolio/internal/jsonfile"
)

func Handler(files fs.FS) api.Handler {
	return func(c *api.Context) {
		explorer, err := jsonfile.Read[Explorer](files, "explorer.json")
		if err != nil {
			slog.Error("load explorer", "error", err)
			c.Error(http.StatusInternalServerError, "Unable to load explorer.")
			return
		}
		c.JSON(http.StatusOK, explorer)
	}
}
