package certifications

import (
	"io/fs"
	"log/slog"
	"net/http"

	"portfolio/internal/api"
	"portfolio/internal/jsonfile"
)

func Handler(files fs.FS) api.Handler {
	return func(c *api.Context) {
		entries, err := jsonfile.Read[[]Entry](files, "certifications.json")
		if err != nil {
			slog.Error("load certifications", "error", err)
			c.Error(http.StatusInternalServerError, "Unable to load certifications.")
			return
		}
		c.JSON(http.StatusOK, entries)
	}
}
