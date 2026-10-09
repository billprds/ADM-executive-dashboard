export const DEFAULT_TEAMS = ['TXN', 'USR-M', 'USR-E', 'BAO', 'APPS', 'API', 'AI/ML', 'Other'];
export const DEFAULT_STATUSES = ['To Do', 'In Progress', 'Done', 'Blocked'];

/** Built-in default colors per team name */
export const DEFAULT_TEAM_COLORS: Record<string, string> = {
  'TXN':   '#1a6fc4',
  'USR-M': '#d97020',
  'USR-E': '#c84040',
  'BAO':   '#b8960a',
  'APPS':  '#a030a0',
  'API':   '#1a9060',
  'AI/ML': '#7040b8',
  'Other': '#5a7090',
};

const FALLBACK_PALETTE = [
  '#1a6fc4','#d97020','#c84040','#b8960a',
  '#a030a0','#1a9060','#7040b8','#5a7090',
  '#c04060','#208080','#806020','#406080',
];

/**
 * Resolve the display color for a team.
 * Pass `overrides` (settings.teamColors) to pick up user-edited colors first.
 * Falls back to built-in defaults, then a deterministic palette hash.
 */
export function teamColor(team: string, overrides: Record<string, string> = {}): string {
  if (overrides[team]) return overrides[team];
  if (DEFAULT_TEAM_COLORS[team]) return DEFAULT_TEAM_COLORS[team];
  let hash = 0;
  for (let i = 0; i < team.length; i++) hash = team.charCodeAt(i) + ((hash << 5) - hash);
  return FALLBACK_PALETTE[Math.abs(hash) % FALLBACK_PALETTE.length];
}

// Legacy exports kept for compatibility
export const TEAM_COLORS = DEFAULT_TEAM_COLORS;
export const TEAMS: Record<string, { label: string; colorVar: string }> = {};
export const TEAM_ORDER: string[] = DEFAULT_TEAMS;
