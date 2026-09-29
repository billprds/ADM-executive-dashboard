/* ============================================================
   Mock fixture data — Angkas-shaped. Exercises every UI state
   the dashboard needs to render: all health levels, all teams,
   all activity statuses, projects at 0/50/100% completion,
   overdue items, upcoming deployments, etc.
============================================================ */

import type {
  Project,
  TimelineActivity,
  CapacityData,
  DashboardSnapshot,
} from '../lib/types';

/** Anchor "today" for the mock. Real app derives from Date(). */
export const MOCK_TODAY_ISO = '2026-09-25';

// ---------- Projects (Active Projects tab) ----------

export const mockProjects: Project[] = [
  {
    id: 'ANGKAS-528',
    name: 'Rain Initiatives (Phase 3)',
    number: 'ANGKAS-528',
    health: 'On Track',
    progress: 100,
    targets: [
      { label: 'BE Prod Deployment', date: '2026-08-20' },
      { label: 'Full Rollout', date: '2026-09-15' },
    ],
    actuals: [
      { label: 'BE Prod Deployment', date: '2026-08-22' },
      { label: 'Full Rollout', date: '2026-09-15' },
    ],
    issuesCount: 0,
    riskLevel: 'Low Risk',
  },
  {
    id: 'ANGKAS-503',
    name: 'Angcars 6-Seater',
    number: 'ANGKAS-503',
    health: 'At Risk',
    progress: 60,
    targets: [
      { label: 'APP Deployment (CAX & DAX)', date: '2026-09-30' },
      { label: 'Public launch', date: '2026-10-14' },
    ],
    actuals: [],
    issuesCount: 3,
    issuesSummary: 'iOS build failing on TestFlight — signing profile expired',
    riskDescription: 'App submission depends on Apple review; 5–7d SLA cutting into launch buffer',
    riskMitigation: 'Submitting builds in parallel to iOS/Android; keeping feature-flagged rollout in reserve',
    riskLevel: 'Medium Risk',
    dependsOn: 'Marketing collateral',
    dependencyImpact: 'Cannot launch without approved store screenshots',
    dependencyStatus: 'Open',
  },
  {
    id: 'ANGKAS-137',
    name: 'In-App Biker Onboarding & Incubation',
    number: 'ANGKAS-137',
    health: 'On Track',
    progress: 50,
    targets: [
      { label: 'USR-M Prod Deployment', date: '2026-09-07' },
      { label: 'Rollout to Cebu pilot', date: '2026-10-01' },
    ],
    actuals: [
      { label: 'USR-M Prod Deployment', date: '2026-09-07' },
    ],
    issuesCount: 1,
    issuesSummary: 'KYC integration returning intermittent 5xx from HyperVerge',
    riskLevel: 'Low Risk',
  },
  {
    id: 'ANGKAS-73',
    name: 'Experimentation Platform',
    number: 'ANGKAS-73',
    health: 'On Track',
    progress: 50,
    targets: [
      { label: 'TXN (Booking Prio — Queue Length)', date: '2026-05-26' },
      { label: 'TXN (Booking Prio — Polling)', date: '2026-06-02' },
    ],
    actuals: [
      { label: 'TXN (Booking Prio — Queue Length)', date: '2026-05-26' },
      { label: 'TXN (Booking Prio — Polling)', date: '2026-06-04' },
    ],
    issuesCount: 0,
    riskDescription: 'Occasional Statsig config drift in Prod',
    riskMitigation: 'BE handles graceful fallback when Statsig is unreachable',
    riskLevel: 'Low Risk',
    dependsOn: 'Statsig SDK stability',
    dependencyStatus: 'Cleared',
  },
  {
    id: 'ANGKAS-611',
    name: 'In App Chat Phase 1.5',
    number: 'ANGKAS-611',
    health: 'On Track',
    progress: 90,
    targets: [
      { label: 'Full rollout to all cities', date: '2026-10-05' },
    ],
    actuals: [],
    issuesCount: 0,
    riskLevel: 'Low Risk',
  },
  {
    id: 'ANGKAS-580',
    name: '[Tech] Load Tests for Mass Driver Onboarding / Scalability mitigation',
    number: 'ANGKAS-580',
    health: 'Not Started',
    progress: 10,
    targets: [
      { label: 'Baseline load test report', date: '2026-11-01' },
    ],
    actuals: [],
    issuesCount: 0,
    riskLevel: 'Low Risk',
  },
  {
    id: 'ANGKAS-620',
    name: 'Piso Surprise',
    number: 'ANGKAS-620',
    health: 'On Track',
    progress: 30,
    targets: [
      { label: 'Campaign start', date: '2026-10-20' },
    ],
    actuals: [],
    issuesCount: 0,
    riskLevel: 'Low Risk',
  },
  {
    id: 'ANGKAS-604',
    name: 'Quick Match Phase 2',
    number: 'ANGKAS-604',
    health: 'On Track',
    progress: 60,
    targets: [
      { label: 'Metro Manila rollout', date: '2026-10-08' },
    ],
    actuals: [],
    issuesCount: 1,
    issuesSummary: 'Match latency spikes on high-density hours',
    riskLevel: 'Low Risk',
  },
  {
    id: 'ANGKAS-475',
    name: '[DAX] Incubation content',
    number: 'ANGKAS-475',
    health: 'Not Started',
    progress: 10,
    targets: [],
    actuals: [],
    issuesCount: 0,
    riskLevel: 'Low Risk',
  },
  {
    id: 'ANGKAS-590',
    name: '[In-App Navigation in DAX] Google Mobility SDK DAX',
    number: 'ANGKAS-590',
    health: 'Not Started',
    progress: 0,
    targets: [],
    actuals: [],
    issuesCount: 0,
    riskLevel: 'Low Risk',
  },
  {
    id: 'ANGKAS-595',
    name: 'Habal/Hail Allocator',
    number: 'ANGKAS-595',
    health: 'Not Started',
    progress: 0,
    targets: [],
    actuals: [],
    issuesCount: 0,
    riskLevel: 'Low Risk',
  },
  {
    id: 'ANGKAS-585',
    name: '[Tech] Worker Optimization',
    number: 'ANGKAS-585',
    health: 'On Track',
    progress: 90,
    targets: [
      { label: 'Rollout to prod queue workers', date: '2026-10-02' },
    ],
    actuals: [],
    issuesCount: 0,
    riskLevel: 'Low Risk',
  },
];

