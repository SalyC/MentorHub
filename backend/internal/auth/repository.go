package auth

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

const (
	queryInsertUser        = `INSERT INTO users (id, email, password_hash, role, is_blocked, created_at, updated_at) VALUES (:id, :email, :password_hash, :role, :is_blocked, :created_at, :updated_at)`
	querySelectUserByEmail = `SELECT * FROM users WHERE email = $1`
	querySelectUserByID    = `SELECT * FROM users WHERE id = $1`
	queryUpdateUserRole    = `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2`
	queryUpdateUserBlocked = `UPDATE users SET is_blocked = $1, updated_at = NOW() WHERE id = $2`
)

type UserRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

func (r *UserRepository) Create(ctx context.Context, user *User) error {
	_, err := r.db.NamedExecContext(ctx, queryInsertUser, user)
	if err != nil {
		return fmt.Errorf("insert user: %w", err)
	}
	return nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*User, error) {
	var user User
	err := r.db.GetContext(ctx, &user, querySelectUserByEmail, email)
	if err != nil {
		return nil, fmt.Errorf("select user by email: %w", err)
	}
	return &user, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id uuid.UUID) (*User, error) {
	var user User
	err := r.db.GetContext(ctx, &user, querySelectUserByID, id)
	if err != nil {
		return nil, fmt.Errorf("select user by id: %w", err)
	}
	return &user, nil
}

func (r *UserRepository) UpdateRole(ctx context.Context, id uuid.UUID, role Role) error {
	_, err := r.db.ExecContext(ctx, queryUpdateUserRole, role, id)
	if err != nil {
		return fmt.Errorf("update user role: %w", err)
	}
	return nil
}

func (r *UserRepository) SetBlocked(ctx context.Context, id uuid.UUID, blocked bool) error {
	_, err := r.db.ExecContext(ctx, queryUpdateUserBlocked, blocked, id)
	if err != nil {
		return fmt.Errorf("update user blocked: %w", err)
	}
	return nil
}
