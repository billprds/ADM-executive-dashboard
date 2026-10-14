import { Panel as PanelImpl } from './Panel';
export { PanelImpl as Panel };
import { teamColor } from '../lib/teams';

export function StatusDot({ status, label }: { status: string; label?: string }) {
  const colorMap: Record<string, string> = {
    'Done': 'var(--status-done)', 'On Track': 'var(--status-done)',
    'Complete': 'var(--status-done)', 'In Progress': 'var(--accent-500)',
    'At Risk': 'var(--status-progress)', 'Blocked': 'var(--status-risk)',
    'Off Track': 'var(--status-risk)', 'To Do': 'var(--ink-quaternary)',
    'Not Started': 'var(--ink-quaternary)',
  };
  const color = colorMap[status] ?? 'var(--ink-quaternary)';
  return (
    <span className="status-dot-wrap">
      <span className="status-dot" style={{ width: 8, height: 8, background: color, display: 'inline-block', borderRadius: '50%' }} />
      {label && <span className="status-dot-label">{label}</span>}
    </span>
  );
}

export function TeamBadge({ team, colorOverrides = {} }: { team: string; colorOverrides?: Record<string, string> }) {
  return (
    <span className="team-badge">
      <span className="team-badge__swatch" style={{ background: teamColor(team, colorOverrides), width: 6, height: 6, borderRadius: 2, display: 'inline-block' }} />
      <span className="team-badge__label">{team}</span>
    </span>
  );
}
