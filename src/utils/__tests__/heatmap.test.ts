import {
  calculateHeatmapLevel,
  getRolling12MonthRange,
  generateHeatmapData,
} from '../analytics/heatmap';
import { TimeEntry } from '../../types';

// テスト用のタイムエントリーデータ
const createTimeEntry = (
  projectId: string,
  startTime: string,
  endTime: string
): TimeEntry => ({
  id: `entry-${Math.random().toString(36).substr(2, 9)}`,
  projectId,
  startTime,
  endTime,
  description: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe('heatmap ユーティリティ', () => {
  describe('calculateHeatmapLevel', () => {
    test('0時間の場合はレベル0を返す', () => {
      expect(calculateHeatmapLevel(0)).toBe(0);
    });

    test('0.1〜2時間未満の場合はレベル1を返す', () => {
      expect(calculateHeatmapLevel(0.1)).toBe(1);
      expect(calculateHeatmapLevel(1)).toBe(1);
      expect(calculateHeatmapLevel(1.9)).toBe(1);
    });

    test('2〜4時間未満の場合はレベル2を返す', () => {
      expect(calculateHeatmapLevel(2)).toBe(2);
      expect(calculateHeatmapLevel(3)).toBe(2);
      expect(calculateHeatmapLevel(3.9)).toBe(2);
    });

    test('4〜6時間未満の場合はレベル3を返す', () => {
      expect(calculateHeatmapLevel(4)).toBe(3);
      expect(calculateHeatmapLevel(5)).toBe(3);
      expect(calculateHeatmapLevel(5.9)).toBe(3);
    });

    test('6時間以上の場合はレベル4を返す', () => {
      expect(calculateHeatmapLevel(6)).toBe(4);
      expect(calculateHeatmapLevel(8)).toBe(4);
      expect(calculateHeatmapLevel(12)).toBe(4);
    });
  });

  describe('getRolling12MonthRange', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-12-27T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('今日を終了日として12ヶ月前を開始日とする', () => {
      const { start, end } = getRolling12MonthRange();

      expect(end.getFullYear()).toBe(2025);
      expect(end.getMonth()).toBe(11); // December
      expect(end.getDate()).toBe(27);

      expect(start.getFullYear()).toBe(2024);
      expect(start.getMonth()).toBe(11); // December
      expect(start.getDate()).toBe(28);
    });

    test('開始日は終了日のちょうど1年前の翌日', () => {
      const { start, end } = getRolling12MonthRange();

      const diffInDays = Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );

      // 365日または364日（うるう年考慮）
      expect(diffInDays).toBeGreaterThanOrEqual(364);
      expect(diffInDays).toBeLessThanOrEqual(366);
    });
  });

  describe('generateHeatmapData', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('空のタイムエントリーでも週の配列を返す', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-14');

      const result = generateHeatmapData([], startDate, endDate);

      expect(result.length).toBeGreaterThan(0);
      expect(Array.isArray(result[0].days)).toBe(true);
    });

    test('各週は7日分のデータを持つ', () => {
      const startDate = new Date('2025-01-06'); // 月曜日
      const endDate = new Date('2025-01-12'); // 日曜日

      const result = generateHeatmapData([], startDate, endDate);

      expect(result.length).toBeGreaterThanOrEqual(1);
      result.forEach((week) => {
        expect(week.days.length).toBe(7);
      });
    });

    test('タイムエントリーがある日は時間が計算される', () => {
      const timeEntries = [
        createTimeEntry('p1', '2025-01-10T09:00:00Z', '2025-01-10T13:00:00Z'), // 4時間
      ];
      const startDate = new Date('2025-01-06');
      const endDate = new Date('2025-01-12');

      const result = generateHeatmapData(timeEntries, startDate, endDate);

      // 1月10日（金曜日）のデータを探す
      let found = false;
      for (const week of result) {
        for (const day of week.days) {
          if (day && day.date.getDate() === 10 && day.date.getMonth() === 0) {
            expect(day.hours).toBe(4);
            expect(day.level).toBe(3); // 4時間はレベル3（4〜6時間の範囲）
            found = true;
          }
        }
      }
      expect(found).toBe(true);
    });

    test('同じ日に複数のエントリーがある場合は合計される', () => {
      const timeEntries = [
        createTimeEntry('p1', '2025-01-10T09:00:00Z', '2025-01-10T11:00:00Z'), // 2時間
        createTimeEntry('p1', '2025-01-10T13:00:00Z', '2025-01-10T16:00:00Z'), // 3時間
      ];
      const startDate = new Date('2025-01-06');
      const endDate = new Date('2025-01-12');

      const result = generateHeatmapData(timeEntries, startDate, endDate);

      let found = false;
      for (const week of result) {
        for (const day of week.days) {
          if (day && day.date.getDate() === 10 && day.date.getMonth() === 0) {
            expect(day.hours).toBe(5);
            expect(day.level).toBe(3); // 5時間はレベル3
            found = true;
          }
        }
      }
      expect(found).toBe(true);
    });

    test('期間外のエントリーは含まれない', () => {
      const timeEntries = [
        createTimeEntry('p1', '2025-01-05T09:00:00Z', '2025-01-05T17:00:00Z'), // 期間外
        createTimeEntry('p1', '2025-01-10T09:00:00Z', '2025-01-10T13:00:00Z'), // 期間内
      ];
      const startDate = new Date('2025-01-06');
      const endDate = new Date('2025-01-12');

      const result = generateHeatmapData(timeEntries, startDate, endDate);

      // 1月5日のデータは含まれないはず
      let foundOutOfRangeDate = false;
      for (const week of result) {
        for (const day of week.days) {
          if (day && day.date.getDate() === 5 && day.date.getMonth() === 0) {
            foundOutOfRangeDate = true;
          }
        }
      }
      expect(foundOutOfRangeDate).toBe(false);
    });

    test('HeatmapDayの構造が正しい', () => {
      const timeEntries = [
        createTimeEntry('p1', '2025-01-10T09:00:00Z', '2025-01-10T13:00:00Z'),
      ];
      const startDate = new Date('2025-01-06');
      const endDate = new Date('2025-01-12');

      const result = generateHeatmapData(timeEntries, startDate, endDate);

      for (const week of result) {
        for (const day of week.days) {
          if (day !== null) {
            expect(day).toHaveProperty('date');
            expect(day).toHaveProperty('hours');
            expect(day).toHaveProperty('level');
            expect(day.date instanceof Date).toBe(true);
            expect(typeof day.hours).toBe('number');
            expect([0, 1, 2, 3, 4]).toContain(day.level);
          }
        }
      }
    });
  });
});
