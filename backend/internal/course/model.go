package course

import (
	"time"

	"github.com/google/uuid"
)

type Course struct {
	ID          uuid.UUID `db:"id" json:"id"`
	MentorID    uuid.UUID `db:"mentor_id" json:"mentor_id"`
	Title       string    `db:"title" json:"title"`
	Description string    `db:"description" json:"description"`
	CoverURL    string    `db:"cover_url" json:"cover_url"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time `db:"updated_at" json:"updated_at"`
}
type Module struct {
	ID         uuid.UUID `db:"id" json:"id"`
	CourseID   uuid.UUID `db:"course_id" json:"course_id"`
	Title      string    `db:"title" json:"title"`
	Content    string    `db:"content" json:"content"`
	OrderIndex int       `db:"order_index" json:"order_index"`
	CreatedAt  time.Time `db:"created_at" json:"created_at"`
	UpdatedAt  time.Time `db:"updated_at" json:"updated_at"`
}
