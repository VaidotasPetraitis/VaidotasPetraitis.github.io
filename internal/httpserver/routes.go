package httpserver

import (
	"io/fs"
	"net/http"
	"portfolio/internal/certifications"
	"portfolio/internal/data"
	"portfolio/internal/experience"
	"portfolio/internal/explorer"
	"portfolio/internal/httpserver/response"
	"portfolio/internal/jsonfile"
	"portfolio/internal/profile"
	"portfolio/internal/projects"
)

func Handler(assets fs.FS) http.Handler {
	mux := http.NewServeMux()
	content := jsonfile.Reader{Files: data.Files}
	projectReader := projects.JSONReader{Source: content}
	mux.HandleFunc("/api/v1/profile", profile.Handler(profile.JSONReader{Source: content}))
	mux.HandleFunc("/api/v1/experience", experience.Handler(experience.JSONReader{Source: content}))
	mux.HandleFunc("/api/v1/projects", projects.ListHandler(projectReader))
	mux.HandleFunc("/api/v1/projects/{slug}", projects.DetailHandler(projectReader))
	mux.HandleFunc("/api/v1/explorer", explorer.Handler(explorer.JSONReader{Source: content}))
	mux.HandleFunc("/api/v1/certifications", certifications.Handler(certifications.JSONReader{Source: content}))
	mux.HandleFunc("/api/", missingAPI)
	mux.HandleFunc("/api", missingAPI)
	mux.HandleFunc("/healthz", health)
	mux.Handle("/", staticPages(assets))
	return requestLog(securityHeaders(mux))
}

func missingAPI(w http.ResponseWriter, r *http.Request) {
	response.Error(w, 404, "route_not_found", "API route not found.")
}
func health(w http.ResponseWriter, r *http.Request) {
	if response.Get(w, r) {
		response.JSON(w, 200, map[string]string{"status": "ok"})
	}
}
