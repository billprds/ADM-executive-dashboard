package repository

import (
	"database/sql"
	"github.com/angkas/delivery/internal/entity"
)

type NoteRepository struct{ db *sql.DB }

func NewNoteRepository(db *sql.DB) *NoteRepository { return &NoteRepository{db: db} }

func (r *NoteRepository) ListByProject(projectID string) ([]entity.Note, error) {
	rows, err := r.db.Query(`SELECT id, project_id, text, author, created_at FROM adm_notes WHERE project_id=$1 ORDER BY created_at ASC`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []entity.Note
	for rows.Next() {
		var n entity.Note
		if err := rows.Scan(&n.ID, &n.ProjectID, &n.Text, &n.Author, &n.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, n)
	}
	return out, nil
}

func (r *NoteRepository) Create(projectID, text, author string) (*entity.Note, error) {
	var n entity.Note
	err := r.db.QueryRow(`INSERT INTO adm_notes (project_id, text, author) VALUES ($1,$2,$3) RETURNING id, project_id, text, author, created_at`, projectID, text, author).
		Scan(&n.ID, &n.ProjectID, &n.Text, &n.Author, &n.CreatedAt)
	return &n, err
}

func (r *NoteRepository) Delete(id string) error {
	_, err := r.db.Exec(`DELETE FROM adm_notes WHERE id=$1`, id)
	return err
}
