package auth

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestHashPassword(t *testing.T) {
	password := "qwerty123"
	hash, err := HashPassword(password)

	assert.NoError(t, err)
	assert.NotEmpty(t, hash)
	assert.NotEqual(t, password, hash, "Хеш не должен совпадать с паролем в открытом виде")
}

func TestCheckPassword(t *testing.T) {
	correctPassword := "qwerty123"
	correctHash, _ := HashPassword(correctPassword)
	tests := []struct {
		name     string
		password string
		hash     string
		wantErr  bool
	}{
		{
			name:     "Правильный пароль",
			password: correctPassword,
			hash:     correctHash,
			wantErr:  false,
		},
		{
			name:     "Неправильный пароль",
			password: "qweqwe",
			hash:     correctHash,
			wantErr:  true,
		},
		{
			name:     "Пустой хеш",
			password: correctPassword,
			hash:     "",
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := CheckPassword(tt.password, tt.hash)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

// password := "qwerty123"
// hash, _ := HashPassword(password)

// err := CheckPassword(password, hash)
// assert.NoError(t, err, "Правильный пароль должен проходить проверку")

// err = CheckPassword("wrong_password_123123123123", hash)
// assert.Error(t, err, "Неправильный пароль не должен проходить проверку")
