package api

import "net/http"

type Router struct {
	mux *http.ServeMux
}

func NewRouter() *Router {
	return &Router{mux: http.NewServeMux()}
}

func (router *Router) GET(pattern string, handler Handler) {
	router.mux.HandleFunc("GET "+pattern, func(w http.ResponseWriter, r *http.Request) {
		handler(&Context{Writer: w, Request: r})
	})
}

func (router *Router) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	router.mux.ServeHTTP(w, r)
}
