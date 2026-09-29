import { useEffect, useState } from 'react';
import type { Project, TimelineActivity } from '../lib/types';
import { StatusDot, TeamBadge } from './primitives';
import { fmtDate } from '../lib/dateUtils';
import './ProjectDetailDrawer.css';

interface Props {
  project: Project;
  timeline: TimelineActivity[];
  onClose: () => void;
  onProjectUpdate?: (updated: Project) => void;
}

export function ProjectDetailDrawer({ project, timeline, onClose, onProjectUpdate }: Props) {
  const [activeSection, setActiveSection] = useState<'overview' | 'issues' | 'notes'>('overview');
  const [issuesSummary,  setIssuesSummary]  = useState(project.issuesSummary ?? '');
  const [notes,          setNotes]          = useState((project as unknown as { notes?: string }).notes ?? '');
  const [issuesCount,    setIssuesCount]    = useState(project.issuesCount);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  function save() {
    if (!onProjectUpdate) return;
    const { notes: _ignored, ...rest } = project as unknown as { notes?: string } & Project;
    void _ignored;
    onProjectUpdate({
      ...rest,
      issuesCount,
      issuesSummary: issuesSummary || undefined,
      notes,
    } as unknown as Project);
    setDirty(false);
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="drawer__header">
          <div className="drawer__header-main">
            <div className="drawer__project-number u-mono">{project.number}</div>
            <h2 className="drawer__project-name">{project.name}</h2>
            <div className="drawer__header-status">
              <StatusDot status={project.health} label={project.health} />
              <span className="drawer__progress-badge">{project.progress}%</span>
            </div>
          </div>
          <button type="button" className="drawer__close" onClick={onClose} aria-label="Close">✕</button>
        </header>

        {/* Section tabs */}
        <div className="drawer__tabs">
          {(['overview', 'issues', 'notes'] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`drawer__tab ${activeSection === s ? 'is-active' : ''}`}
              onClick={() => setActiveSection(s)}
            >
              {s === 'overview' ? 'Overview' : s === 'issues' ? `Issues (${issuesCount})` : 'Notes'}
            </button>
          ))}
          {dirty && onProjectUpdate && (
            <button type="button" className="drawer__save-btn" onClick={save}>Save changes</button>
          )}
        </div>

        <div className="drawer__body">

          {/* ---- OVERVIEW ---- */}
          {activeSection === 'overview' && (
            <>
              <section className="drawer__section">
                <h3 className="u-label drawer__section-title">Target deployments</h3>
                {project.targets.length === 0 ? <div className="drawer__empty">No targets set.</div> : (
                  <ul className="drawer__deploy-list">
                    {project.targets.map((t, i) => (
                      <li key={i} className="drawer__deploy-item">
                        <span className="drawer__deploy-label">{t.label}</span>
                        <span className="drawer__deploy-date">{fmtDate(t.date)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {project.actuals.length > 0 && (
                <section className="drawer__section">
                  <h3 className="u-label drawer__section-title">Actual deployments</h3>
                  <ul className="drawer__deploy-list">
                    {project.actuals.map((t, i) => (
                      <li key={i} className="drawer__deploy-item drawer__deploy-item--done">
                        <span className="drawer__deploy-label">{t.label}</span>
                        <span className="drawer__deploy-date">{fmtDate(t.date)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {project.riskDescription && (
                <section className="drawer__section">
                  <h3 className="u-label drawer__section-title">Risk · {project.riskLevel}</h3>
                  <div className="drawer__note">
                    <div className="drawer__note-label u-label">Description</div>
                    <div className="drawer__note-body">{project.riskDescription}</div>
                  </div>
                  {project.riskMitigation && (
                    <div className="drawer__note">
                      <div className="drawer__note-label u-label">Mitigation</div>
                      <div className="drawer__note-body">{project.riskMitigation}</div>
                    </div>
                  )}
                </section>
              )}

              {project.dependsOn && (
                <section className="drawer__section">
                  <h3 className="u-label drawer__section-title">Dependency</h3>
                  <div className="drawer__dep">
                    <div className="drawer__dep-header">
                      <span className="drawer__dep-name">{project.dependsOn}</span>
                      {project.dependencyStatus && (
                        <span className={`drawer__dep-status is-${project.dependencyStatus.toLowerCase()}`}>
                          {project.dependencyStatus}
                        </span>
                      )}
                    </div>
                    {project.dependencyImpact && <div className="drawer__note-body">{project.dependencyImpact}</div>}
                  </div>
                </section>
              )}

              <section className="drawer__section">
                <h3 className="u-label drawer__section-title">Activities ({timeline.length})</h3>
                {timeline.length === 0 ? <div className="drawer__empty">No timeline activities yet.</div> : (
                  <ul className="drawer__activity-list">
                    {timeline.map((a) => (
                      <li key={a.id} className="drawer__activity-item">
                        <StatusDot status={a.status} />
                        <div className="drawer__activity-body">
                          <div className="drawer__activity-title">{a.activity}</div>
                          <div className="drawer__activity-meta">
                            <TeamBadge team={a.team} />
                            <span className="drawer__activity-status">{a.status}</span>
                            <span className="drawer__activity-dates">
                              {a.start ? fmtDate(a.start) : '—'} → {a.due ? fmtDate(a.due) : '—'}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}

          {/* ---- ISSUES ---- */}
          {activeSection === 'issues' && (
            <section className="drawer__section">
              <div className="drawer__field-row">
                <label className="u-label">Issue count</label>
                <input
                  type="number" min={0}
                  className="drawer__inline-input"
                  value={issuesCount}
                  onChange={(e) => { setIssuesCount(Math.max(0, Number(e.target.value))); setDirty(true); }}
                />
              </div>
              <label className="u-label" style={{ display: 'block', marginBottom: 6, marginTop: 16 }}>
                Issues summary / description
              </label>
              <textarea
                className="drawer__textarea"
                placeholder="Describe the issues, blockers, or risks…"
                value={issuesSummary}
                rows={8}
                onChange={(e) => { setIssuesSummary(e.target.value); setDirty(true); }}
              />
              <div className="drawer__field-hint">
                Changes are saved when you click "Save changes" above.
              </div>
            </section>
          )}

          {/* ---- NOTES ---- */}
          {activeSection === 'notes' && (
            <section className="drawer__section">
              <label className="u-label" style={{ display: 'block', marginBottom: 6 }}>
                Notes &amp; updates
              </label>
              <textarea
                className="drawer__textarea"
                placeholder="Add any context, decisions, or status updates for this project…"
                value={notes}
                rows={12}
                onChange={(e) => { setNotes(e.target.value); setDirty(true); }}
              />
              <div className="drawer__field-hint">
                Use this for meeting notes, weekly updates, or anything the team should know.
              </div>
            </section>
          )}

        </div>
      </aside>
    </div>
  );
}
