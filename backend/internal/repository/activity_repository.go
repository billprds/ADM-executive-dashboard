package repository

import (
	"database/sql"
	"github.com/angkas/delivery/internal/entity"
)

type ActivityRepository struct{ db *sql.DB }

func NewActivityRepository(db *sql.DB) *ActivityRepository { return &ActivityRepository{db: db} }

const activityCols = `id, project_id, name, type, status, team, start_date, due_date, sort_order, created_at, updated_at`

func scanActivities(rows *sql.Rows) ([]entity.Activity, error) {
	var out []entity.Activity
	for rows.Next() {
		var a entity.Activity
		if err := rows.Scan(&a.ID, &a.ProjectID, &a.Name, &a.Type, &a.Status, &a.Team, &a.StartDate, &a.DueDate, &a.SortOrder, &a.CreatedAt, &a.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, a)
	}
	return out, nil
}

func (r *ActivityRepository) ListAll() ([]entity.Activity, error) {
	rows, err := r.db.Query(`SELECT ` + activityCols + ` FROM adm_activities ORDER BY project_id, sort_order ASC, created_at ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanActivities(rows)
}

func (r *ActivityRepository) ListByProject(projectID string) ([]entity.Activity, error) {
	rows, err := r.db.Query(`SELECT `+activityCols+` FROM adm_activities WHERE project_id=$1 ORDER BY sort_order ASC, created_at ASC`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanActivities(rows)
}

func (r *ActivityRepository) Create(projectID, name, actType, status, team string, startDate, dueDate *string) (*entity.Activity, error) {
	var a entity.Activity
	err := r.db.QueryRow(`INSERT INTO adm_activities (project_id, name, type, status, team, start_date, due_date) VALUES ($1,$2,$3,$4,$5,$6::date,$7::date) RETURNING `+activityCols,
		projectID, name, actType, status, team, startDate, dueDate).
		Scan(&a.ID, &a.ProjectID, &a.Name, &a.Type, &a.Status, &a.Team, &a.StartDate, &a.DueDate, &a.SortOrder, &a.CreatedAt, &a.UpdatedAt)
	return &a, err
}

func (r *ActivityRepository) Update(id, name, actType, status, team string, startDate, dueDate *string) (*entity.Activity, error) {
	var a entity.Activity
	err := r.db.QueryRow(`UPDATE adm_activities SET name=$1, type=$2, status=$3, team=$4, start_date=$5::date, due_date=$6::date, updated_at=NOW() WHERE id=$7 RETURNING `+activityCols,
		name, actType, status, team, startDate, dueDate, id).
		Scan(&a.ID, &a.ProjectID, &a.Name, &a.Type, &a.Status, &a.Team, &a.StartDate, &a.DueDate, &a.SortOrder, &a.CreatedAt, &a.UpdatedAt)
	return &a, err
}

func (r *ActivityRepository) Delete(id string) error {
	_, err := r.db.Exec(`DELETE FROM adm_activities WHERE id=$1`, id)
	return err
}

func (r *ActivityRepository) Reorder(ids []string) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	for i, id := range ids {
		if _, err := tx.Exec(`UPDATE adm_activities SET sort_order=$1 WHERE id=$2`, i, id); err != nil {
			return err
		}
	}
	return tx.Commit()
}
