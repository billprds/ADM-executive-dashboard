package entity

import "time"

type Activity struct {
	ID        string     `json:"id"`
	ProjectID string     `json:"project_id"`
	Name      string     `json:"name"`
	Type      string     `json:"type"`
	Status    string     `json:"status"`
	Team      string     `json:"team"`
	StartDate *time.Time `json:"start_date"`
	DueDate   *time.Time `json:"due_date"`
	SortOrder int        `json:"sort_order"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}
