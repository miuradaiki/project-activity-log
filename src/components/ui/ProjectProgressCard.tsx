import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  useTheme,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Slider,
  InputAdornment,
} from '@mui/material';
import {
  TimerOutlined as TimerIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  FlagCircle as _TargetIcon,
  InfoOutlined as InfoIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { Project } from '../../types';
import { useSettingsContext } from '../../contexts/SettingsContext';

interface ProjectProgressCardProps {
  project: Project;
  currentHours: number;
  targetHours: number;
  onStartTimer: (projectId: string) => void;
  onEditProject?: (project: Project) => void;
  onArchiveProject?: (project: Project) => void;
  onUnarchiveProject?: (project: Project) => void;
  onViewDetails?: (project: Project) => void;
  onUpdateTarget?: (project: Project, newMonthlyCapacity: number) => void;
}

/**
 * プロジェクトの進捗状況を視覚的に表示するカードコンポーネント
 */
export const ProjectProgressCard: React.FC<ProjectProgressCardProps> = ({
  project,
  currentHours,
  targetHours,
  onStartTimer,
  onEditProject,
  onArchiveProject,
  onUnarchiveProject,
  onViewDetails,
  onUpdateTarget,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const { settings } = useSettingsContext(); // 設定から基準時間を取得
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);
  const [newMonthlyCapacity, setNewMonthlyCapacity] = useState(
    project.monthlyCapacity * 100
  );

  // メニューの開閉
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // 目標時間調整ダイアログ
  const handleOpenTargetDialog = () => {
    setNewMonthlyCapacity(project.monthlyCapacity * 100);
    setTargetDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseTargetDialog = () => {
    setTargetDialogOpen(false);
  };

  const handleUpdateTarget = () => {
    if (onUpdateTarget) {
      onUpdateTarget(project, newMonthlyCapacity / 100);
    }
    handleCloseTargetDialog();
  };

  // 各アクションの処理
  const handleEdit = () => {
    if (onEditProject) {
      onEditProject(project);
    }
    handleMenuClose();
  };

  const handleArchive = () => {
    if (project.isArchived) {
      if (onUnarchiveProject) {
        onUnarchiveProject(project);
      }
    } else {
      if (onArchiveProject) {
        onArchiveProject(project);
      }
    }
    handleMenuClose();
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(project);
    }
    handleMenuClose();
  };

  // 進捗率の計算
  const progressPercentage =
    targetHours > 0
      ? Math.min(Math.round((currentHours / targetHours) * 100), 100)
      : 0;

  // 残り時間の計算
  const remainingHours = Math.max(targetHours - currentHours, 0);

  // 進捗状況に基づいて色とステータスを設定
  let statusColor = theme.palette.info.main;
  let statusText = t('projects.filter.active');

  if (progressPercentage >= 100) {
    statusColor = theme.palette.error.main;
    statusText = t('projects.filter.completed');
  } else if (progressPercentage >= 90) {
    statusColor = theme.palette.warning.main;
    statusText = t('projects.filter.warning');
  }

  // プログレスバーの色を設定
  const getProgressColor = () => {
    if (progressPercentage >= 100) return theme.palette.error.main;
    if (progressPercentage >= 90) return theme.palette.warning.main;
    return theme.palette.primary.main;
  };

  // 稼働率に基づく月間目標時間の計算
  const calculateMonthlyHours = (allocation: number) => {
    return (
      Math.round(
        (allocation / 100) * settings.workHours.baseMonthlyHours * 10
      ) / 10
    );
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[4],
          },
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          {/* ヘッダー部分 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                label={statusText}
                size="small"
                sx={{
                  backgroundColor: `${statusColor}20`,
                  color: statusColor,
                  fontWeight: 'medium',
                  mr: 1,
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {t('projects.utilization')}:{' '}
                {(project.monthlyCapacity * 100).toFixed(0)}%
              </Typography>
            </Box>
            <Box>
              <Tooltip title={t('timer.start')}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => onStartTimer(project.id)}
                >
                  <TimerIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('actions.search')}>
                <IconButton size="small" onClick={handleMenuOpen}>
                  <MoreIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* プロジェクト名 */}
          <Typography
            variant="h6"
            fontWeight="medium"
            gutterBottom
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {project.name}
          </Typography>

          {/* プロジェクト説明 */}
          {project.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                height: '2.5rem',
              }}
            >
              {project.description}
            </Typography>
          )}

          {/* 進捗インジケーター */}
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 0.5,
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                {t('dashboard.progress.title')}
              </Typography>
              <Typography
                variant="body2"
                fontWeight="medium"
                color={getProgressColor()}
              >
                {progressPercentage}%
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={Math.min(progressPercentage, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                mb: 1.5,
                backgroundColor:
                  theme.palette.mode === 'light'
                    ? theme.palette.grey[200]
                    : theme.palette.grey[700],
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getProgressColor(),
                  borderRadius: 4,
                  transition: 'transform 0.4s linear',
                },
              }}
            />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {currentHours.toFixed(1)} {t('units.hours')} /{' '}
                {targetHours.toFixed(1)} {t('units.hours')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('projects.sort.remaining')} {remainingHours.toFixed(1)}{' '}
                {t('units.hours')}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* アクションメニュー */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 200,
            borderRadius: '8px',
          },
        }}
      >
        <MenuItem onClick={handleEdit} disabled={!onEditProject}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('projects.edit')} />
        </MenuItem>

        <MenuItem
          onClick={handleArchive}
          disabled={!onArchiveProject && !onUnarchiveProject}
        >
          <ListItemIcon>
            {project.isArchived ? (
              <UnarchiveIcon fontSize="small" />
            ) : (
              <ArchiveIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText
            primary={
              project.isArchived
                ? t('projects.unarchive')
                : t('projects.archive')
            }
          />
        </MenuItem>

        <MenuItem onClick={handleOpenTargetDialog} disabled={!onUpdateTarget}>
          <ListItemIcon>
            <AccessTimeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('projects.monthly.target')} />
        </MenuItem>

        <MenuItem onClick={handleViewDetails} disabled={!onViewDetails}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('timer.description')} />
        </MenuItem>
      </Menu>

      {/* 月間目標時間調整ダイアログ */}
      <Dialog
        open={targetDialogOpen}
        onClose={handleCloseTargetDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('projects.monthly.target')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 4 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('projects.name')}: {project.name}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography id="monthly-capacity-slider" gutterBottom>
                {t('projects.utilization')}: {newMonthlyCapacity.toFixed(0)}%
              </Typography>
              <Slider
                value={newMonthlyCapacity}
                onChange={(_event, newValue) =>
                  setNewMonthlyCapacity(newValue as number)
                }
                aria-labelledby="monthly-capacity-slider"
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={100}
                sx={{ mt: 2, mb: 4 }}
              />

              <TextField
                label={t('projects.monthly.target')}
                type="number"
                value={calculateMonthlyHours(newMonthlyCapacity)}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      {t('units.hours')}
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                fullWidth
                size="small"
                helperText={`${t('projects.utilization')}${t('settings.monthly.hours.example', { hours: settings.workHours.baseMonthlyHours })}`}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTargetDialog}>
            {t('projects.cancel')}
          </Button>
          <Button onClick={handleUpdateTarget} variant="contained">
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
