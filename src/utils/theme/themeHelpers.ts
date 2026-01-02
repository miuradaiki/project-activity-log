import { Theme } from '@mui/material/styles';

/**
 * Returns different values based on theme mode (dark/light)
 * @param theme - MUI Theme object
 * @param darkValue - Value to return in dark mode
 * @param lightValue - Value to return in light mode
 * @returns The appropriate value based on theme mode
 */
export const getModeValue = <T>(
  theme: Theme,
  darkValue: T,
  lightValue: T
): T => (theme.palette.mode === 'dark' ? darkValue : lightValue);
