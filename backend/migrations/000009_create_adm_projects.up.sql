CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE adm_projects (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT        NOT NULL,
    number     TEXT        NOT NULL DEFAULT '',
    progress   INT         NOT NULL DEFAULT 0,
    sort_order INT         NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
