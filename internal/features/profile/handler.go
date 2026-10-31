package profile

import (
	"io/fs"
	"log/slog"
	"net/http"

	"portfolio/internal/api"
	"portfolio/internal/jsonfile"
)

func Handler(files fs.FS) api.Handler {
	return func(c *api.Context) {
		profile, err := jsonfile.Read[Profile](files, "profile.json")
		if err != nil {
			slog.Error("load profile", "error", err)
			c.Error(http.StatusInternalServerError, "Unable to load profile.")
			return
		}
		c.JSON(http.StatusOK, profile)
	}
}
