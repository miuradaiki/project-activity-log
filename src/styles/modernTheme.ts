import { createTheme, alpha, Theme, ThemeOptions } from '@mui/material/styles';

/**
 * Graphite デザインシステム（Linear 風のニュートラル配色＋アクセント1色）。
 * 決定事項: plans/261126-1551-modern-ui-mockups/design-decisions.md
 */

export interface GraphiteTokens {
  surface2: string;
  border2: string;
  track: string;
  navActive: string;
  glow: string;
  cardShadow: string;
  numberFont: string;
}

declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      gradients: Record<GradientKey, string>;
      shadows: Record<ShadowKey, string>;
      animations: { easeInOut: string; spring: string; bounce: string };
      glassmorphism: { background: string; border: string; blur: string };
      borderRadius: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
        round: string;
      };
      tokens: GraphiteTokens;
    };
  }
  interface ThemeOptions {
    custom?: Partial<Theme['custom']>;
  }
}

type GradientKey =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'dark'
  | 'light'
  | 'mesh'
  | 'radial'
  | 'glass';
type ShadowKey =
  | 'soft'
  | 'medium'
  | 'strong'
  | 'glow'
  | 'inset'
  | 'card'
  | 'hover';

const BODY_FONT = '"Inter", "Noto Sans JP", -apple-system, sans-serif';
const NUMBER_FONT = '"Manrope", "Inter", sans-serif';

interface Scheme {
  mode: 'dark' | 'light';
  bg: string;
  sidebar: string;
  surface: string;
  surface2: string;
  border: string;
  border2: string;
  text: string;
  text2: string;
  text3: string;
  accent: string;
  danger: string;
  success: string;
  warning: string;
  track: string;
  navActive: string;
  glow: string;
  cardShadow: string;
}

const darkScheme: Scheme = {
  mode: 'dark',
  bg: '#09090B',
  sidebar: '#09090B',
  surface: '#111114',
  surface2: '#18181C',
  border: 'rgba(255,255,255,0.07)',
  border2: 'rgba(255,255,255,0.12)',
  text: '#EDEDEF',
  text2: '#A0A0AB',
  text3: '#5E5E68',
  accent: '#8E8CFF',
  danger: '#FF6B6B',
  success: '#3DD6A3',
  warning: '#F5A524',
  track: 'rgba(255,255,255,0.06)',
  navActive: 'rgba(255,255,255,0.06)',
  glow: 'rgba(142,140,255,0.10)',
  cardShadow: 'none',
};

const lightScheme: Scheme = {
  mode: 'light',
  bg: '#FBFBFC',
  sidebar: '#F5F5F7',
  surface: '#FFFFFF',
  surface2: '#F4F4F6',
  border: 'rgba(10,10,20,0.08)',
  border2: 'rgba(10,10,20,0.14)',
  text: '#0B0B0F',
  text2: '#5E5E6B',
  text3: '#A1A1AB',
  accent: '#5652E0',
  danger: '#E5484D',
  success: '#12A58A',
  warning: '#E08A0B',
  track: 'rgba(10,10,20,0.06)',
  navActive: 'rgba(10,10,20,0.06)',
  glow: 'rgba(108,104,238,0.07)',
  cardShadow: '0 1px 2px rgba(10,10,20,0.03)',
};

const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: '50%',
};

const buildCustom = (s: Scheme): Theme['custom'] => {
  // 旧 UI のグラデーション参照を、フラットな単色に置き換えて互換を保つ
  const flat = (c: string) => c;
  return {
    gradients: {
      primary: flat(s.accent),
      secondary: flat(s.text2),
      success: flat(s.success),
      warning: flat(s.warning),
      error: flat(s.danger),
      info: flat(s.accent),
      dark: flat(s.surface),
      light: flat(s.surface),
      mesh: 'none',
      radial: `radial-gradient(120% 140% at 0% 0%, ${s.glow}, transparent 55%)`,
      glass: flat(s.surface),
    },
    shadows: {
      soft: s.cardShadow,
      medium: s.cardShadow,
      strong: '0 12px 32px rgba(0,0,0,0.28)',
      glow: 'none',
      inset: 'none',
      card: s.cardShadow,
      hover: s.cardShadow,
    },
    animations: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.2, 0, 0, 1)',
      bounce: 'cubic-bezier(0.2, 0, 0, 1)',
    },
    glassmorphism: {
      background: s.surface,
      border: `1px solid ${s.border}`,
      blur: 'none',
    },
    borderRadius,
    tokens: {
      surface2: s.surface2,
      border2: s.border2,
      track: s.track,
      navActive: s.navActive,
      glow: s.glow,
      cardShadow: s.cardShadow,
      numberFont: NUMBER_FONT,
    },
  };
};

