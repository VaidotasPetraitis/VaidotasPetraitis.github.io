package projects

import (
	"io/fs"
	"log/slog"
	"net/http"
	"slices"

	"portfolio/internal/jsonio"
)

func DetailHandler(files fs.FS) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		projects, err := jsonio.ReadAndDecode[[]Project](files, "projects.json")
		if err != nil {
			slog.ErrorContext(r.Context(), "load projects failed", "error", err)
			jsonio.Error(w, r, http.StatusInternalServerError, "Unable to load projects.")
			return
		}
		slug := r.PathValue("slug")
		index := slices.IndexFunc(projects, func(project Project) bool {
			return project.Slug == slug
		})
		if index == -1 {
			jsonio.Error(w, r, http.StatusNotFound, "Project not found.")
			return
		}
		jsonio.EncodeAndWrite(w, r, http.StatusOK, projects[index])
	}
}
