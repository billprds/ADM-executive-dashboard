package entity

import "time"

type Note struct {
	ID        string    `json:"id"`
	ProjectID string    `json:"project_id"`
	Text      string    `json:"text"`
	Author    string    `json:"author"`
	CreatedAt time.Time `json:"created_at"`
}
