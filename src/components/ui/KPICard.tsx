import React from 'react';
import {
  Box,
  CardContent,
  Typography,
  SvgIconProps,
  useTheme,
} from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  GlassCard,
  AnimatedIconWrapper,
  fadeInUp,
  hoverScale,
} from './modern/StyledComponents';

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactElement<SvgIconProps>;
  trend?: {
    value: number;
    label: string;
  };
  color?: string;
}

/**
 * Modern KPIカードコンポーネント - ダッシュボードの統計情報を表示するための美しいカード
 */
export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  trend,
  color,
}) => {
  const theme = useTheme();
  const iconColor = color || theme.palette.primary.main;

  // トレンドアイコンと色を決定
  const getTrendIcon = () => {
    if (!trend) return null;

    if (trend.value > 0) {
      return (
        <TrendingUp
          fontSize="small"
          sx={{ color: theme.palette.success.main }}
        />
      );
    } else if (trend.value < 0) {
      return (
        <TrendingDown
          fontSize="small"
          sx={{ color: theme.palette.error.main }}
        />
      );
    } else {
      return (
        <TrendingFlat
          fontSize="small"
          sx={{ color: theme.palette.text.secondary }}
        />
      );
    }
  };

  const trendIcon = getTrendIcon();
  const trendColor =
    trend && trend.value > 0
      ? theme.palette.success.main
      : trend && trend.value < 0
        ? theme.palette.error.main
        : theme.palette.text.secondary;

  // NaN値を表示しないようにする
  const displayTrendValue = trend && !isNaN(trend.value) ? trend.value : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.95 }}
      style={{ height: '100%' }}
    >
      <GlassCard
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: `linear-gradient(90deg, ${iconColor}, ${theme.palette.mode === 'dark' ? '#FFFFFF40' : '#00000020'})`,
          },
        }}
      >
        <CardContent
          sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatedIconWrapper
                sx={{
                  mr: 1.5,
                  background: `linear-gradient(135deg, ${iconColor}20, ${iconColor}10)`,
                  border: `1px solid ${iconColor}30`,
                  backdropFilter: 'blur(10px)',
                }}
              >
                {React.cloneElement(icon, {
                  style: {
                    color: iconColor,
                    fontSize: '1.5rem',
                  },
                })}
              </AnimatedIconWrapper>
            </motion.div>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}
            >
              {title}
            </Typography>
          </Box>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
          >
            <Typography
              variant="h4"
              component="div"
              sx={{
                mb: 1,
                fontWeight: 700,
                background:
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #FFFFFF, #B0B3B8)'
                    : 'linear-gradient(135deg, #1A1F2E, #374151)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
              }}
            >
              {value}
            </Typography>
          </motion.div>

          {trend && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mt: 'auto',
                  p: 1,
                  borderRadius: theme.custom?.borderRadius?.sm || 8,
                  background:
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(0, 0, 0, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                }}
              >
                <motion.div
                  animate={{
                    rotate:
                      trend.value > 0
                        ? [0, 10, 0]
                        : trend.value < 0
                          ? [0, -10, 0]
                          : 0,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                >
                  {trendIcon}
                </motion.div>
                <Typography
                  variant="body2"
                  sx={{
                    ml: 0.5,
                    color: trendColor,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  {displayTrendValue > 0 ? '+' : ''}
                  {displayTrendValue}%
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    ml: 1,
                    fontSize: '0.75rem',
                    opacity: 0.8,
                  }}
                >
                  {trend.label}
                </Typography>
              </Box>
            </motion.div>
          )}
        </CardContent>
      </GlassCard>
    </motion.div>
  );
};
