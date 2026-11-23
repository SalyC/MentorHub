CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    max_score INT NOT NULL DEFAULT 100,
    deadline TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY,
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    score INT,
    feedback TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    graded_at TIMESTAMPTZ
);