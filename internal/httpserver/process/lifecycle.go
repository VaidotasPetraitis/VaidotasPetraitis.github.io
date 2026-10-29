// Package process owns environment configuration, listeners, signals and shutdown.
// Tests exercise its helpers without starting listeners or registering signals.
package process

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"portfolio/internal/httpserver"
	"syscall"
	"time"
)

func Address() string {
	address := os.Getenv("PORTFOLIO_ADDR")
	if address == "" {
		return "127.0.0.1:8080"
	}
	return address
}

func ExitStatus(err error) int {
	if err != nil {
		slog.Error("portfolio stopped", "error", err)
		return 1
	}
	return 0
}

func ServeHTTP(handler http.Handler, address string) error {
	httpServer := httpserver.Configured(handler, address)
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	shutdownDone := make(chan struct{})
	go func() { defer close(shutdownDone); shutdownOnSignal(ctx, httpServer) }()
	slog.Info("portfolio ready", "address", address)
	err := httpServer.ListenAndServe()
	// Unblock the shutdown goroutine on a bind failure as well as on a signal.
	stop()
	<-shutdownDone
	return listenResult(err)
}

func shutdownOnSignal(ctx context.Context, httpServer *http.Server) {
	<-ctx.Done()
	shutdown, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := httpServer.Shutdown(shutdown); err != nil {
		slog.Error("shutdown", "error", err)
	}
}

func listenResult(err error) error {
	if errors.Is(err, http.ErrServerClosed) {
		return nil
	}
	return err
}
