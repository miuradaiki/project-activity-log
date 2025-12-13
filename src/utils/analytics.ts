/**
 * @deprecated このファイルは後方互換性のために維持されています。
 * 新しいコードでは 'utils/analytics' からインポートしてください。
 *
 * 例:
 * import { getDailyWorkHours } from './utils/analytics';
 */
export {
  // Common
  isWithinDateRange,
  // Daily
  getDailyProjectHours,
  getDailyWorkHours,
  getLongestWorkSession,
  getAverageWorkSession,
  // Weekly
  getWeekNumber,
  getWeeklyDistribution,
  // Monthly
  getMonthlyDistribution,
  calculateMonthlyProgress,
  calculateMonthlyTargetHours,
  getPreviousMonthProjectDistribution,
  // Predictions
  predictCompletionDate,
  calculateRecommendedDailyHours,
  calculateDailyAverageHours,
  // Aggregations
  getProjectDistribution,
  getMostActiveProject,
  calculateProjectHours,
} from './analytics/index';
