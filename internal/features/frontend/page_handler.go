package frontend

import (
	"bytes"
	"io/fs"
	"log/slog"
	"net/http"
	"time"
)

func PageHandler(files fs.FS) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		page, err := fs.ReadFile(files, "index.html")
		if err != nil {
			slog.ErrorContext(r.Context(), "load frontend page failed", "error", err)
			http.Error(w, "Frontend build unavailable", http.StatusInternalServerError)
			return
		}
		http.ServeContent(w, r, "index.html", time.Time{}, bytes.NewReader(page))
	}
}
