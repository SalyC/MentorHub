package grade

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

type CreateAssignmentRequest struct {
	CourseID    uuid.UUID `json:"course_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	MaxScore    int       `json:"max_score"`
	Deadline    time.Time `json:"deadline"`
}

type SubmitRequest struct {
	AssignmentID uuid.UUID `json:"assignment_id"`
	Content      string    `json:"content"`
}

type GradeSubmission struct {
	Score    int    `json:"score"`
	Feedback string `json:"feedback"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func (h *Handler) CreateAssignment(w http.ResponseWriter, r *http.Request) {
	var req CreateAssignmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid request body"})
		return
	}
	userID, ok := r.Context().Value("userID").(uuid.UUID)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	_ = userID

	assignment, err := h.service.CreateAssignment(r.Context(), req.CourseID, req.Title, req.Description, req.MaxScore, req.Deadline)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "failed to create assignment"})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(assignment)
}

func (h *Handler) SubmitAssignment(w http.ResponseWriter, r *http.Request) {
	var req SubmitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid request body"})
		return
	}
	userID, ok := r.Context().Value("userID").(uuid.UUID)
	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	subm, err := h.service.SubmitAssignment(r.Context(), req.AssignmentID, userID, req.Content)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "failed to submit assignment"})
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(subm)
}

func (h *Handler) GradeSubmission(w http.ResponseWriter, r *http.Request) {
	var req GradeSubmission
	submIDStr := r.PathValue("submissionID")
	submID, err := uuid.Parse(submIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid request body"})
		return
	}

	if err := h.service.GradeSubmission(r.Context(), submID, req.Score, req.Feedback); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "graded"})
}

func (h *Handler) GetAssignments(w http.ResponseWriter, r *http.Request) {
	assignmentIDStr := r.URL.Query().Get("course_id")
	assignmentID, err := uuid.Parse(assignmentIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "invalid assignment ID format"})
		return
	}

	courseID, err := h.service.GetAssignments(r.Context(), assignmentID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(courseID)
}
func (h *Handler) GetSubmissions(w http.ResponseWriter, r *http.Request) {
	assignmentIDStr := r.URL.Query().Get("assignment_id")
	assignmentID, err := uuid.Parse(assignmentIDStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "status unauthorizated"})
		return
	}

	submJSON, err := h.service.GetSubmissions(r.Context(), assignmentID)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(submJSON)
}
