import { styled, alpha } from '@mui/material/styles';
import { Box, Card, Paper, Button, IconButton } from '@mui/material';
import { motion } from 'framer-motion';

// Animated wrapper components
export const MotionBox = motion(Box);
export const MotionCard = motion(Card);
export const MotionPaper = motion(Paper);

// Glassmorphism Card
export const GlassCard = styled(MotionCard)(({ theme }) => ({
  background:
    theme.palette.mode === 'dark'
      ? 'rgba(26, 31, 46, 0.4)'
      : 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(255, 255, 255, 0.6)'
  }`,
  borderRadius: theme.custom?.borderRadius?.lg || 16,
  boxShadow:
    theme.custom?.shadows?.card || '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  position: 'relative' as const,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow:
      theme.custom?.shadows?.hover || '0 12px 48px 0 rgba(31, 38, 135, 0.25)',
    border: `1px solid ${
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(255, 255, 255, 0.8)'
    }`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background:
      'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    animation: 'shimmer 2s infinite',
  },
  '@keyframes shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },
}));

// Gradient Card
export const GradientCard = styled(MotionCard)<{ gradient?: string }>(
  ({ theme, gradient }) => ({
    background:
      gradient ||
      theme.custom?.gradients?.primary ||
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: theme.custom?.borderRadius?.lg || 16,
    boxShadow:
      theme.custom?.shadows?.medium || '0 10px 40px -15px rgba(0,0,0,0.3)',
    color: '#FFFFFF',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative' as const,
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow:
        theme.custom?.shadows?.strong || '0 20px 60px -20px rgba(0,0,0,0.4)',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.1))',
      pointerEvents: 'none',
    },
  })
);

// Neumorphic Card
export const NeumorphicCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? '#1A1F2E' : '#F0F4F8',
  borderRadius: theme.custom?.borderRadius?.xl || 24,
  boxShadow:
    theme.palette.mode === 'dark'
      ? '9px 9px 16px #0d1015, -9px -9px 16px #272e41'
      : '9px 9px 16px #d1d9e6, -9px -9px 16px #ffffff',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow:
      theme.palette.mode === 'dark'
        ? '12px 12px 20px #0d1015, -12px -12px 20px #272e41'
        : '12px 12px 20px #d1d9e6, -12px -12px 20px #ffffff',
  },
  '&:active': {
    boxShadow:
      theme.palette.mode === 'dark'
        ? 'inset 5px 5px 10px #0d1015, inset -5px -5px 10px #272e41'
        : 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
  },
}));

// Modern Button with gradient
export const GradientButton = styled(Button)<{ gradient?: string }>(
  ({ theme, gradient }) => ({
    background:
      gradient ||
      theme.custom?.gradients?.primary ||
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: theme.custom?.borderRadius?.sm || 8,
    boxShadow: theme.custom?.shadows?.soft || '0 2px 20px 0 rgba(0,0,0,0.1)',
    color: '#FFFFFF',
    padding: '12px 32px',
    fontWeight: 600,
    fontSize: '0.95rem',
    letterSpacing: '0.02em',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative' as const,
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow:
        theme.custom?.shadows?.medium || '0 10px 40px -15px rgba(0,0,0,0.3)',
      filter: 'brightness(1.1)',
    },
    '&:active': {
      transform: 'scale(0.98)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '0',
      height: '0',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.5)',
      transform: 'translate(-50%, -50%)',
      transition: 'width 0.6s, height 0.6s',
    },
    '&:hover::before': {
      width: '300px',
      height: '300px',
    },
  })
);

// Ghost Button
export const GhostButton = styled(Button)(({ theme }) => ({
  background: 'transparent',
  color: theme.palette.primary.main,
  border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  borderRadius: theme.custom?.borderRadius?.sm || 8,
  padding: '10px 24px',
  fontWeight: 600,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.08),
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-2px)',
  },
}));

// Floating Action Button
export const FloatingButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed' as const,
  bottom: 32,
  right: 32,
  width: 56,
  height: 56,
  borderRadius: '50%',
  background:
    theme.custom?.gradients?.primary ||
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: '#FFFFFF',
  boxShadow:
    theme.custom?.shadows?.strong || '0 20px 60px -20px rgba(0,0,0,0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.1) rotate(90deg)',
    boxShadow:
      theme.custom?.shadows?.hover || '0 10px 40px -10px rgba(0,0,0,0.4)',
  },
}));

// Animated Progress Bar
export const AnimatedProgressBar = styled(Box)<{
  progress: number;
  gradient?: string;
}>(({ theme, progress, gradient }) => ({
  width: '100%',
  height: 8,
  borderRadius: theme.custom?.borderRadius?.xs || 4,
  background: alpha(theme.palette.primary.main, 0.1),
  position: 'relative' as const,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${progress}%`,
    background:
      gradient ||
      theme.custom?.gradients?.primary ||
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: theme.custom?.borderRadius?.xs || 4,
    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${progress}%`,
    background:
      'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    animation: 'progress-shimmer 2s infinite',
  },
  '@keyframes progress-shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(200%)' },
  },
}));

// Status Badge
export const StatusBadge = styled(Box)<{
  status: 'success' | 'warning' | 'error' | 'info';
}>(({ theme, status }) => {
  const colors = {
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
  };

  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: theme.custom?.borderRadius?.md || 12,
    background: alpha(colors[status], 0.1),
    color: colors[status],
    fontSize: '0.875rem',
    fontWeight: 600,
    border: `1px solid ${alpha(colors[status], 0.3)}`,
    '&::before': {
      content: '""',
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: colors[status],
      marginRight: 8,
      animation: 'pulse 2s infinite',
    },
    '@keyframes pulse': {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
  };
});

// Skeleton Loader
export const SkeletonCard = styled(Box)(({ theme }) => ({
  background:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(90deg, #1A1F2E 0%, #252B3B 50%, #1A1F2E 100%)'
      : 'linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-loading 1.5s infinite',
  borderRadius: theme.custom?.borderRadius?.md || 12,
  '@keyframes skeleton-loading': {
    '0%': { backgroundPosition: '200% 0' },
    '100%': { backgroundPosition: '-200% 0' },
  },
}));

// Animated Icon Wrapper
export const AnimatedIconWrapper = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 48,
  height: 48,
  borderRadius: theme.custom?.borderRadius?.md || 12,
  background: alpha(theme.palette.primary.main, 0.1),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.1) rotate(10deg)',
    background: alpha(theme.palette.primary.main, 0.2),
  },
}));

// Modern Container with mesh gradient
export const MeshGradientContainer = styled(Box)(({ theme }) => ({
  position: 'relative' as const,
  width: '100%',
  minHeight: '100vh',
  background: theme.palette.background.default,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      theme.custom?.gradients?.mesh ||
      'radial-gradient(at 40% 20%, hsla(28,100%,74%,0.1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.1) 0px, transparent 50%)',
    pointerEvents: 'none',
  },
}));

// Animation variants for Framer Motion
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

export const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

export const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
};

export const hoverRotate = {
  whileHover: { rotate: 5 },
  whileTap: { rotate: -5 },
};
