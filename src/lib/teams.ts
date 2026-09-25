/* Team → color mapping. Keeps team visualization consistent across
   the legend, Gantt bars, and any other place teams appear. */

import type { Team } from './types';

export interface TeamInfo {
  label: string;
  colorVar: string; // CSS variable name (without the var() wrapper)
}

export const TEAMS: Record<Team, TeamInfo> = {
  'TXN':   { label: 'TXN',   colorVar: '--team-txn' },
  'USR-M': { label: 'USR-M', colorVar: '--team-usr-m' },
  'USR-E': { label: 'USR-E', colorVar: '--team-usr-e' },
  'BAO':   { label: 'BAO',   colorVar: '--team-bao' },
  'APPS':  { label: 'APPS',  colorVar: '--team-apps' },
  'API':   { label: 'API',   colorVar: '--team-api' },
  'AI/ML': { label: 'AI/ML', colorVar: '--team-aiml' },
  'Other': { label: 'Other', colorVar: '--team-other' },
};

/** All teams in display order for the legend. */
export const TEAM_ORDER: Team[] = ['TXN', 'USR-M', 'USR-E', 'BAO', 'APPS', 'API', 'AI/ML'];

/** Get the color CSS value for a team. */
export function teamColor(team: string): string {
  const info = TEAMS[team as Team];
  return info ? `var(${info.colorVar})` : 'var(--team-other)';
}
