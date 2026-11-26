import { Project, TimeEntry } from '../../types';
import { calculateDuration } from './common';
import {
  calculateMonthlyTargetHours,
  calculateRemainingWorkingDays,
} from './monthly';

export type ProgressStatus = 'tracking' | 'ok' | 'warning' | 'over';

export interface ProjectMonthProgress {
  actualHours: number;
  targetHours: number;
  /** 実績 / 目標。超過時も 1 で切り捨てない（全画面で同じ値を出すため） */
  ratio: number;
  overHours: number;
  remainingHours: number;
  requiredDailyHours: number;
  isTrackingOnly: boolean;
  status: ProgressStatus;
}

const WARNING_RATIO = 0.9;
const round1 = (n: number) => Math.round(n * 10) / 10;

export const sumProjectHoursInMonth = (
  entries: TimeEntry[],
  projectId: string,
  now: Date
): number => {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const ms = entries
    .filter((e) => {
      if (e.projectId !== projectId) return false;
      const t = new Date(e.startTime);
      return t >= start && t < end;
    })
    .reduce((sum, e) => sum + calculateDuration(e.startTime, e.endTime), 0);
  return ms / 3600_000;
};

/**
 * プロジェクトの今月の進捗。月間目標は必ず設定の基準時間から計算する。
 */
export const getProjectMonthProgress = (
  project: Project,
  entries: TimeEntry[],
  baseMonthlyHours: number,
  now: Date = new Date()
): ProjectMonthProgress => {
  const actual = sumProjectHoursInMonth(entries, project.id, now);
  const isTrackingOnly = project.monthlyCapacity <= 0;
  const targetHours = isTrackingOnly
    ? 0
    : calculateMonthlyTargetHours(
        project.monthlyCapacity * 100,
        baseMonthlyHours
      );
  const ratio = targetHours > 0 ? actual / targetHours : 0;
  const remaining = Math.max(0, targetHours - actual);
  const workingDays = calculateRemainingWorkingDays(now);

  let status: ProgressStatus = 'ok';
  if (isTrackingOnly) status = 'tracking';
  else if (round1(actual) > targetHours) status = 'over';
  else if (ratio >= WARNING_RATIO) status = 'warning';

  return {
    actualHours: round1(actual),
    targetHours,
    ratio,
    overHours: isTrackingOnly ? 0 : round1(Math.max(0, actual - targetHours)),
    remainingHours: round1(remaining),
    requiredDailyHours: workingDays > 0 ? round1(remaining / workingDays) : 0,
    isTrackingOnly,
    status,
  };
};
