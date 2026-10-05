package db

import (
	"context"
	"fmt"

	"github.com/SalyC/mentorhub/backend/internal/config"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
)

func New(ctx context.Context, cfg config.DBConfig) (*sqlx.DB, error) {
	dsn := cfg.DSN()
	db, err := sqlx.ConnectContext(ctx, "pgx", dsn)
	if err != nil {
		return nil, fmt.Errorf("create pgx pool: %w", err)
	}
	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return nil, fmt.Errorf("ping postgres: %w", err)
	}
	return db, nil
}
