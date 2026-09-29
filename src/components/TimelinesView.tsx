import {
  useMemo, useState, useRef, useEffect, useCallback,
} from 'react';
import type { TimelineActivity, ActivityStatus, ActivityType, Team } from '../lib/types';
import type { Project } from '../lib/types';
import { Panel, StatusDot, TeamBadge } from './primitives';
import { fmtDate, parseISO, toISO } from '../lib/dateUtils';
import { TEAM_ORDER, TEAMS, teamColor } from '../lib/teams';
import { IconDiamond } from './icons';
import { MultiSelect } from './MultiSelect';
import './TimelinesView.css';

type Granularity = 'sprints' | 'weeks' | 'months' | 'quarters';

const DAY_PX: Record<Granularity, number> = {
  sprints: 6, weeks: 8, months: 3.2, quarters: 2,
};

const YEAR_START   = new Date(2026, 0, 1);
const YEAR_END     = new Date(2026, 11, 31);
const DAY_MS       = 86400000;
const TOTAL_DAYS   = Math.round((YEAR_END.getTime() - YEAR_START.getTime()) / DAY_MS) + 1;
const LEFT_COL_W   = 640; // px — fixed left columns

interface Props {
  projects: Project[];
  timeline: TimelineActivity[];
  setTimeline: (t: TimelineActivity[]) => void;
  todayISO: string;
  onOpenProject?: (project: Project) => void;
}

const ACTIVITY_STATUSES: ActivityStatus[] = ['To Do', 'In Progress', 'Done', 'Blocked'];
const ACTIVITY_TYPES: ActivityType[]      = ['Task', 'Milestone', 'Deployment'];
const ALL_TEAMS: Team[]                    = [...TEAM_ORDER, 'Other'];

