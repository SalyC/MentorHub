package course

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// ! надо запомнить, что это и есть DTO ! //
type CreateCourseRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	CoverURL    string `json:"cover_url"`
}

type AddModuleRequest struct {
	Title      string `json:"title"`
	Content    string `json:"content"`
	OrderIndex int    `json:"order_index"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func (h *Handler) CreateCourse(w http.ResponseWriter, r *http.Request) {
	var req CreateCourseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid request body"})
		return
	}

	mentorIDStr := r.Header.Get("X-User-ID")
	if mentorIDStr == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "X-User-ID header is required"})
		return
	}
	mentorUUID, err := uuid.Parse(mentorIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid X-User-ID format"})
		return
	}

	course, err := h.service.CreateCourse(r.Context(), mentorUUID, req.Title, req.Description, req.CoverURL)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "failed to create course"})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(course)
}
