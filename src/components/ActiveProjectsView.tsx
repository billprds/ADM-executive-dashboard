import { useState } from 'react';
import type { Project, TimelineActivity } from '../lib/types';
import { Panel } from './primitives';
import { IconChevronRight } from './icons';
import { ProjectDetailDrawer } from './ProjectDetailDrawer';
import './ActiveProjectsView.css';

interface Props {
  projects: Project[];
  setProjects: (p: Project[]) => void;
  timeline: TimelineActivity[];
}

const EMPTY_FORM = {
  name: '', number: '',
};

export function ActiveProjectsView({ projects, setProjects, timeline }: Props) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddModal, setShowAddModal]       = useState(false);
  const [form, setForm]                       = useState({ ...EMPTY_FORM });

  function handleAdd() {
    if (!form.name.trim()) return;
    const id = form.number.trim() || `ANGKAS-${Date.now()}`;
    setProjects([...projects, {
      id, number: id,
      name: form.name.trim(),
      health: 'Not Started',
      progress: 0,
      issuesCount: 0,
      targets: [], actuals: [],
      issuesSummary: undefined,
    }]);
    setForm({ ...EMPTY_FORM });
    setShowAddModal(false);
  }

  function handleDelete(id: string) {
    setProjects(projects.filter((p) => p.id !== id));
    if (selectedProject?.id === id) setSelectedProject(null);
  }

  return (
    <>
      <div className="active-view">
        {/* Portfolio register — no deployments panel */}
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
                    <th style={{ width: '55%' }}>Project</th>
                    <th style={{ width: 140 }}>Number</th>
                    <th style={{ width: 48 }} />
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} onClick={() => setSelectedProject(p)} className="register-table__row">
                      <td><span className="register-table__project-name">{p.name}</span></td>
                      <td className="register-table__number">{p.number}</td>
                      <td onClick={(e) => e.stopPropagation()} className="register-table__actions-cell">
                        <button type="button" className="row-delete-btn" title="Delete" onClick={() => handleDelete(p.id)}>✕</button>
                        <IconChevronRight size={12} className="register-table__chevron" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      {/* Add project modal */}
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
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
              </div>
              <div className="modal__field">
                <label className="u-label">Project number</label>
                <input type="text" className="modal__input" placeholder="ANGKAS-001"
                  value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
              </div>

            </div>
            <div className="modal__footer">
              <button type="button" className="modal__cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="button" className="modal__submit" onClick={handleAdd} disabled={!form.name.trim()}>Add project</button>
            </div>
          </div>
        </div>
      )}

      {selectedProject && (
        <ProjectDetailDrawer
          project={selectedProject}
          onProjectUpdate={(updated) => {
            setProjects(projects.map((p) => p.id === updated.id ? updated : p));
            setSelectedProject(updated);
          }}
          timeline={timeline.filter((t) => t.projectId === selectedProject.id)}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}


