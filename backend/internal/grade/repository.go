package grade

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type GradeRepository struct {
	db *sqlx.DB
}

func NewGradeRepository(db *sqlx.DB) *GradeRepository {
	return &GradeRepository{db: db}
}

const (
	queryInsertAssignment            = `INSERT INTO assignments (id, course_id, title, description, max_score, deadline, created_at, updated_at) VALUES (:id, :course_id, :title, :description, :max_score, :deadline, :created_at, :updated_at)`
	querySelectAssignmentsByCourseID = `SELECT * FROM assignments WHERE course_id = $1 ORDER BY created_at DESC`

	queryInsertSubmission = `INSERT INTO submissions (id, assignment_id, student_id, content, submitted_at) VALUES (:id, :assignment_id, :student_id, :content, :submitted_at)`

	querySelectSubmissionsByAssignmentID = `SELECT * FROM submissions WHERE assignment_id = $1 ORDER BY submitted_at ASC`
	queryGradeSubmission                 = `UPDATE submissions SET score = $1, feedback = $2, graded_at = NOW() WHERE id = $3`
)

func (r *GradeRepository) CreateAssignment(ctx context.Context, assignment *Assignment) error {
	_, err := r.db.NamedExecContext(ctx, queryInsertAssignment, assignment)
	if err != nil {
		return fmt.Errorf("insert assignment: %w", err)
	}
	return nil
}

func (r *GradeRepository) GetAssignmentsByCourseID(ctx context.Context, courseID uuid.UUID) ([]Assignment, error) {
	assignments := []Assignment{}
	if err := r.db.SelectContext(ctx, &assignments, querySelectAssignmentsByCourseID, courseID); err != nil {
		return nil, fmt.Errorf("select assignment: %w", err)
	}
	return assignments, nil
}

func (r *GradeRepository) CreateSubmission(ctx context.Context, submission *Submission) error {
	_, err := r.db.NamedExecContext(ctx, queryInsertSubmission, submission)
	if err != nil {
		return fmt.Errorf("insert submission: %w", err)
	}
	return nil
}

func (r *GradeRepository) GetSubmissionsByAssignmentID(ctx context.Context, assignmentID uuid.UUID) ([]Submission, error) {
	submission := []Submission{}
	if err := r.db.SelectContext(ctx, &submission, querySelectSubmissionsByAssignmentID, assignmentID); err != nil {
		return nil, fmt.Errorf("select submissions: %w", err)
	}
	return submission, nil
}

func (r *GradeRepository) GradeSubmission(ctx context.Context, submissionID uuid.UUID, score int, feedback string) error {
	_, err := r.db.ExecContext(ctx, queryGradeSubmission, score, feedback, submissionID)
	if err != nil {
		return fmt.Errorf("grade submission: %w", err)
	}
	return nil
}
