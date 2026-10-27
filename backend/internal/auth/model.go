package auth

import (
	"time"

	"github.com/google/uuid"
)

type Role string

const (
	RoleStudent Role = "student"
	RoleMentor  Role = "mentor"
	RoleAdmin   Role = "admin"
)

type User struct {
	ID           uuid.UUID `db:"id" json:"id"`
	Email        string    `db:"email" json:"email"`
	PasswordHash string    `db:"password_hash" json:"-"`
	Role         Role      `db:"role" json:"role"`
	IsBlocked    bool      `db:"is_blocked" json:"is_blocked"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time `db:"updated_at" json:"updated_at"`
}
