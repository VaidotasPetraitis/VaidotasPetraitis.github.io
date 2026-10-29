package main

import (
	"errors"
	"net/http"
	"testing"
)

func TestExitCodeForSuccess(t *testing.T) {
	if exitCode(nil) != 0 {
		t.Error("successful process should exit zero")
	}
}

func TestExitCodeForNormalShutdown(t *testing.T) {
	if exitCode(http.ErrServerClosed) != 0 {
		t.Error("normal shutdown should exit zero")
	}
}

func TestExitCodeForFailure(t *testing.T) {
	if exitCode(errors.New("failure")) != 1 {
		t.Error("failed process should exit one")
	}
}
