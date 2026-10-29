package httpserver

import "net/http"

func pipeline(handler http.Handler, steps ...func(http.Handler) http.Handler) http.Handler {
	for index := len(steps) - 1; index >= 0; index-- {
		handler = steps[index](handler)
	}
	return handler
}
