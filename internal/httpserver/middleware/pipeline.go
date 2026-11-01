package middleware

import "net/http"

type middleware func(http.Handler) http.Handler

type Pipeline struct {
	steps []middleware
}

func (p *Pipeline) SecurityHeaders() {
	p.steps = append(p.steps, securityHeaders)
}

func (p *Pipeline) Handler(handler http.Handler) http.Handler {
	for index := len(p.steps) - 1; index >= 0; index-- {
		handler = p.steps[index](handler)
	}
	return handler
}
