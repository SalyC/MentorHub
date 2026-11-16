package auth

import (
	"context"
	"database/sql"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/segmentio/kafka-go"
	"github.com/stretchr/testify/assert"
)

type mockUserRepository struct {
	user *User
	err  error
}

type mockProducer struct{}

type mockTokenManager struct{}
type mockTokenStore struct{}

func (m *mockUserRepository) Create(ctx context.Context, user *User) error {
	return nil
}
func (m *mockUserRepository) GetByEmail(ctx context.Context, email string) (*User, error) {
	return m.user, m.err
}
func (m *mockUserRepository) GetByID(ctx context.Context, ID uuid.UUID) (*User, error) {
	return m.user, m.err
}

func (p *mockProducer) WriteMessages(ctx context.Context, msgs ...kafka.Message) error {
	return nil
}

func (t *mockTokenManager) GenerateTokenPair(userID uuid.UUID, role Role) (string, string, error) {
	return "fake-access", "fake-refresh", nil
}
func (t *mockTokenManager) ValidateToken(token string) (*Claims, error) {
	return &Claims{
		UserID: uuid.New(),
		RegisteredClaims: jwt.RegisteredClaims{
			ID: "fake-jti-id",
		},
	}, nil
}

func (s *mockTokenStore) Save(ctx context.Context, userID uuid.UUID, tokenID string, ttl time.Duration) error {
	return nil
}
func (s *mockTokenStore) Delete(ctx context.Context, userID uuid.UUID, tokenID string) error {
	return nil
}
func (s *mockTokenStore) Exists(ctx context.Context, userID uuid.UUID, tokenID string) (bool, error) {
	return true, nil
}

func TestRegister(t *testing.T) {
	tests := []struct {
		name        string
		mockUser    *User
		mockErr     error
		expectedErr error
	}{
		{
			name:        "Успешная регистрация",
			mockUser:    nil,
			mockErr:     sql.ErrNoRows,
			expectedErr: nil,
		},
		{
			name:        "Email уже занят",
			mockUser:    &User{Email: "test@mail.ru"},
			mockErr:     nil,
			expectedErr: ErrEmailTaken,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockUserRepository{user: tt.mockUser, err: tt.mockErr}
			svc := NewService(mockRepo, nil, nil, &mockProducer{}, 0)

			_, err := svc.Register(context.Background(), "test@mail.ru", "password123")
			if tt.expectedErr != nil {
				assert.ErrorIs(t, err, tt.expectedErr)
			}
			if tt.expectedErr == nil {
				assert.NoError(t, err)
			}
		})
	}
}

func TestLogin(t *testing.T) {
	validHash, _ := HashPassword("password123")
	tests := []struct {
		name        string
		password    string
		mockUser    *User
		mockErr     error
		expectedErr error
	}{
		{
			name:        "Успешный вход",
			password:    "password123",
			mockUser:    &User{PasswordHash: validHash, IsBlocked: false},
			mockErr:     nil,
			expectedErr: nil,
		},
		{
			name:        "Неверный пароль",
			password:    "errorpassword",
			mockUser:    &User{PasswordHash: validHash, IsBlocked: false},
			mockErr:     nil,
			expectedErr: ErrInvalidCredentials,
		},
		{
			name:        "Заблокирован",
			password:    "password123",
			mockUser:    &User{PasswordHash: validHash, IsBlocked: true},
			mockErr:     nil,
			expectedErr: ErrUserBlocked,
		},
		{
			name:        "Не найден",
			password:    "password123",
			mockUser:    nil,
			mockErr:     sql.ErrNoRows,
			expectedErr: ErrInvalidCredentials,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := &mockUserRepository{user: tt.mockUser, err: tt.mockErr}
			svc := NewService(mockRepo, &mockTokenManager{}, &mockTokenStore{}, &mockProducer{}, 0)

			_, _, _, err := svc.Login(context.Background(), "test@mail.ru", tt.password)

			if tt.expectedErr != nil {
				assert.ErrorIs(t, err, tt.expectedErr)
			}
			if tt.expectedErr == nil {
				assert.NoError(t, err)
			}
		})
	}
}