const buildTheme = (s: Scheme): Theme => {
  const options: ThemeOptions = {
    palette: {
      mode: s.mode,
      primary: {
        main: s.accent,
        contrastText: s.mode === 'dark' ? s.bg : '#fff',
      },
      secondary: { main: s.text2 },
      error: { main: s.danger },
      warning: { main: s.warning },
      success: { main: s.success },
      info: { main: s.accent },
      background: { default: s.bg, paper: s.surface },
      text: { primary: s.text, secondary: s.text2, disabled: s.text3 },
      divider: s.border,
      action: {
        hover: s.track,
        selected: s.navActive,
        disabledBackground: s.track,
      },
    },
    typography: {
      fontFamily: BODY_FONT,
      fontSize: 13.5,
      h1: { fontWeight: 600, letterSpacing: '-0.02em' },
      h2: { fontWeight: 600, letterSpacing: '-0.02em' },
      h3: { fontWeight: 600, letterSpacing: '-0.02em' },
      h4: { fontWeight: 600, letterSpacing: '-0.02em', fontSize: '1.625rem' },
      h5: { fontWeight: 600, letterSpacing: '-0.01em', fontSize: '1.125rem' },
      h6: { fontWeight: 600, fontSize: '0.9375rem' },
      subtitle1: { fontWeight: 500 },
      subtitle2: { fontWeight: 500, fontSize: '0.8125rem' },
      body1: { fontSize: '0.84375rem', lineHeight: 1.55 },
      body2: { fontSize: '0.78125rem', lineHeight: 1.55 },
      caption: { fontSize: '0.75rem', color: s.text2 },
      button: { textTransform: 'none', fontWeight: 500, letterSpacing: 0 },
    },
    shape: { borderRadius: 9 },
    spacing: 8,
    custom: buildCustom(s),
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: s.bg,
            WebkitFontSmoothing: 'antialiased',
            scrollbarWidth: 'thin',
            scrollbarColor: `${s.border2} transparent`,
          },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
            },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 9,
            height: 34,
            padding: '0 14px',
            fontSize: 13,
          },
          sizeSmall: { height: 28, padding: '0 10px', fontSize: 12.5 },
          // 主要 CTA は「文字色の塗り」で、アクセントの紫とは役割を分ける
          containedPrimary: {
            backgroundColor: s.text,
            color: s.bg,
            '&:hover': { backgroundColor: alpha(s.text, 0.86) },
          },
          outlined: {
            borderColor: s.border2,
            color: s.text,
            backgroundColor: s.surface,
            '&:hover': { borderColor: s.border2, backgroundColor: s.track },
          },
          text: { color: s.text2, '&:hover': { backgroundColor: s.track } },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { borderRadius: 8, '&:hover': { backgroundColor: s.track } },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: 'none' },
          outlined: { borderColor: s.border },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${s.border}`,
            boxShadow: s.cardShadow,
            backgroundColor: s.surface,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            border: `1px solid ${s.border2}`,
            boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
            borderRadius: 10,
          },
          list: { padding: 5 },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: { borderRadius: 6, fontSize: 13, minHeight: 32 },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            border: `1px solid ${s.border2}`,
            borderRadius: 14,
            backgroundColor: s.surface,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 9,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: s.border2 },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: s.text3,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: s.accent,
              borderWidth: 1,
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { height: 4, borderRadius: 4, backgroundColor: s.track },
          bar: { borderRadius: 4 },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 6, fontWeight: 500, height: 22, fontSize: 11 },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: s.mode === 'dark' ? '#26262B' : '#18181B',
            color: '#EDEDEF',
            fontSize: 12,
            borderRadius: 6,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 500, minHeight: 40 },
        },
      },
      MuiDivider: { styleOverrides: { root: { borderColor: s.border } } },
      MuiSnackbarContent: {
        styleOverrides: {
          root: {
            backgroundColor: s.mode === 'dark' ? '#EDEDEF' : '#18181B',
            color: s.mode === 'dark' ? '#09090B' : '#EDEDEF',
            borderRadius: 10,
            fontSize: 13,
          },
        },
      },
    },
  };
  return createTheme(options);
};

export const modernDarkTheme = buildTheme(darkScheme);
export const modernLightTheme = buildTheme(lightScheme);

export const getResponsiveTheme = (isDarkMode: boolean): Theme =>
  isDarkMode ? modernDarkTheme : modernLightTheme;

export const getGradient = (theme: Theme, type: GradientKey) =>
  theme.custom.gradients[type];

export const getCustomShadow = (theme: Theme, type: ShadowKey) =>
  theme.custom.shadows[type];

export const applyGlassmorphism = (theme: Theme) => ({
  background: theme.custom.glassmorphism.background,
  border: theme.custom.glassmorphism.border,
});

/** 数字表示（タイマー・KPI）の共通スタイル */
export const numberTypography = (theme: Theme) => ({
  fontFamily: theme.custom.tokens.numberFont,
  fontWeight: 200,
  letterSpacing: '-0.04em',
  fontVariantNumeric: 'tabular-nums' as const,
});
