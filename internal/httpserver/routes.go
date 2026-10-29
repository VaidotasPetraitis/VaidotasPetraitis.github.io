package httpserver

import (
	"io/fs"
	"net/http"
	"portfolio/internal/certifications"
	"portfolio/internal/data"
	"portfolio/internal/experience"
	"portfolio/internal/explorer"
	"portfolio/internal/httpserver/middleware"
	"portfolio/internal/httpserver/response"
	"portfolio/internal/jsonfile"
	"portfolio/internal/profile"
	"portfolio/internal/projects"
)

func Handler(assets fs.FS) http.Handler {
	content := jsonfile.Reader{Files: data.Files}
	projectReader := projects.JSONReader{Source: content}
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/v1/profile", profile.Handler(profile.JSONReader{Source: content}))
	mux.HandleFunc("GET /api/v1/experience", experience.Handler(experience.JSONReader{Source: content}))
	mux.HandleFunc("GET /api/v1/projects", projects.ListHandler(projectReader))
	mux.HandleFunc("GET /api/v1/projects/{slug}", projects.DetailHandler(projectReader))
	mux.HandleFunc("GET /api/v1/explorer", explorer.Handler(explorer.JSONReader{Source: content}))
	mux.HandleFunc("GET /api/v1/certifications", certifications.Handler(certifications.JSONReader{Source: content}))
	mux.HandleFunc("GET /healthz", health)

	page := frontendPage(assets)
	files := frontendFiles(assets)
	mux.HandleFunc("GET /{$}", page)
	mux.HandleFunc("GET /projects/{slug}", page)
	mux.Handle("GET /assets/", files)
	mux.Handle("GET /images/", files)
	mux.Handle("GET /favicon.svg", files)

	return pipeline(mux, middleware.RequestLog, middleware.SecurityHeaders)
}

func health(w http.ResponseWriter, r *http.Request) {
	response.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
