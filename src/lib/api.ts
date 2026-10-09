/* ============================================================
   Data-access layer — hits the real Go backend.
   Backend runs on :8081, proxied through Vite at /adm.
============================================================ */

import type { DashboardSnapshot, Project, TimelineActivity, ProjectNote } from './types';

const BASE = '/adm';

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---------- Projects ----------

export async function listProjects(): Promise<Project[]> {
  const raw = await req<any[]>('GET', '/projects');
  return (raw ?? []).map(mapProject);
}

export async function createProject(name: string, number: string): Promise<Project> {
  const raw = await req<any>('POST', '/projects', { name, number });
  return mapProject(raw);
}

export async function updateProject(id: string, name: string, number: string, progress: number): Promise<Project> {
  const raw = await req<any>('PUT', `/projects/${id}`, { name, number, progress });
  return mapProject(raw);
}

export async function deleteProject(id: string): Promise<void> {
  await req('DELETE', `/projects/${id}`);
}

export async function reorderProjects(ids: string[]): Promise<void> {
  await req('POST', '/projects/reorder', { ids });
}

// ---------- Activities ----------

export async function listActivities(): Promise<TimelineActivity[]> {
  const raw = await req<any[]>('GET', '/activities');
  return (raw ?? []).map(mapActivity);
}

export async function createActivity(
  projectId: string,
  projectName: string,
  name: string,
  type: string,
  status: string,
  team: string,
  startDate: string | null,
  dueDate: string | null,
): Promise<TimelineActivity> {
  const raw = await req<any>('POST', `/projects/${projectId}/activities`, {
    name, type, status, team,
    start_date: startDate || null,
    due_date: dueDate || null,
  });
  return mapActivity({ ...raw, projectName });
}

export async function updateActivity(
  id: string,
  name: string,
  type: string,
  status: string,
  team: string,
  startDate: string | null,
  dueDate: string | null,
): Promise<TimelineActivity> {
  const raw = await req<any>('PUT', `/activities/${id}`, {
    name, type, status, team,
    start_date: startDate || null,
    due_date: dueDate || null,
  });
  return mapActivity(raw);
}

export async function deleteActivity(id: string): Promise<void> {
  await req('DELETE', `/activities/${id}`);
}

export async function reorderActivities(ids: string[]): Promise<void> {
  await req('POST', '/activities/reorder', { ids });
}

// ---------- Notes ----------

export async function listNotes(projectId: string): Promise<ProjectNote[]> {
  const raw = await req<any[]>('GET', `/projects/${projectId}/notes`);
  return (raw ?? []).map(mapNote);
}

export async function createNote(projectId: string, text: string, author: string): Promise<ProjectNote> {
  const raw = await req<any>('POST', `/projects/${projectId}/notes`, { text, author });
  return mapNote(raw);
}

export async function deleteNote(id: string): Promise<void> {
  await req('DELETE', `/notes/${id}`);
}

// ---------- Snapshot (loads everything at once for App.tsx) ----------

export async function fetchSnapshot(): Promise<DashboardSnapshot> {
  const [projects, activities] = await Promise.all([
    listProjects(),
    listActivities(),
  ]);

  // Enrich activities with project names
  const projectMap = new Map(projects.map((p) => [p.id, p.name]));
  const enriched = activities.map((a) => ({
    ...a,
    projectName: projectMap.get(a.projectId) ?? a.projectName,
  }));

  return {
    projects,
    timeline: enriched,
    capacity: null,
    fetchedAt: new Date().toISOString(),
  };
}

// ---------- Mappers (backend snake_case → frontend camelCase) ----------

function mapProject(r: any): Project {
  return {
    id:          r.id,
    name:        r.name,
    number:      r.number ?? '',
    health:      'Not Started',   // not stored in DB yet — default
    progress:    r.progress ?? 0,
    targets:     [],
    actuals:     [],
    issuesCount: 0,
    notes:       [],
  };
}

function mapActivity(r: any): TimelineActivity {
  return {
    id:          r.id,
    projectId:   r.project_id,
    projectName: r.projectName ?? '',
    team:        r.team ?? '',
    type:        r.type ?? 'Task',
    activity:    r.name,
    status:      r.status ?? 'To Do',
    start:       r.start_date ? r.start_date.split('T')[0] : null,
    due:         r.due_date   ? r.due_date.split('T')[0]   : null,
  };
}

function mapNote(r: any): ProjectNote {
  return {
    id:        r.id,
    text:      r.text,
    author:    r.author,
    createdAt: r.created_at,
  };
}

// Keep IS_MOCK for any component that still checks it
export const IS_MOCK = false;