function makeId() { return `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

const EMPTY_FORM = {
  projectId: '',
  activity:  '',
  type:      'Task'       as ActivityType,
  status:    'To Do'     as ActivityStatus,
  team:      'TXN'       as Team,
  start:     '',
  due:       '',
};

/* ====================== Component ====================== */
export function TimelinesView({ projects, timeline, setTimeline, todayISO, onOpenProject }: Props) {
  const [granularity, setGranularity]           = useState<Granularity>('sprints');
  const [zoom, setZoom]                         = useState(1);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [selectedTeams, setSelectedTeams]       = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal]   = useState(false);
  const [addInsertAfter, setAddInsertAfter] = useState<string | null>(null); // activity id to insert after
  const [form, setForm]                   = useState({ ...EMPTY_FORM });

  // Inline editing — which cell is being edited
  const [editing, setEditing] = useState<{ id: string; field: string } | null>(null);

  // Drag-to-reorder state
  const [dragId, setDragId]     = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const dayWidth  = DAY_PX[granularity] * zoom;
  const chartWidth = TOTAL_DAYS * dayWidth;

  // Auto-scroll to today
  useEffect(() => {
    if (!scrollRef.current) return;
    const today = parseISO(todayISO);
    if (!today) return;
    const off = Math.round((today.getTime() - YEAR_START.getTime()) / DAY_MS);
    scrollRef.current.scrollLeft = Math.max(0, off * dayWidth - 200);
  }, [granularity, zoom, todayISO, dayWidth]);

  const uniqueProjects = useMemo(() => {
    const seen = new Set<string>();
    const out: { id: string; name: string }[] = [];
    timeline.forEach((t) => {
      if (!seen.has(t.projectId)) { seen.add(t.projectId); out.push({ id: t.projectId, name: t.projectName }); }
    });
    // Also include projects with no timeline rows yet
    projects.forEach((p) => {
      if (!seen.has(p.id)) { out.push({ id: p.id, name: p.name }); }
    });
    return out;
  }, [timeline, projects]);

  const filtered = useMemo(() => timeline.filter((t) => {
    if (selectedProjects.size > 0 && !selectedProjects.has(t.projectId)) return false;
    if (selectedTeams.size    > 0 && !selectedTeams.has(t.team))         return false;
    return true;
  }), [timeline, selectedProjects, selectedTeams]);

  const grouped = useMemo(() => {
    const order: string[] = [];
    const by: Record<string, TimelineActivity[]> = {};
    filtered.forEach((t) => {
      if (!by[t.projectId]) { by[t.projectId] = []; order.push(t.projectId); }
      by[t.projectId].push(t);
    });
    return order.map((id) => ({ id, name: by[id][0].projectName, items: by[id] }));
  }, [filtered]);

  const headerBands = useMemo(() => buildHeaderBands(granularity, dayWidth), [granularity, dayWidth]);
  const today       = parseISO(todayISO)!;
  const todayOffset = Math.round((today.getTime() - YEAR_START.getTime()) / DAY_MS);

  /* ---- Mutations ---- */
  function updateActivity(id: string, patch: Partial<TimelineActivity>) {
    setTimeline(timeline.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function deleteActivity(id: string) {
    setTimeline(timeline.filter((t) => t.id !== id));
  }

  function openAddModal(insertAfterId: string | null = null) {
    const defaultProjectId = selectedProjects.size === 1
      ? Array.from(selectedProjects)[0]
      : (uniqueProjects[0]?.id ?? '');
    setForm({ ...EMPTY_FORM, projectId: defaultProjectId });
    setAddInsertAfter(insertAfterId);
    setShowAddModal(true);
  }

  function handleAdd() {
    if (!form.activity.trim() || !form.projectId) return;
    const project = uniqueProjects.find((p) => p.id === form.projectId);
    const newAct: TimelineActivity = {
      id:          makeId(),
      projectId:   form.projectId,
      projectName: project?.name ?? form.projectId,
      team:        form.team,
      type:        form.type,
      activity:    form.activity.trim(),
      status:      form.status,
      start:       form.start || null,
      due:         form.due   || null,
    };
    if (addInsertAfter) {
      const idx = timeline.findIndex((t) => t.id === addInsertAfter);
      const next = [...timeline];
      next.splice(idx + 1, 0, newAct);
      setTimeline(next);
    } else {
      setTimeline([...timeline, newAct]);
    }
    setForm({ ...EMPTY_FORM });
    setShowAddModal(false);
  }

  /* ---- Drag-to-reorder ---- */
  function handleDragStart(id: string) { setDragId(id); }
  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    setDragOver(id);
  }
  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOver(null); return; }
    const next = [...timeline];
    const fromIdx = next.findIndex((t) => t.id === dragId);
    const toIdx   = next.findIndex((t) => t.id === targetId);
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setTimeline(next);
    setDragId(null);
    setDragOver(null);
  }

  return (
    <div className="timelines-view">
      {/* Filters */}
      <Panel dense>
        <div className="tl-filters">
          <MultiSelect
            id="tl-project"
            label="Project"
            options={uniqueProjects.map((p) => ({ value: p.id, label: p.name }))}
            selected={selectedProjects}
            allLabel="All projects"
            onChange={setSelectedProjects}
          />
          <MultiSelect
            id="tl-team"
            label="Team"
            options={TEAM_ORDER.map((t) => ({ value: t, label: TEAMS[t].label }))}
            selected={selectedTeams}
            allLabel="All teams"
            onChange={setSelectedTeams}
          />
          <div className="tl-filter-group">
            <label className="u-label">Granularity</label>
            <div className="tl-segmented">
              {(['sprints','weeks','months','quarters'] as Granularity[]).map((g) => (
                <button key={g} type="button" className={granularity === g ? 'is-active' : ''} onClick={() => setGranularity(g)}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="tl-filter-group">
            <label className="u-label">Zoom</label>
            <div className="tl-segmented">
              <button type="button" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>−</button>
              <span className="tl-zoom-value">{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>+</button>
            </div>
          </div>
          <div className="tl-filter-spacer" />
          <div className="tl-legend">
            {TEAM_ORDER.map((t) => (
              <span key={t} className="tl-legend-item">
                <span className="tl-legend-swatch" style={{ background: teamColor(t) }} />
                <span className="u-label">{TEAMS[t].label}</span>
              </span>
            ))}
            <span className="tl-legend-item">
              <IconDiamond size={10} className="tl-legend-milestone" />
              <span className="u-label">Milestone</span>
            </span>
          </div>
          <button type="button" className="add-btn" onClick={() => openAddModal(null)}>+ Add activity</button>
        </div>
      </Panel>

      {/* Gantt */}
      <Panel title="Timeline" meta={`${filtered.length} activities · ${grouped.length} projects`} noPad>
        <div className="tl-chart" ref={scrollRef}>
          <div className="tl-chart-inner" style={{ minWidth: LEFT_COL_W + chartWidth }}>
            {/* Header */}
            <div className="tl-header">
              <div className="tl-header-fixed">
                <div className="tl-col tl-col--drag" />
                <div className="tl-col tl-col--activity u-label">Activity</div>
                <div className="tl-col tl-col--status u-label">Status</div>
                <div className="tl-col tl-col--team u-label">Team</div>
                <div className="tl-col tl-col--start u-label">Start</div>
                <div className="tl-col tl-col--due u-label">Due</div>
                <div className="tl-col tl-col--rowact" />
              </div>
              <div className="tl-header-time" style={{ width: chartWidth }}>
                <div className="tl-header-band tl-header-band--major">
                  {headerBands.major.map((b, i) => (
                    <div key={i} className="tl-band-cell" style={{ left: b.left, width: b.width }}>{b.label}</div>
                  ))}
                </div>
                <div className="tl-header-band tl-header-band--minor">
                  {headerBands.minor.map((b, i) => (
                    <div key={i} className="tl-band-cell" style={{ left: b.left, width: b.width }}>{b.label}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rows */}
            <div className="tl-rows" style={{ position: 'relative' }}>
              {grouped.map((group) => (
                <div key={group.id} className="tl-group">
                  <div className="tl-group-header">
                    <div className="tl-group-header-fixed">
                      <span
                        className="tl-group-name"
                        title="Click to open project details"
                        onClick={() => {
                          if (!onOpenProject) return;
                          const proj = projects.find((p) => p.id === group.id);
                          if (proj) onOpenProject(proj);
                        }}
                      >{group.name}</span>
                      <span className="tl-group-number">{group.id}</span>
                      <span className="tl-group-count u-label">{group.items.length} items</span>
                    </div>
                    <div className="tl-group-header-time" style={{ width: chartWidth }} />
                  </div>
                  {group.items.map((a) => (
                    <TimelineRow
                      key={a.id}
                      activity={a}
                      dayWidth={dayWidth}
                      chartWidth={chartWidth}
                      todayISO={todayISO}
                      editing={editing}
                      setEditing={setEditing}
                      onUpdate={updateActivity}
                      onDelete={deleteActivity}
                      onAddBelow={() => openAddModal(a.id)}
                      isDragOver={dragOver === a.id}
                      onDragStart={() => handleDragStart(a.id)}
                      onDragOver={(e) => handleDragOver(e, a.id)}
                      onDrop={() => handleDrop(a.id)}
                    />
                  ))}
                </div>
              ))}

              {/* Today line */}
              <div className="tl-today-line" style={{ left: LEFT_COL_W + todayOffset * dayWidth }}>
                <span className="tl-today-label u-label">Today</span>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Add activity modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">{addInsertAfter ? 'Add activity below' : 'Add activity'}</h2>
              <button type="button" className="modal__close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal__body">
              <div className="modal__field">
                <label className="u-label">Project *</label>
                <select className="modal__input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                  <option value="">— select —</option>
                  {uniqueProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="modal__field">
                <label className="u-label">Activity name *</label>
                <input
                  type="text"
                  className="modal__input"
                  placeholder="e.g. BE Dev't"
                  value={form.activity}
                  onChange={(e) => setForm({ ...form, activity: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="modal__row">
                <div className="modal__field">
                  <label className="u-label">Type</label>
                  <select className="modal__input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ActivityType })}>
                    {ACTIVITY_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="modal__field">
                  <label className="u-label">Status</label>
                  <select className="modal__input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ActivityStatus })}>
                    {ACTIVITY_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal__field">
                <label className="u-label">Team</label>
                <select className="modal__input" value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value as Team })}>
                  {ALL_TEAMS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="modal__row">
                <div className="modal__field">
                  <label className="u-label">Start date</label>
                  <input type="date" className="modal__input" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
                </div>
                <div className="modal__field">
                  <label className="u-label">Due date</label>
                  <input type="date" className="modal__input" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button type="button" className="modal__cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button type="button" className="modal__submit" onClick={handleAdd} disabled={!form.activity.trim() || !form.projectId}>
                Add activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====================== Row component ====================== */

interface RowProps {
  activity: TimelineActivity;
  dayWidth: number;
  chartWidth: number;
  todayISO: string;
  editing: { id: string; field: string } | null;
  setEditing: (v: { id: string; field: string } | null) => void;
  onUpdate: (id: string, patch: Partial<TimelineActivity>) => void;
  onDelete: (id: string) => void;
  onAddBelow: () => void;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}

function TimelineRow({
  activity, dayWidth, chartWidth, todayISO,
  editing, setEditing, onUpdate, onDelete, onAddBelow,
  isDragOver, onDragStart, onDragOver, onDrop,
}: RowProps) {
  const a = activity;
  const isMilestone  = a.type === 'Milestone';
  const isDeployment = a.type === 'Deployment';
  const start  = a.start ? parseISO(a.start) : null;
  const due    = a.due   ? parseISO(a.due)   : null;
  const today  = parseISO(todayISO)!;
  const overdue = due && due < today && a.status !== 'Done';

  // Bar geometry
  let barLeft  = 0;
  let barWidth = 0;
  if (start && due) {
    const startOff = Math.round((start.getTime() - YEAR_START.getTime()) / DAY_MS);
    const endOff   = Math.round((due.getTime()   - YEAR_START.getTime()) / DAY_MS);
    barLeft  = startOff * dayWidth;
    barWidth = Math.max(dayWidth * 0.6, (endOff - startOff + 1) * dayWidth - 2);
  }

  // Bar drag-to-resize
  const barRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<{ side: 'left' | 'right'; startX: number; startLeft: number; startWidth: number } | null>(null);

  const onResizeMouseDown = useCallback((e: React.MouseEvent, side: 'left' | 'right') => {
    e.stopPropagation();
    e.preventDefault();
    resizeRef.current = { side, startX: e.clientX, startLeft: barLeft, startWidth: barWidth };
    const onMove = (mv: MouseEvent) => {
      if (!resizeRef.current) return;
      const { side, startX, startLeft, startWidth } = resizeRef.current;
      const dx = mv.clientX - startX;
      if (side === 'right') {
        const newW  = Math.max(dayWidth, startWidth + dx);
        const days  = Math.round(newW / dayWidth);
        if (start) {
          const newDue = new Date(start.getTime() + (days - 1) * DAY_MS);
          onUpdate(a.id, { due: toISO(newDue) });
        }
      } else {
        const newL  = startLeft + dx;
        void Math.max(dayWidth, startWidth - dx); // width maintained by start move
        const offDays = Math.round(newL / dayWidth);
        const newStart = new Date(YEAR_START.getTime() + offDays * DAY_MS);
        onUpdate(a.id, { start: toISO(newStart) });
      }
    };
    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [a.id, barLeft, barWidth, dayWidth, start, onUpdate]);

  // Bar drag-to-move (entire bar)
  const barMoveRef = useRef<{ startX: number; startLeft: number } | null>(null);
  const onBarMouseDown = useCallback((e: React.MouseEvent) => {
    // Only respond to middle of bar (not handles)
    if ((e.target as HTMLElement).classList.contains('tl-bar-handle')) return;
    e.preventDefault();
    barMoveRef.current = { startX: e.clientX, startLeft: barLeft };
    const onMove = (mv: MouseEvent) => {
      if (!barMoveRef.current) return;
      const dx  = mv.clientX - barMoveRef.current.startX;
      const newL = barMoveRef.current.startLeft + dx;
      const offDays = Math.round(newL / dayWidth);
      const durDays = Math.round(barWidth / dayWidth);
      const newStart = new Date(YEAR_START.getTime() + offDays * DAY_MS);
      const newDue   = new Date(newStart.getTime() + (durDays - 1) * DAY_MS);
      onUpdate(a.id, { start: toISO(newStart), due: toISO(newDue) });
    };
    const onUp = () => {
      barMoveRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [a.id, barLeft, barWidth, dayWidth, onUpdate]);

  // Inline edit helper
  function cell(field: string, content: React.ReactNode, editEl: React.ReactNode) {
    const active = editing?.id === a.id && editing.field === field;
    return (
      <div
        className={`tl-col tl-col--${field} ${active ? 'is-editing' : ''}`}
        onClick={() => !active && setEditing({ id: a.id, field })}
      >
        {active ? editEl : content}
      </div>
    );
  }

  function stopEdit() { setEditing(null); }

  return (
    <div
      className={`tl-row ${isDragOver ? 'is-drag-over' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="tl-row-fixed">
        {/* Drag handle */}
        <div className="tl-col tl-col--drag">
          <span className="tl-drag-handle" title="Drag to reorder">⠿</span>
        </div>

        {/* Activity name — inline editable */}
        {cell('activity',
          <span className="tl-activity-label" title={a.activity}>{a.activity}</span>,
          <input
            className="tl-inline-input"
            defaultValue={a.activity}
            autoFocus
            onBlur={(e) => { onUpdate(a.id, { activity: e.target.value }); stopEdit(); }}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') stopEdit(); }}
          />
        )}

        {/* Status */}
        {cell('status',
          <StatusDot status={a.status} label={a.status} />,
          <select
            className="tl-inline-input"
            defaultValue={a.status}
            autoFocus
            onBlur={(e) => { onUpdate(a.id, { status: e.target.value as ActivityStatus }); stopEdit(); }}
            onChange={(e) => { onUpdate(a.id, { status: e.target.value as ActivityStatus }); stopEdit(); }}
          >
            {ACTIVITY_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        )}

        {/* Team */}
        {cell('team',
          <TeamBadge team={a.team} />,
          <select
            className="tl-inline-input"
            defaultValue={a.team}
            autoFocus
            onBlur={(e) => { onUpdate(a.id, { team: e.target.value as Team }); stopEdit(); }}
            onChange={(e) => { onUpdate(a.id, { team: e.target.value as Team }); stopEdit(); }}
          >
            {ALL_TEAMS.map((t) => <option key={t}>{t}</option>)}
          </select>
        )}

        {/* Start date */}
        {cell('start',
          <span className={`tl-date ${!a.start ? 'is-empty' : ''}`}>{a.start ? fmtDate(a.start) : '—'}</span>,
          <input
            type="date"
            className="tl-inline-input"
            defaultValue={a.start ?? ''}
            autoFocus
            onBlur={(e) => { onUpdate(a.id, { start: e.target.value || null }); stopEdit(); }}
          />
        )}

        {/* Due date */}
        {cell('due',
          <span className={`tl-date ${overdue ? 'is-overdue' : ''} ${!a.due ? 'is-empty' : ''}`}>{a.due ? fmtDate(a.due) : '—'}</span>,
          <input
            type="date"
            className="tl-inline-input"
            defaultValue={a.due ?? ''}
            autoFocus
            onBlur={(e) => { onUpdate(a.id, { due: e.target.value || null }); stopEdit(); }}
          />
        )}

        {/* Row actions */}
        <div className="tl-col tl-col--rowact">
          <button type="button" className="tl-row-btn" title="Add row below" onClick={(e) => { e.stopPropagation(); onAddBelow(); }}>+</button>
          <button type="button" className="tl-row-btn tl-row-btn--del" title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(a.id); }}>✕</button>
        </div>
      </div>

      {/* Timeline area */}
      <div className="tl-row-time" style={{ width: chartWidth }}>
        {isMilestone && due && (
          <div className="tl-milestone" style={{ left: Math.round((due.getTime() - YEAR_START.getTime()) / DAY_MS) * dayWidth + dayWidth / 2 }} title={a.activity}>
            <IconDiamond size={14} />
          </div>
        )}
        {isDeployment && due && (
          <div className="tl-milestone tl-milestone--deploy" style={{ left: Math.round((due.getTime() - YEAR_START.getTime()) / DAY_MS) * dayWidth + dayWidth / 2 }} title={a.activity}>
            <IconDiamond size={14} />
          </div>
        )}
        {!isMilestone && !isDeployment && start && due && (
          <div
            ref={barRef}
            className={`tl-bar ${a.status === 'Done' ? 'is-done' : ''} ${overdue ? 'is-overdue' : ''}`}
            style={{ left: barLeft, width: barWidth, background: teamColor(a.team), borderColor: teamColor(a.team), cursor: 'grab' }}
            title={`${a.activity} · ${fmtDate(a.start)} → ${fmtDate(a.due)} · drag to move, handles to resize`}
            onMouseDown={onBarMouseDown}
          >
            {/* Left resize handle */}
            <span className="tl-bar-handle tl-bar-handle--left" onMouseDown={(e) => onResizeMouseDown(e, 'left')} title="Drag to resize start" />
            {a.status === 'Done' && <span className="tl-bar-check">✓</span>}
            {/* Right resize handle */}
            <span className="tl-bar-handle tl-bar-handle--right" onMouseDown={(e) => onResizeMouseDown(e, 'right')} title="Drag to resize end" />
          </div>
        )}
        {/* Empty bar placeholder for unscheduled rows */}
        {!isMilestone && !isDeployment && (!start || !due) && (
          <div className="tl-bar-unscheduled" style={{ left: 8 }}>unscheduled</div>
        )}
      </div>
    </div>
  );
}

