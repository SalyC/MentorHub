package course

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

const (
	queryInsertCourse = `INSERT INTO courses (id, mentor_id, title, description, cover_url, created_at, updated_at) 
	VALUES (:id, :mentor_id, :title, :description, :cover_url, :created_at, :updated_at)`
	querySelectCourses    = `SELECT * FROM courses ORDER BY created_at DESC`
	querySelectCourseByID = `SELECT * FROM courses WHERE id = $1`
	queryInsertModule     = `INSERT INTO modules (id, course_id, title, content, order_index, created_at, updated_at)
	VALUES (:id, :course_id, :title, :content, :order_index, :created_at, :updated_at)`
	querySelectModulesByCourseID = `SELECT * FROM modules WHERE course_id = $1 ORDER BY order_index ASC`
)

type CourseRepository struct {
	db *sqlx.DB
}

func NewCourseRepository(db *sqlx.DB) *CourseRepository {
	return &CourseRepository{db: db}
}

func (r *CourseRepository) CreateCourse(ctx context.Context, course *Course) error {
	_, err := r.db.NamedExecContext(ctx, queryInsertCourse, course)
	if err != nil {
		return fmt.Errorf("insert course: %w", err)
	}
	return nil
}
func (r *CourseRepository) GetCourses(ctx context.Context) ([]Course, error) {
	var courses []Course
	if err := r.db.SelectContext(ctx, &courses, querySelectCourses); err != nil {
		return nil, fmt.Errorf("select courses: %w", err)
	}
	return courses, nil
}
func (r *CourseRepository) GetCourseByID(ctx context.Context, id uuid.UUID) (*Course, error) {
	var courses Course
	if err := r.db.GetContext(ctx, &courses, querySelectCourseByID, id); err != nil {
		return nil, fmt.Errorf("select course by id: %w", err)
	}
	return &courses, nil
}
func (r *CourseRepository) CreateModule(ctx context.Context, module *Module) error {
	_, err := r.db.NamedExecContext(ctx, queryInsertModule, module)
	if err != nil {
		return fmt.Errorf("insert module: %w", err)
	}
	return nil
}
func (r *CourseRepository) GetModulesByCourseID(ctx context.Context, courseID uuid.UUID) ([]Module, error) {
	var modules []Module
	if err := r.db.SelectContext(ctx, &modules, querySelectModulesByCourseID, courseID); err != nil {
		return nil, fmt.Errorf("select modules: %w", err)
	}
	return modules, nil
}
