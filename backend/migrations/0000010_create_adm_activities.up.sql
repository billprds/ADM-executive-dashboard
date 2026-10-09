CREATE TABLE adm_activities (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID        NOT NULL REFERENCES adm_projects(id) ON DELETE CASCADE,
    name       TEXT        NOT NULL,
    type       TEXT        NOT NULL DEFAULT 'Task',
    status     TEXT        NOT NULL DEFAULT 'To Do',
    team       TEXT        NOT NULL DEFAULT '',
    start_date DATE,
    due_date   DATE,
    sort_order INT         NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
