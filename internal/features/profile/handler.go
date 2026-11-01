package profile

import (
	"io/fs"
	"log/slog"
	"net/http"

	"portfolio/internal/jsonio"
)

func Handler(files fs.FS) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		profile, err := jsonio.ReadAndDecode[Profile](files, "profile.json")
		if err != nil {
			slog.ErrorContext(r.Context(), "load profile failed", "error", err)
			jsonio.Error(w, r, http.StatusInternalServerError, "Unable to load profile.")
			return
		}
		jsonio.EncodeAndWrite(w, r, http.StatusOK, profile)
	}
}
