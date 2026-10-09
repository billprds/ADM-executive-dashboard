package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/angkas/delivery/internal/service"
)

type ActivityHandler struct{ svc *service.ActivityService }

func NewActivityHandler(svc *service.ActivityService) *ActivityHandler {
	return &ActivityHandler{svc: svc}
}

func (h *ActivityHandler) ListAll(w http.ResponseWriter, r *http.Request) {
	activities, err := h.svc.ListAll()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if activities == nil {
		writeJSON(w, http.StatusOK, []any{})
		return
	}
	writeJSON(w, http.StatusOK, activities)
}

func (h *ActivityHandler) ListByProject(w http.ResponseWriter, r *http.Request) {
	projectID := r.PathValue("projectID")
	activities, err := h.svc.ListByProject(projectID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if activities == nil {
		writeJSON(w, http.StatusOK, []any{})
		return
	}
	writeJSON(w, http.StatusOK, activities)
}

func (h *ActivityHandler) Create(w http.ResponseWriter, r *http.Request) {
	projectID := r.PathValue("projectID")
	var body struct {
		Name      string  `json:"name"`
		Type      string  `json:"type"`
		Status    string  `json:"status"`
		Team      string  `json:"team"`
		StartDate *string `json:"start_date"`
		DueDate   *string `json:"due_date"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON")
		return
	}
	a, err := h.svc.Create(projectID, body.Name, body.Type, body.Status, body.Team, body.StartDate, body.DueDate)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, a)
}

func (h *ActivityHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var body struct {
		Name      string  `json:"name"`
		Type      string  `json:"type"`
		Status    string  `json:"status"`
		Team      string  `json:"team"`
		StartDate *string `json:"start_date"`
		DueDate   *string `json:"due_date"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON")
		return
	}
	a, err := h.svc.Update(id, body.Name, body.Type, body.Status, body.Team, body.StartDate, body.DueDate)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, a)
}

func (h *ActivityHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.svc.Delete(id); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *ActivityHandler) Reorder(w http.ResponseWriter, r *http.Request) {
	var body struct {
		IDs []string `json:"ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON")
		return
	}
	if err := h.svc.Reorder(body.IDs); err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
