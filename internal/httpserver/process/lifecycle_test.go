package process

import (
	"context"
	"errors"
	"net/http"
	"testing"
)

// These checks never open a listener or register signal handlers.
func TestAddress(t *testing.T) {
	t.Setenv("PORTFOLIO_ADDR", "")
	if got := Address(); got != "127.0.0.1:8080" {
		t.Fatalf("unexpected default: %s", got)
	}
	t.Setenv("PORTFOLIO_ADDR", "0.0.0.0:9090")
	if got := Address(); got != "0.0.0.0:9090" {
		t.Fatalf("unexpected configured address: %s", got)
	}
}

func TestExitStatus(t *testing.T) {
	if ExitStatus(nil) != 0 {
		t.Error("successful process should exit zero")
	}
	if ExitStatus(errors.New("failure")) != 1 {
		t.Error("failed process should exit one")
	}
}

func TestListenResult(t *testing.T) {
	if listenResult(http.ErrServerClosed) != nil {
		t.Error("normal shutdown should succeed")
	}
	failure := errors.New("bind failed")
	if !errors.Is(listenResult(failure), failure) {
		t.Error("listener failure was discarded")
	}
}

func TestShutdownOfIdleServer(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	shutdownOnSignal(ctx, &http.Server{})
}
