import { Project, TimeEntry } from '../../types';
import {
  ProgressStatus,
  getProjectMonthProgress,
  sumProjectHoursInMonth,
} from './project-progress';

export interface ReportProjectRow {
  projectId: string;
  actualHours: number;
  targetHours: number;
  /** 実績 / 配分。超過時も 1 で切り捨てない */
  ratio: number;
  status: ProgressStatus;
  isTrackingOnly: boolean;
}

export interface ReportProjectSummary {
  actualHours: number;
  targetHours: number;
  ratio: number;
  overCount: number;
  warningCount: number;
  trackingHours: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * レポートの月のプロジェクト一覧。配分を超えていないかを見るのが目的なので、
 * 配分のあるものを割合の高い順に先に並べ、追跡のみは後ろに時間の多い順で並べる。
 * month は 0 始まり。
 */
export const getMonthProjectRows = (
  projects: Project[],
  entries: TimeEntry[],
  baseMonthlyHours: number,
  year: number,
  month: number
): ReportProjectRow[] => {
  // 進捗計算は「日付が属する月」で集計するため、月内の任意の日を渡す
  const inMonth = new Date(year, month, 1);
  const rows = projects
    .filter(
      (p) =>
        (!p.isArchived && p.monthlyCapacity > 0) ||
        sumProjectHoursInMonth(entries, p.id, inMonth) > 0
    )
    .map((p): ReportProjectRow => {
      const progress = getProjectMonthProgress(
        p,
        entries,
        baseMonthlyHours,
        inMonth
      );
      return {
        projectId: p.id,
        actualHours: progress.actualHours,
        targetHours: progress.targetHours,
        ratio: progress.ratio,
        status: progress.status,
        isTrackingOnly: progress.isTrackingOnly,
      };
    });

  const allocated = rows
    .filter((r) => !r.isTrackingOnly)
    .sort((a, b) => b.ratio - a.ratio);
  const tracking = rows
    .filter((r) => r.isTrackingOnly)
    .sort((a, b) => b.actualHours - a.actualHours);
  return [...allocated, ...tracking];
};

export const summarizeProjectRows = (
  rows: ReportProjectRow[]
): ReportProjectSummary => {
  const allocated = rows.filter((r) => !r.isTrackingOnly);
  const actual = allocated.reduce((sum, r) => sum + r.actualHours, 0);
  const target = allocated.reduce((sum, r) => sum + r.targetHours, 0);
  return {
    actualHours: round1(actual),
    targetHours: round1(target),
    ratio: target > 0 ? round1((actual / target) * 100) / 100 : 0,
    overCount: allocated.filter((r) => r.status === 'over').length,
    warningCount: allocated.filter((r) => r.status === 'warning').length,
    trackingHours: round1(
      rows
        .filter((r) => r.isTrackingOnly)
        .reduce((sum, r) => sum + r.actualHours, 0)
    ),
  };
};
