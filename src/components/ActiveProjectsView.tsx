import { useMemo, useState } from 'react';
import type { Project, TimelineActivity } from '../lib/types';
import { Panel, Metric, StatusDot, TeamBadge } from './primitives';
import { fmtDate, daysFromToday, parseISO } from '../lib/dateUtils';
import { IconAlert, IconRocket, IconChevronRight } from './icons';
import { ProjectDetailDrawer } from './ProjectDetailDrawer';
import './ActiveProjectsView.css';

interface Props {
  projects: Project[];
  timeline: TimelineActivity[];
  todayISO: string;
}

export function ActiveProjectsView({ projects, timeline, todayISO }: Props) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // ---------- KPIs computed once per render ----------
  const stats = useMemo(() => {
    const active = projects.length;
    const onTrack = projects.filter((p) => p.health === 'On Track').length;
    const atRisk = projects.filter((p) => p.health === 'At Risk').length;
    const offTrack = projects.filter((p) => p.health === 'Off Track').length;
    const openIssues = projects.reduce((s, p) => s + p.issuesCount, 0);
    const avgProgress = active > 0
      ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / active)
      : 0;
    return { active, onTrack, atRisk, offTrack, openIssues, avgProgress };
  }, [projects]);

  // ---------- Upcoming deployments strip ----------
  // Deployments (from timeline) + milestones, coming in the next 30d, sorted by date
  const upcomingDeployments = useMemo(() => {
    const items = timeline
      .filter((t) => (t.type === 'Deployment' || t.type === 'Milestone') && t.due)
      .map((t) => {
        const days = daysFromToday(t.due!, todayISO);
        return { ...t, daysFromToday: days };
      })
      .filter((t) => t.daysFromToday >= -3 && t.daysFromToday <= 30 && t.status !== 'Done')
      .sort((a, b) => a.daysFromToday - b.daysFromToday);
    return items.slice(0, 8);
  }, [timeline, todayISO]);

  return (
    <>
      <div className="active-view">
        {/* Portfolio metrics — dense row of 6 tight metrics */}
        <Panel className="active-view__metrics-panel" noPad>
          <div className="active-view__metrics">
            <Metric label="Active Projects" value={stats.active} tone="accent" />
            <div className="active-view__metrics-sep" />
            <Metric label="On Track" value={stats.onTrack} tone="positive" hint={`${Math.round((stats.onTrack / stats.active) * 100) || 0}% of portfolio`} />
            <Metric label="At Risk" value={stats.atRisk} tone="warning" hint={stats.atRisk === 0 ? 'None' : 'Needs attention'} />
            <Metric label="Off Track" value={stats.offTrack} tone={stats.offTrack === 0 ? 'default' : 'critical'} />
            <div className="active-view__metrics-sep" />
            <Metric label="Open Issues" value={stats.openIssues} tone={stats.openIssues === 0 ? 'default' : 'warning'} />
            <Metric label="Avg Progress" value={`${stats.avgProgress}%`} />
          </div>
        </Panel>

        {/* Upcoming deployments strip */}
        <Panel title="Upcoming deployments" meta={`${upcomingDeployments.length} in next 30 days`} noPad>
          {upcomingDeployments.length === 0 ? (
            <div className="active-view__empty">No deployments scheduled in the next 30 days.</div>
          ) : (
            <ul className="deploy-strip">
              {upcomingDeployments.map((d) => {
                const overdue = d.daysFromToday < 0;
                const soon = d.daysFromToday >= 0 && d.daysFromToday <= 7;
                return (
                  <li key={d.id} className="deploy-strip__item">
                    <div className="deploy-strip__icon">
                      {d.type === 'Milestone' ? <IconRocket size={14} /> : <IconRocket size={14} />}
                    </div>
                    <div className="deploy-strip__body">
                      <div className="deploy-strip__project u-label">{d.projectName}</div>
                      <div className="deploy-strip__label">{d.activity}</div>
                      <div className="deploy-strip__meta">
                        <TeamBadge team={d.team} />
                        <span className="deploy-strip__date u-mono">{fmtDate(d.due!)}</span>
                        <span
                          className={`deploy-strip__eta ${overdue ? 'is-overdue' : soon ? 'is-soon' : ''}`}
                        >
                          {overdue ? `${Math.abs(d.daysFromToday)}d overdue` : d.daysFromToday === 0 ? 'today' : `in ${d.daysFromToday}d`}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        {/* Portfolio register */}
        <Panel title="Portfolio register" meta={`${projects.length} projects`} noPad>
          <div className="register-table-wrap">
            <table className="register-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Project</th>
                  <th style={{ width: 100 }}>Number</th>
                  <th style={{ width: 140 }}>Health</th>
                  <th style={{ width: 180 }}>Progress</th>
                  <th style={{ width: 80, textAlign: 'right' }}>Issues</th>
                  <th style={{ width: 140 }}>Next milestone</th>
                  <th style={{ width: 24 }} />
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const nextMilestone = nextMilestoneFor(p.id, timeline, todayISO);
                  return (
                    <tr key={p.id} onClick={() => setSelectedProject(p)} className="register-table__row">
                      <td>
                        <span className="register-table__project-name">{p.name}</span>
                      </td>
                      <td className="u-mono register-table__number">{p.number}</td>
                      <td>
                        <StatusDot status={p.health} label={p.health} />
                      </td>
                      <td>
                        <div className="register-table__progress">
                          <div className="register-table__progress-track">
                            <div
                              className={`register-table__progress-fill ${progressToneClass(p.health, p.progress)}`}
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                          <span className="register-table__progress-pct u-mono">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="register-table__issues">
                        {p.issuesCount > 0 ? (
                          <span className="register-table__issue-count">
                            <IconAlert size={12} />
                            <span className="u-mono">{p.issuesCount}</span>
                          </span>
                        ) : (
                          <span className="register-table__issue-none">—</span>
                        )}
                      </td>
                      <td className="u-mono register-table__milestone">
                        {nextMilestone ? fmtDate(nextMilestone.due) : '—'}
                      </td>
                      <td>
                        <IconChevronRight size={12} className="register-table__chevron" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {selectedProject && (
        <ProjectDetailDrawer
          project={selectedProject}
          timeline={timeline.filter((t) => t.projectId === selectedProject.id)}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}

/** Find the next non-done milestone/deployment for a project. */
function nextMilestoneFor(projectId: string, timeline: TimelineActivity[], todayISO: string) {
  const today = parseISO(todayISO);
  if (!today) return null;
  const candidates = timeline
    .filter((t) => t.projectId === projectId)
    .filter((t) => (t.type === 'Milestone' || t.type === 'Deployment') && t.status !== 'Done' && t.due)
    .map((t) => ({ ...t, dueDate: parseISO(t.due!)! }))
    .filter((t) => t.dueDate >= today)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  return candidates[0] ? { due: candidates[0].due! } : null;
}

function progressToneClass(health: Project['health'], progress: number): string {
  if (progress >= 100) return 'is-done';
  if (health === 'At Risk') return 'is-warn';
  if (health === 'Off Track') return 'is-critical';
  if (progress === 0) return 'is-idle';
  return 'is-active';
}
