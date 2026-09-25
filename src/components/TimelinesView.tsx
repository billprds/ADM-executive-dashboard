import { useMemo, useState, useRef, useEffect } from 'react';
import type { TimelineActivity } from '../lib/types';
import { Panel, StatusDot, TeamBadge } from './primitives';
import { fmtDate, parseISO, toISO } from '../lib/dateUtils';
import { TEAM_ORDER, TEAMS, teamColor } from '../lib/teams';
import { IconDiamond } from './icons';
import './TimelinesView.css';

type Granularity = 'sprints' | 'weeks' | 'months' | 'quarters';

/** Pixels per DAY at each granularity level (before zoom). */
const DAY_PX: Record<Granularity, number> = {
  sprints: 6,
  weeks: 8,
  months: 3.2,
  quarters: 2,
};

/** Year window this Gantt renders. Kept aligned to the mock data. */
const YEAR_START = new Date(2026, 0, 1);
const YEAR_END = new Date(2026, 11, 31);
const DAY_MS = 86400000;
const TOTAL_DAYS = Math.round((YEAR_END.getTime() - YEAR_START.getTime()) / DAY_MS) + 1;

interface Props {
  timeline: TimelineActivity[];
  todayISO: string;
}

export function TimelinesView({ timeline, todayISO }: Props) {
  const [granularity, setGranularity] = useState<Granularity>('sprints');
  const [zoom, setZoom] = useState(1);
  const [projectFilter, setProjectFilter] = useState<string>('__ALL__');
  const [teamFilter, setTeamFilter] = useState<string>('__ALL__');

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const dayWidth = DAY_PX[granularity] * zoom;
  const chartWidth = TOTAL_DAYS * dayWidth;

  // ---------- Filters ----------
  const projects = useMemo(() => {
    const set = new Set<string>();
    timeline.forEach((t) => set.add(t.projectName));
    return Array.from(set);
  }, [timeline]);

  const filtered = useMemo(() => {
    return timeline.filter((t) => {
      if (projectFilter !== '__ALL__' && t.projectName !== projectFilter) return false;
      if (teamFilter !== '__ALL__' && t.team !== teamFilter) return false;
      return true;
    });
  }, [timeline, projectFilter, teamFilter]);

  // Group by project, preserving first-appearance order
  const grouped = useMemo(() => {
    const order: string[] = [];
    const byProject: Record<string, TimelineActivity[]> = {};
    filtered.forEach((t) => {
      if (!byProject[t.projectId]) {
        byProject[t.projectId] = [];
        order.push(t.projectId);
      }
      byProject[t.projectId].push(t);
    });
    return order.map((id) => ({ id, name: byProject[id][0].projectName, items: byProject[id] }));
  }, [filtered]);

  // ---------- Auto-scroll to today on mount / when granularity changes ----------
  useEffect(() => {
    if (!scrollRef.current) return;
    const today = parseISO(todayISO);
    if (!today) return;
    const daysFromStart = Math.round((today.getTime() - YEAR_START.getTime()) / DAY_MS);
    const targetLeft = daysFromStart * dayWidth - 200;
    scrollRef.current.scrollLeft = Math.max(0, targetLeft);
  }, [granularity, zoom, todayISO, dayWidth]);

  // ---------- Header time bands ----------
  const headerBands = useMemo(() => buildHeaderBands(granularity, dayWidth), [granularity, dayWidth]);

  const today = parseISO(todayISO)!;
  const todayOffset = Math.round((today.getTime() - YEAR_START.getTime()) / DAY_MS);

  return (
    <div className="timelines-view">
      {/* Filters row */}
      <Panel dense>
        <div className="tl-filters">
          <div className="tl-filter-group">
            <label className="u-label" htmlFor="tl-project">Project</label>
            <select id="tl-project" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
              <option value="__ALL__">All projects</option>
              {projects.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="tl-filter-group">
            <label className="u-label" htmlFor="tl-team">Team</label>
            <select id="tl-team" value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
              <option value="__ALL__">All teams</option>
              {TEAM_ORDER.map((t) => <option key={t} value={t}>{TEAMS[t].label}</option>)}
            </select>
          </div>
          <div className="tl-filter-group">
            <label className="u-label">Granularity</label>
            <div className="tl-segmented">
              {(['sprints','weeks','months','quarters'] as Granularity[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  className={granularity === g ? 'is-active' : ''}
                  onClick={() => setGranularity(g)}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="tl-filter-group">
            <label className="u-label">Zoom</label>
            <div className="tl-segmented">
              <button type="button" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>−</button>
              <span className="tl-zoom-value u-mono">{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>+</button>
            </div>
          </div>

          <div className="tl-filter-spacer" />

          {/* Compact legend, right-aligned. Not a rainbow. */}
          <div className="tl-legend" aria-label="Team legend">
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
            <span className="tl-legend-item">
              <span className="tl-legend-today" />
              <span className="u-label">Today</span>
            </span>
          </div>
        </div>
      </Panel>

      {/* Gantt panel */}
      <Panel
        title="Timeline"
        meta={`${filtered.length} activities · ${grouped.length} projects`}
        noPad
      >
        <div className="tl-chart" ref={scrollRef}>
          <div className="tl-chart-inner" style={{ minWidth: 640 + chartWidth }}>
            {/* Header rows */}
            <div className="tl-header">
              <div className="tl-header-fixed">
                <div className="tl-col tl-col--activity u-label">Activity</div>
                <div className="tl-col tl-col--status u-label">Status</div>
                <div className="tl-col tl-col--team u-label">Team</div>
                <div className="tl-col tl-col--start u-label">Start</div>
                <div className="tl-col tl-col--due u-label">Due</div>
              </div>
              <div className="tl-header-time" style={{ width: chartWidth }}>
                <div className="tl-header-band tl-header-band--major">
                  {headerBands.major.map((b, i) => (
                    <div key={i} className="tl-band-cell" style={{ left: b.left, width: b.width }}>
                      {b.label}
                    </div>
                  ))}
                </div>
                <div className="tl-header-band tl-header-band--minor">
                  {headerBands.minor.map((b, i) => (
                    <div key={i} className="tl-band-cell" style={{ left: b.left, width: b.width }}>
                      {b.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rows */}
            <div className="tl-rows">
              {grouped.map((group) => (
                <div key={group.id} className="tl-group">
                  <div className="tl-group-header">
                    <div className="tl-group-header-fixed">
                      <span className="tl-group-name">{group.name}</span>
                      <span className="tl-group-number u-mono">{group.id}</span>
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
                      todayOffset={todayOffset}
                      todayISO={todayISO}
                    />
                  ))}
                </div>
              ))}

              {/* Today marker overlays the whole chart */}
              <div
                className="tl-today-line"
                style={{
                  left: 640 + todayOffset * dayWidth,
                  height: '100%',
                }}
              >
                <span className="tl-today-label u-label">Today</span>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

// ============================================================
// Single row
// ============================================================

interface RowProps {
  activity: TimelineActivity;
  dayWidth: number;
  chartWidth: number;
  todayOffset: number;
  todayISO: string;
}

function TimelineRow({ activity, dayWidth, chartWidth, todayISO }: RowProps) {
  const isMilestone = activity.type === 'Milestone';
  const isDeployment = activity.type === 'Deployment';

  const start = activity.start ? parseISO(activity.start) : null;
  const due = activity.due ? parseISO(activity.due) : null;
  const today = parseISO(todayISO);

  let bar: { left: number; width: number } | null = null;
  if (start && due) {
    const startOffset = Math.round((start.getTime() - YEAR_START.getTime()) / DAY_MS);
    const endOffset = Math.round((due.getTime() - YEAR_START.getTime()) / DAY_MS);
    bar = {
      left: startOffset * dayWidth,
      width: Math.max(dayWidth * 0.6, (endOffset - startOffset + 1) * dayWidth - 2),
    };
  }

  const overdue = due && today && due < today && activity.status !== 'Done';

  return (
    <div className="tl-row">
      <div className="tl-row-fixed">
        <div className="tl-col tl-col--activity">
          <span className="tl-activity-label" title={activity.activity}>{activity.activity}</span>
        </div>
        <div className="tl-col tl-col--status">
          <StatusDot status={activity.status} label={activity.status} />
        </div>
        <div className="tl-col tl-col--team">
          <TeamBadge team={activity.team} />
        </div>
        <div className={`tl-col tl-col--start u-mono ${!activity.start ? 'is-empty' : ''}`}>
          {activity.start ? fmtDate(activity.start) : '—'}
        </div>
        <div className={`tl-col tl-col--due u-mono ${overdue ? 'is-overdue' : ''} ${!activity.due ? 'is-empty' : ''}`}>
          {activity.due ? fmtDate(activity.due) : '—'}
        </div>
      </div>
      <div className="tl-row-time" style={{ width: chartWidth }}>
        {isMilestone && due && (
          <div
            className="tl-milestone"
            style={{
              left: Math.round((due.getTime() - YEAR_START.getTime()) / DAY_MS) * dayWidth + dayWidth / 2,
            }}
            title={activity.activity}
          >
            <IconDiamond size={14} />
          </div>
        )}
        {isDeployment && due && (
          <div
            className="tl-milestone tl-milestone--deploy"
            style={{
              left: Math.round((due.getTime() - YEAR_START.getTime()) / DAY_MS) * dayWidth + dayWidth / 2,
            }}
            title={activity.activity}
          >
            <IconDiamond size={14} />
          </div>
        )}
        {!isMilestone && !isDeployment && bar && (
          <div
            className={`tl-bar ${activity.status === 'Done' ? 'is-done' : ''} ${overdue ? 'is-overdue' : ''}`}
            style={{
              left: bar.left,
              width: bar.width,
              background: teamColor(activity.team),
              borderColor: teamColor(activity.team),
            }}
            title={`${activity.activity} · ${fmtDate(activity.start)} → ${fmtDate(activity.due)}`}
          >
            {activity.status === 'Done' && <span className="tl-bar-check">✓</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Header band construction
// ============================================================

interface Band {
  left: number;
  width: number;
  label: string;
}

function buildHeaderBands(granularity: Granularity, dayWidth: number): { major: Band[]; minor: Band[] } {
  const major: Band[] = [];
  const minor: Band[] = [];

  const d = new Date(YEAR_START);
  const monthStarts: Array<{ month: number; year: number; offset: number }> = [];
  while (d <= YEAR_END) {
    if (d.getDate() === 1) {
      monthStarts.push({ month: d.getMonth(), year: d.getFullYear(), offset: daysFromStart(d) });
    }
    d.setDate(d.getDate() + 1);
  }

  // Major = quarter or month depending on density
  for (let i = 0; i < monthStarts.length; i++) {
    const ms = monthStarts[i];
    const next = monthStarts[i + 1];
    const endOffset = next ? next.offset : TOTAL_DAYS;
    const label = new Date(ms.year, ms.month, 1)
      .toLocaleString('en-US', { month: 'short' })
      .toUpperCase() + ` ${ms.year}`;
    major.push({ left: ms.offset * dayWidth, width: (endOffset - ms.offset) * dayWidth, label });
  }

  // Minor bands
  if (granularity === 'sprints') {
    // 2-week sprints starting Jan 5, 2026 (a Monday). Naming: S1, S2, ...
    const sprintStart = new Date(2026, 0, 5);
    let sprintNum = 1;
    const dd = new Date(sprintStart);
    while (dd <= YEAR_END) {
      const offset = daysFromStart(dd);
      minor.push({ left: offset * dayWidth, width: 14 * dayWidth, label: `S${sprintNum}` });
      sprintNum++;
      dd.setDate(dd.getDate() + 14);
    }
  } else if (granularity === 'weeks') {
    // ISO weeks starting Monday
    const dd = new Date(YEAR_START);
    // Snap forward to next Monday
    while (dd.getDay() !== 1) dd.setDate(dd.getDate() + 1);
    while (dd <= YEAR_END) {
      const offset = daysFromStart(dd);
      minor.push({ left: offset * dayWidth, width: 7 * dayWidth, label: `W${weekNum(dd)}` });
      dd.setDate(dd.getDate() + 7);
    }
  } else if (granularity === 'months') {
    for (const ms of monthStarts) {
      minor.push({ left: ms.offset * dayWidth, width: 30 * dayWidth, label: new Date(ms.year, ms.month, 1).toLocaleString('en-US', { month: 'short' }) });
    }
  } else {
    // Quarters
    for (let q = 0; q < 4; q++) {
      const qStart = new Date(2026, q * 3, 1);
      const qEnd = new Date(2026, q * 3 + 3, 0);
      const offset = daysFromStart(qStart);
      const width = ((qEnd.getTime() - qStart.getTime()) / DAY_MS + 1) * dayWidth;
      minor.push({ left: offset * dayWidth, width, label: `Q${q + 1}` });
    }
  }

  return { major, minor };
}

function daysFromStart(d: Date): number {
  return Math.round((d.getTime() - YEAR_START.getTime()) / DAY_MS);
}

function weekNum(d: Date): number {
  const first = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - first.getTime()) / DAY_MS);
  return Math.ceil((days + first.getDay() + 1) / 7);
}

// Silence "unused" warning while the export shape settles
void toISO;
