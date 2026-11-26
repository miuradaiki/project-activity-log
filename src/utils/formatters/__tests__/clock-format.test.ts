import { formatClock } from '../clock-format';

describe('formatClock', () => {
  it('秒付きでは時間の先頭ゼロを付けず h:mm:ss で返す', () => {
    expect(formatClock((1 * 3600 + 24 * 60 + 7) * 1000)).toBe('1:24:07');
  });

  it('秒なしでは h:mm で返す', () => {
    expect(formatClock((1 * 3600 + 24 * 60 + 59) * 1000, false)).toBe('1:24');
  });

  it('負の値は 0 として扱う', () => {
    expect(formatClock(-5000)).toBe('0:00:00');
  });
});
