package api

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

type Context struct {
	Writer  http.ResponseWriter
	Request *http.Request
}

type Handler func(*Context)

type errorResponse struct {
	Error struct {
		Message string `json:"message"`
	} `json:"error"`
}

func (c *Context) Param(name string) string {
	return c.Request.PathValue(name)
}

func (c *Context) JSON(status int, value any) {
	content, err := json.Marshal(value)
	if err != nil {
		slog.Error("encode response", "error", err)
		c.Error(http.StatusInternalServerError, "Unable to encode response.")
		return
	}

	c.Writer.Header().Set("Content-Type", "application/json; charset=utf-8")
	c.Writer.WriteHeader(status)
	if _, err := c.Writer.Write(content); err != nil {
		slog.Error("write response", "error", err)
	}
}

func (c *Context) Error(status int, message string) {
	var value errorResponse
	value.Error.Message = message
	c.JSON(status, value)
}
