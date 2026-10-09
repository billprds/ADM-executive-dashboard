CREATE TABLE adm_notes (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID        NOT NULL REFERENCES adm_projects(id) ON DELETE CASCADE,
    text       TEXT        NOT NULL,
    author     TEXT        NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
