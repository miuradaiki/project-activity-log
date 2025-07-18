import React, { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
  Chip,
  Divider,
  useTheme,
} from '@mui/material';
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

  // 進捗率を計算
  const progress = Math.min((monthlyTime / monthlyTarget) * 100, 100);

  // 進捗に基づいて色を決定
  const getProgressColor = () => {
    if (progress >= 100) return theme.palette.error.main;
    if (progress >= 90) return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  // ステータスを決定
  const getStatusInfo = () => {
    if (project.isArchived) {
      // ダークモードでは少し明るい灰色、ライトモードでは少し暗い灰色を使用
      const bgColor =
        theme.palette.mode === 'dark'
          ? theme.palette.grey[600]
          : theme.palette.grey[300];
      return {
        label: t('projects.archive'),
        color: 'default' as 'default',
        bgColor: bgColor,
        // getContrastTextで自動的に適切なテキスト色を計算
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
    <Card
      elevation={2}
      sx={{
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
        border: isActive ? `1px solid ${theme.palette.secondary.main}` : 'none',
      }}
    >
      {/* 左サイドカラーバー */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
          bgcolor: project.isArchived
            ? theme.palette.mode === 'dark'
              ? theme.palette.grey[500]
              : theme.palette.grey[400]
            : progressColor,
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

        {/* ステータスバッジ */}
        <Chip
          label={statusInfo.label}
          color={statusInfo.color}
          size="small"
          sx={{
            mb: 2,
            bgcolor: statusInfo.bgColor,
            fontWeight: 'medium',
            color: statusInfo.textColor,
          }}
        />

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

        {/* 進捗情報 */}
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.progress.title')}
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {monthlyTime.toFixed(1)} {t('units.hours')} /{' '}
              {monthlyTarget.toFixed(1)} {t('units.hours')}
            </Typography>
          </Box>

          {/* 円形プログレスインジケーター */}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Box sx={{ position: 'relative', mr: 2 }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={50}
                thickness={4}
                sx={{
                  color:
                    theme.palette.mode === 'dark'
                      ? theme.palette.grey[700]
                      : theme.palette.grey[200],
                }}
              />
              <CircularProgress
                variant="determinate"
                value={progress}
                size={50}
                thickness={4}
                sx={{
                  color: progressColor,
                  position: 'absolute',
                  left: 0,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" component="div" fontWeight="bold">
                  {`${Math.round(progress)}%`}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="body2" fontWeight="medium">
                {t('projects.utilization')}:{' '}
                {(project.monthlyCapacity * 100).toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {project.isArchived
                  ? t('projects.archive')
                  : isActive
                    ? t('timer.title')
                    : ''}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>

      {/* アクションエリア */}
      <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
        {!project.isArchived && (
          <Tooltip title={isActive ? t('timer.stop') : t('timer.start')}>
            <IconButton
              color={isActive ? 'secondary' : 'primary'}
              onClick={() => onStartTimer(project)}
              sx={{
                ml: 1,
                ...(isActive && {
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)',
                    },
                    '70%': {
                      boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)',
                    },
                    '100%': {
                      boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)',
                    },
                  },
                }),
              }}
            >
              {isActive ? <StopIcon /> : <PlayArrowIcon />}
            </IconButton>
          </Tooltip>
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
    </Card>
  );
};
