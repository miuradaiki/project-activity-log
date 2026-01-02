import { formatHours, formatMinutesToHM } from '../timeFormatters';

describe('timeFormatters', () => {
  describe('formatHours', () => {
    test('should format hours with default precision (1 decimal)', () => {
      expect(formatHours(10.567)).toBe('10.6');
    });

    test('should format hours with custom precision', () => {
      expect(formatHours(10.567, 2)).toBe('10.57');
    });

    test('should format zero hours', () => {
      expect(formatHours(0)).toBe('0.0');
    });

    test('should format whole numbers', () => {
      expect(formatHours(5)).toBe('5.0');
    });

    test('should handle large numbers', () => {
      expect(formatHours(1000.123)).toBe('1000.1');
    });

    test('should handle small decimal numbers', () => {
      expect(formatHours(0.05)).toBe('0.1');
    });
  });

  describe('formatMinutesToHM', () => {
    test('should format 60 minutes as 1:00', () => {
      expect(formatMinutesToHM(60)).toBe('1:00');
    });

    test('should format 90 minutes as 1:30', () => {
      expect(formatMinutesToHM(90)).toBe('1:30');
    });

    test('should format 0 minutes as 0:00', () => {
      expect(formatMinutesToHM(0)).toBe('0:00');
    });

    test('should format 5 minutes as 0:05', () => {
      expect(formatMinutesToHM(5)).toBe('0:05');
    });

    test('should format 125 minutes as 2:05', () => {
      expect(formatMinutesToHM(125)).toBe('2:05');
    });

    test('should handle large values', () => {
      expect(formatMinutesToHM(600)).toBe('10:00');
    });
  });
});
