import { useEffect, useRef, useState } from 'react';
import type { Project, TimelineActivity, ProjectNote } from '../lib/types';
import { StatusDot, TeamBadge } from './primitives';
import { fmtDate, fmtDateTime } from '../lib/dateUtils';
import './ProjectDetailDrawer.css';

interface Props {
  project: Project; timeline: TimelineActivity[];
  onClose: () => void; onProjectUpdate?: (updated: Project) => void;
  onAddNote?: (text: string) => Promise<void>;
  onDeleteNote?: (noteId: string) => Promise<void>;
  onEditNote?: (noteId: string, text: string) => Promise<void>;
}

export function ProjectDetailDrawer({ project, timeline, onClose, onAddNote, onDeleteNote, onEditNote }: Props) {
  const [activeSection, setActiveSection] = useState<'overview' | 'notes'>('overview');
  const [commentText, setCommentText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const notes: ProjectNote[] = (project as any).notes ?? [];
  // Latest first
  const sortedNotes = [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (editingNoteId) { setEditingNoteId(null); } else { onClose(); } } };
    document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h);
  }, [onClose, editingNoteId]);

  async function submitComment() {
    const text = commentText.trim();
    if (!text) return;
    setCommentText('');
    if (onAddNote) await onAddNote(text).catch(console.error);
    textareaRef.current?.focus();
  }

  async function submitEdit(id: string) {
    const text = editText.trim();
    if (!text) return;
    if (onEditNote) await onEditNote(id, text).catch(console.error);
    setEditingNoteId(null);
  }

  function startEdit(note: ProjectNote) {
    setEditingNoteId(note.id);
    setEditText(note.text);
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer" onClick={e=>e.stopPropagation()} role="dialog">
        <header className="drawer__header">
          <div className="drawer__header-main">
            <div className="drawer__project-number">{project.number}</div>
            <h2 className="drawer__project-name">{project.name}</h2>
            <div className="drawer__header-status">
              <StatusDot status={project.health} label={project.health}/>
              <span className="drawer__progress-badge">{project.progress}%</span>
              {project.retired && <span className="retired-pill">Retired</span>}
            </div>
          </div>
          <button type="button" className="drawer__close" onClick={onClose}>✕</button>
        </header>

        <div className="drawer__tabs">
          {(['overview','notes'] as const).map(s => (
            <button key={s} type="button" className={`drawer__tab ${activeSection===s?'is-active':''}`} onClick={()=>setActiveSection(s)}>
              {s==='overview'?'Overview':`Notes (${notes.length})`}
            </button>
          ))}
        </div>

        <div className="drawer__body">
          {activeSection === 'overview' && (
            <>
              {project.targets.length > 0 && (
                <section className="drawer__section">
                  <h3 className="u-label drawer__section-title">Target deployments</h3>
                  <ul className="drawer__deploy-list">
                    {project.targets.map((t,i) => <li key={i} className="drawer__deploy-item"><span className="drawer__deploy-label">{t.label}</span><span className="drawer__deploy-date">{fmtDate(t.date)}</span></li>)}
                  </ul>
                </section>
              )}
              <section className="drawer__section">
                <h3 className="u-label drawer__section-title">Activities ({timeline.length})</h3>
                {timeline.length === 0 ? <div className="drawer__empty">No activities yet.</div> : (
                  <ul className="drawer__activity-list">
                    {timeline.map(a => (
                      <li key={a.id} className="drawer__activity-item">
                        <StatusDot status={a.status as any}/>
                        <div className="drawer__activity-body">
                          <div className="drawer__activity-title">{a.activity}</div>
                          <div className="drawer__activity-meta">
                            <TeamBadge team={a.team}/>
                            <span className="drawer__activity-status">{a.status}</span>
                            <span className="drawer__activity-dates">{a.start ? fmtDate(a.start) : '—'} → {a.due ? fmtDate(a.due) : '—'}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}

          {activeSection === 'notes' && (
            <section className="drawer__section drawer__notes-section">
              {/* Thread — latest first */}
              <div className="notes-thread">
                {sortedNotes.length === 0 && <div className="notes-thread__empty">No notes yet.</div>}
                {sortedNotes.map(note => (
                  <div key={note.id} className="notes-comment">
                    <div className="notes-comment__avatar">{note.author.charAt(0)}</div>
                    <div className="notes-comment__body">
                      <div className="notes-comment__header">
                        <span className="notes-comment__author">{note.author}</span>
                        <span className="notes-comment__time">{fmtDateTime(note.createdAt)}</span>
                        {note.editedAt && <span className="notes-comment__edited">(edited)</span>}
                        <button type="button" className="notes-comment__action" onClick={()=>startEdit(note)} title="Edit">✎</button>
                        <button type="button" className="notes-comment__delete" onClick={()=>onDeleteNote&&onDeleteNote(note.id).catch(console.error)} title="Delete">✕</button>
                      </div>
                      {editingNoteId === note.id ? (
                        <div className="notes-edit-wrap">
                          <textarea className="notes-input" value={editText} rows={3} onChange={e=>setEditText(e.target.value)}
                            onKeyDown={e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();submitEdit(note.id);}}}/>
                          <div className="notes-input-footer">
                            <button type="button" className="modal__cancel" style={{padding:'4px 12px',fontSize:'12px'}} onClick={()=>setEditingNoteId(null)}>Cancel</button>
                            <button type="button" className="notes-submit-btn" onClick={()=>submitEdit(note.id)} disabled={!editText.trim()}>Save</button>
                          </div>
                        </div>
                      ) : (
                        <div className="notes-comment__text">{note.text}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input at bottom */}
              <div className="notes-input-wrap">
                <div className="notes-comment__avatar notes-comment__avatar--you">Y</div>
                <div className="notes-input-body">
                  <textarea ref={textareaRef} className="notes-input" placeholder="Add a note… (⌘↵ to submit)" value={commentText} rows={3}
                    onChange={e=>setCommentText(e.target.value)}
                    onKeyDown={e=>{ if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();submitComment();}}}/>
                  <div className="notes-input-footer">
                    <span className="notes-input-hint">⌘↵ to submit</span>
                    <button type="button" className="notes-submit-btn" onClick={submitComment} disabled={!commentText.trim()}>Save</button>
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
