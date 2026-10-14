import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import type { TimelineActivity, ActivityType, Project, AppSettings } from '../lib/types';
import { Panel } from './primitives';
import { TeamBadge } from './primitives';
import { fmtDate, parseISO, toISO } from '../lib/dateUtils';
import { teamColor } from '../lib/teams';
import { IconDiamond } from './icons';
import { MultiSelect } from './MultiSelect';
import './TimelinesView.css';

type Granularity = 'sprints' | 'weeks' | 'months' | 'quarters';
const YEAR_START = new Date('2026-01-01');
const DAY_MS = 86400000;
const LEFT_COL_W = 713;
// Only Task and Milestone — Deployment removed
const ACTIVITY_TYPES: ActivityType[] = ['Task', 'Milestone'];

interface Props {
  projects: Project[];
  timeline: TimelineActivity[];
  setTimeline?: (t: TimelineActivity[]) => void;
  onAddActivity?: (projectId: string, projectName: string, name: string, type: string, status: string, team: string, start: string | null, due: string | null) => Promise<void>;
  onUpdateActivity?: (id: string, name: string, type: string, status: string, team: string, start: string | null, due: string | null) => Promise<void>;
  onDeleteActivity?: (id: string) => Promise<void>;
  onReorderActivities?: (ordered: TimelineActivity[]) => Promise<void>;
  todayISO: string;
  onOpenProject?: (project: Project) => void;
  settings: AppSettings;
}

const EMPTY_FORM = { projectId: '', activity: '', type: 'Task' as ActivityType, status: 'To Do', team: 'TXN', start: '', due: '' };

function makeId() { return `act-${Date.now()}-${Math.random().toString(36).slice(2,6)}`; }

