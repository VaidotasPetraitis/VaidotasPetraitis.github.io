package httpserver

import (
	"io/fs"
	"net/http"
	"portfolio/internal/api"
	"portfolio/internal/features/certifications"
	"portfolio/internal/features/experience"
	"portfolio/internal/features/explorer"
	"portfolio/internal/features/frontend"
	"portfolio/internal/features/profile"
	"portfolio/internal/features/projects"
)

func Handler(assets, content fs.FS) http.Handler {
	router := api.NewRouter()

	router.GET("/api/v1/profile", profile.Handler(content))
	router.GET("/api/v1/experience", experience.Handler(content))
	router.GET("/api/v1/projects", projects.ListHandler(content))
	router.GET("/api/v1/projects/{slug}", projects.DetailHandler(content))
	router.GET("/api/v1/explorer", explorer.Handler(content))
	router.GET("/api/v1/certifications", certifications.Handler(content))
	router.GET("/healthz", health)

	router.GET("/{$}", frontend.PageHandler(assets))
	router.GET("/projects/{slug}", frontend.PageHandler(assets))
	router.GET("/assets/", frontend.FilesHandler(assets))
	router.GET("/images/", frontend.FilesHandler(assets))
	router.GET("/favicon.svg", frontend.FilesHandler(assets))

	var pipeline Pipeline
	pipeline.LogMiddleware()
	pipeline.SecurityHeaders()

	return pipeline.Handler(router)
}

func health(c *api.Context) {
	c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}
