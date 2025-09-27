import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { stagger, fadeInUp } from './StyledComponents';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  spacing?: number;
  maxWidth?: string | number;
  center?: boolean;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  spacing = 2,
  maxWidth = '100%',
  center = false,
}) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));

  const getCurrentColumns = () => {
    if (isXs) return columns.xs || 1;
    if (isSm) return columns.sm || 2;
    if (isMd) return columns.md || 3;
    if (isLg) return columns.lg || 4;
    return columns.xl || 4;
  };

  const currentColumns = getCurrentColumns();

  return (
    <motion.div variants={stagger} initial="initial" animate="animate">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${currentColumns}, 1fr)`,
          gap: theme.spacing(spacing),
          width: '100%',
          maxWidth,
          margin: center ? '0 auto' : '0',
          // Ensure grid items don't overflow on small screens
          gridAutoRows: 'minmax(auto, 1fr)',
          // Handle very small screens gracefully
          [theme.breakpoints.down('sm')]: {
            gridTemplateColumns:
              columns.xs === 1 ? '1fr' : `repeat(${columns.xs || 1}, 1fr)`,
            gap: theme.spacing(Math.max(1, spacing - 1)),
          },
        }}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            transition={{ delay: index * 0.1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0, // Prevent overflow
            }}
          >
            {child}
          </motion.div>
        ))}
      </Box>
    </motion.div>
  );
};

// Mobile-optimized card grid
export const MobileCardGrid: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ResponsiveGrid
      columns={{ xs: 1, sm: 1, md: 2, lg: 3, xl: 4 }}
      spacing={2}
      center
    >
      {children}
    </ResponsiveGrid>
  );
};

// Dashboard KPI grid
export const KPIGrid: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ResponsiveGrid columns={{ xs: 1, sm: 2, md: 2, lg: 4 }} spacing={3} center>
      {children}
    </ResponsiveGrid>
  );
};

// Project grid with responsive columns
export const ProjectGrid: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ResponsiveGrid columns={{ xs: 1, sm: 1, md: 2, lg: 3 }} spacing={3} center>
      {children}
    </ResponsiveGrid>
  );
};

// Responsive container with max width and centering
export const ResponsiveContainer: React.FC<{
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: number;
}> = ({ children, maxWidth = 'lg', padding = 3 }) => {
  const theme = useTheme();

  const getMaxWidth = () => {
    switch (maxWidth) {
      case 'sm':
        return theme.breakpoints.values.sm;
      case 'md':
        return theme.breakpoints.values.md;
      case 'lg':
        return theme.breakpoints.values.lg;
      case 'xl':
        return theme.breakpoints.values.xl;
      default:
        return theme.breakpoints.values.lg;
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: getMaxWidth(),
        margin: '0 auto',
        padding: theme.spacing(padding),
        [theme.breakpoints.down('sm')]: {
          padding: theme.spacing(Math.max(1, padding - 1)),
        },
      }}
    >
      {children}
    </Box>
  );
};

// Responsive spacing component
export const ResponsiveSpacing: React.FC<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}> = ({ size = 'md' }) => {
  const theme = useTheme();

  const getSpacing = () => {
    switch (size) {
      case 'xs':
        return { desktop: 1, mobile: 0.5 };
      case 'sm':
        return { desktop: 2, mobile: 1 };
      case 'md':
        return { desktop: 3, mobile: 2 };
      case 'lg':
        return { desktop: 4, mobile: 3 };
      case 'xl':
        return { desktop: 6, mobile: 4 };
      default:
        return { desktop: 3, mobile: 2 };
    }
  };

  const spacing = getSpacing();

  return (
    <Box
      sx={{
        height: theme.spacing(spacing.desktop),
        [theme.breakpoints.down('sm')]: {
          height: theme.spacing(spacing.mobile),
        },
      }}
    />
  );
};

// Mobile-first button group
export const ResponsiveButtonGroup: React.FC<{
  children: React.ReactNode;
  direction?: 'row' | 'column';
  spacing?: number;
}> = ({ children, direction = 'row', spacing = 2 }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: direction,
        gap: theme.spacing(spacing),
        flexWrap: 'wrap',
        [theme.breakpoints.down('sm')]: {
          flexDirection: 'column',
          gap: theme.spacing(Math.max(1, spacing - 1)),
          width: '100%',
          '& > *': {
            width: '100%',
          },
        },
      }}
    >
      {children}
    </Box>
  );
};
