package projects

import (
	"io/fs"
	"log/slog"
	"net/http"
	"slices"

	"portfolio/internal/api"
	"portfolio/internal/jsonfile"
)

func DetailHandler(files fs.FS) api.Handler {
	return func(c *api.Context) {
		projects, err := jsonfile.Read[[]Project](files, "projects.json")
		if err != nil {
			slog.Error("load projects", "error", err)
			c.Error(http.StatusInternalServerError, "Unable to load projects.")
			return
		}
		slug := c.Param("slug")
		index := slices.IndexFunc(projects, func(project Project) bool {
			return project.Slug == slug
		})
		if index == -1 {
			c.Error(http.StatusNotFound, "Project not found.")
			return
		}
		c.JSON(http.StatusOK, projects[index])
	}
}
