package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

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

	repo := course.NewCourseRepository(dbConn)
	svc := course.NewService(repo)
	handler := course.NewHandler(svc)
	mux := http.NewServeMux()
	mux.HandleFunc("POST /courses", handler.CreateCourse)
	mux.HandleFunc("GET /courses", handler.GetCourses)
	mux.HandleFunc("POST /courses/{courseID}/modules", handler.AddModule)

	log.Printf("Starting Course Service on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
