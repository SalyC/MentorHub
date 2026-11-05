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
	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("cfg load failed: %v", err)
	}
	ctx := context.Background()
	addr := fmt.Sprintf(":%d", cfg.App.CoursePort)

	dbConn, err := db.New(ctx, cfg.DB)
	if err != nil {
		log.Fatalf("db load failed: %v", err)
	}

	tm := auth.NewTokenManager(cfg.JWT.Secret, cfg.JWT.AccessTTL, cfg.JWT.RefreshTTL)

	repo := course.NewCourseRepository(dbConn)
	svc := course.NewService(repo)
	handler := course.NewHandler(svc)
	mux := http.NewServeMux()

	//TODO:! ЗАЩИЩЕННЫЕ МАРШРУТЫ (онли авторизованные)
	mux.Handle("POST /courses", course.AuthMiddleware(tm)(http.HandlerFunc(handler.CreateCourse)))
	mux.Handle("POST /courses/{courseID}/modules", course.AuthMiddleware(tm)(http.HandlerFunc(handler.AddModule)))

	//TODO:! ПУБЛИЧНЫЕ МАРШРУТЫ (абсолютли все имеют доступ)
	mux.HandleFunc("GET /courses", handler.GetCourses)
	mux.HandleFunc("GET /courses/{courseID}", handler.GetCourseByID)
	mux.HandleFunc("GET /courses/{courseID}/modules", handler.GetModules)

	log.Printf("Starting Course Service on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
