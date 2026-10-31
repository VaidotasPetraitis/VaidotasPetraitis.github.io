package api

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGETPassesRequestAndPathParameters(t *testing.T) {
	router := NewRouter()
	var contexts []*Context
	router.GET("/projects/{slug}", func(c *Context) {
		contexts = append(contexts, c)
		c.JSON(http.StatusOK, map[string]string{"slug": c.Param("slug"), "method": c.Request.Method})
	})
	for _, method := range []string{"GET", "HEAD"} {
		response := httptest.NewRecorder()
		request := httptest.NewRequest(method, "/projects/quiz", nil)
		router.ServeHTTP(response, request)
		if response.Code != http.StatusOK {
			t.Fatalf("%s status = %d, want 200", method, response.Code)
		}
		context := contexts[len(contexts)-1]
		if context.Request != request || context.Writer != response || context.Param("slug") != "quiz" {
			t.Fatalf("%s received incorrect request context", method)
		}
	}
	if contexts[0] == contexts[1] {
		t.Fatal("context was reused across requests")
	}
}

func TestGETRejectsOtherMethods(t *testing.T) {
	router := NewRouter()
	router.GET("/profile", func(c *Context) { t.Fatal("GET handler ran for POST") })
	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest("POST", "/profile", nil))
	if response.Code != http.StatusMethodNotAllowed || response.Header().Get("Allow") != "GET, HEAD" {
		t.Fatalf("unexpected method response: %d, Allow %q", response.Code, response.Header().Get("Allow"))
	}
}
