package explorer

import (
	"io/fs"
	"log/slog"
	"net/http"

	"portfolio/internal/jsonio"
)

func Handler(files fs.FS) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		explorer, err := jsonio.ReadAndDecode[Explorer](files, "explorer.json")
		if err != nil {
			slog.ErrorContext(r.Context(), "load explorer failed", "error", err)
			jsonio.Error(w, r, http.StatusInternalServerError, "Unable to load explorer.")
			return
		}
		jsonio.EncodeAndWrite(w, r, http.StatusOK, explorer)
	}
}
