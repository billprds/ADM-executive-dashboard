import { useEffect, useState, useCallback } from 'react';
import type { DashboardSnapshot, Project, TimelineActivity, AppSettings } from './lib/types';
import type { TabId } from './components/Sidebar';
import {
  fetchSnapshot,
  createProject, updateProject, deleteProject, reorderProjects,
  createActivity, updateActivity, deleteActivity, reorderActivities,
  createNote, deleteNote,
} from './lib/api';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { ActiveProjectsView } from './components/ActiveProjectsView';
import { TimelinesView } from './components/TimelinesView';
import { SettingsView } from './components/SettingsView';
import { PlaceholderView } from './components/PlaceholderView';
import { CommandPalette } from './components/CommandPalette';
import { ProjectDetailDrawer } from './components/ProjectDetailDrawer';
import { DEFAULT_TEAMS, DEFAULT_STATUSES } from './lib/teams';
import './App.css';

const TAB_TITLES: Record<TabId, string> = {
  active:    'Active Projects',
  timelines: 'Project Timelines',
  capacity:  'Capacity',
  effort:    'Effort Estimates',
  settings:  'Settings',
};

export default function App() {
  const [snapshot,       setSnapshot]       = useState<DashboardSnapshot | null>(null);
  const [isRefreshing,   setIsRefreshing]   = useState(false);
  const [activeTab,      setActiveTab]      = useState<TabId>('timelines');
  const [paletteOpen,    setPaletteOpen]    = useState(false);
  const [drawerProject,  setDrawerProject]  = useState<Project | null>(null);

  const [projects,  setProjects]  = useState<Project[]>([]);
  const [timeline,  setTimeline]  = useState<TimelineActivity[]>([]);
  const [settings,  setSettings]  = useState<AppSettings>({
    teams:      DEFAULT_TEAMS,
    statuses:   DEFAULT_STATUSES,
    teamColors: {},
  });

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchSnapshot();
      setSnapshot(data);
      setProjects(data.projects);
      setTimeline(data.timeline);
    } catch (err) {
      console.error('[App] fetch failed', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setPaletteOpen(true); return;
      }
      const inInput = document.activeElement instanceof HTMLInputElement
        || document.activeElement instanceof HTMLTextAreaElement
        || document.activeElement instanceof HTMLSelectElement;
      if (!inInput && !paletteOpen) {
        if (e.key === '1') setActiveTab('active');
        else if (e.key === '2') setActiveTab('timelines');
        else if (e.key === '3') setActiveTab('capacity');
        else if (e.key === '4') setActiveTab('effort');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [paletteOpen]);

  // ---------- Project mutations ----------

  async function handleAddProject(name: string, number: string) {
    const p = await createProject(name, number);
    setProjects((prev) => [...prev, p]);
  }

  async function handleUpdateProject(id: string, name: string, number: string, progress: number) {
    const p = await updateProject(id, name, number, progress);
    setProjects((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x)));
  }

  async function handleDeleteProject(id: string) {
    await deleteProject(id);
    setProjects((prev) => prev.filter((x) => x.id !== id));
    if (drawerProject?.id === id) setDrawerProject(null);
  }

  async function handleReorderProjects(ordered: Project[]) {
    setProjects(ordered);
    await reorderProjects(ordered.map((p) => p.id));
  }

  // ---------- Activity mutations ----------

  async function handleAddActivity(
    projectId: string, projectName: string,
    name: string, type: string, status: string, team: string,
    start: string | null, due: string | null,
  ) {
    const a = await createActivity(projectId, projectName, name, type, status, team, start, due);
    setTimeline((prev) => [...prev, a]);
  }

  async function handleUpdateActivity(
    id: string, name: string, type: string, status: string, team: string,
    start: string | null, due: string | null,
  ) {
    const a = await updateActivity(id, name, type, status, team, start, due);
    setTimeline((prev) => prev.map((x) => (x.id === id ? { ...x, ...a, projectName: x.projectName } : x)));
  }

  async function handleDeleteActivity(id: string) {
    await deleteActivity(id);
    setTimeline((prev) => prev.filter((x) => x.id !== id));
  }

  async function handleReorderActivities(ordered: TimelineActivity[]) {
    setTimeline(ordered);
    await reorderActivities(ordered.map((a) => a.id));
  }

  // ---------- Note mutations ----------

  async function handleAddNote(projectId: string, text: string) {
    const note = await createNote(projectId, text, 'You');
    setProjects((prev) => prev.map((p) =>
      p.id === projectId ? { ...p, notes: [...(p.notes ?? []), note] } : p
    ));
    if (drawerProject?.id === projectId) {
      setDrawerProject((prev) => prev ? { ...prev, notes: [...(prev.notes ?? []), note] } : prev);
    }
  }

  async function handleDeleteNote(projectId: string, noteId: string) {
    await deleteNote(noteId);
    setProjects((prev) => prev.map((p) =>
      p.id === projectId ? { ...p, notes: (p.notes ?? []).filter((n) => n.id !== noteId) } : p
    ));
    if (drawerProject?.id === projectId) {
      setDrawerProject((prev) => prev ? { ...prev, notes: (prev.notes ?? []).filter((n) => n.id !== noteId) } : prev);
    }
  }

  function handleProjectUpdate(updated: Project) {
    setProjects((prev) => prev.map((p) => p.id === updated.id ? updated : p));
    setDrawerProject(updated);
  }

  const counts: Partial<Record<TabId, number>> = {
    active:    projects.length,
    timelines: new Set(timeline.map((t) => t.projectId)).size,
    capacity:  0,
    effort:    0,
  };

  return (
    <div className="app">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />
      <main className="app__main">
        <Topbar
          pageTitle={TAB_TITLES[activeTab]}
          onRefresh={refresh}
          isRefreshing={isRefreshing}
          onOpenCommandPalette={() => setPaletteOpen(true)}
        />
        <div className="app__content">
          {!snapshot ? (
            <div className="app__loading">Connecting to backend…</div>
          ) : activeTab === 'active' ? (
            <ActiveProjectsView
              projects={projects}
              setProjects={(ordered) => handleReorderProjects(ordered)}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              timeline={timeline}
              settings={settings}
            />
          ) : activeTab === 'timelines' ? (
            <TimelinesView
              projects={projects}
              timeline={timeline}
              onAddActivity={handleAddActivity}
              onUpdateActivity={handleUpdateActivity}
              onDeleteActivity={handleDeleteActivity}
              onReorderActivities={handleReorderActivities}
              todayISO={new Date().toISOString().slice(0, 10)}
              onOpenProject={(p) => setDrawerProject(p)}
              settings={settings}
            />
          ) : activeTab === 'capacity' ? (
            <PlaceholderView
              title="Capacity Stack Rank"
              description="Per-person daily capacity heatmap. Coming soon."
              plannedFeatures={['Sticky columns', 'Month tabs', 'Run consolidation', 'Project filter']}
            />
          ) : activeTab === 'effort' ? (
            <PlaceholderView
              title="Project Effort Estimates"
              description="Working-day duration calculator. Coming soon."
              plannedFeatures={['Duration minus PH holidays', 'Estimate = (Dev + QA) × Duration', 'Per-project subtotals']}
            />
          ) : (
            <SettingsView settings={settings} onSettingsChange={setSettings} />
          )}
        </div>
      </main>

      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        projects={projects}
        onTabChange={setActiveTab}
        onRefresh={refresh}
        onOpenProject={(p) => { setActiveTab('active'); setDrawerProject(p); }}
      />

      {drawerProject && (
        <ProjectDetailDrawer
          project={drawerProject}
          timeline={timeline.filter((t) => t.projectId === drawerProject.id)}
          onProjectUpdate={handleProjectUpdate}
          onAddNote={(text) => handleAddNote(drawerProject.id, text)}
          onDeleteNote={(noteId) => handleDeleteNote(drawerProject.id, noteId)}
          onClose={() => setDrawerProject(null)}
        />
      )}
    </div>
  );
}
