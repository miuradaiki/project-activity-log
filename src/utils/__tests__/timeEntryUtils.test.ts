import { createSplitEntries, createTimerEntries } from '../timeEntryUtils';

// uuid をモック
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
}));

describe('timeEntryUtils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-15T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('createSplitEntries', () => {
    test('同じ日の場合は1つのエントリーを返す', () => {
      // ローカルタイムゾーンで同じ日になるようにする
      const startDateTime = new Date(2025, 0, 15, 9, 0, 0); // 2025年1月15日 9:00
      const endDateTime = new Date(2025, 0, 15, 17, 0, 0); // 2025年1月15日 17:00

      const result = createSplitEntries(
        'project-1',
        startDateTime,
        endDateTime,
        'テスト作業'
      );

      expect(result).toHaveLength(1);
      expect(result[0].projectId).toBe('project-1');
      expect(result[0].description).toBe('テスト作業');
    });

    test('日跨ぎの場合は2つのエントリーに分割する', () => {
      // ローカルタイムゾーンで日跨ぎになるようにする
      const startDateTime = new Date(2025, 0, 15, 22, 0, 0); // 2025年1月15日 22:00
      const endDateTime = new Date(2025, 0, 16, 2, 0, 0); // 2025年1月16日 2:00

      const result = createSplitEntries(
        'project-1',
        startDateTime,
        endDateTime,
        '深夜作業'
      );

      expect(result).toHaveLength(2);

      // 1日目のエントリー
      expect(result[0].description).toBe('深夜作業');

      // 2日目のエントリー
      expect(result[1].description).toBe('深夜作業 (2日目)');
    });

    test('3日にまたがる場合は3つのエントリーに分割する', () => {
      const startDateTime = new Date(2025, 0, 14, 20, 0, 0); // 2025年1月14日 20:00
      const endDateTime = new Date(2025, 0, 16, 8, 0, 0); // 2025年1月16日 8:00

      const result = createSplitEntries(
        'project-1',
        startDateTime,
        endDateTime,
        '長時間作業'
      );

      expect(result).toHaveLength(3);

      // 1日目
      expect(result[0].description).toBe('長時間作業');

      // 2日目
      expect(result[1].description).toBe('長時間作業 (2日目)');

      // 3日目
      expect(result[2].description).toBe('長時間作業 (3日目)');
    });

    test('説明が空の場合でも正しく動作する', () => {
      const startDateTime = new Date(2025, 0, 15, 22, 0, 0);
      const endDateTime = new Date(2025, 0, 16, 2, 0, 0);

      const result = createSplitEntries(
        'project-1',
        startDateTime,
        endDateTime,
        ''
      );

      expect(result).toHaveLength(2);
      expect(result[0].description).toBe('');
      expect(result[1].description).toBe(' (2日目)');
    });

    test('各エントリーに一意のIDが付与される', () => {
      const startDateTime = new Date(2025, 0, 15, 22, 0, 0);
      const endDateTime = new Date(2025, 0, 16, 2, 0, 0);

      const result = createSplitEntries(
        'project-1',
        startDateTime,
        endDateTime
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).not.toBe(result[1].id);
    });

    test('createdAtとupdatedAtが設定される', () => {
      const startDateTime = new Date(2025, 0, 15, 9, 0, 0);
      const endDateTime = new Date(2025, 0, 15, 17, 0, 0);

      const result = createSplitEntries(
        'project-1',
        startDateTime,
        endDateTime
      );

      expect(result[0].createdAt).toBe('2025-01-15T12:00:00.000Z');
      expect(result[0].updatedAt).toBe('2025-01-15T12:00:00.000Z');
    });

    test('開始時刻と終了時刻が正しく設定される（同じ日）', () => {
      const startDateTime = new Date(2025, 0, 15, 9, 0, 0);
      const endDateTime = new Date(2025, 0, 15, 17, 0, 0);

      const result = createSplitEntries(
        'project-1',
        startDateTime,
        endDateTime
      );

      expect(result[0].startTime).toBe(startDateTime.toISOString());
      expect(result[0].endTime).toBe(endDateTime.toISOString());
    });

    test('日跨ぎ時に1日目の終了が23:59:59.999になる', () => {
      const startDateTime = new Date(2025, 0, 15, 22, 0, 0);
      const endDateTime = new Date(2025, 0, 16, 2, 0, 0);

      const result = createSplitEntries(
        'project-1',
        startDateTime,
        endDateTime
      );

      // 1日目の終了時刻を確認
      const firstEntryEnd = new Date(result[0].endTime);
      expect(firstEntryEnd.getHours()).toBe(23);
      expect(firstEntryEnd.getMinutes()).toBe(59);
      expect(firstEntryEnd.getSeconds()).toBe(59);

      // 2日目の開始時刻を確認
      const secondEntryStart = new Date(result[1].startTime);
      expect(secondEntryStart.getHours()).toBe(0);
      expect(secondEntryStart.getMinutes()).toBe(0);
      expect(secondEntryStart.getSeconds()).toBe(0);
    });
  });

  describe('createTimerEntries', () => {
    test('ISO文字列から正しくエントリーを作成する（同じ日）', () => {
      // ローカルタイムゾーンで同じ日になるISO文字列を作成
      const startDateTime = new Date(2025, 0, 15, 9, 0, 0);
      const endDateTime = new Date(2025, 0, 15, 17, 0, 0);

      const result = createTimerEntries(
        'project-1',
        startDateTime.toISOString(),
        endDateTime.toISOString(),
        'タイマー作業'
      );

      expect(result).toHaveLength(1);
      expect(result[0].projectId).toBe('project-1');
      expect(result[0].description).toBe('タイマー作業');
    });

    test('日跨ぎのISO文字列から分割エントリーを作成する', () => {
      const startDateTime = new Date(2025, 0, 15, 23, 0, 0);
      const endDateTime = new Date(2025, 0, 16, 1, 0, 0);

      const result = createTimerEntries(
        'project-1',
        startDateTime.toISOString(),
        endDateTime.toISOString(),
        '深夜タイマー'
      );

      expect(result).toHaveLength(2);
    });

    test('説明のデフォルト値が空文字列である', () => {
      const startDateTime = new Date(2025, 0, 15, 9, 0, 0);
      const endDateTime = new Date(2025, 0, 15, 17, 0, 0);

      const result = createTimerEntries(
        'project-1',
        startDateTime.toISOString(),
        endDateTime.toISOString()
      );

      expect(result[0].description).toBe('');
    });
  });
});
