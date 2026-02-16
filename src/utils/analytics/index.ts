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

// Heatmap
export {
  calculateHeatmapLevel,
  getRolling12MonthRange,
  generateHeatmapData,
} from './heatmap';
export type { HeatmapDay, HeatmapWeek } from './heatmap';
