import { useRef, useState } from 'react';
import type { Project, TimelineActivity, AppSettings, HealthStatus } from '../lib/types';
import { Panel } from './primitives';
import { IconChevronRight } from './icons';
import { ProjectDetailDrawer } from './ProjectDetailDrawer';
import './ActiveProjectsView.css';

const HEALTH_OPTIONS: HealthStatus[] = ['Not Started', 'On Track', 'At Risk', 'Off Track', 'Complete'];

function healthColor(h: HealthStatus) {
  return { 'On Track': 'var(--health-on-track)', 'At Risk': 'var(--health-at-risk)', 'Off Track': 'var(--health-off-track)', 'Complete': 'var(--health-on-track)', 'Not Started': 'var(--health-not-started)' }[h] ?? 'var(--health-not-started)';
}

interface Props {
  projects: Project[]; setProjects: (ordered: Project[]) => void;
  onAddProject: (name: string, number: string) => Promise<void>;
  onUpdateProject: (id: string, name: string, number: string, progress: number, health: HealthStatus, retired: boolean) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  timeline: TimelineActivity[]; settings: AppSettings;
}

export function ActiveProjectsView({ projects, setProjects, onAddProject, onUpdateProject, onDeleteProject, timeline }: Props) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: '', number: '' });
  const [saving, setSaving] = useState(false);
  const dragIdRef = useRef<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const active  = projects.filter(p => !p.retired).sort((a,b) => a.name.localeCompare(b.name));
  const retired = projects.filter(p => p.retired);
  const sorted  = [...active, ...retired];

  async function handleAdd() {
    if (!form.name.trim() || saving) return;
    setSaving(true);
    try { await onAddProject(form.name.trim(), form.number.trim()); setForm({ name: '', number: '' }); setShowAddModal(false); }
    finally { setSaving(false); }
  }

  async function handleProgressChange(p: Project, val: number) {
    await onUpdateProject(p.id, p.name, p.number, val, p.health, p.retired);
  }

  async function handleHealthChange(p: Project, health: HealthStatus) {
    await onUpdateProject(p.id, p.name, p.number, p.progress, health, p.retired);
  }

  async function handleRetire(p: Project) {
    await onUpdateProject(p.id, p.name, p.number, p.progress, p.health, !p.retired);
  }

  function handleProjectUpdate(updated: Project) {
    setProjects(projects.map(p => p.id === updated.id ? updated : p));
    setSelectedProject(updated);
  }

  function handleDragStart(id: string) { if (!projects.find(p=>p.id===id)?.retired) dragIdRef.current = id; }
  function handleDragOver(e: React.DragEvent, id: string) { e.preventDefault(); setDragOver(id); }
  function handleDrop(targetId: string) {
    const fromId = dragIdRef.current;
    if (!fromId || fromId === targetId) { setDragOver(null); return; }
    const next = [...projects];
    const from = next.findIndex(p => p.id === fromId);
    const to   = next.findIndex(p => p.id === targetId);
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setProjects(next);
    dragIdRef.current = null; setDragOver(null);
  }

  return (
    <>
      <div className="active-view">
        <Panel title="Portfolio register" meta={`${projects.length} projects`} actions={<button type="button" className="add-btn" onClick={() => setShowAddModal(true)}>+ Add project</button>} noPad>
          {projects.length === 0 ? (
            <div className="active-view__empty">No projects yet. <button type="button" className="add-btn-inline" onClick={() => setShowAddModal(true)}>Add your first →</button></div>
          ) : (
            <table className="register-table">
              <thead><tr><th style={{width:'42%'}}>Project</th><th style={{width:130}}>Number</th><th style={{width:36}}/></tr></thead>
              <tbody>
                {sorted.map(p => (
                  <tr key={p.id} onClick={() => setSelectedProject(p)} className={`register-table__row ${p.retired ? 'is-retired' : ''}`}>
                    <td><span className="register-table__project-name">{p.name}</span>{p.retired && <span className="retired-pill">Retired</span>}</td>
                    <td className="register-table__number">{p.number}</td>
                    <td onClick={e=>e.stopPropagation()} className="register-table__actions-cell">
                      <button type="button" className="row-action-btn" title={p.retired ? 'Reactivate' : 'Retire'} onClick={() => handleRetire(p)}>{p.retired ? '↩' : '⏸'}</button>
                      <button type="button" className="row-delete-btn" onClick={() => onDeleteProject(p.id)}>✕</button>
                      <IconChevronRight size={12} className="register-table__chevron"/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        {projects.length > 0 && (
          <Panel title="Project progress" meta="Drag to reorder · edit to update">
            <div className="progress-list">
              {sorted.map(p => (
                <div key={p.id} className={`progress-row ${dragOver===p.id ? 'is-drag-over' : ''} ${p.retired ? 'is-retired' : ''}`}
                  draggable={!p.retired}
                  onDragStart={() => handleDragStart(p.id)}
                  onDragOver={e => handleDragOver(e, p.id)}
                  onDrop={() => handleDrop(p.id)}
                  onDragEnd={() => setDragOver(null)}>
                  <span className="progress-row__handle">{!p.retired && '⠿'}</span>
                  <div className="progress-row__name">{p.name}</div>
                  <div className="progress-row__bar-wrap">
                    <div className="progress-row__track">
                      <div className="progress-row__fill" style={{ width:`${p.progress}%`, background: healthColor(p.health) }}/>
                    </div>
                  </div>
                  <select className="progress-row__health-select" value={p.health}
                    onClick={e=>e.stopPropagation()}
                    onChange={e=>handleHealthChange(p, e.target.value as HealthStatus)}
                    style={{ color: healthColor(p.health) }}>
                    {HEALTH_OPTIONS.map(h => <option key={h}>{h}</option>)}
                  </select>
                  <input type="number" className="progress-row__input" min={0} max={100} value={p.progress}
                    onClick={e=>e.stopPropagation()}
                    onChange={e=>handleProgressChange(p, Math.min(100, Math.max(0, Number(e.target.value))))}
                    disabled={p.retired}/>
                  <span className="progress-row__pct">%</span>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal__header"><h2 className="modal__title">Add project</h2><button type="button" className="modal__close" onClick={() => setShowAddModal(false)}>✕</button></div>
            <div className="modal__body">
              <div className="modal__field"><label className="u-label">Project name *</label><input type="text" className="modal__input" placeholder="e.g. Rain Initiatives (Phase 4)" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} autoFocus onKeyDown={e=>e.key==='Enter'&&handleAdd()}/></div>
              <div className="modal__field"><label className="u-label">Project number</label><input type="text" className="modal__input" placeholder="ANGKAS-001" value={form.number} onChange={e=>setForm({...form,number:e.target.value})} onKeyDown={e=>e.key==='Enter'&&handleAdd()}/></div>
            </div>
            <div className="modal__footer">
              <button type="button" className="modal__cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="button" className="modal__submit" onClick={handleAdd} disabled={!form.name.trim()||saving}>{saving?'Adding…':'Add project'}</button>
            </div>
          </div>
        </div>
      )}

      {selectedProject && (
        <ProjectDetailDrawer project={selectedProject} onProjectUpdate={handleProjectUpdate} timeline={timeline.filter(t=>t.projectId===selectedProject.id)} onClose={()=>setSelectedProject(null)}/>
      )}
    </>
  );
}