/* ====================== Header band helpers ====================== */
interface Band { left: number; width: number; label: string; }

function buildHeaderBands(granularity: Granularity, dayWidth: number): { major: Band[]; minor: Band[] } {
  const major: Band[] = [];
  const minor: Band[] = [];

  const d = new Date(YEAR_START);
  const monthStarts: Array<{ month: number; year: number; offset: number }> = [];
  while (d <= YEAR_END) {
    if (d.getDate() === 1) monthStarts.push({ month: d.getMonth(), year: d.getFullYear(), offset: dFromStart(d) });
    d.setDate(d.getDate() + 1);
  }

  for (let i = 0; i < monthStarts.length; i++) {
    const ms   = monthStarts[i];
    const next = monthStarts[i + 1];
    const end  = next ? next.offset : TOTAL_DAYS;
    const label = new Date(ms.year, ms.month, 1).toLocaleString('en-US', { month: 'short' }).toUpperCase() + ` ${ms.year}`;
    major.push({ left: ms.offset * dayWidth, width: (end - ms.offset) * dayWidth, label });
  }

  if (granularity === 'sprints') {
    const ss = new Date(2026, 0, 5); let sn = 1;
    const dd = new Date(ss);
    while (dd <= YEAR_END) {
      minor.push({ left: dFromStart(dd) * dayWidth, width: 14 * dayWidth, label: `S${sn++}` });
      dd.setDate(dd.getDate() + 14);
    }
  } else if (granularity === 'weeks') {
    const dd = new Date(YEAR_START);
    while (dd.getDay() !== 1) dd.setDate(dd.getDate() + 1);
    while (dd <= YEAR_END) {
      minor.push({ left: dFromStart(dd) * dayWidth, width: 7 * dayWidth, label: `W${weekNum(dd)}` });
      dd.setDate(dd.getDate() + 7);
    }
  } else if (granularity === 'months') {
    for (const ms of monthStarts)
      minor.push({ left: ms.offset * dayWidth, width: 30 * dayWidth, label: new Date(ms.year, ms.month, 1).toLocaleString('en-US', { month: 'short' }) });
  } else {
    for (let q = 0; q < 4; q++) {
      const qs = new Date(2026, q * 3, 1);
      const qe = new Date(2026, q * 3 + 3, 0);
      minor.push({ left: dFromStart(qs) * dayWidth, width: ((qe.getTime() - qs.getTime()) / DAY_MS + 1) * dayWidth, label: `Q${q + 1}` });
    }
  }

  return { major, minor };
}

function dFromStart(d: Date): number { return Math.round((d.getTime() - YEAR_START.getTime()) / DAY_MS); }
function weekNum(d: Date): number {
  const first = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((Math.floor((d.getTime() - first.getTime()) / DAY_MS) + first.getDay() + 1) / 7);
}
