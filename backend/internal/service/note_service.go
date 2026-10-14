package service

import (
	"github.com/angkas/delivery/internal/entity"
	"github.com/angkas/delivery/internal/repository"
)

type NoteService struct{ repo *repository.NoteRepository }

func NewNoteService(repo *repository.NoteRepository) *NoteService {
	return &NoteService{repo: repo}
}

func (s *NoteService) ListByProject(projectID string) ([]entity.Note, error) {
	return s.repo.ListByProject(projectID)
}
func (s *NoteService) Create(projectID, text, author string) (*entity.Note, error) {
	return s.repo.Create(projectID, text, author)
}
func (s *NoteService) Update(id, text string) (*entity.Note, error) {
	return s.repo.Update(id, text)
}
func (s *NoteService) Delete(id string) error { return s.repo.Delete(id) }