// ---------- Timeline activities (Project Timelines tab) ----------

export const mockTimeline: TimelineActivity[] = [
  // Rain Initiatives (Phase 3) — ANGKAS-528
  { id: 't1',  projectId: 'ANGKAS-528', projectName: 'Rain Initiatives (Phase 3)', team: 'TXN',   type: 'Task',       activity: '[TXN only] BE Dev\'t',           status: 'Done',        start: '2026-07-23', due: '2026-08-10' },
  { id: 't2',  projectId: 'ANGKAS-528', projectName: 'Rain Initiatives (Phase 3)', team: 'TXN',   type: 'Task',       activity: '[TXN only] BE Testing',          status: 'Done',        start: '2026-08-11', due: '2026-08-20' },
  { id: 't3',  projectId: 'ANGKAS-528', projectName: 'Rain Initiatives (Phase 3)', team: 'TXN',   type: 'Deployment', activity: '[TXN only] BE Prod Deployment',  status: 'Done',        start: '2026-08-22', due: '2026-08-22' },
  { id: 't4',  projectId: 'ANGKAS-528', projectName: 'Rain Initiatives (Phase 3)', team: 'TXN',   type: 'Task',       activity: '[TXN x USR-M] BE Dev\'t',        status: 'Done',        start: '2026-07-23', due: '2026-08-03' },
  { id: 't5',  projectId: 'ANGKAS-528', projectName: 'Rain Initiatives (Phase 3)', team: 'TXN',   type: 'Task',       activity: '[TXN x APPS] BE Dev\'t',         status: 'Done',        start: '2026-07-28', due: '2026-08-17' },
  { id: 't6',  projectId: 'ANGKAS-528', projectName: 'Rain Initiatives (Phase 3)', team: 'APPS',  type: 'Deployment', activity: 'App submission (iOS)',           status: 'Done',        start: '2026-09-12', due: '2026-09-12' },
  { id: 't7',  projectId: 'ANGKAS-528', projectName: 'Rain Initiatives (Phase 3)', team: 'APPS',  type: 'Milestone',  activity: 'Full rollout',                   status: 'Done',        start: '2026-09-15', due: '2026-09-15' },

  // Angcars 6-Seater — ANGKAS-503
  { id: 't10', projectId: 'ANGKAS-503', projectName: 'Angcars 6-Seater',           team: 'APPS',  type: 'Task',       activity: 'APP Dev\'t (CAX & DAX)',         status: 'In Progress', start: '2026-08-20', due: '2026-09-26', devResources: 2, qaResources: 1 },
  { id: 't11', projectId: 'ANGKAS-503', projectName: 'Angcars 6-Seater',           team: 'APPS',  type: 'Task',       activity: 'QA regression pass',             status: 'To Do',       start: '2026-09-27', due: '2026-10-04', devResources: 0, qaResources: 1 },
  { id: 't12', projectId: 'ANGKAS-503', projectName: 'Angcars 6-Seater',           team: 'APPS',  type: 'Deployment', activity: 'App submission (iOS/Android)',   status: 'To Do',       start: '2026-09-30', due: '2026-09-30' },
  { id: 't13', projectId: 'ANGKAS-503', projectName: 'Angcars 6-Seater',           team: 'APPS',  type: 'Milestone',  activity: 'Public launch',                  status: 'To Do',       start: '2026-10-14', due: '2026-10-14' },

  // In-App Biker Onboarding — ANGKAS-137
  { id: 't20', projectId: 'ANGKAS-137', projectName: 'In-App Biker Onboarding & Incubation', team: 'USR-M', type: 'Task',       activity: 'USR-M Dev\'t & Testing: KYC APIs',    status: 'Done',        start: '2026-08-28', due: '2026-09-02', devResources: 1, qaResources: 0.5 },
  { id: 't21', projectId: 'ANGKAS-137', projectName: 'In-App Biker Onboarding & Incubation', team: 'USR-M', type: 'Task',       activity: 'USR-M Dev\'t & Testing: HyperVerge',  status: 'Done',        start: '2026-08-28', due: '2026-09-02' },
  { id: 't22', projectId: 'ANGKAS-137', projectName: 'In-App Biker Onboarding & Incubation', team: 'USR-M', type: 'Task',       activity: 'USR-M Dev\'t & Testing: AAP Upload',  status: 'Done',        start: '2026-08-28', due: '2026-09-03' },
  { id: 't23', projectId: 'ANGKAS-137', projectName: 'In-App Biker Onboarding & Incubation', team: 'USR-M', type: 'Deployment', activity: 'USR-M BE Prod Deployment',           status: 'Done',        start: '2026-09-07', due: '2026-09-07' },
  { id: 't24', projectId: 'ANGKAS-137', projectName: 'In-App Biker Onboarding & Incubation', team: 'BAO',   type: 'Task',       activity: 'BAO Dev\'t: Base build',              status: 'Done',        start: '2026-08-28', due: '2026-09-01' },
  { id: 't25', projectId: 'ANGKAS-137', projectName: 'In-App Biker Onboarding & Incubation', team: 'BAO',   type: 'Task',       activity: 'BAO Dev\'t: OTP API integration',     status: 'Done',        start: '2026-09-02', due: '2026-09-02' },
  { id: 't26', projectId: 'ANGKAS-137', projectName: 'In-App Biker Onboarding & Incubation', team: 'BAO',   type: 'Task',       activity: 'BAO Dev\'t: HyperVerge WebSDK',       status: 'In Progress', start: '2026-09-03', due: '2026-09-30' },
  { id: 't27', projectId: 'ANGKAS-137', projectName: 'In-App Biker Onboarding & Incubation', team: 'USR-E', type: 'Task',       activity: 'USR-E App integration',              status: 'In Progress', start: '2026-09-15', due: '2026-10-10' },
  { id: 't28', projectId: 'ANGKAS-137', projectName: 'In-App Biker Onboarding & Incubation', team: 'USR-M', type: 'Milestone',  activity: 'Cebu pilot rollout',                 status: 'To Do',       start: '2026-10-01', due: '2026-10-01' },

  // Experimentation Platform — ANGKAS-73
  { id: 't30', projectId: 'ANGKAS-73',  projectName: 'Experimentation Platform',   team: 'TXN',   type: 'Task',       activity: 'Statsig SDK integration',        status: 'Done',        start: '2026-04-14', due: '2026-05-20' },
  { id: 't31', projectId: 'ANGKAS-73',  projectName: 'Experimentation Platform',   team: 'TXN',   type: 'Deployment', activity: 'Booking Prio — Queue Length',    status: 'Done',        start: '2026-05-26', due: '2026-05-26' },
  { id: 't32', projectId: 'ANGKAS-73',  projectName: 'Experimentation Platform',   team: 'TXN',   type: 'Deployment', activity: 'Booking Prio — Polling',         status: 'Done',        start: '2026-06-04', due: '2026-06-04' },

  // In App Chat Phase 1.5 — ANGKAS-611
  { id: 't40', projectId: 'ANGKAS-611', projectName: 'In App Chat Phase 1.5',      team: 'APPS',  type: 'Task',       activity: 'Push notification handling',     status: 'Done',        start: '2026-08-15', due: '2026-09-10' },
  { id: 't41', projectId: 'ANGKAS-611', projectName: 'In App Chat Phase 1.5',      team: 'APPS',  type: 'Task',       activity: 'End-to-end regression',          status: 'In Progress', start: '2026-09-15', due: '2026-09-30' },
  { id: 't42', projectId: 'ANGKAS-611', projectName: 'In App Chat Phase 1.5',      team: 'APPS',  type: 'Milestone',  activity: 'Full rollout to all cities',     status: 'To Do',       start: '2026-10-05', due: '2026-10-05' },

  // Quick Match Phase 2 — ANGKAS-604
  { id: 't50', projectId: 'ANGKAS-604', projectName: 'Quick Match Phase 2',        team: 'TXN',   type: 'Task',       activity: 'Matching engine refactor',       status: 'Done',        start: '2026-08-01', due: '2026-09-10' },
  { id: 't51', projectId: 'ANGKAS-604', projectName: 'Quick Match Phase 2',        team: 'TXN',   type: 'Task',       activity: 'Load test w/ 3x traffic',        status: 'In Progress', start: '2026-09-15', due: '2026-09-28' },
  { id: 't52', projectId: 'ANGKAS-604', projectName: 'Quick Match Phase 2',        team: 'TXN',   type: 'Milestone',  activity: 'Metro Manila rollout',           status: 'To Do',       start: '2026-10-08', due: '2026-10-08' },

  // [Tech] Worker Optimization — ANGKAS-585
  { id: 't60', projectId: 'ANGKAS-585', projectName: '[Tech] Worker Optimization', team: 'API',   type: 'Task',       activity: 'Worker pool sizing analysis',    status: 'Done',        start: '2026-08-20', due: '2026-09-15' },
  { id: 't61', projectId: 'ANGKAS-585', projectName: '[Tech] Worker Optimization', team: 'API',   type: 'Deployment', activity: 'Rollout to prod queue workers',  status: 'To Do',       start: '2026-10-02', due: '2026-10-02' },

  // Piso Surprise — ANGKAS-620
  { id: 't70', projectId: 'ANGKAS-620', projectName: 'Piso Surprise',              team: 'APPS',  type: 'Task',       activity: 'Campaign wireframes',            status: 'Done',        start: '2026-09-01', due: '2026-09-10' },
  { id: 't71', projectId: 'ANGKAS-620', projectName: 'Piso Surprise',              team: 'APPS',  type: 'Task',       activity: 'Notification templates',         status: 'In Progress', start: '2026-09-15', due: '2026-10-05' },
  { id: 't72', projectId: 'ANGKAS-620', projectName: 'Piso Surprise',              team: 'APPS',  type: 'Milestone',  activity: 'Campaign start',                 status: 'To Do',       start: '2026-10-20', due: '2026-10-20' },

  // [DAX] Incubation content
  { id: 't80', projectId: 'ANGKAS-475', projectName: '[DAX] Incubation content',   team: 'USR-E', type: 'Task',       activity: 'Content audit',                  status: 'In Progress', start: '2026-09-20', due: '2026-10-10' },

  // [Tech] Load Tests — ANGKAS-580
  { id: 't90', projectId: 'ANGKAS-580', projectName: '[Tech] Load Tests for Mass Driver Onboarding / Scalability mitigation', team: 'API', type: 'Task', activity: 'Test harness setup', status: 'In Progress', start: '2026-09-20', due: '2026-10-15' },
  { id: 't91', projectId: 'ANGKAS-580', projectName: '[Tech] Load Tests for Mass Driver Onboarding / Scalability mitigation', team: 'API', type: 'Milestone',  activity: 'Baseline load test report', status: 'To Do', start: '2026-11-01', due: '2026-11-01' },

  // AI/ML activity for palette coverage
  { id: 't100', projectId: 'ANGKAS-604', projectName: 'Quick Match Phase 2',       team: 'AI/ML', type: 'Task',       activity: 'ETA prediction model retraining', status: 'In Progress', start: '2026-09-05', due: '2026-10-05' },
];

// ---------- Capacity data — placeholder for Phase 2 ----------

export const mockCapacity: CapacityData | null = null;

// ---------- Snapshot ----------

export const mockSnapshot: DashboardSnapshot = {
  projects: mockProjects,
  timeline: mockTimeline,
  capacity: mockCapacity,
  fetchedAt: new Date().toISOString(),
};
