package config

import (
	"fmt"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	App   AppConfig
	DB    DBConfig
	Redis RedisConfig
	Kafka KafkaConfig
	JWT   JWTConfig
}

type AppConfig struct {
	Env      string
	Port     int
	LogLevel string
}

type DBConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	Name     string
	SSLMode  string
}

type RedisConfig struct {
	Host     string
	Port     int
	Password string
	DB       int
}

type KafkaConfig struct {
	Brokers []string
}

type JWTConfig struct {
	Secret     string
	AccessTTL  time.Duration
	RefreshTTL time.Duration
}

func (c DBConfig) DSN() string {
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s?sslmode=%s",
		c.User, c.Password, c.Host, c.Port, c.Name, c.SSLMode,
	)
}

func (c RedisConfig) Addr() string {
	return fmt.Sprintf("%s:%d", c.Host, c.Port)
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	appPort, err := getEnvInt("APP_PORT")
	if err != nil {
		return nil, fmt.Errorf("app config: %w", err)
	}
	app := AppConfig{
		Env:      getEnvDefault("APP_ENV", "development"),
		Port:     appPort,
		LogLevel: getEnvDefault("LOG_LEVEL", "info"),
	}

	dbHost, err := getEnv("DB_HOST")
	if err != nil {
		return nil, fmt.Errorf("db config: %w", err)
	}
	dbPort, err := getEnvInt("DB_PORT")
	if err != nil {
		return nil, fmt.Errorf("db config: %w", err)
	}
	dbUser, err := getEnv("DB_USER")
	if err != nil {
		return nil, fmt.Errorf("db config: %w", err)
	}
	dbPassword, err := getEnv("DB_PASSWORD")
	if err != nil {
		return nil, fmt.Errorf("db config: %w", err)
	}
	dbName, err := getEnv("DB_NAME")
	if err != nil {
		return nil, fmt.Errorf("db config: %w", err)
	}
	db := DBConfig{
		Host:     dbHost,
		Port:     dbPort,
		User:     dbUser,
		Password: dbPassword,
		Name:     dbName,
		SSLMode:  getEnvDefault("DB_SSLMODE", "disable"),
	}

	redisHost, err := getEnv("REDIS_HOST")
	if err != nil {
		return nil, fmt.Errorf("redis config: %w", err)
	}
	redisPort, err := getEnvInt("REDIS_PORT")
	if err != nil {
		return nil, fmt.Errorf("redis config: %w", err)
	}
	redisDB, err := getEnvInt("REDIS_DB")
	if err != nil {
		return nil, fmt.Errorf("redis config: %w", err)
	}
	redisCfg := RedisConfig{
		Host:     redisHost,
		Port:     redisPort,
		Password: getEnvDefault("REDIS_PASSWORD", ""),
		DB:       redisDB,
	}

	brokers, err := getEnvSlice("KAFKA_BROKERS", ",")
	if err != nil {
		return nil, fmt.Errorf("kafka config: %w", err)
	}
	kafkaCfg := KafkaConfig{
		Brokers: brokers,
	}

	jwtSecret, err := getEnv("JWT_SECRET")
	if err != nil {
		return nil, fmt.Errorf("jwt config: %w", err)
	}
	accessTTL, err := getEnvDuration("JWT_ACCESS_TTL")
	if err != nil {
		return nil, fmt.Errorf("jwt config: %w", err)
	}
	refreshTTL, err := getEnvDuration("JWT_REFRESH_TTL")
	if err != nil {
		return nil, fmt.Errorf("jwt config: %w", err)
	}
	jwtCfg := JWTConfig{
		Secret:     jwtSecret,
		AccessTTL:  accessTTL,
		RefreshTTL: refreshTTL,
	}

	return &Config{
		App:   app,
		DB:    db,
		Redis: redisCfg,
		Kafka: kafkaCfg,
		JWT:   jwtCfg,
	}, nil
}
