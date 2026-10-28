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
	mux := http.NewServeMux()
	mux.HandleFunc("/api/auth/", func(w http.ResponseWriter, r *http.Request) {
		r.URL.Path = strings.TrimPrefix(r.URL.Path, "/api")
		proxy.ServeHTTP(w, r)
	})

	addr := fmt.Sprintf(":%d", cfg.App.GatewayPort)
	log.Printf("Starting API Gateway on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server isn't started: %v", err)
	}
}
