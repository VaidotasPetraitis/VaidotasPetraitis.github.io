package experience

import (
	"io/fs"
	"log/slog"
	"net/http"

	"portfolio/internal/api"
	"portfolio/internal/jsonfile"
)

func Handler(files fs.FS) api.Handler {
	return func(c *api.Context) {
		entries, err := jsonfile.Read[[]Entry](files, "experience.json")
		if err != nil {
			slog.Error("load experience", "error", err)
			c.Error(http.StatusInternalServerError, "Unable to load experience.")
			return
		}
		c.JSON(http.StatusOK, entries)
	}
}
