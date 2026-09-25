import { useEffect } from 'react';
import type { Project, TimelineActivity } from '../lib/types';
import { StatusDot, TeamBadge } from './primitives';
import { fmtDate } from '../lib/dateUtils';
import './ProjectDetailDrawer.css';

interface Props {
  project: Project;
  timeline: TimelineActivity[];
  onClose: () => void;
}

export function ProjectDetailDrawer({ project, timeline, onClose }: Props) {
  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`${project.name} details`}>
        <header className="drawer__header">
          <div className="drawer__header-main">
            <div className="drawer__project-number u-mono">{project.number}</div>
            <h2 className="drawer__project-name">{project.name}</h2>
            <div className="drawer__header-status">
              <StatusDot status={project.health} label={project.health} />
              <span className="drawer__progress-badge u-mono">{project.progress}%</span>
            </div>
          </div>
          <button type="button" className="drawer__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="drawer__body">
          {/* Deployments */}
          <section className="drawer__section">
            <h3 className="u-label drawer__section-title">Target deployments</h3>
            {project.targets.length === 0 ? (
              <div className="drawer__empty">No targets scheduled.</div>
            ) : (
              <ul className="drawer__deploy-list">
                {project.targets.map((t, i) => (
                  <li key={i} className="drawer__deploy-item">
                    <span className="drawer__deploy-label">{t.label}</span>
                    <span className="drawer__deploy-date u-mono">{fmtDate(t.date)}</span>
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
                    <span className="drawer__deploy-date u-mono">{fmtDate(t.date)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Issues */}
          {project.issuesCount > 0 && (
            <section className="drawer__section">
              <h3 className="u-label drawer__section-title">Open issues ({project.issuesCount})</h3>
              <div className="drawer__note">{project.issuesSummary}</div>
            </section>
          )}

          {/* Risk */}
          {project.riskDescription && (
            <section className="drawer__section">
              <h3 className="u-label drawer__section-title">Risk · {project.riskLevel ?? 'Unspecified'}</h3>
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

          {/* Dependencies */}
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
                {project.dependencyImpact && (
                  <div className="drawer__note-body">{project.dependencyImpact}</div>
                )}
              </div>
            </section>
          )}

          {/* Activities */}
          <section className="drawer__section">
            <h3 className="u-label drawer__section-title">Activities ({timeline.length})</h3>
            {timeline.length === 0 ? (
              <div className="drawer__empty">No activities on the timeline yet.</div>
            ) : (
              <ul className="drawer__activity-list">
                {timeline.map((a) => (
                  <li key={a.id} className="drawer__activity-item">
                    <StatusDot status={a.status} />
                    <div className="drawer__activity-body">
                      <div className="drawer__activity-title">{a.activity}</div>
                      <div className="drawer__activity-meta">
                        <TeamBadge team={a.team} />
                        <span className="drawer__activity-status">{a.status}</span>
                        <span className="drawer__activity-dates u-mono">
                          {a.start ? fmtDate(a.start) : '—'} → {a.due ? fmtDate(a.due) : '—'}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
}
