import type { ReactNode } from 'react';
import type { ActivityStatus, HealthStatus } from '../lib/types';
import { teamColor } from '../lib/teams';
import './primitives.css';

// ============================================================
// Panel — flat container with 1px border, no drop shadow.
// Default padding is generous. Use `dense` for tight tables/lists.
// ============================================================

interface PanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  dense?: boolean;
  noPad?: boolean;
}

export function Panel({ children, className = '', title, meta, actions, dense, noPad }: PanelProps) {
  const hasHeader = title || meta || actions;
  return (
    <section className={`panel ${dense ? 'panel--dense' : ''} ${className}`}>
      {hasHeader && (
        <header className="panel__header">
          <div className="panel__header-left">
            {title && <div className="panel__title">{title}</div>}
            {meta && <div className="panel__meta">{meta}</div>}
          </div>
          {actions && <div className="panel__actions">{actions}</div>}
        </header>
      )}
      <div className={noPad ? 'panel__body panel__body--nopad' : 'panel__body'}>{children}</div>
    </section>
  );
}

// ============================================================
// Section eyebrow — a stand-alone tiny label for grouping content
// outside a Panel header.
// ============================================================
export function Eyebrow({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <div className="eyebrow">
      <span className="u-label">{children}</span>
      {count !== undefined && <span className="eyebrow__count u-mono">{count}</span>}
    </div>
  );
}

// ============================================================
// StatusDot — 8px filled circle in a semantic color, optionally
// followed by a label. Replaces the old pill-shaped status badges.
// ============================================================

export function StatusDot({
  status,
  label,
  size = 8,
}: {
  status: ActivityStatus | HealthStatus | 'overdue';
  label?: string;
  size?: number;
}) {
  const colorVar = statusVarFor(status);
  return (
    <span className="status-dot-wrap">
      <span
        className="status-dot"
        style={{ background: `var(${colorVar})`, width: size, height: size }}
        aria-hidden="true"
      />
      {label && <span className="status-dot-label">{label}</span>}
    </span>
  );
}

function statusVarFor(status: ActivityStatus | HealthStatus | 'overdue'): string {
  switch (status) {
    case 'Done':
    case 'Complete':
    case 'On Track':
      return '--status-done';
    case 'In Progress':
    case 'At Risk':
      return '--status-progress';
    case 'To Do':
    case 'Not Started':
      return '--status-todo';
    case 'Blocked':
    case 'Off Track':
    case 'overdue':
      return '--status-risk';
    default:
      return '--status-todo';
  }
}

// ============================================================
// TeamBadge — plain-text team name with a 6px colored square prefix.
// Deliberately NOT a rounded pill: the color square IS the affordance;
// wrapping the text in a colored background adds noise, not information.
// ============================================================

export function TeamBadge({ team }: { team: string }) {
  return (
    <span className="team-badge">
      <span
        className="team-badge__swatch"
        style={{ background: teamColor(team) }}
        aria-hidden="true"
      />
      <span className="team-badge__label u-mono">{team}</span>
    </span>
  );
}

// ============================================================
// Metric — big number with a small uppercase label above it.
// The core "20px bold figure" from the type scale.
// ============================================================

export function Metric({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'accent' | 'positive' | 'warning' | 'critical';
}) {
  return (
    <div className={`metric metric--${tone}`}>
      <div className="metric__label u-label">{label}</div>
      <div className="metric__value u-mono">{value}</div>
      {hint && <div className="metric__hint">{hint}</div>}
    </div>
  );
}
