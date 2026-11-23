package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/SalyC/mentorhub/backend/internal/auth"
	"github.com/SalyC/mentorhub/backend/internal/config"
	"github.com/SalyC/mentorhub/backend/internal/course"
	"github.com/SalyC/mentorhub/backend/internal/db"
	"github.com/SalyC/mentorhub/backend/internal/grade"
	"github.com/SalyC/mentorhub/backend/internal/kafkaclient"
	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("cfg load failed: %v", err)
	}
	ctx := context.Background()
	addr := fmt.Sprintf(":%d", cfg.App.GradePort)

	dbConn, err := db.New(ctx, cfg.DB)
	if err != nil {
		log.Fatalf("db load failed: %v", err)
	}
	defer dbConn.Close()
	producer := kafkaclient.NewProducer(cfg.Kafka)
	defer producer.Close()

	tm := auth.NewTokenManager(cfg.JWT.Secret, cfg.JWT.AccessTTL, cfg.JWT.RefreshTTL)

	repo := grade.NewGradeRepository(dbConn)
	svc := grade.NewService(repo, producer)
	handler := grade.NewHandler(svc)
	mux := http.NewServeMux()

	mux.Handle("POST /assignments", course.AuthMiddleware(tm)(http.HandlerFunc(handler.CreateAssignment)))
	mux.HandleFunc("GET /assignments", handler.GetAssignments)

	mux.Handle("POST /submissions", course.AuthMiddleware(tm)(http.HandlerFunc(handler.SubmitAssignment)))
	mux.HandleFunc("GET /submissions", handler.GetSubmissions)

	mux.Handle("POST /submissions/{submissionID}/grade", course.AuthMiddleware(tm)(http.HandlerFunc(handler.GradeSubmission)))

	log.Printf("Starting Grade Service on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
