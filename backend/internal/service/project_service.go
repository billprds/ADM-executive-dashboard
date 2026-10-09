package service

import (
	"github.com/angkas/delivery/internal/entity"
	"github.com/angkas/delivery/internal/repository"
)

type ProjectService struct{ repo *repository.ProjectRepository }

func NewProjectService(repo *repository.ProjectRepository) *ProjectService {
	return &ProjectService{repo: repo}
}

func (s *ProjectService) List() ([]entity.Project, error) { return s.repo.List() }
func (s *ProjectService) Create(name, number string) (*entity.Project, error) {
	return s.repo.Create(name, number)
}
func (s *ProjectService) Update(id, name, number string, progress int) (*entity.Project, error) {
	return s.repo.Update(id, name, number, progress)
}
func (s *ProjectService) Delete(id string) error         { return s.repo.Delete(id) }
func (s *ProjectService) Reorder(ids []string) error     { return s.repo.Reorder(ids) }
