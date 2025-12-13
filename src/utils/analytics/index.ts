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
