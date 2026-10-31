package main

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	"github.com/SalyC/mentorhub/backend/internal/config"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	authURL, err := url.Parse(fmt.Sprintf("http://localhost:%d", cfg.App.Port))
	if err != nil {
		log.Fatalf("invalid auth service url: %v", err)
	}
	proxy := httputil.NewSingleHostReverseProxy(authURL)
	courseURL, err := url.Parse(fmt.Sprintf("http://localhost:%d", cfg.App.CoursePort))
	if err != nil {
		log.Fatalf("invalid course service URL: %v", err)
	}
	courseProxy := httputil.NewSingleHostReverseProxy(courseURL)
	mux := http.NewServeMux()
	mux.HandleFunc("/api/auth/", func(w http.ResponseWriter, r *http.Request) {
		r.URL.Path = strings.TrimPrefix(r.URL.Path, "/api")
		proxy.ServeHTTP(w, r)
	})
	mux.HandleFunc("/api/courses", func(w http.ResponseWriter, r *http.Request) {
		r.URL.Path = strings.TrimPrefix(r.URL.Path, "/api")
		courseProxy.ServeHTTP(w, r)
	})
	mux.HandleFunc("/api/courses/", func(w http.ResponseWriter, r *http.Request) {
		r.URL.Path = strings.TrimPrefix(r.URL.Path, "/api")
		courseProxy.ServeHTTP(w, r)
	})

	addr := fmt.Sprintf(":%d", cfg.App.GatewayPort)

	corsMux := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		mux.ServeHTTP(w, r)
	})

	log.Printf("Starting API Gateway on %s", addr)
	if err := http.ListenAndServe(addr, corsMux); err != nil {
		log.Fatalf("Server isn't started: %v", err)
	}
}
