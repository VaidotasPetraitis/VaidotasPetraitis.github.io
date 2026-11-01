package certifications

import (
	"io/fs"
	"log/slog"
	"net/http"

	"portfolio/internal/jsonio"
)

func Handler(files fs.FS) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		entries, err := jsonio.ReadAndDecode[[]Entry](files, "certifications.json")
		if err != nil {
			slog.ErrorContext(r.Context(), "load certifications failed", "error", err)
			jsonio.Error(w, r, http.StatusInternalServerError, "Unable to load certifications.")
			return
		}
		jsonio.EncodeAndWrite(w, r, http.StatusOK, entries)
	}
}
