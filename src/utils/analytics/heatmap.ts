import { TimeEntry } from '../../types';
import { getDailyWorkHours } from './daily';

/**
 * ヒートマップの1日分のデータ
 */
export interface HeatmapDay {
  date: Date;
  hours: number;
  level: 0 | 1 | 2 | 3 | 4;
}

/**
 * ヒートマップの1週間分のデータ
 */
export interface HeatmapWeek {
  days: (HeatmapDay | null)[];
}

/**
 * 作業時間からヒートマップのレベル（0-4）を計算
 * - 0: 0時間
 * - 1: 0.1〜2時間未満
 * - 2: 2〜4時間未満
 * - 3: 4〜6時間未満
 * - 4: 6時間以上
 */
export const calculateHeatmapLevel = (hours: number): 0 | 1 | 2 | 3 | 4 => {
  if (hours === 0) return 0;
  if (hours < 2) return 1;
  if (hours < 4) return 2;
  if (hours < 6) return 3;
  return 4;
};

/**
 * 12ヶ月のローリング期間を取得
 * 今日を終了日として、1年前の翌日を開始日とする
 */
export const getRolling12MonthRange = (): { start: Date; end: Date } => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);

  return { start, end };
};

/**
 * 指定期間のヒートマップデータを生成
 * 週ごとにグループ化し、日曜始まり（GitHub風）の構造で返す
 */
export const generateHeatmapData = (
  timeEntries: TimeEntry[],
  startDate: Date,
  endDate: Date
): HeatmapWeek[] => {
  const weeks: HeatmapWeek[] = [];

  // 開始日を日曜日に調整
  const adjustedStart = new Date(startDate);
  adjustedStart.setHours(0, 0, 0, 0);
  const dayOfWeek = adjustedStart.getDay();
  if (dayOfWeek !== 0) {
    adjustedStart.setDate(adjustedStart.getDate() - dayOfWeek);
  }

  // 終了日を土曜日に調整
  const adjustedEnd = new Date(endDate);
  adjustedEnd.setHours(23, 59, 59, 999);
  const endDayOfWeek = adjustedEnd.getDay();
  if (endDayOfWeek !== 6) {
    adjustedEnd.setDate(adjustedEnd.getDate() + (6 - endDayOfWeek));
  }

  // 日ごとにデータを生成
  const currentDate = new Date(adjustedStart);
  let currentWeek: (HeatmapDay | null)[] = [];

  while (currentDate <= adjustedEnd) {
    // 期間内かどうかをチェック
    const isInRange = currentDate >= startDate && currentDate <= endDate;

    if (isInRange) {
      const hours = getDailyWorkHours(timeEntries, new Date(currentDate));
      const level = calculateHeatmapLevel(hours);

      currentWeek.push({
        date: new Date(currentDate),
        hours,
        level,
      });
    } else {
      currentWeek.push(null);
    }

    // 土曜日の場合、週を完了
    if (currentDate.getDay() === 6) {
      weeks.push({ days: currentWeek });
      currentWeek = [];
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // 残りの日があれば追加
  if (currentWeek.length > 0) {
    // 7日になるまでnullで埋める
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push({ days: currentWeek });
  }

  return weeks;
};
