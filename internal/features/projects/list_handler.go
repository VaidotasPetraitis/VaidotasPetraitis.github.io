package projects

import (
	"io/fs"
	"log/slog"
	"net/http"

	"portfolio/internal/api"
	"portfolio/internal/jsonfile"
)

func ListHandler(files fs.FS) api.Handler {
	return func(c *api.Context) {
		projects, err := jsonfile.Read[[]Project](files, "projects.json")
		if err != nil {
			slog.Error("load projects", "error", err)
			c.Error(http.StatusInternalServerError, "Unable to load projects.")
			return
		}
		summaries := make([]Summary, 0, len(projects))
		for _, project := range projects {
			summaries = append(summaries, project.Summary)
		}
		c.JSON(http.StatusOK, summaries)
	}
}
