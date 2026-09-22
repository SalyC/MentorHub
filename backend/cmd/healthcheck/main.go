package main

import (
	"fmt"
	"log"

	"github.com/SalyC/mentorhub/backend/internal/config"
<<<<<<< Updated upstream
=======
	"github.com/SalyC/mentorhub/backend/internal/db"
	"github.com/SalyC/mentorhub/backend/internal/redisclient"
>>>>>>> Stashed changes
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("cfg load failed :( : %v", err)
	}

<<<<<<< Updated upstream
=======
	ctx := context.Background()
	pool, err := db.New(ctx, cfg.DB)
	if err != nil {
		log.Fatalf("DB connect failed: %v", err)
	}
	defer pool.Close()
	fmt.Println("Postgres: connected")

	redisClient, err := redisclient.New(ctx, cfg.Redis)
	if err != nil {
		log.Fatalf("Redis connect failed: %v", err)
	}
	defer redisClient.Close()
	fmt.Println("Redis: connected")

>>>>>>> Stashed changes
	fmt.Println("=== App ===")
	fmt.Printf("Env:      %s\n", cfg.App.Env)
	fmt.Printf("Port:     %d\n", cfg.App.Port)
	fmt.Printf("LogLevel: %s\n", cfg.App.LogLevel)

	fmt.Println("=== DB ===")
	fmt.Printf("Host:     %s\n", cfg.DB.Host)
	fmt.Printf("Port:     %d\n", cfg.DB.Port)
	fmt.Printf("User:     %s\n", cfg.DB.User)
	fmt.Printf("Name:     %s\n", cfg.DB.Name)
	fmt.Printf("SSLMode:  %s\n", cfg.DB.SSLMode)
	fmt.Println("=== Redis ===")
	fmt.Printf("Host: %s\n", cfg.Redis.Host)
	fmt.Printf("Port: %d\n", cfg.Redis.Port)
	fmt.Printf("DB: %d\n", cfg.Redis.DB)
	fmt.Println("=== Kafka ===")
	fmt.Printf("Brokers %v\n", cfg.Kafka.Brokers)
	fmt.Println("=== JWT ===")
	fmt.Printf("AccessTTL %v\n", cfg.JWT.AccessTTL)
	fmt.Printf("RefreshTTL %v\n", cfg.JWT.RefreshTTL)
}
