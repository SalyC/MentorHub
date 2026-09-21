package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

func getEnv(key string) (string, error) {
	value := os.Getenv(key)
	if value == "" {
		return "", fmt.Errorf("environment variable %s is required", key)
	}
	return value, nil
}

func getEnvDefault(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func getEnvInt(key string) (int, error) {
	raw, err := getEnv(key)
	if err != nil {
		return 0, err
	}
	parsed, err := strconv.Atoi(raw)
	if err != nil {
		return 0, fmt.Errorf("environment variable %s must be a number: %w", key, err)
	}
	return parsed, nil
}

func getEnvDuration(key string) (time.Duration, error) {
	raw, err := getEnv(key)
	if err != nil {
		return 0, err
	}
	parsed, err := time.ParseDuration(raw)
	if err != nil {
		return 0, fmt.Errorf("environment variable %s must be a duration (e.g. 15m, 168h): %w", key, err)
	}
	return parsed, nil
}

func getEnvSlice(key, sep string) ([]string, error) {
	raw, err := getEnv(key)
	if err != nil {
		return nil, err
	}
	parts := strings.Split(raw, sep)
	for i := range parts {
		parts[i] = strings.TrimSpace(parts[i])
	}
	return parts, nil
}
