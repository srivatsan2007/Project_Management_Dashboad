// VeroPlan: Layout Presets & Configurations
// All user application data starts at 0 (no hardcoded sample data)

export const DEFAULT_WORKSPACE = {
  id: 'ws-personal',
  name: 'Personal Workspace',
  slug: 'personal',
  description: 'My primary VeroPlan workspace.',
  role: 'owner',
};

export const DEFAULT_USER = null;

export const INITIAL_PROJECTS = [];
export const INITIAL_TASKS = [];
export const INITIAL_MILESTONES = [];
export const INITIAL_DOCUMENTS = [];
export const INITIAL_NOTIFICATIONS = [];
export const INITIAL_ACTIVITY_LOGS = [];

export const DEFAULT_DASHBOARD_LAYOUT = [
  { id: 'widget-stats', title: 'Key Performance Metrics', visible: true, colSpan: 12, size: 'compact' },
  { id: 'widget-my-day', title: "Today's Focus & Priorities", visible: true, colSpan: 8, size: 'standard' },
  { id: 'widget-deadlines', title: 'Upcoming Deadlines', visible: true, colSpan: 4, size: 'standard' },
  { id: 'widget-progress-chart', title: 'Project Progress Overview', visible: true, colSpan: 6, size: 'standard' },
  { id: 'widget-velocity-chart', title: 'Task Completion Velocity', visible: true, colSpan: 6, size: 'standard' },
  { id: 'widget-recent-projects', title: 'Recent Active Projects', visible: true, colSpan: 8, size: 'standard' },
  { id: 'widget-milestones', title: 'Milestones Radar', visible: true, colSpan: 4, size: 'standard' },
  { id: 'widget-recent-activity', title: 'Recent Activity Stream', visible: true, colSpan: 6, size: 'standard' },
  { id: 'widget-recent-docs', title: 'Project Documents Vault', visible: true, colSpan: 6, size: 'compact' },
];

export const DASHBOARD_PRESETS = [
  {
    id: 'preset-daily-planning',
    name: 'Daily Planning',
    is_system: true,
    layout: [
      { id: 'widget-my-day', title: "Today's Focus & Priorities", visible: true, colSpan: 8, size: 'expanded' },
      { id: 'widget-deadlines', title: 'Upcoming Deadlines', visible: true, colSpan: 4, size: 'standard' },
      { id: 'widget-stats', title: 'Key Performance Metrics', visible: true, colSpan: 12, size: 'compact' },
      { id: 'widget-recent-projects', title: 'Recent Active Projects', visible: true, colSpan: 6, size: 'standard' },
      { id: 'widget-recent-activity', title: 'Recent Activity Stream', visible: true, colSpan: 6, size: 'standard' },
    ]
  },
  {
    id: 'preset-project-overview',
    name: 'Project Overview',
    is_system: true,
    layout: [
      { id: 'widget-stats', title: 'Key Performance Metrics', visible: true, colSpan: 12, size: 'compact' },
      { id: 'widget-recent-projects', title: 'Recent Active Projects', visible: true, colSpan: 8, size: 'expanded' },
      { id: 'widget-progress-chart', title: 'Project Progress Overview', visible: true, colSpan: 4, size: 'standard' },
      { id: 'widget-milestones', title: 'Milestones Radar', visible: true, colSpan: 6, size: 'standard' },
      { id: 'widget-recent-docs', title: 'Project Documents Vault', visible: true, colSpan: 6, size: 'standard' },
    ]
  },
  {
    id: 'preset-dev-workspace',
    name: 'Developer Workspace',
    is_system: true,
    layout: [
      { id: 'widget-stats', title: 'Key Performance Metrics', visible: true, colSpan: 12, size: 'compact' },
      { id: 'widget-my-day', title: "Today's Focus & Priorities", visible: true, colSpan: 6, size: 'standard' },
      { id: 'widget-deadlines', title: 'Upcoming Deadlines', visible: true, colSpan: 6, size: 'standard' },
      { id: 'widget-recent-activity', title: 'Recent Activity Stream', visible: true, colSpan: 8, size: 'standard' },
      { id: 'widget-milestones', title: 'Milestones Radar', visible: true, colSpan: 4, size: 'standard' },
    ]
  },
  {
    id: 'preset-minimal',
    name: 'Minimal Dashboard',
    is_system: true,
    layout: [
      { id: 'widget-stats', title: 'Key Performance Metrics', visible: true, colSpan: 12, size: 'compact' },
      { id: 'widget-my-day', title: "Today's Focus & Priorities", visible: true, colSpan: 8, size: 'standard' },
      { id: 'widget-deadlines', title: 'Upcoming Deadlines', visible: true, colSpan: 4, size: 'standard' },
    ]
  }
];
