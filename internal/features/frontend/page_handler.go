package frontend

import (
	"bytes"
	"io/fs"
	"log/slog"
	"net/http"
	"time"

	"portfolio/internal/api"
)

func PageHandler(files fs.FS) api.Handler {
	return func(c *api.Context) {
		page, err := fs.ReadFile(files, "index.html")
		if err != nil {
			slog.Error("load frontend page", "error", err)
			http.Error(c.Writer, "Frontend build unavailable", http.StatusInternalServerError)
			return
		}
		http.ServeContent(c.Writer, c.Request, "index.html", time.Time{}, bytes.NewReader(page))
	}
}
