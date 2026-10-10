package auth

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/segmentio/kafka-go"
)

var (
	ErrEmailTaken         = errors.New("email already taken")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrInvalidToken       = errors.New("invalid token")
	ErrUserBlocked        = errors.New("user is blocked")
)

type UserRegisteredEvent struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
}

type Service struct {
	userRepo     *UserRepository
	tokenManager *TokenManager
	tokenStore   *TokenStore
	producer     *kafka.Writer
	refreshTTL   time.Duration
}

func NewService(
	userRepo *UserRepository,
	tokenManager *TokenManager,
	tokenStore *TokenStore,
	producer *kafka.Writer,
	refreshTTL time.Duration,
) *Service {
	return &Service{
		userRepo:     userRepo,
		tokenManager: tokenManager,
		tokenStore:   tokenStore,
		producer:     producer,
		refreshTTL:   refreshTTL,
	}
}

func (s *Service) Register(ctx context.Context, email, password string) (*User, error) {
	now := time.Now()
	_, err := s.userRepo.GetByEmail(ctx, email)
	if err == nil {
		return nil, ErrEmailTaken
	}
	if !errors.Is(err, sql.ErrNoRows) {
		return nil, fmt.Errorf("check email: %w", err)
	}

	hash, err := HashPassword(password)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	user := &User{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: hash,
		Role:         RoleStudent,
		IsBlocked:    false,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
	if err = s.userRepo.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}

	event := UserRegisteredEvent{
		UserID: user.ID.String(),
		Email:  email,
		Role:   string(user.Role),
	}

	payload, err := json.Marshal(event)
	if err != nil {
		return nil, fmt.Errorf("marshal event: %w", err)
	}

	if err = s.producer.WriteMessages(ctx, kafka.Message{
		Topic: "user.registered",
		Value: payload,
	}); err != nil {
		return nil, fmt.Errorf("publish user.registered: %w", err) // TODO: вообще кафка не должна в проде ронять регу
	}
	return user, nil
}

func (s *Service) Login(ctx context.Context, email, password string) (string, string, error) {
	user, err := s.userRepo.GetByEmail(ctx, email)
	if errors.Is(err, sql.ErrNoRows) {
		return "", "", ErrInvalidCredentials
	}
	if err != nil {
		return "", "", fmt.Errorf("get user by email: %w", err)
	}

	err = CheckPassword(password, user.PasswordHash)
	if err != nil {
		return "", "", ErrInvalidCredentials
	}
	if user.IsBlocked {
		return "", "", ErrUserBlocked
	}

	accessToken, refreshToken, err := s.tokenManager.GenerateTokenPair(user.ID, user.Role)
	if err != nil {
		return "", "", fmt.Errorf("generate token: %w", err)
	}

	claims, err := s.tokenManager.ValidateToken(refreshToken)
	if err != nil {
		return "", "", fmt.Errorf("validate refresh: %w", err)
	}

	err = s.tokenStore.Save(ctx, user.ID, claims.ID, s.refreshTTL)
	if err != nil {
		return "", "", fmt.Errorf("save refresh token: %w", err)
	}
	return accessToken, refreshToken, nil
}
