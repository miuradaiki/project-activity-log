import React from 'react';
import { Box, Typography, CircularProgress, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedProgressBar } from '../modern/StyledComponents';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Project } from '../../../types';
import { formatHours } from '../../../utils/formatters/timeFormatters';

interface ProjectProgressSectionProps {
  project: Project;
  isActive: boolean;
  monthlyTime: number;
  monthlyTarget: number;
  progress: number;
  animatedProgress: number;
  progressColor: string;
  isTrackingOnly: boolean;
}

export const ProjectProgressSection: React.FC<ProjectProgressSectionProps> = ({
  project,
  isActive,
  monthlyTime,
  monthlyTarget,
  progress,
  animatedProgress,
  progressColor,
  isTrackingOnly,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();

  if (isTrackingOnly) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500, mb: 1.5 }}
        >
          {t('projects.tracking.cumulative')}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            background:
              theme.custom?.gradients?.primary ||
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 2,
          }}
        >
          {formatHours(monthlyTime)} {t('units.hours')}
        </Typography>
        <AnimatePresence>
          {(project.isArchived || isActive) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: isActive
                    ? theme.palette.secondary.main
                    : theme.palette.text.secondary,
                  fontWeight: 500,
                  fontSize: '0.75rem',
                }}
              >
                {project.isArchived
                  ? t('projects.archive')
                  : isActive
                    ? t('timer.title')
                    : ''}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          {t('dashboard.progress.title')}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            background:
              theme.custom?.gradients?.primary ||
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {formatHours(monthlyTime)} {t('units.hours')} /{' '}
          {formatHours(monthlyTarget)} {t('units.hours')}
        </Typography>
      </Box>

      <AnimatedProgressBar progress={progress} sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Box sx={{ position: 'relative' }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={60}
              thickness={6}
              sx={{
                color:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.1)',
              }}
            />
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.3,
                duration: 0.5,
                type: 'spring',
              }}
            >
              <CircularProgress
                variant="determinate"
                value={animatedProgress}
                size={60}
                thickness={6}
                sx={{
                  color: progressColor,
                  filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.3))',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                    transition: 'stroke-dasharray 0.8s ease-out',
                  },
                }}
              />
            </motion.div>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
              }}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.6,
                  type: 'spring',
                  stiffness: 300,
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  component="div"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: progressColor,
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    textAlign: 'center',
                    lineHeight: 1,
                  }}
                >
                  {`${Math.round(animatedProgress)}%`}
                </Typography>
              </motion.div>
            </Box>
          </Box>
        </motion.div>

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              mb: 0.5,
              color: theme.palette.text.primary,
            }}
          >
            {t('projects.utilization')}:{' '}
            <span
              style={{
                background:
                  theme.custom?.gradients?.secondary ||
                  'linear-gradient(135deg, #00ACC1 0%, #26C6DA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {(project.monthlyCapacity * 100).toFixed(1)}%
            </span>
          </Typography>
          <AnimatePresence>
            {(project.isArchived || isActive) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: isActive
                      ? theme.palette.secondary.main
                      : theme.palette.text.secondary,
                    fontWeight: 500,
                    fontSize: '0.75rem',
                  }}
                >
                  {project.isArchived
                    ? t('projects.archive')
                    : isActive
                      ? t('timer.title')
                      : ''}
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};