export function TimelinesView({ projects, timeline, setTimeline, onAddActivity, onUpdateActivity, onDeleteActivity, onReorderActivities, todayISO, onOpenProject, settings }: Props) {
  const ALL_TEAMS = settings.teams;
  const ACTIVITY_STATUSES_DYN = settings.statuses;

  const [granularity, setGranularity] = useState<Granularity>('sprints');
  const [zoom, setZoom] = useState(1);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<{ id: string; field: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addInsertAfter, setAddInsertAfter] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const dayWidth = useMemo(() => {
    const base = { sprints: 28, weeks: 20, months: 10, quarters: 5 }[granularity];
    return base * zoom;
  }, [granularity, zoom]);

  useEffect(() => {
    const today = parseISO(todayISO);
    if (!today) return;
    const off = Math.round((today.getTime() - YEAR_START.getTime()) / DAY_MS);
    setTimeout(() => { if (chartRef.current) chartRef.current.scrollLeft = Math.max(0, off * dayWidth - 200); }, 100);
  }, [granularity, zoom, todayISO, dayWidth]);

  const uniqueProjects = useMemo(() => {
    const seen = new Set<string>(); const out: { id: string; name: string; number: string }[] = [];
    timeline.forEach(t => { if (!seen.has(t.projectId)) { seen.add(t.projectId); const p = projects.find(x=>x.id===t.projectId); out.push({ id: t.projectId, name: t.projectName, number: p?.number??'' }); } });
    projects.forEach(p => { if (!seen.has(p.id)) out.push({ id: p.id, name: p.name, number: p.number }); });
    return out;
  }, [timeline, projects]);

  const filtered = useMemo(() => timeline.filter(t => {
    if (selectedProjects.size > 0 && !selectedProjects.has(t.projectId)) return false;
    if (selectedTeams.size    > 0 && !selectedTeams.has(t.team)) return false;
    return true;
  }), [timeline, selectedProjects, selectedTeams]);

  const grouped = useMemo(() => {
    const by: Record<string, TimelineActivity[]> = {}; const order: string[] = [];
    filtered.forEach(t => { if (!by[t.projectId]) { by[t.projectId]=[]; order.push(t.projectId); } by[t.projectId].push(t); });
    return order.map(id => { const p = projects.find(x=>x.id===id); return { id, name: by[id][0].projectName, number: p?.number??'', items: by[id] }; });
  }, [filtered, projects]);

  const headerBands = useMemo(() => buildHeaderBands(granularity, dayWidth), [granularity, dayWidth]);
  const today = parseISO(todayISO)!;
  const todayOffset = Math.round((today.getTime() - YEAR_START.getTime()) / DAY_MS);
  const chartWidth = 365 * 2 * dayWidth;

  function updateActivity(id: string, patch: Partial<TimelineActivity>) {
    setTimeline && setTimeline(timeline.map(t => t.id===id ? {...t,...patch} : t));
    if (onUpdateActivity) {
      const updated = timeline.find(t=>t.id===id);
      if (updated) { const m = {...updated,...patch}; onUpdateActivity(id,m.activity,m.type,m.status,m.team,m.start,m.due).catch(console.error); }
    }
  }

  function deleteActivity(id: string) {
    setTimeline && setTimeline(timeline.filter(t=>t.id!==id));
    onDeleteActivity && onDeleteActivity(id).catch(console.error);
  }

  function openAddModal(insertAfterId: string | null = null) {
    const defaultProjectId = selectedProjects.size===1 ? Array.from(selectedProjects)[0] : (uniqueProjects[0]?.id??'');
    setForm({...EMPTY_FORM, projectId: defaultProjectId, status: ACTIVITY_STATUSES_DYN[0]??'To Do', team: ALL_TEAMS[0]??'TXN'});
    setAddInsertAfter(insertAfterId); setShowAddModal(true);
  }

  async function handleAdd() {
    if (!form.activity.trim() || !form.projectId) return;
    const project = uniqueProjects.find(p=>p.id===form.projectId);
    if (onAddActivity) {
      await onAddActivity(form.projectId, project?.name??form.projectId, form.activity.trim(), form.type, form.status, form.team, form.start||null, form.due||null);
    } else {
      const newAct: TimelineActivity = { id: makeId(), projectId: form.projectId, projectName: project?.name??form.projectId, team: form.team, type: form.type, activity: form.activity.trim(), status: form.status, start: form.start||null, due: form.due||null };
      setTimeline && setTimeline([...timeline, newAct]);
    }
    setForm({...EMPTY_FORM}); setShowAddModal(false);
  }

  function handleDragStart(id: string) { setDragId(id); }
  function handleDragOver(e: React.DragEvent, id: string) { e.preventDefault(); setDragOver(id); }
  function handleDrop(targetId: string) {
    if (!dragId || dragId===targetId) { setDragId(null); setDragOver(null); return; }
    const next = [...timeline];
    const fi = next.findIndex(t=>t.id===dragId); const ti = next.findIndex(t=>t.id===targetId);
    const [moved] = next.splice(fi, 1); next.splice(ti, 0, moved);
    setTimeline && setTimeline(next);
    onReorderActivities && onReorderActivities(next).catch(console.error);
    setDragId(null); setDragOver(null);
  }

  return (
    <div className="timelines-view">
      <Panel dense>
        <div className="tl-filters">
          <MultiSelect id="tl-project" label="Project" options={uniqueProjects.map(p=>({value:p.id,label:p.name}))} selected={selectedProjects} allLabel="All projects" onChange={setSelectedProjects}/>
          <MultiSelect id="tl-team" label="Team" options={ALL_TEAMS.map(t=>({value:t,label:t}))} selected={selectedTeams} allLabel="All teams" onChange={setSelectedTeams}/>
          <div className="tl-filter-group" style={{display:'flex',flexDirection:'column',gap:6}}>
            <label className="u-label">Granularity</label>
            <div className="tl-segmented">
              {(['sprints','weeks','months','quarters'] as Granularity[]).map(g => <button key={g} type="button" className={granularity===g?'is-active':''} onClick={()=>setGranularity(g)}>{g.charAt(0).toUpperCase()+g.slice(1)}</button>)}
            </div>
          </div>
          <div className="tl-filter-group" style={{display:'flex',flexDirection:'column',gap:6}}>
            <label className="u-label">Zoom</label>
            <div className="tl-segmented">
              <button type="button" onClick={()=>setZoom(z=>Math.max(0.25,z-0.25))}>–</button>
              <span className="tl-zoom-value">{Math.round(zoom*100)}%</span>
              <button type="button" onClick={()=>setZoom(z=>Math.min(3,z+0.25))}>+</button>
            </div>
          </div>
          <div className="tl-legend">
            {ALL_TEAMS.map((t:string) => <span key={t} className="tl-legend-item"><span className="tl-legend-swatch" style={{background:teamColor(t,settings.teamColors)}}/><span className="u-label">{t}</span></span>)}
            <span className="tl-legend-item"><IconDiamond size={12} style={{color:'var(--status-progress)'}}/><span className="u-label">Milestone</span></span>
          </div>
          <button type="button" className="add-btn" onClick={()=>openAddModal(null)}>+ Add activity</button>
        </div>
      </Panel>

      <Panel title="Timeline" noPad>
        <div className="tl-chart" ref={chartRef}>
          <div className="tl-chart-inner" style={{minWidth: LEFT_COL_W + chartWidth}}>
            {/* Header */}
            <div className="tl-header">
              <div className="tl-header-fixed">
                <div className="tl-col tl-col--drag"/>
                <div className="tl-col tl-col--activity">Activity</div>
                <div className="tl-col tl-col--status">Status</div>
                <div className="tl-col tl-col--team">Team</div>
                <div className="tl-col tl-col--start">Start</div>
                <div className="tl-col tl-col--due">Due</div>
                <div className="tl-col tl-col--rowact"/>
              </div>
              <div className="tl-header-time" style={{width:chartWidth}}>
                {headerBands.map((band, bi) => (
                  <div key={bi} className={`tl-header-band ${band.isMajor?'tl-header-band--major':''}`}>
                    {band.cells.map((cell, ci) => <div key={ci} className="tl-band-cell" style={{left:cell.left,width:cell.width}}>{cell.label}</div>)}
                  </div>
                ))}
              </div>
            </div>
            {/* Rows */}
            <div className="tl-rows">
              {grouped.map(group => (
                <div key={group.id} className="tl-group">
                  <div className="tl-group-header">
                    <div className="tl-group-header-fixed">
                      <span className="tl-group-name" title="Click to open project details" onClick={()=>{ if(onOpenProject){ const proj=projects.find(p=>p.id===group.id); if(proj) onOpenProject(proj); }}}>{group.name}</span>
                      {group.number && <span className="tl-group-number">{group.number}</span>}
                      <span className="tl-group-count u-label">{group.items.length} items</span>
                    </div>
                    <div className="tl-group-header-time" style={{width:chartWidth}}/>
                  </div>
                  {group.items.map(a => (
                    <TimelineRow key={a.id} activity={a} dayWidth={dayWidth} chartWidth={chartWidth} todayISO={todayISO}
                      editing={editing} setEditing={setEditing} onUpdate={updateActivity} onDelete={deleteActivity}
                      onAddBelow={()=>openAddModal(a.id)} isDragOver={dragOver===a.id}
                      onDragStart={()=>handleDragStart(a.id)} onDragOver={e=>handleDragOver(e,a.id)} onDrop={()=>handleDrop(a.id)}
                      allTeams={ALL_TEAMS} allStatuses={ACTIVITY_STATUSES_DYN} teamColors={settings.teamColors}/>
                  ))}
                </div>
              ))}
              {grouped.length === 0 && (
                <div style={{padding:'40px',textAlign:'center',color:'var(--ink-tertiary)',fontSize:'var(--text-body)'}}>
                  No activities yet. <button type="button" className="add-btn-inline" onClick={()=>openAddModal(null)}>Add one →</button>
                </div>
              )}
              {/* Today line */}
              <div className="tl-today-line" style={{left: LEFT_COL_W + todayOffset * dayWidth}}>
                <span className="tl-today-label u-label">Today</span>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {showAddModal && (
        <div className="modal-overlay" onClick={()=>setShowAddModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal__header"><h2 className="modal__title">{addInsertAfter?'Add activity below':'Add activity'}</h2><button type="button" className="modal__close" onClick={()=>setShowAddModal(false)}>✕</button></div>
            <div className="modal__body">
              <div className="modal__field"><label className="u-label">Project *</label>
                <select className="modal__input" value={form.projectId} onChange={e=>setForm({...form,projectId:e.target.value})}>
                  <option value="">— select —</option>
                  {uniqueProjects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="modal__field"><label className="u-label">Activity name *</label><input type="text" className="modal__input" placeholder="e.g. BE Dev't" value={form.activity} onChange={e=>setForm({...form,activity:e.target.value})} autoFocus/></div>
              <div className="modal__row">
                <div className="modal__field"><label className="u-label">Type</label>
                  <select className="modal__input" value={form.type} onChange={e=>setForm({...form,type:e.target.value as ActivityType})}>
                    {ACTIVITY_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="modal__field"><label className="u-label">Status</label>
                  <select className="modal__input" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                    {ACTIVITY_STATUSES_DYN.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal__field"><label className="u-label">Team</label>
                <select className="modal__input" value={form.team} onChange={e=>setForm({...form,team:e.target.value})}>
                  {ALL_TEAMS.map((t:string)=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="modal__row">
                <div className="modal__field"><label className="u-label">Start date</label><input type="date" className="modal__input" value={form.start} onChange={e=>setForm({...form,start:e.target.value})}/></div>
                <div className="modal__field"><label className="u-label">Due date</label><input type="date" className="modal__input" value={form.due} onChange={e=>setForm({...form,due:e.target.value})}/></div>
              </div>
            </div>
            <div className="modal__footer">
              <button type="button" className="modal__cancel" onClick={()=>setShowAddModal(false)}>Cancel</button>
              <button type="button" className="modal__submit" onClick={handleAdd} disabled={!form.activity.trim()||!form.projectId}>Add activity</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ====================== TimelineRow ====================== */
interface RowProps {
  activity: TimelineActivity; dayWidth: number; chartWidth: number; todayISO: string;
  editing: { id: string; field: string } | null; setEditing: (v: { id: string; field: string } | null) => void;
  onUpdate: (id: string, patch: Partial<TimelineActivity>) => void; onDelete: (id: string) => void;
  onAddBelow: () => void; isDragOver: boolean;
  onDragStart: () => void; onDragOver: (e: React.DragEvent) => void; onDrop: () => void;
  allTeams: string[]; allStatuses: string[]; teamColors: Record<string, string>;
}

function TimelineRow({ activity: a, dayWidth, chartWidth, todayISO, editing, setEditing, onUpdate, onDelete, onAddBelow, isDragOver, onDragStart, onDragOver, onDrop, allTeams, allStatuses, teamColors }: RowProps) {
  const today = parseISO(todayISO)!;
  const start = parseISO(a.start); const due = parseISO(a.due);
  const isMilestone = a.type === 'Milestone';
  const overdue = due && due < today && a.status !== 'Done';
  const isDone  = a.status === 'Done';

  function isEd(field: string) { return editing?.id===a.id && editing.field===field; }
  function startEdit(field: string) { setEditing({id:a.id,field}); }
  function stopEdit() { setEditing(null); }

  const barLeft  = start ? Math.round((start.getTime()-YEAR_START.getTime())/86400000)*dayWidth : 8;
  const barWidth = (start && due) ? Math.max(dayWidth, Math.round((due.getTime()-start.getTime())/86400000+1)*dayWidth-2) : dayWidth*5;
  const color    = teamColor(a.team, teamColors);

  return (
    <div className={`tl-row ${isDragOver?'is-drag-over':''}`} draggable onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={()=>{}}>
      <div className="tl-row-fixed">
        <div className="tl-col tl-col--drag"><span className="tl-drag-handle">⠿</span></div>
        {/* Activity name */}
        <div className={`tl-col tl-col--activity ${isEd('activity')?'is-editing':''}`} onClick={()=>!isEd('activity')&&startEdit('activity')}>
          {isEd('activity') ? <input autoFocus className="tl-inline-input" value={a.activity} onChange={e=>onUpdate(a.id,{activity:e.target.value})} onBlur={stopEdit} onKeyDown={e=>e.key==='Enter'&&stopEdit()}/> : <span className="tl-activity-label" title={a.activity}>{a.activity}</span>}
        </div>
        {/* Status */}
        <div className={`tl-col tl-col--status ${isEd('status')?'is-editing':''}`} onClick={()=>!isEd('status')&&startEdit('status')}>
          {isEd('status') ? <select autoFocus className="tl-inline-input" value={a.status} onChange={e=>onUpdate(a.id,{status:e.target.value})} onBlur={stopEdit}>{allStatuses.map(s=><option key={s}>{s}</option>)}</select> : <span style={{fontSize:'var(--text-caption)',color:'var(--ink-secondary)'}}>{a.status}</span>}
        </div>
        {/* Team */}
        <div className={`tl-col tl-col--team ${isEd('team')?'is-editing':''}`} onClick={()=>!isEd('team')&&startEdit('team')}>
          {isEd('team') ? <select autoFocus className="tl-inline-input" value={a.team} onChange={e=>onUpdate(a.id,{team:e.target.value})} onBlur={stopEdit}>{allTeams.map((t:string)=><option key={t}>{t}</option>)}</select> : <TeamBadge team={a.team} colorOverrides={teamColors}/>}
        </div>
        {/* Start */}
        <div className={`tl-col tl-col--start ${isEd('start')?'is-editing':''}`} onClick={()=>!isEd('start')&&startEdit('start')}>
          {isEd('start') ? <input autoFocus type="date" className="tl-inline-input" value={a.start??''} onChange={e=>onUpdate(a.id,{start:e.target.value||null})} onBlur={stopEdit}/> : <span className={`tl-date ${!a.start?'is-empty':''}`}>{a.start?fmtDate(a.start):'—'}</span>}
        </div>
        {/* Due */}
        <div className={`tl-col tl-col--due ${isEd('due')?'is-editing':''} ${overdue?'is-overdue':''}`} onClick={()=>!isEd('due')&&startEdit('due')}>
          {isEd('due') ? <input autoFocus type="date" className="tl-inline-input" value={a.due??''} onChange={e=>onUpdate(a.id,{due:e.target.value||null})} onBlur={stopEdit}/> : <span className={`tl-date ${!a.due?'is-empty':''} ${overdue?'is-overdue':''}`}>{a.due?fmtDate(a.due):'—'}</span>}
        </div>
        {/* Row actions */}
        <div className="tl-col tl-col--rowact">
          <button type="button" className="tl-row-btn" title="Add below" onClick={onAddBelow}>+</button>
          <button type="button" className="tl-row-btn tl-row-btn--del" title="Delete" onClick={()=>onDelete(a.id)}>✕</button>
        </div>
      </div>
      {/* Gantt area */}
      <div className="tl-row-time" style={{width:chartWidth}}>
        {(isMilestone) && due && <MilestoneDot activity={a} due={due} dayWidth={dayWidth} onUpdate={onUpdate}/>}
        {!isMilestone && start && due && (
          <GanttBar activity={a} start={start} due={due} barLeft={barLeft} barWidth={barWidth} color={color} isDone={isDone} isOverdue={!!overdue} dayWidth={dayWidth} onUpdate={onUpdate}/>
        )}
        {!isMilestone && (!start || !due) && (
          <div className="tl-bar-unscheduled" style={{left:8}}>Unscheduled</div>
        )}
      </div>
    </div>
  );
}

/* ====================== GanttBar ====================== */
function GanttBar({ activity: a, barLeft, barWidth, color, isDone, isOverdue, dayWidth, onUpdate }: any) {
  const dragRef = useRef<{startX:number;origLeft:number;origWidth:number;mode:'move'|'left'|'right'}|null>(null);

  const onBarMouseDown = useCallback((e: React.MouseEvent, mode: 'move'|'left'|'right') => {
    if (e.button !== 0) return; e.preventDefault(); e.stopPropagation();
    dragRef.current = { startX: e.clientX, origLeft: barLeft, origWidth: barWidth, mode };
    const onMove = (mv: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = mv.clientX - dragRef.current.startX;
      const { origLeft, origWidth, mode: m } = dragRef.current;
      let newLeft = origLeft, newWidth = origWidth;
      if (m==='move') newLeft = origLeft+dx;
      else if (m==='right') newWidth = Math.max(dayWidth, origWidth+dx);
      else if (m==='left') { newLeft=origLeft+dx; newWidth=Math.max(dayWidth,origWidth-dx); }
      const startDays = Math.round(newLeft/dayWidth);
      const endDays   = Math.round((newLeft+newWidth)/dayWidth)-1;
      const startDate = new Date(YEAR_START.getTime()+startDays*86400000);
      const endDate   = new Date(YEAR_START.getTime()+endDays*86400000);
      onUpdate(a.id, { start: toISO(startDate), due: toISO(endDate) });
    };
    const onUp = () => { dragRef.current=null; window.removeEventListener('mousemove',onMove); window.removeEventListener('mouseup',onUp); };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  }, [a.id, barLeft, barWidth, dayWidth, onUpdate]);

  return (
    <div className={`tl-bar ${isDone?'is-done':''} ${isOverdue?'is-overdue':''}`}
      style={{left:barLeft,width:barWidth,background:color,borderColor:color,cursor:'grab'}}
      onMouseDown={e=>onBarMouseDown(e,'move')} title={`${a.activity} — drag to move`}>
      {isDone && <span className="tl-bar-check">✓</span>}
      <div className="tl-bar-handle tl-bar-handle--left" onMouseDown={e=>{e.stopPropagation();onBarMouseDown(e,'left');}}/>
      <div className="tl-bar-handle tl-bar-handle--right" onMouseDown={e=>{e.stopPropagation();onBarMouseDown(e,'right');}}/>
    </div>
  );
}

/* ====================== MilestoneDot — draggable, same height as bar ====================== */
function MilestoneDot({ activity: a, due, dayWidth, onUpdate }: { activity: TimelineActivity; due: Date; dayWidth: number; onUpdate: (id:string,patch:any)=>void }) {
  const left = Math.round((due.getTime()-YEAR_START.getTime())/86400000)*dayWidth + dayWidth/2;
  const dragRef = useRef<{startX:number;startLeft:number}|null>(null);
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragRef.current = { startX: e.clientX, startLeft: left };
    const onMove = (mv: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = mv.clientX - dragRef.current.startX;
      const newLeft = dragRef.current.startLeft + dx;
      const offDays = Math.round((newLeft - dayWidth/2)/dayWidth);
      const newDate = new Date(YEAR_START.getTime()+offDays*86400000);
      onUpdate(a.id, { due: toISO(newDate), start: toISO(newDate) });
    };
    const onUp = () => { dragRef.current=null; window.removeEventListener('mousemove',onMove); window.removeEventListener('mouseup',onUp); };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  }, [a.id, dayWidth, left, onUpdate]);
  return (
    <div className="tl-milestone tl-milestone--draggable" style={{left}} title={`${a.activity} — drag to move`} onMouseDown={onMouseDown}>
      <IconDiamond size={20}/>
    </div>
  );
}

/* ====================== Header bands ====================== */
function buildHeaderBands(granularity: Granularity, dayWidth: number) {
  const totalDays = 730;
  if (granularity === 'sprints') {
    const sprintCells: any[] = [];
    const monthMap: Record<string, {left:number;width:number;label:string}> = {};
    for (let i=0;i<totalDays;i+=14) {
      const d = new Date(YEAR_START.getTime()+i*86400000);
      const sprintNum = Math.ceil((i+1)/14);
      sprintCells.push({left:i*dayWidth,width:14*dayWidth,label:`S${sprintNum}`});
      const mk = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleDateString('en-US',{month:'long',year:'numeric'});
      if (!monthMap[mk]) monthMap[mk]={left:i*dayWidth,width:0,label};
      monthMap[mk].width += 14*dayWidth;
    }
    return [{ isMajor:true, cells: Object.values(monthMap) },{ isMajor:false, cells: sprintCells }];
  }
  if (granularity === 'weeks') {
    const wCells: any[] = []; const monthMap: Record<string,any> = {};
    for (let i=0;i<totalDays;i+=7) {
      const d=new Date(YEAR_START.getTime()+i*86400000);
      wCells.push({left:i*dayWidth,width:7*dayWidth,label:`W${getWeek(d)}`});
      const mk=`${d.getFullYear()}-${d.getMonth()}`;
      if(!monthMap[mk]) monthMap[mk]={left:i*dayWidth,width:0,label:d.toLocaleDateString('en-US',{month:'long',year:'numeric'})};
      monthMap[mk].width+=7*dayWidth;
    }
    return [{isMajor:true,cells:Object.values(monthMap)},{isMajor:false,cells:wCells}];
  }
  if (granularity === 'months') {
    const mCells: any[] = []; const yMap: Record<number,any> = {};
    let i=0;
    while(i<totalDays) {
      const d=new Date(YEAR_START.getTime()+i*86400000);
      const y=d.getFullYear(); const m=d.getMonth();
      const daysInMonth=new Date(y,m+1,0).getDate();
      const w=daysInMonth*dayWidth;
      mCells.push({left:i*dayWidth,width:w,label:d.toLocaleDateString('en-US',{month:'short'})});
      if(!yMap[y]) yMap[y]={left:i*dayWidth,width:0,label:String(y)};
      yMap[y].width+=w; i+=daysInMonth;
    }
    return [{isMajor:true,cells:Object.values(yMap)},{isMajor:false,cells:mCells}];
  }
  // quarters
  const qCells: any[] = []; const yMap2: Record<number,any>={};
  let i=0;
  while(i<totalDays) {
    const d=new Date(YEAR_START.getTime()+i*86400000);
    const y=d.getFullYear(); const q=Math.floor(d.getMonth()/3)+1;
    const qStart=new Date(y,(q-1)*3,1); const qEnd=new Date(y,q*3,0);
    const days=Math.round((qEnd.getTime()-qStart.getTime())/86400000)+1;
    const w=days*dayWidth;
    qCells.push({left:i*dayWidth,width:w,label:`Q${q}`});
    if(!yMap2[y]) yMap2[y]={left:i*dayWidth,width:0,label:String(y)};
    yMap2[y].width+=w; i+=days;
  }
  return [{isMajor:true,cells:Object.values(yMap2)},{isMajor:false,cells:qCells}];
}

function getWeek(d: Date) {
  const first=new Date(d.getFullYear(),0,1);
  return Math.ceil((Math.floor((d.getTime()-first.getTime())/86400000)+first.getDay()+1)/7);
}
