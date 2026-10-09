import { useEffect, useRef, useState } from 'react';
import type { Project, TimelineActivity, ProjectNote } from '../lib/types';
import { StatusDot, TeamBadge } from './primitives';
import { fmtDate } from '../lib/dateUtils';
import './ProjectDetailDrawer.css';

interface Props {
  project: Project;
  timeline: TimelineActivity[];
  onClose: () => void;
  onProjectUpdate?: (updated: Project) => void;
  onAddNote?: (text: string) => Promise<void>;
  onDeleteNote?: (noteId: string) => Promise<void>;
}



export function ProjectDetailDrawer({ project, timeline, onClose, onAddNote, onDeleteNote }: Props) {
  const [activeSection, setActiveSection] = useState<'overview' | 'notes'>('overview');
  const [commentText, setCommentText]     = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const notes: ProjectNote[] = (project as unknown as { notes?: ProjectNote[] }).notes ?? [];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  async function submitComment() {
    const text = commentText.trim();
    if (!text) return;
    setCommentText('');
    if (onAddNote) {
      await onAddNote(text).catch(console.error);
    }
    textareaRef.current?.focus();
  }

  async function deleteNote(id: string) {
    if (onDeleteNote) {
      await onDeleteNote(id).catch(console.error);
    }
  }

  function fmtNoteTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="drawer__header">
          <div className="drawer__header-main">
            <div className="drawer__project-number">{project.number}</div>
            <h2 className="drawer__project-name">{project.name}</h2>
            <div className="drawer__header-status">
              <StatusDot status={project.health} label={project.health} />
              <span className="drawer__progress-badge">{project.progress}%</span>
            </div>
          </div>
          <button type="button" className="drawer__close" onClick={onClose}>✕</button>
        </header>

        {/* Tabs: Overview | Notes */}
        <div className="drawer__tabs">
          {(['overview', 'notes'] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`drawer__tab ${activeSection === s ? 'is-active' : ''}`}
              onClick={() => setActiveSection(s)}
            >
              {s === 'overview' ? 'Overview' : `Notes (${notes.length})`}
            </button>
          ))}
        </div>

        <div className="drawer__body">

          {/* ---- OVERVIEW ---- */}
          {activeSection === 'overview' && (
            <>
              {project.targets.length > 0 && (
                <section className="drawer__section">
                  <h3 className="u-label drawer__section-title">Target deployments</h3>
                  <ul className="drawer__deploy-list">
                    {project.targets.map((t, i) => (
                      <li key={i} className="drawer__deploy-item">
                        <span className="drawer__deploy-label">{t.label}</span>
                        <span className="drawer__deploy-date">{fmtDate(t.date)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

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
                {timeline.length === 0
                  ? <div className="drawer__empty">No timeline activities yet.</div>
                  : (
                    <ul className="drawer__activity-list">
                      {timeline.map((a) => (
                        <li key={a.id} className="drawer__activity-item">
                          <StatusDot status={a.status as 'To Do' | 'In Progress' | 'Done' | 'Blocked'} />
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

          {/* ---- NOTES (Jira-style thread) ---- */}
          {activeSection === 'notes' && (
            <section className="drawer__section drawer__notes-section">
              {/* Comment thread */}
              <div className="notes-thread">
                {notes.length === 0 && (
                  <div className="notes-thread__empty">
                    No notes yet. Add the first one below.
                  </div>
                )}
                {notes.map((note) => (
                  <div key={note.id} className="notes-comment">
                    <div className="notes-comment__avatar">{note.author.charAt(0)}</div>
                    <div className="notes-comment__body">
                      <div className="notes-comment__header">
                        <span className="notes-comment__author">{note.author}</span>
                        <span className="notes-comment__time">{fmtNoteTime(note.createdAt)}</span>
                        <button
                          type="button"
                          className="notes-comment__delete"
                          onClick={() => deleteNote(note.id)}
                          title="Delete comment"
                        >✕</button>
                      </div>
                      <div className="notes-comment__text">{note.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment input — no save button, Cmd+Enter or button */}
              <div className="notes-input-wrap">
                <div className="notes-comment__avatar notes-comment__avatar--you">Y</div>
                <div className="notes-input-body">
                  <textarea
                    ref={textareaRef}
                    className="notes-input"
                    placeholder="Add a note… (⌘↵ or Ctrl+↵ to submit)"
                    value={commentText}
                    rows={3}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                        e.preventDefault();
                        submitComment();
                      }
                    }}
                  />
                  <div className="notes-input-footer">
                    <span className="notes-input-hint">⌘↵ to submit</span>
                    <button
                      type="button"
                      className="notes-submit-btn"
                      onClick={submitComment}
                      disabled={!commentText.trim()}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>
      </aside>
    </div>
  );
}
