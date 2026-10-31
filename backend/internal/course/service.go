package course

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Service struct {
	repo *CourseRepository
}

func NewService(repo *CourseRepository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateCourse(ctx context.Context, mentorID uuid.UUID, title, description, coverURL string) (*Course, error) {
	now := time.Now()
	course := &Course{
		ID:          uuid.New(),
		MentorID:    mentorID,
		Title:       title,
		Description: description,
		CoverURL:    coverURL,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := s.repo.CreateCourse(ctx, course); err != nil {
		return nil, fmt.Errorf("create course: %w", err)
	}

	return course, nil
}

func (s *Service) GetCourses(ctx context.Context) ([]Course, error) {
	courses, err := s.repo.GetCourses(ctx)
	if err != nil {
		return nil, fmt.Errorf("get courses: %w", err)
	}
	return courses, nil
}

func (s *Service) AddModule(ctx context.Context, courseID uuid.UUID, title, content string, orderIndex int) (*Module, error) {
	now := time.Now()
	module := &Module{
		ID:         uuid.New(),
		CourseID:   courseID,
		Title:      title,
		Content:    content,
		OrderIndex: orderIndex,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	if err := s.repo.CreateModule(ctx, module); err != nil {
		return nil, fmt.Errorf("create modulee: %w", err)
	}

	return module, nil
}
