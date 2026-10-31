package httpserver

import (
	"net/http"
	"portfolio/internal/httpserver/middleware"
)

// Middleware wraps an HTTP handler with additional request handling.
type Middleware func(http.Handler) http.Handler

// Pipeline collects middleware in the order requests enter it.
// Its zero value is ready to use.
type Pipeline struct {
	steps []Middleware
}

// Use registers middleware in the order requests enter it.
func (p *Pipeline) Use(step Middleware) {
	p.steps = append(p.steps, step)
}

func (p *Pipeline) LogMiddleware() {
	p.Use(middleware.RequestLog)
}

func (p *Pipeline) SecurityHeaders() {
	p.Use(middleware.SecurityHeaders)
}

// Handler wraps the supplied handler with the registered middleware.
func (p *Pipeline) Handler(handler http.Handler) http.Handler {
	for index := len(p.steps) - 1; index >= 0; index-- {
		handler = p.steps[index](handler)
	}
	return handler
}
