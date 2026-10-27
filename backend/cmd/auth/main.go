package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/SalyC/mentorhub/backend/internal/auth"
	"github.com/SalyC/mentorhub/backend/internal/config"
	"github.com/SalyC/mentorhub/backend/internal/db"
	"github.com/SalyC/mentorhub/backend/internal/kafkaclient"
	"github.com/SalyC/mentorhub/backend/internal/redisclient"
	"github.com/go-chi/chi/v5"
	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("cfg load failed: %v", err)
	}
	ctx := context.Background()

	dbConn, err := db.New(ctx, cfg.DB)
	if err != nil {
		log.Fatalf("db load failed: %v", err)
	}
	defer dbConn.Close()

	rdb, err := redisclient.New(ctx, cfg.Redis)
	if err != nil {
		log.Fatalf("redis load failed: %v", err)
	}
	defer rdb.Close()

	producer := kafkaclient.NewProducer(cfg.Kafka)
	defer producer.Close()

	userRepo := auth.NewUserRepository(dbConn)
	tokenManager := auth.NewTokenManager(cfg.JWT.Secret, cfg.JWT.AccessTTL, cfg.JWT.RefreshTTL)
	tokenStore := auth.NewTokenStore(rdb)

	authService := auth.NewService(
		userRepo,
		tokenManager,
		tokenStore,
		producer,
		cfg.JWT.RefreshTTL,
	)

	authHandler := auth.NewHandler(authService)

	r := chi.NewRouter()
	r.Route("/auth", func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
		r.Post("/refresh", authHandler.Refresh)
		r.Post("/logout", authHandler.Logout)
	})

	addr := fmt.Sprintf(":%d", cfg.App.Port)
	log.Printf("Starting Auth Service on %s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Error starting auth service: %v", err)
	}
}
