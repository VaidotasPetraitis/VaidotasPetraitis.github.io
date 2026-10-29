package httpserver

import (
	"net/http"
	"testing"
)

func TestShutdownOfIdleServer(t *testing.T) {
	shutdownServer(&http.Server{})
}
