import { createTheme, responsiveFontSizes, alpha } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      gradients: {
        primary: string;
        secondary: string;
        success: string;
        warning: string;
        error: string;
        info: string;
        dark: string;
        light: string;
        mesh: string;
        radial: string;
        glass: string;
      };
      shadows: {
        soft: string;
        medium: string;
        strong: string;
        glow: string;
        inset: string;
        card: string;
        hover: string;
      };
      animations: {
        easeInOut: string;
        spring: string;
        bounce: string;
      };
      glassmorphism: {
        background: string;
        border: string;
        blur: string;
      };
      borderRadius: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
        round: string;
      };
    };
  }
  interface ThemeOptions {
    custom?: {
      gradients?: Record<string, string>;
      shadows?: Record<string, string>;
      animations?: Record<string, string>;
      glassmorphism?: Record<string, string>;
      borderRadius?: Record<string, number | string>;
    };
  }
}

// Modern color palette with semantic colors
const modernColors = {
  primary: {
    main: '#5E35B1',
    light: '#7E57C2',
    dark: '#4527A0',
    50: '#EDE7F6',
    100: '#D1C4E9',
    200: '#B39DDB',
    300: '#9575CD',
    400: '#7E57C2',
    500: '#673AB7',
    600: '#5E35B1',
    700: '#512DA8',
    800: '#4527A0',
    900: '#311B92',
  },
  secondary: {
    main: '#00ACC1',
    light: '#26C6DA',
    dark: '#00838F',
    50: '#E0F7FA',
    100: '#B2EBF2',
    200: '#80DEEA',
    300: '#4DD0E1',
    400: '#26C6DA',
    500: '#00BCD4',
    600: '#00ACC1',
    700: '#0097A7',
    800: '#00838F',
    900: '#006064',
  },
  success: {
    main: '#00C853',
    light: '#69F0AE',
    dark: '#00A844',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  warning: {
    main: '#FFB300',
    light: '#FFCA28',
    dark: '#FF8F00',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  error: {
    main: '#FF5252',
    light: '#FF8A80',
    dark: '#FF1744',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  info: {
    main: '#536DFE',
    light: '#8C9EFF',
    dark: '#3D5AFE',
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// Modern gradients
const gradients = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  secondary: 'linear-gradient(135deg, #00ACC1 0%, #26C6DA 100%)',
  success: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  warning: 'linear-gradient(135deg, #FFB300 0%, #FFCA28 100%)',
  error: 'linear-gradient(135deg, #FF5252 0%, #FF8A80 100%)',
  info: 'linear-gradient(135deg, #536DFE 0%, #8C9EFF 100%)',
  dark: 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)',
  light: 'linear-gradient(135deg, #FFFFFF 0%, #F7FAFC 100%)',
  mesh: 'radial-gradient(at 40% 20%, hsla(28,100%,74%,0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.3) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.3) 0px, transparent 50%)',
  radial:
    'radial-gradient(circle at 50% 50%, rgba(94, 53, 177, 0.1) 0%, transparent 70%)',
  glass:
    'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
};

// Modern shadows
const modernShadows = {
  soft: '0 2px 20px 0 rgba(0,0,0,0.05)',
  medium: '0 10px 40px -15px rgba(0,0,0,0.15)',
  strong: '0 20px 60px -20px rgba(0,0,0,0.3)',
  glow: '0 0 20px rgba(94, 53, 177, 0.3)',
  inset: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
  card: '0 0 1px 0 rgba(0,0,0,0.05), 0 2px 8px -2px rgba(0,0,0,0.1)',
  hover: '0 10px 40px -10px rgba(0,0,0,0.2)',
};

// Animation curves
const animations = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// Border radius system
const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  round: '50%',
};

// Create base theme configuration
const baseThemeConfig = {
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.005em',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '0',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '0',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '0',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontWeight: 500,
      letterSpacing: '0.005em',
    },
    subtitle2: {
      fontWeight: 500,
      letterSpacing: '0.005em',
    },
    body1: {
      letterSpacing: '0.003em',
      lineHeight: 1.6,
    },
    body2: {
      letterSpacing: '0.003em',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none' as const,
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: borderRadius.md,
  },
  spacing: 8,
  transitions: {
    easing: {
      easeInOut: animations.easeInOut,
      easeOut: animations.spring,
      easeIn: animations.easeInOut,
      sharp: animations.bounce,
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
};

// Light theme
export const modernLightTheme = createTheme({
  ...baseThemeConfig,
  palette: {
    mode: 'light',
    primary: modernColors.primary,
    secondary: modernColors.secondary,
    success: modernColors.success,
    warning: modernColors.warning,
    error: modernColors.error,
    info: modernColors.info,
    grey: modernColors.neutral,
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: modernColors.neutral[900],
      secondary: modernColors.neutral[600],
      disabled: modernColors.neutral[400],
    },
  },
  custom: {
    gradients,
    shadows: modernShadows,
    animations,
    glassmorphism: {
      background: 'rgba(255, 255, 255, 0.25)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      blur: 'blur(20px)',
    },
    borderRadius,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: modernColors.neutral[100],
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: modernColors.neutral[400],
            borderRadius: '4px',
            '&:hover': {
              background: modernColors.neutral[500],
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          padding: '10px 24px',
          fontSize: '0.95rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        contained: {
          boxShadow: modernShadows.soft,
          '&:hover': {
            boxShadow: modernShadows.medium,
            transform: 'translateY(-2px)',
          },
        },
        containedPrimary: {
          background: gradients.primary,
          '&:hover': {
            background: gradients.primary,
            filter: 'brightness(1.1)',
          },
        },
        containedSecondary: {
          background: gradients.secondary,
          '&:hover': {
            background: gradients.secondary,
            filter: 'brightness(1.1)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            transform: 'translateY(-2px)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: alpha(modernColors.primary.main, 0.08),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.lg,
          boxShadow: modernShadows.card,
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: modernShadows.hover,
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: borderRadius.md,
        },
        elevation0: {
          boxShadow: 'none',
        },
        elevation1: {
          boxShadow: modernShadows.soft,
        },
        elevation2: {
          boxShadow: modernShadows.medium,
        },
        elevation3: {
          boxShadow: modernShadows.strong,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: borderRadius.sm,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: modernShadows.soft,
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(modernColors.primary.main, 0.1)}`,
            },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          margin: '4px 8px',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: alpha(modernColors.primary.main, 0.08),
            transform: 'translateX(4px)',
          },
          '&.Mui-selected': {
            background: gradients.primary,
            color: '#FFFFFF',
            boxShadow: modernShadows.soft,
            '&:hover': {
              background: gradients.primary,
              filter: 'brightness(1.1)',
            },
            '& .MuiListItemIcon-root': {
              color: '#FFFFFF',
            },
            '& .MuiListItemText-primary': {
              fontWeight: 600,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.8)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: modernShadows.soft,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
          minWidth: 'auto',
          padding: '12px 24px',
          transition: 'all 0.3s ease',
          '&:hover': {
            color: modernColors.primary.main,
            opacity: 1,
          },
          '&.Mui-selected': {
            color: modernColors.primary.main,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          background: gradients.primary,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          fontWeight: 500,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
        filled: {
          background: alpha(modernColors.primary.main, 0.1),
          color: modernColors.primary.main,
          '&:hover': {
            background: alpha(modernColors.primary.main, 0.2),
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: modernColors.neutral[800],
          borderRadius: borderRadius.sm,
          fontSize: '0.875rem',
          padding: '8px 12px',
          boxShadow: modernShadows.medium,
        },
        arrow: {
          color: modernColors.neutral[800],
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 6,
          borderRadius: borderRadius.xs,
          backgroundColor: modernColors.neutral[200],
        },
        bar: {
          borderRadius: borderRadius.xs,
          background: gradients.primary,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: modernColors.primary.main,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(modernColors.neutral[300], 0.3),
          '&::after': {
            background: `linear-gradient(90deg, transparent, ${alpha(modernColors.neutral[100], 0.5)}, transparent)`,
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: modernShadows.medium,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: modernShadows.strong,
            transform: 'scale(1.1) rotate(5deg)',
          },
        },
        primary: {
          background: gradients.primary,
        },
      },
    },
  },
});

// Dark theme
export const modernDarkTheme = createTheme({
  ...baseThemeConfig,
  palette: {
    mode: 'dark',
    primary: {
      ...modernColors.primary,
      main: '#7E57C2',
    },
    secondary: modernColors.secondary,
    success: modernColors.success,
    warning: modernColors.warning,
    error: modernColors.error,
    info: modernColors.info,
    grey: modernColors.neutral,
    background: {
      default: '#0F1419',
      paper: '#1A1F2E',
    },
    text: {
      primary: '#E4E6EB',
      secondary: '#B0B3B8',
      disabled: modernColors.neutral[600],
    },
  },
  custom: {
    gradients: {
      ...gradients,
      glass:
        'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
    },
    shadows: {
      ...modernShadows,
      card: '0 0 1px 0 rgba(0,0,0,0.3), 0 2px 8px -2px rgba(0,0,0,0.5)',
      hover: '0 10px 40px -10px rgba(0,0,0,0.5)',
    },
    animations,
    glassmorphism: {
      background: 'rgba(26, 31, 46, 0.5)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      blur: 'blur(20px)',
    },
    borderRadius,
  },
  components: {
    ...modernLightTheme.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: modernColors.neutral[800],
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: modernColors.neutral[600],
            borderRadius: '4px',
            '&:hover': {
              background: modernColors.neutral[500],
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.lg,
          boxShadow:
            '0 0 1px 0 rgba(0,0,0,0.3), 0 2px 8px -2px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(26, 31, 46, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
            transform: 'translateY(-4px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(20px)',
          background: 'rgba(15, 20, 25, 0.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(180deg, #1A1F2E 0%, #0F1419 100%)',
        },
      },
    },
  },
});

// Export responsive themes
export const getResponsiveTheme = (isDarkMode: boolean) => {
  return responsiveFontSizes(isDarkMode ? modernDarkTheme : modernLightTheme);
};

// Export modern helper functions
export const getGradient = (theme: any, type: keyof typeof gradients) => {
  return theme.custom?.gradients?.[type] || gradients[type];
};

export const getCustomShadow = (
  theme: any,
  type: keyof typeof modernShadows
) => {
  return theme.custom?.shadows?.[type] || modernShadows[type];
};

export const applyGlassmorphism = (theme: any) => ({
  background: theme.custom?.glassmorphism?.background,
  backdropFilter: theme.custom?.glassmorphism?.blur,
  border: theme.custom?.glassmorphism?.border,
});
