// Common utilities
export { isWithinDateRange } from './common';

// Daily analytics
export {
  getDailyProjectHours,
  getDailyWorkHours,
  getLongestWorkSession,
  getAverageWorkSession,
} from './daily';

// Weekly analytics
export { getWeekNumber, getWeeklyDistribution } from './weekly';

// Monthly analytics
export {
  getMonthlyDistribution,
  calculateMonthlyProgress,
  calculateMonthlyTargetHours,
  getPreviousMonthProjectDistribution,
  calculateTotalMonthlyTarget,
  calculateRemainingWorkingDays,
} from './monthly';

// Predictions
export {
  predictCompletionDate,
  calculateRecommendedDailyHours,
  calculateDailyAverageHours,
} from './predictions';

// Aggregations
export {
  getProjectDistribution,
  getMostActiveProject,
  calculateProjectHours,
} from './aggregations';

export {
  getProjectMonthProgress,
  getMonthOverview,
  sumProjectHoursInMonth,
} from './project-progress';
export type {
  ProjectMonthProgress,
  ProgressStatus,
  MonthOverview,
} from './project-progress';
export {
  getTodaySegments,
  getTodayProjectHours,
  getRecentProjects,
} from './today';
export type { TimelineSegment } from './today';
export { getWeekdayBreakdown } from './report';
export { getMonthProjectRows, summarizeProjectRows } from './report-projects';
export type { ReportProjectRow, ReportProjectSummary } from './report-projects';
export type { ReportDay, ReportWeek } from './report';
