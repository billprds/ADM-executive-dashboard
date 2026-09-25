/* ============================================================
   Domain types for the ADM Delivery dashboard.
   Deliberately close to the existing dashboard's data model so
   the future Go backend can serve identical JSON shapes.
============================================================ */

/** Project health as reported by the delivery manager. */
export type HealthStatus =
  | 'On Track'
  | 'At Risk'
  | 'Off Track'
  | 'Not Started'
  | 'Complete';

export type Team =
  | 'TXN'
  | 'USR-M'
  | 'USR-E'
  | 'BAO'
  | 'APPS'
  | 'API'
  | 'AI/ML'
  | 'Other';

export type ActivityStatus = 'To Do' | 'In Progress' | 'Done' | 'Blocked';
export type ActivityType = 'Task' | 'Milestone' | 'Deployment';

/** A named deployment or delivery milestone attached to a project. */
export interface Deployment {
  label: string;
  date: string; // ISO YYYY-MM-DD
}

/** A top-level project as shown on the Active Projects tab. */
export interface Project {
  id: string;              // e.g. "ANGKAS-503"
  name: string;
  number: string;
  health: HealthStatus;
  progress: number;        // 0-100

  targets: Deployment[];   // Planned deployments
  actuals: Deployment[];   // Actual deployments made

  issuesCount: number;
  issuesSummary?: string;

  riskDescription?: string;
  riskMitigation?: string;
  riskLevel?: 'Low Risk' | 'Medium Risk' | 'High Risk';

  dependsOn?: string;
  dependencyImpact?: string;
  dependencyStatus?: 'Cleared' | 'Open' | 'Blocked';
}

/** A single row on the Project Timelines Gantt. */
export interface TimelineActivity {
  id: string;
  projectId: string;       // FK to Project.id
  projectName: string;     // Denormalized for convenience
  team: Team;
  type: ActivityType;
  activity: string;        // Row label
  status: ActivityStatus;
  start: string | null;    // ISO date; null for unscheduled
  due: string | null;
  devResources?: number | null;  // For effort tab
  qaResources?: number | null;
}

/** A person's daily allocation for the Capacity tab. */
export interface CapacityPerson {
  id: string;
  name: string;
  role: string;
  team: string;            // Full team name, may include "/" separators
  cells: (string | null)[]; // One per date column; project name or null=unassigned
}

export interface CapacityMonth {
  key: string;             // "2026-09"
  label: string;           // "Sep 2026"
  year: number;
  monthIdx: number;        // 0-11
}

export interface CapacityDateColumn {
  iso: string;             // "2026-09-01"
  day: number;             // 1-31
  monthKey: string;
  monthLabel: string;
}

export interface CapacityData {
  people: CapacityPerson[];
  dateColumns: CapacityDateColumn[];
  months: CapacityMonth[];
}

/** Snapshot returned by the API. Everything the frontend needs in one call. */
export interface DashboardSnapshot {
  projects: Project[];
  timeline: TimelineActivity[];
  capacity: CapacityData | null;
  fetchedAt: string; // ISO timestamp
}
