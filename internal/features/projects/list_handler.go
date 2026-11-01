package projects

import (
	"io/fs"
	"log/slog"
	"net/http"

	"portfolio/internal/jsonio"
)

func ListHandler(files fs.FS) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		projects, err := jsonio.ReadAndDecode[[]Project](files, "projects.json")
		if err != nil {
			slog.ErrorContext(r.Context(), "load projects failed", "error", err)
			jsonio.Error(w, r, http.StatusInternalServerError, "Unable to load projects.")
			return
		}
		summaries := make([]Summary, 0, len(projects))
		for _, project := range projects {
			summaries = append(summaries, project.Summary)
		}
		jsonio.EncodeAndWrite(w, r, http.StatusOK, summaries)
	}
}
