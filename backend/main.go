package main

import (
	"embed"
	"log"
	"net/http"
	"strings"

	"github.com/angkas/delivery/internal/config"
	"github.com/angkas/delivery/internal/db"
	"github.com/angkas/delivery/internal/handlers"
	"github.com/angkas/delivery/internal/repository"
	"github.com/angkas/delivery/internal/service"
)

//go:embed migrations/*.sql
var migrations embed.FS

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config error: %v", err)
	}

	database, err := db.Connect(cfg.Database.DSN())
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	defer database.Close()
	log.Println("connected to PostgreSQL")

	if err := db.Migrate(database, migrations); err != nil {
		log.Fatalf("migration failed: %v", err)
	}
	log.Println("migrations OK")

	// Wire up
	projectRepo  := repository.NewProjectRepository(database)
	activityRepo := repository.NewActivityRepository(database)
	noteRepo     := repository.NewNoteRepository(database)

	projectSvc  := service.NewProjectService(projectRepo)
	activitySvc := service.NewActivityService(activityRepo)
	noteSvc     := service.NewNoteService(noteRepo)

	projectHandler  := handlers.NewProjectHandler(projectSvc)
	activityHandler := handlers.NewActivityHandler(activitySvc)
	noteHandler     := handlers.NewNoteHandler(noteSvc)

	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})

	// Projects
	mux.HandleFunc("GET /adm/projects",          projectHandler.List)
	mux.HandleFunc("POST /adm/projects",         projectHandler.Create)
	mux.HandleFunc("PUT /adm/projects/{id}",     projectHandler.Update)
	mux.HandleFunc("DELETE /adm/projects/{id}",  projectHandler.Delete)
	mux.HandleFunc("POST /adm/projects/reorder", projectHandler.Reorder)

	// Activities
	mux.HandleFunc("GET /adm/activities",                           activityHandler.ListAll)
	mux.HandleFunc("GET /adm/projects/{projectID}/activities",      activityHandler.ListByProject)
	mux.HandleFunc("POST /adm/projects/{projectID}/activities",     activityHandler.Create)
	mux.HandleFunc("PUT /adm/activities/{id}",                      activityHandler.Update)
	mux.HandleFunc("DELETE /adm/activities/{id}",                   activityHandler.Delete)
	mux.HandleFunc("POST /adm/activities/reorder",                  activityHandler.Reorder)

	// Notes
	mux.HandleFunc("GET /adm/projects/{projectID}/notes",           noteHandler.ListByProject)
	mux.HandleFunc("POST /adm/projects/{projectID}/notes",          noteHandler.Create)
	mux.HandleFunc("DELETE /adm/notes/{id}",                        noteHandler.Delete)

	addr := ":" + cfg.Server.Port
	log.Printf("server running on http://localhost%s", addr)
	log.Fatal(http.ListenAndServe(addr, cors(mux, cfg.Server.FrontendOrigin)))
}

func cors(next http.Handler, frontendOrigin string) http.Handler {
	allowed := []string{
		"http://localhost:5173",
		"http://localhost:5174",
		frontendOrigin,
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		for _, a := range allowed {
			if a != "" && strings.EqualFold(origin, a) {
				w.Header().Set("Access-Control-Allow-Origin", a)
				break
			}
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
