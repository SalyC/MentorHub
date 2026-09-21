package main

import (
	"fmt"
	"log"

	"github.com/SalyC/mentorhub/backend/internal/config"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("cfg load failed :( : %v", err)
	}

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
