package service

import (
	"github.com/angkas/delivery/internal/entity"
	"github.com/angkas/delivery/internal/repository"
)

type ActivityService struct{ repo *repository.ActivityRepository }

func NewActivityService(repo *repository.ActivityRepository) *ActivityService {
	return &ActivityService{repo: repo}
}

func (s *ActivityService) ListAll() ([]entity.Activity, error) { return s.repo.ListAll() }
func (s *ActivityService) ListByProject(projectID string) ([]entity.Activity, error) {
	return s.repo.ListByProject(projectID)
}
func (s *ActivityService) Create(projectID, name, actType, status, team string, startDate, dueDate *string) (*entity.Activity, error) {
	return s.repo.Create(projectID, name, actType, status, team, startDate, dueDate)
}
func (s *ActivityService) Update(id, name, actType, status, team string, startDate, dueDate *string) (*entity.Activity, error) {
	return s.repo.Update(id, name, actType, status, team, startDate, dueDate)
}
func (s *ActivityService) Delete(id string) error        { return s.repo.Delete(id) }
func (s *ActivityService) Reorder(ids []string) error    { return s.repo.Reorder(ids) }
