import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// カスタムカラーパレット
const colors = {
  primary: {
    main: '#3B82F6', // 鮮やかな青
    light: '#93C5FD',
    dark: '#1D4ED8',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#10B981', // エメラルドグリーン
    light: '#6EE7B7',
    dark: '#047857',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#F59E0B', // 琥珀色
    light: '#FCD34D',
    dark: '#B45309',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#EF4444', // 赤
    light: '#FCA5A5',
    dark: '#B91C1C',
    contrastText: '#FFFFFF',
  },
  grey: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  background: {
    default: '#F9FAFB',
    paper: '#FFFFFF',
  },
};

// テーマ設定（ライトモード）
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: colors.primary,
    secondary: colors.secondary,
    warning: colors.warning,
    error: colors.error,
    grey: colors.grey,
    background: colors.background,
    text: {
      primary: colors.grey[800],
      secondary: colors.grey[500],
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: colors.primary.main,
            color: colors.primary.contrastText,
            '&:hover': {
              backgroundColor: colors.primary.dark,
            },
            '& .MuiListItemIcon-root': {
              color: colors.primary.contrastText,
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minWidth: 'auto',
        },
      },
    },
  },
});

// ダークモード用テーマ
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: colors.primary,
    secondary: colors.secondary,
    warning: colors.warning,
    error: colors.error,
    background: {
      default: colors.grey[900],
      paper: colors.grey[800],
    },
    text: {
      primary: colors.grey[100],
      secondary: colors.grey[300],
    },
  },
  typography: lightTheme.typography,
  components: lightTheme.components,
});

// レスポンシブフォント設定を適用
export const responsiveTheme = (isDarkMode: boolean) => {
  return responsiveFontSizes(isDarkMode ? darkTheme : lightTheme);
};
