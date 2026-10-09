export type HealthStatus =
  | 'On Track' | 'At Risk' | 'Off Track' | 'Not Started' | 'Complete';

export type Team = string;
export type ActivityStatus = string;
export type ActivityType = 'Task' | 'Milestone' | 'Deployment';

export interface Deployment { label: string; date: string; }

export interface ProjectNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  number: string;
  health: HealthStatus;
  progress: number;
  targets: Deployment[];
  actuals: Deployment[];
  issuesCount: number;
  issuesSummary?: string;
  notes?: ProjectNote[];
  riskDescription?: string;
  riskMitigation?: string;
  riskLevel?: 'Low Risk' | 'Medium Risk' | 'High Risk';
  dependsOn?: string;
  dependencyImpact?: string;
  dependencyStatus?: 'Cleared' | 'Open' | 'Blocked';
}

export interface TimelineActivity {
  id: string;
  projectId: string;
  projectName: string;
  team: Team;
  type: ActivityType;
  activity: string;
  status: ActivityStatus;
  start: string | null;
  due: string | null;
  devResources?: number | null;
  qaResources?: number | null;
}

export interface CapacityPerson {
  id: string; name: string; role: string; team: string;
  cells: (string | null)[];
}
export interface CapacityMonth { key: string; label: string; year: number; monthIdx: number; }
export interface CapacityDateColumn { iso: string; day: number; monthKey: string; monthLabel: string; }
export interface CapacityData { people: CapacityPerson[]; dateColumns: CapacityDateColumn[]; months: CapacityMonth[]; }

export interface AppSettings {
  teams: string[];
  statuses: string[];
  /** Per-team color overrides. Key = team name, value = hex color e.g. "#1a6fc4" */
  teamColors: Record<string, string>;
}

export interface DashboardSnapshot {
  projects: Project[];
  timeline: TimelineActivity[];
  capacity: CapacityData | null;
  fetchedAt: string;
}
