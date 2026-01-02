import { Theme } from '@mui/material/styles';
import { getModeValue } from '../themeHelpers';

describe('themeHelpers', () => {
  describe('getModeValue', () => {
    const createMockTheme = (mode: 'light' | 'dark'): Theme =>
      ({
        palette: {
          mode,
        },
      }) as Theme;

    test('should return dark value when theme is dark mode', () => {
      const theme = createMockTheme('dark');
      const result = getModeValue(theme, 'darkValue', 'lightValue');
      expect(result).toBe('darkValue');
    });

    test('should return light value when theme is light mode', () => {
      const theme = createMockTheme('light');
      const result = getModeValue(theme, 'darkValue', 'lightValue');
      expect(result).toBe('lightValue');
    });

    test('should work with numbers', () => {
      const darkTheme = createMockTheme('dark');
      const lightTheme = createMockTheme('light');
      expect(getModeValue(darkTheme, 0.8, 0.4)).toBe(0.8);
      expect(getModeValue(lightTheme, 0.8, 0.4)).toBe(0.4);
    });

    test('should work with objects', () => {
      const theme = createMockTheme('dark');
      const darkObj = { color: 'white' };
      const lightObj = { color: 'black' };
      expect(getModeValue(theme, darkObj, lightObj)).toBe(darkObj);
    });

    test('should work with arrays', () => {
      const theme = createMockTheme('light');
      const darkArr = [1, 2, 3];
      const lightArr = [4, 5, 6];
      expect(getModeValue(theme, darkArr, lightArr)).toBe(lightArr);
    });
  });
});
