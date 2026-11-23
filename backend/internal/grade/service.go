package grade

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/segmentio/kafka-go"
)

type SubmissionGradedEvent struct {
	SubmissionID uuid.UUID `json:"submission_id"`
	Score        int       `json:"score"`
	Feedback     string    `json:"feedback"`
}
type Service struct {
	repo     *GradeRepository
	producer EventProducer
}

func NewService(repo *GradeRepository, producer EventProducer) *Service {
	return &Service{repo: repo, producer: producer}
}

type EventProducer interface {
	WriteMessages(ctx context.Context, msgs ...kafka.Message) error
}

func (s *Service) CreateAssignment(ctx context.Context, courseID uuid.UUID, title, description string, maxScore int, deadline time.Time) (*Assignment, error) {
	assignment := Assignment{
		ID:          uuid.New(),
		CourseID:    courseID,
		Title:       title,
		Description: description,
		MaxScore:    maxScore,
		Deadline:    deadline,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := s.repo.CreateAssignment(ctx, &assignment); err != nil {
		return nil, fmt.Errorf("create assignment: %w", err)
	}

	return &assignment, nil
}

func (s *Service) GetAssignments(ctx context.Context, courseID uuid.UUID) ([]Assignment, error) {
	assig, err := s.repo.GetAssignmentsByCourseID(ctx, courseID)
	if err != nil {
		return nil, fmt.Errorf("get assignments: %w", err)
	}

	return assig, nil
}

func (s *Service) SubmitAssignment(ctx context.Context, assignmentID, studentID uuid.UUID, content string) (*Submission, error) {
	subm := Submission{
		ID:           uuid.New(),
		AssignmentID: assignmentID,
		StudentID:    studentID,
		Content:      content,
		SubmittedAt:  time.Now(),
	}

	if err := s.repo.CreateSubmission(ctx, &subm); err != nil {
		return nil, fmt.Errorf("create submissions: %w", err)
	}
	return &subm, nil
}

func (s *Service) GetSubmissions(ctx context.Context, assignmentID uuid.UUID) ([]Submission, error) {
	subm, err := s.repo.GetSubmissionsByAssignmentID(ctx, assignmentID)
	if err != nil {
		return nil, fmt.Errorf("get submissions: %w", err)
	}
	return subm, nil
}

func (s *Service) GradeSubmission(ctx context.Context, submissionID uuid.UUID, score int, feedback string) error {
	if err := s.repo.GradeSubmission(ctx, submissionID, score, feedback); err != nil {
		return fmt.Errorf("grade submissions: %w", err)
	}

	submGradeEvent := SubmissionGradedEvent{
		SubmissionID: submissionID,
		Score:        score,
		Feedback:     feedback,
	}

	payload, err := json.Marshal(submGradeEvent)
	if err != nil {
		return fmt.Errorf("marshal event: %w", err)
	}

	if err := s.producer.WriteMessages(ctx, kafka.Message{
		Topic: "submission.graded",
		Value: payload,
	}); err != nil {
		return fmt.Errorf("publish submission.graded: %w", err)
	}

	return nil
}
