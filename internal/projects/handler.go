package projects

import (
	"errors"
	"net/http"
	"portfolio/internal/httpserver/response"
)

func ListHandler(reader SummaryReader) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !response.Get(w, r) {
			return
		}
		summaries, err := reader.Summaries()
		if err != nil {
			response.Error(w, http.StatusInternalServerError, "invalid_content", err.Error())
			return
		}
		response.JSON(w, http.StatusOK, summaries)
	}
}

func DetailHandler(reader ProjectReader) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !response.Get(w, r) {
			return
		}
		project, err := reader.Project(r.PathValue("slug"))
		if errors.Is(err, ErrNotFound) {
			response.Error(w, http.StatusNotFound, "project_not_found", "Project not found.")
			return
		}
		if err != nil {
			response.Error(w, http.StatusInternalServerError, "invalid_content", err.Error())
			return
		}
		response.JSON(w, http.StatusOK, project)
	}
}
