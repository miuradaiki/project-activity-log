import {
  isWithinDateRange,
  getDailyProjectHours,
  getDailyWorkHours,
  getProjectDistribution,
  getWeeklyDistribution,
  getWeekNumber,
  getMonthlyDistribution,
  getMostActiveProject,
  calculateMonthlyProgress,
  calculateProjectHours,
  calculateMonthlyTargetHours,
  predictCompletionDate,
  calculateRecommendedDailyHours,
  calculateDailyAverageHours,
  getLongestWorkSession,
  getAverageWorkSession,
  getPreviousMonthProjectDistribution,
} from '../analytics';
import { TimeEntry, Project } from '../../types';

// テスト用のプロジェクトデータ
const createProject = (
  id: string,
  name: string,
  isArchived = false
): Project => ({
  id,
  name,
  description: '',
  monthlyCapacity: 0.5,
  isArchived,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
});

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

describe('analytics ユーティリティ', () => {
  describe('isWithinDateRange', () => {
    test('日付が範囲内の場合trueを返す', () => {
      const date = new Date('2025-01-15');
      const start = new Date('2025-01-10');
      const end = new Date('2025-01-20');

      expect(isWithinDateRange(date, start, end)).toBe(true);
    });

    test('日付が範囲の開始日と同じ場合trueを返す', () => {
      const date = new Date('2025-01-10');
      const start = new Date('2025-01-10');
      const end = new Date('2025-01-20');

      expect(isWithinDateRange(date, start, end)).toBe(true);
    });

    test('日付が範囲の終了日と同じ場合trueを返す', () => {
      const date = new Date('2025-01-20');
      const start = new Date('2025-01-10');
      const end = new Date('2025-01-20');

      expect(isWithinDateRange(date, start, end)).toBe(true);
    });

    test('日付が範囲外の場合falseを返す', () => {
      const date = new Date('2025-01-25');
      const start = new Date('2025-01-10');
      const end = new Date('2025-01-20');

      expect(isWithinDateRange(date, start, end)).toBe(false);
    });
  });

  describe('getDailyProjectHours', () => {
    const projects = [
      createProject('p1', 'Project A'),
      createProject('p2', 'Project B'),
      createProject('p3', 'Archived Project', true),
    ];

    test('指定日のプロジェクト別作業時間を返す', () => {
      const timeEntries = [
        createTimeEntry('p1', '2025-01-15T09:00:00Z', '2025-01-15T11:00:00Z'), // 2時間
        createTimeEntry('p1', '2025-01-15T13:00:00Z', '2025-01-15T14:00:00Z'), // 1時間
        createTimeEntry('p2', '2025-01-15T10:00:00Z', '2025-01-15T12:00:00Z'), // 2時間
      ];

      const result = getDailyProjectHours(
        timeEntries,
        projects,
        new Date('2025-01-15')
      );

      expect(result['Project A']).toBe(3);
      expect(result['Project B']).toBe(2);
    });

    test('アーカイブされたプロジェクトは含まれない', () => {
      const timeEntries = [
        createTimeEntry('p3', '2025-01-15T09:00:00Z', '2025-01-15T11:00:00Z'),
      ];

      const result = getDailyProjectHours(
        timeEntries,
        projects,
        new Date('2025-01-15')
      );

      expect(result['Archived Project']).toBeUndefined();
    });

    test('作業がない場合は0を返す', () => {
      const result = getDailyProjectHours([], projects, new Date('2025-01-15'));

      expect(result['Project A']).toBe(0);
      expect(result['Project B']).toBe(0);
    });
  });

  describe('getDailyWorkHours', () => {
    test('指定日の合計作業時間を返す', () => {
      const timeEntries = [
        createTimeEntry('p1', '2025-01-15T09:00:00Z', '2025-01-15T11:00:00Z'), // 2時間
        createTimeEntry('p1', '2025-01-15T13:00:00Z', '2025-01-15T15:30:00Z'), // 2.5時間
      ];

      const result = getDailyWorkHours(timeEntries, new Date('2025-01-15'));

      expect(result).toBe(4.5);
    });

    test('作業がない日は0を返す', () => {
      const result = getDailyWorkHours([], new Date('2025-01-15'));

      expect(result).toBe(0);
    });
  });

  describe('getProjectDistribution', () => {
    const projects = [
      createProject('p1', 'Project A'),
      createProject('p2', 'Project B'),
    ];

    test('期間内のプロジェクト分布を返す', () => {
      const timeEntries = [
        createTimeEntry('p1', '2025-01-15T09:00:00Z', '2025-01-15T13:00:00Z'), // 4時間
        createTimeEntry('p2', '2025-01-16T09:00:00Z', '2025-01-16T11:00:00Z'), // 2時間
      ];

      const result = getProjectDistribution(
        timeEntries,
        projects,
        new Date('2025-01-10'),
        new Date('2025-01-20')
      );

      expect(result).toEqual([
        { projectName: 'Project A', hours: 4 },
        { projectName: 'Project B', hours: 2 },
      ]);
    });

    test('作業時間順にソートされる', () => {
      const timeEntries = [
        createTimeEntry('p1', '2025-01-15T09:00:00Z', '2025-01-15T10:00:00Z'), // 1時間
        createTimeEntry('p2', '2025-01-15T09:00:00Z', '2025-01-15T14:00:00Z'), // 5時間
      ];

      const result = getProjectDistribution(
        timeEntries,
        projects,
        new Date('2025-01-10'),
        new Date('2025-01-20')
      );

      expect(result[0].projectName).toBe('Project B');
      expect(result[1].projectName).toBe('Project A');
    });
  });

  describe('getWeeklyDistribution', () => {
    const projects = [createProject('p1', 'Project A')];

    test('週次の日別作業時間を返す（日本語）', () => {
      const timeEntries = [
        createTimeEntry('p1', '2025-01-13T09:00:00Z', '2025-01-13T11:00:00Z'), // 月曜 2時間
      ];

      const result = getWeeklyDistribution(
        timeEntries,
        projects,
        new Date('2025-01-13') // 月曜日
      );

      expect(result).toHaveLength(7);
      expect(result[0].date).toBe('月');
    });

    test('週次の日別作業時間を返す（英語）', () => {
      const timeEntries: TimeEntry[] = [];

      const result = getWeeklyDistribution(
        timeEntries,
        projects,
        new Date('2025-01-13'),
        true
      );

      expect(result[0].date).toBe('Mon');
      expect(result[6].date).toBe('Sun');
    });
  });

  describe('getWeekNumber', () => {
    test('月内の週番号を正しく返す', () => {
      expect(getWeekNumber(new Date('2025-01-01'))).toBe(1);
      expect(getWeekNumber(new Date('2025-01-07'))).toBe(2);
      expect(getWeekNumber(new Date('2025-01-15'))).toBe(3);
    });
  });

  describe('getMonthlyDistribution', () => {
    test('月間の週別作業時間を返す', () => {
      const timeEntries = [
        createTimeEntry('p1', '2025-01-06T09:00:00Z', '2025-01-06T17:00:00Z'), // 8時間
        createTimeEntry('p1', '2025-01-13T09:00:00Z', '2025-01-13T17:00:00Z'), // 8時間
      ];

      const result = getMonthlyDistribution(timeEntries, 2025, 0); // 2025年1月

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('week');
      expect(result[0]).toHaveProperty('hours');
    });
  });

  describe('getMostActiveProject', () => {
    const projects = [
      createProject('p1', 'Project A'),
      createProject('p2', 'Project B'),
    ];

    test('最もアクティブなプロジェクトを返す', () => {
      const timeEntries = [
        createTimeEntry('p1', '2025-01-15T09:00:00Z', '2025-01-15T11:00:00Z'), // 2時間
        createTimeEntry('p2', '2025-01-15T09:00:00Z', '2025-01-15T17:00:00Z'), // 8時間
      ];

      const result = getMostActiveProject(
        timeEntries,
        projects,
        new Date('2025-01-10'),
        new Date('2025-01-20')
      );

      expect(result.projectName).toBe('Project B');
      expect(result.hours).toBe(8);
    });

    test('作業がない場合は空のプロジェクトを返す', () => {
      const result = getMostActiveProject(
        [],
        projects,
        new Date('2025-01-10'),
        new Date('2025-01-20')
      );

      expect(result.projectName).toBe('');
      expect(result.hours).toBe(0);
    });
  });

  describe('calculateMonthlyProgress', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('月間進捗を計算する', () => {
      const timeEntries = [
        createTimeEntry('p1', '2025-01-10T09:00:00Z', '2025-01-10T17:00:00Z'), // 8時間
        createTimeEntry('p1', '2025-01-11T09:00:00Z', '2025-01-11T17:00:00Z'), // 8時間
      ];

      const result = calculateMonthlyProgress(timeEntries, 'p1', 40);

      expect(result.monthlyHours).toBe(16);
      expect(result.monthlyPercentage).toBe(40);
    });

    test('目標が0の場合は0%を返す', () => {
      const timeEntries = [
        createTimeEntry('p1', '2025-01-10T09:00:00Z', '2025-01-10T17:00:00Z'),
      ];

      const result = calculateMonthlyProgress(timeEntries, 'p1', 0);

      expect(result.monthlyPercentage).toBe(0);
    });
  });

  describe('calculateProjectHours', () => {
    test('指定期間内のプロジェクト作業時間を計算する', () => {
      const timeEntries = [
        createTimeEntry('p1', '2025-01-15T09:00:00Z', '2025-01-15T13:00:00Z'), // 4時間
        createTimeEntry('p1', '2025-01-16T09:00:00Z', '2025-01-16T12:00:00Z'), // 3時間
        createTimeEntry('p2', '2025-01-15T09:00:00Z', '2025-01-15T17:00:00Z'), // 別プロジェクト
      ];

      const result = calculateProjectHours(
        timeEntries,
        'p1',
        new Date('2025-01-10'),
        new Date('2025-01-20')
      );

      expect(result).toBe(7);
    });
  });

  describe('calculateMonthlyTargetHours', () => {
    test('稼働率から月間目標時間を計算する', () => {
      expect(calculateMonthlyTargetHours(50, 140)).toBe(70);
      expect(calculateMonthlyTargetHours(100, 140)).toBe(140);
      expect(calculateMonthlyTargetHours(25, 160)).toBe(40);
    });

    test('デフォルトの基準時間（140時間）を使用する', () => {
      expect(calculateMonthlyTargetHours(50)).toBe(70);
    });

    test('稼働率が0〜100の範囲外の場合は正規化される', () => {
      expect(calculateMonthlyTargetHours(-10, 140)).toBe(0);
      expect(calculateMonthlyTargetHours(150, 140)).toBe(140);
    });
  });

  describe('predictCompletionDate', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('完了予定日を予測する', () => {
      const result = predictCompletionDate(10, 40, 5); // あと30時間、1日5時間ペース

      expect(result).not.toBeNull();
      expect(result!.getDate()).toBe(21); // 6日後
    });

    test('すでに目標達成の場合はnullを返す', () => {
      const result = predictCompletionDate(50, 40, 5);

      expect(result).toBeNull();
    });

    test('日次平均が0以下の場合はnullを返す', () => {
      const result = predictCompletionDate(10, 40, 0);

      expect(result).toBeNull();
    });
  });

  describe('calculateRecommendedDailyHours', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('推奨日次作業時間を計算する', () => {
      const result = calculateRecommendedDailyHours(10, 40);
      // 1月15日から31日まで17日残り、あと30時間必要
      expect(result).toBeCloseTo(1.8, 1);
    });

    test('目標達成済みの場合は0を返す', () => {
      const result = calculateRecommendedDailyHours(50, 40);

      expect(result).toBe(0);
    });
  });

  describe('calculateDailyAverageHours', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('日次平均作業時間を計算する', () => {
      const timeEntries = [
        createTimeEntry('p1', '2025-01-10T09:00:00Z', '2025-01-10T17:00:00Z'), // 8時間
        createTimeEntry('p1', '2025-01-11T09:00:00Z', '2025-01-11T13:00:00Z'), // 4時間
      ];

      const result = calculateDailyAverageHours(timeEntries, 'p1');

      expect(result).toBe(6); // (8 + 4) / 2日
    });

    test('作業がない場合は0を返す', () => {
      const result = calculateDailyAverageHours([], 'p1');

      expect(result).toBe(0);
    });
  });

  describe('getLongestWorkSession', () => {
    test('最長作業セッションの時間（分）を返す', () => {
      const timeEntries = [
        createTimeEntry('p1', '2025-01-15T09:00:00Z', '2025-01-15T10:00:00Z'), // 60分
        createTimeEntry('p1', '2025-01-15T11:00:00Z', '2025-01-15T13:30:00Z'), // 150分
        createTimeEntry('p1', '2025-01-15T14:00:00Z', '2025-01-15T15:00:00Z'), // 60分
      ];

      const result = getLongestWorkSession(timeEntries, new Date('2025-01-15'));

      expect(result).toBe(150);
    });

    test('作業がない日は0を返す', () => {
      const result = getLongestWorkSession([], new Date('2025-01-15'));

      expect(result).toBe(0);
    });
  });

  describe('getAverageWorkSession', () => {
    test('平均作業セッション時間（分）を返す', () => {
      const timeEntries = [
        createTimeEntry('p1', '2025-01-15T09:00:00Z', '2025-01-15T10:00:00Z'), // 60分
        createTimeEntry('p1', '2025-01-15T11:00:00Z', '2025-01-15T12:30:00Z'), // 90分
      ];

      const result = getAverageWorkSession(timeEntries, new Date('2025-01-15'));

      expect(result).toBe(75); // (60 + 90) / 2
    });

    test('作業がない日は0を返す', () => {
      const result = getAverageWorkSession([], new Date('2025-01-15'));

      expect(result).toBe(0);
    });
  });

  describe('getPreviousMonthProjectDistribution', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-02-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('前月のプロジェクト分布を返す', () => {
      const projects = [
        createProject('p1', 'Project A'),
        createProject('p2', 'Project B'),
      ];

      const timeEntries = [
        createTimeEntry('p1', '2025-01-15T09:00:00Z', '2025-01-15T17:00:00Z'), // 前月 8時間
        createTimeEntry('p2', '2025-01-20T09:00:00Z', '2025-01-20T13:00:00Z'), // 前月 4時間
        createTimeEntry('p1', '2025-02-10T09:00:00Z', '2025-02-10T17:00:00Z'), // 今月（含まれない）
      ];

      const result = getPreviousMonthProjectDistribution(timeEntries, projects);

      expect(result).toEqual([
        { projectName: 'Project A', hours: 8 },
        { projectName: 'Project B', hours: 4 },
      ]);
    });
  });

  describe('calculateTotalMonthlyTarget', () => {
    test('全プロジェクトの月間目標時間を合計する', () => {
      const projects = [
        { ...createProject('p1', 'Project A'), monthlyCapacity: 0.5 }, // 50%
        { ...createProject('p2', 'Project B'), monthlyCapacity: 0.3 }, // 30%
      ];
      const baseMonthlyHours = 140;

      const { calculateTotalMonthlyTarget } = require('../analytics');
      const result = calculateTotalMonthlyTarget(projects, baseMonthlyHours);

      // 50% of 140 = 70, 30% of 140 = 42, total = 112
      expect(result).toBe(112);
    });

    test('アーカイブされたプロジェクトは除外する', () => {
      const projects = [
        { ...createProject('p1', 'Project A'), monthlyCapacity: 0.5 },
        { ...createProject('p2', 'Project B', true), monthlyCapacity: 0.3 }, // archived
      ];
      const baseMonthlyHours = 140;

      const { calculateTotalMonthlyTarget } = require('../analytics');
      const result = calculateTotalMonthlyTarget(projects, baseMonthlyHours);

      // Only 50% of 140 = 70 (Project B is archived)
      expect(result).toBe(70);
    });

    test('プロジェクトがない場合は0を返す', () => {
      const { calculateTotalMonthlyTarget } = require('../analytics');
      const result = calculateTotalMonthlyTarget([], 140);

      expect(result).toBe(0);
    });
  });

  describe('calculateRemainingWorkingDays', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('今月の残り営業日数を計算する', () => {
      // 2025年1月15日（水曜日）
      jest.setSystemTime(new Date('2025-01-15T12:00:00Z'));

      const { calculateRemainingWorkingDays } = require('../analytics');
      const result = calculateRemainingWorkingDays();

      // 1月15日から31日まで: 16,17(金), 20,21,22,23,24(月-金), 27,28,29,30,31(月-金)
      // 15(水), 16(木), 17(金) = 3日
      // 20(月), 21(火), 22(水), 23(木), 24(金) = 5日
      // 27(月), 28(火), 29(水), 30(木), 31(金) = 5日
      // 合計 = 13日（15日含む）
      expect(result).toBe(13);
    });

    test('月末の場合は1を返す', () => {
      // 2025年1月31日（金曜日）
      jest.setSystemTime(new Date('2025-01-31T12:00:00Z'));

      const { calculateRemainingWorkingDays } = require('../analytics');
      const result = calculateRemainingWorkingDays();

      expect(result).toBe(1);
    });

    test('週末の場合は0を返す', () => {
      // 2025年1月25日（土曜日）
      jest.setSystemTime(new Date('2025-01-25T12:00:00Z'));

      const { calculateRemainingWorkingDays } = require('../analytics');
      const result = calculateRemainingWorkingDays();

      // 27(月), 28(火), 29(水), 30(木), 31(金) = 5日
      expect(result).toBe(5);
    });
  });

  describe('calculateMonthOverMonthChange', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-02-15T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('先月同期間との比較を計算する', () => {
      const timeEntries = [
        // 先月（1月1-15日）: 20時間
        createTimeEntry('p1', '2025-01-10T09:00:00Z', '2025-01-10T17:00:00Z'), // 8時間
        createTimeEntry('p1', '2025-01-11T09:00:00Z', '2025-01-11T17:00:00Z'), // 8時間
        createTimeEntry('p1', '2025-01-12T09:00:00Z', '2025-01-12T13:00:00Z'), // 4時間
        // 今月（2月1-15日）: 24時間
        createTimeEntry('p1', '2025-02-10T09:00:00Z', '2025-02-10T17:00:00Z'), // 8時間
        createTimeEntry('p1', '2025-02-11T09:00:00Z', '2025-02-11T17:00:00Z'), // 8時間
        createTimeEntry('p1', '2025-02-12T09:00:00Z', '2025-02-12T17:00:00Z'), // 8時間
      ];

      const { calculateMonthOverMonthChange } = require('../analytics');
      const result = calculateMonthOverMonthChange(timeEntries);

      expect(result.hoursChange).toBe(4); // 24 - 20
      expect(result.percentageChange).toBe(20); // (4/20) * 100
      expect(result.trend).toBe('up');
    });

    test('先月より減少している場合はdownを返す', () => {
      const timeEntries = [
        // 先月: 20時間
        createTimeEntry('p1', '2025-01-10T09:00:00Z', '2025-01-10T17:00:00Z'), // 8時間
        createTimeEntry('p1', '2025-01-11T09:00:00Z', '2025-01-11T17:00:00Z'), // 8時間
        createTimeEntry('p1', '2025-01-12T09:00:00Z', '2025-01-12T13:00:00Z'), // 4時間
        // 今月: 8時間
        createTimeEntry('p1', '2025-02-10T09:00:00Z', '2025-02-10T17:00:00Z'), // 8時間
      ];

      const { calculateMonthOverMonthChange } = require('../analytics');
      const result = calculateMonthOverMonthChange(timeEntries);

      expect(result.hoursChange).toBe(-12);
      expect(result.trend).toBe('down');
    });

    test('先月データがない場合はflatを返す', () => {
      const timeEntries = [
        createTimeEntry('p1', '2025-02-10T09:00:00Z', '2025-02-10T17:00:00Z'),
      ];

      const { calculateMonthOverMonthChange } = require('../analytics');
      const result = calculateMonthOverMonthChange(timeEntries);

      expect(result.percentageChange).toBe(0);
      expect(result.trend).toBe('flat');
    });
  });
});
