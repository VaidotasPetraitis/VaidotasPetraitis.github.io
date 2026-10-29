package httpserver

import (
	"net/http"
	"time"
)

// Configured constructs the HTTP server without opening a listener or reading the environment.
func Configured(handler http.Handler, address string) *http.Server {
	return &http.Server{
		Addr:              address,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    1 << 20,
	}
}
