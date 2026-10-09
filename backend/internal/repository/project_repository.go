package repository

import (
	"database/sql"
	"github.com/angkas/delivery/internal/entity"
)

type ProjectRepository struct{ db *sql.DB }

func NewProjectRepository(db *sql.DB) *ProjectRepository { return &ProjectRepository{db: db} }

func (r *ProjectRepository) List() ([]entity.Project, error) {
	rows, err := r.db.Query(`SELECT id, name, number, progress, sort_order, created_at, updated_at FROM adm_projects ORDER BY sort_order ASC, created_at ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []entity.Project
	for rows.Next() {
		var p entity.Project
		if err := rows.Scan(&p.ID, &p.Name, &p.Number, &p.Progress, &p.SortOrder, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, nil
}

func (r *ProjectRepository) Create(name, number string) (*entity.Project, error) {
	var p entity.Project
	err := r.db.QueryRow(`INSERT INTO adm_projects (name, number) VALUES ($1, $2) RETURNING id, name, number, progress, sort_order, created_at, updated_at`, name, number).
		Scan(&p.ID, &p.Name, &p.Number, &p.Progress, &p.SortOrder, &p.CreatedAt, &p.UpdatedAt)
	return &p, err
}

func (r *ProjectRepository) Update(id, name, number string, progress int) (*entity.Project, error) {
	var p entity.Project
	err := r.db.QueryRow(`UPDATE adm_projects SET name=$1, number=$2, progress=$3, updated_at=NOW() WHERE id=$4 RETURNING id, name, number, progress, sort_order, created_at, updated_at`, name, number, progress, id).
		Scan(&p.ID, &p.Name, &p.Number, &p.Progress, &p.SortOrder, &p.CreatedAt, &p.UpdatedAt)
	return &p, err
}

func (r *ProjectRepository) Delete(id string) error {
	_, err := r.db.Exec(`DELETE FROM adm_projects WHERE id=$1`, id)
	return err
}

func (r *ProjectRepository) Reorder(ids []string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	for i, id := range ids {
		if _, err := tx.Exec(`UPDATE adm_projects SET sort_order=$1 WHERE id=$2`, i, id); err != nil {
			return err
		}
	}
	return tx.Commit()
}
