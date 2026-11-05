package course

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/SalyC/mentorhub/backend/internal/auth"
)

func AuthMiddleware(tm *auth.TokenManager) func(http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authorization := r.Header.Get("Authorization")
			if !strings.HasPrefix(authorization, "Bearer ") {
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(ErrorResponse{Error: "missing or invalid authorization header"})
				return
			}
			token := strings.TrimPrefix(authorization, "Bearer ")
			claims, err := tm.ValidateToken(token)
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid or expired tokken"})
				return
			}
			ctx := context.WithValue(r.Context(), "userID", claims.UserID)
			ctx = context.WithValue(ctx, "userRole", claims.Role)
			h.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
