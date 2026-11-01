package httpserver

import (
	"net/http"
	"testing"
)

func TestShutdownOfIdleServer(t *testing.T) {
	shutdownServer(&http.Server{})
}

func TestServeHTTPReturnsListenFailure(t *testing.T) {
	err := ServeHTTP(http.NotFoundHandler(), "127.0.0.1:invalid")
	if err == nil {
		t.Fatal("expected an invalid listen address to fail")
	}
}
