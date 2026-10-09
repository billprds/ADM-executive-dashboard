import { useRef, useState } from 'react';
import type { Project, TimelineActivity, AppSettings } from '../lib/types';
import { Panel } from './primitives';
import { IconChevronRight } from './icons';
import { ProjectDetailDrawer } from './ProjectDetailDrawer';
import './ActiveProjectsView.css';

interface Props {
  projects: Project[];
  setProjects: (ordered: Project[]) => void;
  onAddProject: (name: string, number: string) => Promise<void>;
  onUpdateProject: (id: string, name: string, number: string, progress: number) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  timeline: TimelineActivity[];
  settings: AppSettings;
}

const EMPTY_FORM = { name: '', number: '' };

export function ActiveProjectsView({
  projects, setProjects,
  onAddProject, onUpdateProject, onDeleteProject,
  timeline,
}: Props) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddModal, setShowAddModal]       = useState(false);
  const [form, setForm]                       = useState({ ...EMPTY_FORM });
  const [saving, setSaving]                   = useState(false);

  const dragIdRef = useRef<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  async function handleAdd() {
    if (!form.name.trim() || saving) return;
    setSaving(true);
    try {
      await onAddProject(form.name.trim(), form.number.trim());
      setForm({ ...EMPTY_FORM });
      setShowAddModal(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await onDeleteProject(id);
  }

  async function handleProgressChange(p: Project, val: number) {
    await onUpdateProject(p.id, p.name, p.number, val);
  }

  function handleProjectUpdate(updated: Project) {
    setProjects(projects.map((p) => p.id === updated.id ? updated : p));
    setSelectedProject(updated);
  }

  // Drag-to-reorder
  function handleDragStart(id: string) { dragIdRef.current = id; }
  function handleDragOver(e: React.DragEvent, id: string) { e.preventDefault(); setDragOver(id); }
  function handleDrop(targetId: string) {
    const fromId = dragIdRef.current;
    if (!fromId || fromId === targetId) { setDragOver(null); return; }
    const next = [...projects];
    const from = next.findIndex((p) => p.id === fromId);
    const to   = next.findIndex((p) => p.id === targetId);
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setProjects(next);
    dragIdRef.current = null;
    setDragOver(null);
  }

  return (
    <>
      <div className="active-view">
        <Panel
          title="Portfolio register"
          meta={`${projects.length} projects`}
          actions={
            <button type="button" className="add-btn" onClick={() => setShowAddModal(true)}>
              + Add project
            </button>
          }
          noPad
        >
          {projects.length === 0 ? (
            <div className="active-view__empty">
              No projects yet.{' '}
              <button type="button" className="add-btn-inline" onClick={() => setShowAddModal(true)}>
                Add your first project →
              </button>
            </div>
          ) : (
            <div className="register-table-wrap">
              <table className="register-table">
                <thead>
                  <tr>
                    <th style={{ width: '42%' }}>Project</th>
                    <th style={{ width: 130 }}>Number</th>
                    <th style={{ width: 36 }} />
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} onClick={() => setSelectedProject(p)} className="register-table__row">
                      <td><span className="register-table__project-name">{p.name}</span></td>
                      <td className="register-table__number">{p.number}</td>
                      <td onClick={(e) => e.stopPropagation()} className="register-table__actions-cell">
                        <button type="button" className="row-delete-btn" onClick={() => handleDelete(p.id)}>✕</button>
                        <IconChevronRight size={12} className="register-table__chevron" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {projects.length > 0 && (
          <Panel title="Project progress" meta="Drag to reorder · edit to update">
            <div className="progress-list">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className={`progress-row ${dragOver === p.id ? 'is-drag-over' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(p.id)}
                  onDragOver={(e) => handleDragOver(e, p.id)}
                  onDrop={() => handleDrop(p.id)}
                  onDragEnd={() => setDragOver(null)}
                >
                  <span className="progress-row__handle" title="Drag to reorder">⠿</span>
                  <div className="progress-row__name">{p.name}</div>
                  <div className="progress-row__bar-wrap">
                    <div className="progress-row__track">
                      <div className="progress-row__fill" style={{ width: `${p.progress}%` }} />
                    </div>
                  </div>
                  <input
                    type="number"
                    className="progress-row__input"
                    min={0} max={100}
                    value={p.progress}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleProgressChange(p, Math.min(100, Math.max(0, Number(e.target.value))))}
                  />
                  <span className="progress-row__pct">%</span>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Add project</h2>
              <button type="button" className="modal__close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal__body">
              <div className="modal__field">
                <label className="u-label">Project name *</label>
                <input type="text" className="modal__input" placeholder="e.g. Rain Initiatives (Phase 4)"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
              </div>
              <div className="modal__field">
                <label className="u-label">Project number</label>
                <input type="text" className="modal__input" placeholder="ANGKAS-001"
                  value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
              </div>
            </div>
            <div className="modal__footer">
              <button type="button" className="modal__cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="button" className="modal__submit" onClick={handleAdd} disabled={!form.name.trim() || saving}>
                {saving ? 'Adding…' : 'Add project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProject && (
        <ProjectDetailDrawer
          project={selectedProject}
          onProjectUpdate={handleProjectUpdate}
          timeline={timeline.filter((t) => t.projectId === selectedProject.id)}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}
