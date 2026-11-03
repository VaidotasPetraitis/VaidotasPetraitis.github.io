package httpserver

import (
	"io/fs"
	"net/http"
	"portfolio/internal/features/certifications"
	"portfolio/internal/features/experience"
	"portfolio/internal/features/explorer"
	"portfolio/internal/features/frontend"
	"portfolio/internal/features/profile"
	"portfolio/internal/features/projects"
	"portfolio/internal/httpserver/middleware"
	"portfolio/internal/jsonio"
)

func Handler(assets, content fs.FS) http.Handler {
	router := http.NewServeMux()

	router.HandleFunc("GET /api/v1/profile", profile.Handler(content))
	router.HandleFunc("GET /api/v1/experience", experience.Handler(content))
	router.HandleFunc("GET /api/v1/projects", projects.ListHandler(content))
	router.HandleFunc("GET /api/v1/projects/{slug}", projects.DetailHandler(content))
	router.HandleFunc("GET /api/v1/explorer", explorer.Handler(content))
	router.HandleFunc("GET /api/v1/certifications", certifications.Handler(content))
	router.HandleFunc("GET /healthz", health)

	router.HandleFunc("GET /{$}", frontend.PageHandler(assets))
	router.HandleFunc("GET /experience", frontend.PageHandler(assets))
	router.HandleFunc("GET /certifications", frontend.PageHandler(assets))
	router.HandleFunc("GET /not-found", frontend.PageHandler(assets))
	router.HandleFunc("GET /projects/{slug}", frontend.PageHandler(assets))
	router.HandleFunc("GET /assets/", frontend.FilesHandler(assets))
	router.HandleFunc("GET /images/", frontend.FilesHandler(assets))
	router.HandleFunc("GET /favicon.svg", frontend.FilesHandler(assets))

	return middleware.SecurityHeaders(router)
}

func health(w http.ResponseWriter, r *http.Request) {
	jsonio.EncodeAndWrite(w, r, http.StatusOK, map[string]string{"status": "ok"})
}
