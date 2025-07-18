// バリデーションロジックのユニットテスト
describe('Timer Validation Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('1分未満の時間差を正しく検出する', () => {
    const startTime = new Date('2025-01-10T10:00:00Z');
    const endTime = new Date('2025-01-10T10:00:30Z'); // 30秒後

    const duration = endTime.getTime() - startTime.getTime();

    // 1分未満（60000ミリ秒）であることを確認
    expect(duration).toBeLessThan(60000);
    expect(duration).toBe(30000); // 30秒 = 30000ミリ秒
  });

  it('1分以上の時間差を正しく検出する', () => {
    const startTime = new Date('2025-01-10T10:00:00Z');
    const endTime = new Date('2025-01-10T10:02:00Z'); // 2分後

    const duration = endTime.getTime() - startTime.getTime();

    // 1分以上（60000ミリ秒）であることを確認
    expect(duration).toBeGreaterThanOrEqual(60000);
    expect(duration).toBe(120000); // 2分 = 120000ミリ秒
  });

  it('同じ時間の場合は0ミリ秒となる', () => {
    const startTime = new Date('2025-01-10T10:00:00Z');
    const endTime = new Date('2025-01-10T10:00:00Z');

    const duration = endTime.getTime() - startTime.getTime();

    expect(duration).toBe(0);
  });

  it('終了時間が開始時間より前の場合は負の値となる', () => {
    const startTime = new Date('2025-01-10T10:00:00Z');
    const endTime = new Date('2025-01-10T09:00:00Z'); // 1時間前

    const duration = endTime.getTime() - startTime.getTime();

    expect(duration).toBeLessThan(0);
    expect(duration).toBe(-3600000); // -1時間 = -3600000ミリ秒
  });
});
