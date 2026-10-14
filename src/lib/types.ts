export type HealthStatus = 'On Track' | 'At Risk' | 'Off Track' | 'Not Started' | 'Complete';
export type Team = string;
export type ActivityStatus = string;
export type ActivityType = 'Task' | 'Milestone';

export interface Deployment { label: string; date: string; }

export interface ProjectNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  editedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  number: string;
  health: HealthStatus;
  progress: number;
  retired: boolean;
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

export interface AppSettings {
  teams: string[];
  statuses: string[];
  teamColors: Record<string, string>;
  darkMode: boolean;
}

export interface DashboardSnapshot {
  projects: Project[];
  timeline: TimelineActivity[];
  capacity: null;
  fetchedAt: string;
}
