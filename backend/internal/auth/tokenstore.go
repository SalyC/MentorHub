package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

type TokenStore struct {
	client *redis.Client
}

func NewTokenStore(client *redis.Client) *TokenStore {
	return &TokenStore{
		client: client,
	}
}

func (s *TokenStore) key(userID uuid.UUID, tokenID string) string {
	return fmt.Sprintf("refresh:%s:%s", userID.String(), tokenID)
}

func (s *TokenStore) Save(ctx context.Context, userID uuid.UUID, tokenID string, ttl time.Duration) error {
	key := s.key(userID, tokenID)
	err := s.client.Set(ctx, key, "1", ttl).Err()
	if err != nil {
		return fmt.Errorf("save refresh token: %w", err)
	}
	return nil
}

func (s *TokenStore) Exists(ctx context.Context, userID uuid.UUID, tokenID string) (bool, error) {
	key := s.key(userID, tokenID)
	count, err := s.client.Exists(ctx, key).Result()
	if err != nil {
		return false, fmt.Errorf("check refresh token: %w", err)
	}
	return count == 1, nil
}

func (s *TokenStore) Delete(ctx context.Context, userID uuid.UUID, tokenID string) error {
	key := s.key(userID, tokenID)
	err := s.client.Del(ctx, key).Err()
	if err != nil {
		return fmt.Errorf("delete refresh token: %w", err)
	}
	return nil
}
