import { Project, TimeEntry } from '../../types';
import {
  getProjectMonthProgress,
  ProjectMonthProgress,
} from '../../utils/analytics';

export interface ProjectRow {
  project: Project;
  progress: ProjectMonthProgress;
}

export type ProjectFilter = 'all' | 'active' | 'over' | 'tracking';
export type ProjectSort = 'progress' | 'remaining' | 'name';

export const buildProjectRows = (
  projects: Project[],
  entries: TimeEntry[],
  baseMonthlyHours: number,
  now: Date = new Date()
): { active: ProjectRow[]; archived: ProjectRow[] } => {
  const rows = projects.map((project) => ({
    project,
    progress: getProjectMonthProgress(project, entries, baseMonthlyHours, now),
  }));
  return {
    active: rows.filter((r) => !r.project.isArchived),
    archived: rows.filter((r) => r.project.isArchived),
  };
};

const matchesFilter = (row: ProjectRow, filter: ProjectFilter) => {
  switch (filter) {
    case 'active':
      return row.progress.status === 'ok' || row.progress.status === 'warning';
    case 'over':
      return row.progress.status === 'over';
    case 'tracking':
      return row.progress.status === 'tracking';
    default:
      return true;
  }
};

export const filterProjectRows = (
  rows: ProjectRow[],
  filter: ProjectFilter,
  query: string
): ProjectRow[] => {
  const q = query.trim().toLowerCase();
  return rows.filter(
    (r) =>
      matchesFilter(r, filter) &&
      (!q || r.project.name.toLowerCase().includes(q))
  );
};

export const countByFilter = (
  rows: ProjectRow[]
): Record<ProjectFilter, number> => ({
  all: rows.length,
  active: filterProjectRows(rows, 'active', '').length,
  over: filterProjectRows(rows, 'over', '').length,
  tracking: filterProjectRows(rows, 'tracking', '').length,
});

export const sortProjectRows = (
  rows: ProjectRow[],
  sort: ProjectSort
): ProjectRow[] => {
  const tracking = (r: ProjectRow) => (r.progress.isTrackingOnly ? 1 : 0);
  return [...rows].sort((a, b) => {
    if (sort === 'name')
      return a.project.name.localeCompare(b.project.name, 'ja');
    const byTracking = tracking(a) - tracking(b);
    if (byTracking !== 0) return byTracking;
    return sort === 'progress'
      ? b.progress.ratio - a.progress.ratio
      : b.progress.remainingHours - a.progress.remainingHours;
  });
};
