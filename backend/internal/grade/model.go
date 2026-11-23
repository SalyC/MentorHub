package grade

import (
	"time"

	"github.com/google/uuid"
)

type Assignment struct {
	ID          uuid.UUID `db:"id" json:"id"`
	CourseID    uuid.UUID `db:"course_id" json:"course_id"`
	Title       string    `db:"title" json:"title"`
	Description string    `db:"description" json:"description"`
	MaxScore    int       `db:"max_score" json:"max_score"`
	Deadline    time.Time `db:"deadline" json:"deadline"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}

type Submission struct {
	ID           uuid.UUID  `db:"id" json:"id"`
	AssignmentID uuid.UUID  `db:"assignment_id" json:"assignment_id"`
	StudentID    uuid.UUID  `db:"student_id" json:"student_id"`
	Content      string     `db:"content" json:"content"`
	Score        *int       `db:"score" json:"score"`
	Feedback     *string    `db:"feedback" json:"feedback"`
	SubmittedAt  time.Time  `db:"submitted_at" json:"submitted_at"`
	GradedAt     *time.Time `db:"graded_at" json:"graded_at"`
}
