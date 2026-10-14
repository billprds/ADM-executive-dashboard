package repository

import (
	"database/sql"
	"time"

	"github.com/angkas/delivery/internal/entity"
)

type NoteRepository struct{ db *sql.DB }

func NewNoteRepository(db *sql.DB) *NoteRepository { return &NoteRepository{db: db} }

func (r *NoteRepository) ListByProject(projectID string) ([]entity.Note, error) {
	rows, err := r.db.Query(`SELECT id, project_id, text, author, edited_at, created_at FROM adm_notes WHERE project_id=$1 ORDER BY created_at ASC`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []entity.Note
	for rows.Next() {
		var n entity.Note
		if err := rows.Scan(&n.ID, &n.ProjectID, &n.Text, &n.Author, &n.EditedAt, &n.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, n)
	}
	return out, nil
}

func (r *NoteRepository) Create(projectID, text, author string) (*entity.Note, error) {
	var n entity.Note
	err := r.db.QueryRow(`INSERT INTO adm_notes (project_id, text, author) VALUES ($1,$2,$3) RETURNING id, project_id, text, author, edited_at, created_at`,
		projectID, text, author).Scan(&n.ID, &n.ProjectID, &n.Text, &n.Author, &n.EditedAt, &n.CreatedAt)
	return &n, err
}

func (r *NoteRepository) Update(id, text string) (*entity.Note, error) {
	now := time.Now()
	var n entity.Note
	err := r.db.QueryRow(`UPDATE adm_notes SET text=$1, edited_at=$2 WHERE id=$3 RETURNING id, project_id, text, author, edited_at, created_at`,
		text, now, id).Scan(&n.ID, &n.ProjectID, &n.Text, &n.Author, &n.EditedAt, &n.CreatedAt)
	return &n, err
}

func (r *NoteRepository) Delete(id string) error {
	_, err := r.db.Exec(`DELETE FROM adm_notes WHERE id=$1`, id)
	return err
}
