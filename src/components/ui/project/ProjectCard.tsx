import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  CardContent,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
  Divider,
  useTheme,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GlassCard,
  AnimatedProgressBar,
  StatusBadge,
} from '../modern/StyledComponents';
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { Project } from '../../../types';

interface ProjectCardProps {
  project: Project;
  isActive: boolean;
  monthlyTime: number;
  monthlyTarget: number;
  onStartTimer: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onArchiveProject?: (project: Project) => void;
  onUnarchiveProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isActive,
  monthlyTime,
  monthlyTarget,
  onStartTimer,
  onEditProject,
  onArchiveProject,
  onUnarchiveProject,
  onDeleteProject,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // 進捗率を計算
  const progress =
    monthlyTarget > 0 ? Math.min((monthlyTime / monthlyTarget) * 100, 100) : 0;

  // プログレスアニメーション
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 300);
    return () => clearTimeout(timer);
  }, [progress]);

  // 進捗に基づいて色を決定
  const getProgressColor = () => {
    if (progress >= 100) return theme.palette.error.main;
    if (progress >= 90) return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  // 稼働率0%かどうかを判定
  const isTrackingOnly = project.monthlyCapacity === 0;

  // ステータスを決定
  const getStatusInfo = () => {
    if (project.isArchived) {
      const bgColor =
        theme.palette.mode === 'dark'
          ? theme.palette.grey[600]
          : theme.palette.grey[300];
      return {
        label: t('projects.archive'),
        color: 'default' as 'default',
        bgColor: bgColor,
        textColor: theme.palette.getContrastText(bgColor),
      };
    }

    if (isTrackingOnly) {
      const bgColor =
        theme.palette.mode === 'dark'
          ? theme.palette.grey[700]
          : theme.palette.grey[200];
      return {
        label: t('projects.filter.tracking'),
        color: 'default' as 'default',
        bgColor: bgColor,
        textColor: theme.palette.getContrastText(bgColor),
      };
    }

    if (progress >= 100) {
      return {
        label: t('projects.filter.completed'),
        color: 'error' as 'error',
        bgColor: theme.palette.error.light,
        textColor: theme.palette.getContrastText(theme.palette.error.light),
      };
    }

    if (progress >= 90) {
      return {
        label: t('projects.filter.warning'),
        color: 'warning' as 'warning',
        bgColor: theme.palette.warning.light,
        textColor: theme.palette.getContrastText(theme.palette.warning.light),
      };
    }

    if (isActive) {
      return {
        label: t('timer.title'),
        color: 'secondary' as 'secondary',
        bgColor: theme.palette.secondary.light,
        textColor: theme.palette.getContrastText(theme.palette.secondary.light),
      };
    }

    return {
      label: t('projects.filter.active'),
      color: 'primary' as 'primary',
      bgColor: theme.palette.primary.light,
      textColor: theme.palette.getContrastText(theme.palette.primary.light),
    };
  };

  const statusInfo = getStatusInfo();
  const progressColor = getProgressColor();

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ scale: 1.02, y: -8 }}
      whileTap={{ scale: 0.95 }}
      style={{ height: '100%' }}
    >
      <GlassCard
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
          border: isActive
            ? `2px solid ${theme.palette.secondary.main}`
            : `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isActive
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))'
              : 'transparent',
            pointerEvents: 'none',
            borderRadius: 'inherit',
          },
        }}
      >
        {/* Modern progress indicator */}
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
            background: project.isArchived
              ? `linear-gradient(180deg, ${theme.palette.grey[400]}, ${theme.palette.grey[600]})`
              : `linear-gradient(180deg, ${progressColor}, ${theme.palette.mode === 'dark' ? '#FFFFFF40' : '#00000020'})`,
            transformOrigin: 'bottom',
          }}
        />

        <CardContent sx={{ flexGrow: 1, pl: 3 }}>
          {/* ヘッダー部分 */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 1,
            }}
          >
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 'bold',
                color: project.isArchived
                  ? theme.palette.text.secondary
                  : theme.palette.text.primary,
              }}
            >
              {project.name}
            </Typography>

            <IconButton
              aria-label="more"
              size="small"
              onClick={handleMenuClick}
              sx={{ mt: -0.5, mr: -0.5 }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Modern status badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
          >
            <StatusBadge
              status={
                project.isArchived
                  ? 'info'
                  : progress >= 100
                    ? 'error'
                    : progress >= 90
                      ? 'warning'
                      : 'success'
              }
              sx={{
                mb: 2,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {statusInfo.label}
            </StatusBadge>
          </motion.div>

          {/* プロジェクト説明 */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              height: '2.5em',
            }}
          >
            {project.description || t('projects.description')}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Modern progress section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {isTrackingOnly ? (
              // 稼働率0%の場合: シンプルな累計時間表示
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
                  {monthlyTime.toFixed(1)} {t('units.hours')}
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
            ) : (
              // 稼働率設定ありの場合: 従来の進捗表示
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
                    {monthlyTime.toFixed(1)} {t('units.hours')} /{' '}
                    {monthlyTarget.toFixed(1)} {t('units.hours')}
                  </Typography>
                </Box>

                {/* Modern animated progress bar */}
                <AnimatedProgressBar progress={progress} sx={{ mb: 2 }} />

                {/* Modern circular progress */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      {/* Background circle */}
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
                      {/* Progress circle with animation */}
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
            )}
          </motion.div>
        </CardContent>

        {/* Modern action area */}
        <Box
          sx={{
            p: 2,
            pt: 0,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
          }}
        >
          {!project.isArchived && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={
                isActive
                  ? {
                      scale: [1, 1.05, 1],
                      transition: {
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                      },
                    }
                  : {}
              }
            >
              <Tooltip
                title={isActive ? t('timer.stop') : t('timer.start')}
                arrow
              >
                <IconButton
                  onClick={() => onStartTimer(project)}
                  sx={{
                    background: isActive
                      ? theme.custom?.gradients?.secondary ||
                        'linear-gradient(135deg, #00ACC1 0%, #26C6DA 100%)'
                      : theme.custom?.gradients?.primary ||
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#FFFFFF',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    boxShadow:
                      theme.custom?.shadows?.medium ||
                      '0 10px 40px -15px rgba(0,0,0,0.3)',
                    '&:hover': {
                      background: isActive
                        ? theme.custom?.gradients?.secondary ||
                          'linear-gradient(135deg, #00ACC1 0%, #26C6DA 100%)'
                        : theme.custom?.gradients?.primary ||
                          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      filter: 'brightness(1.1)',
                      boxShadow:
                        theme.custom?.shadows?.strong ||
                        '0 20px 60px -20px rgba(0,0,0,0.4)',
                    },
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                    ...(isActive && {
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: -4,
                        left: -4,
                        right: -4,
                        bottom: -4,
                        borderRadius: '50%',
                        border: `2px solid ${theme.palette.secondary.main}`,
                        animation: 'ripple 2s infinite',
                      },
                      '@keyframes ripple': {
                        '0%': {
                          transform: 'scale(1)',
                          opacity: 1,
                        },
                        '100%': {
                          transform: 'scale(1.5)',
                          opacity: 0,
                        },
                      },
                    }),
                  }}
                >
                  <motion.div
                    animate={{
                      rotate: isActive ? [0, 180, 360] : 0,
                    }}
                    transition={{
                      duration: 0.5,
                      ease: 'easeInOut',
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    {isActive ? (
                      <StopIcon />
                    ) : (
                      <PlayArrowIcon
                        sx={{
                          marginLeft: '2px', // 視覚的中央揃えのための微調整
                        }}
                      />
                    )}
                  </motion.div>
                </IconButton>
              </Tooltip>
            </motion.div>
          )}
        </Box>

        {/* メニュー */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem
            onClick={() => {
              onEditProject(project);
              handleMenuClose();
            }}
          >
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            {t('actions.edit')}
          </MenuItem>

          {!project.isArchived && onArchiveProject && (
            <MenuItem
              onClick={() => {
                onArchiveProject(project);
                handleMenuClose();
              }}
            >
              <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
              {t('projects.archive')}
            </MenuItem>
          )}

          {project.isArchived && onUnarchiveProject && (
            <MenuItem
              onClick={() => {
                onUnarchiveProject(project);
                handleMenuClose();
              }}
            >
              <UnarchiveIcon fontSize="small" sx={{ mr: 1 }} />
              {t('projects.unarchive')}
            </MenuItem>
          )}

          {onDeleteProject && (
            <MenuItem
              onClick={() => {
                handleMenuClose();
                onDeleteProject(project);
              }}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              {t('projects.delete')}
            </MenuItem>
          )}
        </Menu>
      </GlassCard>
    </motion.div>
  );
};
