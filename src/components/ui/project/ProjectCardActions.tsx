import React from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Project } from '../../../types';

interface ProjectCardActionsProps {
  project: Project;
  isActive: boolean;
  anchorEl: HTMLElement | null;
  onStartTimer: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onArchiveProject?: (project: Project) => void;
  onUnarchiveProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
  onMenuClose: () => void;
}

export const ProjectCardActions: React.FC<ProjectCardActionsProps> = ({
  project,
  isActive,
  anchorEl,
  onStartTimer,
  onEditProject,
  onArchiveProject,
  onUnarchiveProject,
  onDeleteProject,
  onMenuClose,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();

  return (
    <>
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
                data-testid="project-play-button"
                aria-label={
                  isActive ? t('aria.timer.stop') : t('aria.timer.start')
                }
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
                        marginLeft: '2px',
                      }}
                    />
                  )}
                </motion.div>
              </IconButton>
            </Tooltip>
          </motion.div>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={() => {
            onEditProject(project);
            onMenuClose();
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          {t('actions.edit')}
        </MenuItem>

        {!project.isArchived && onArchiveProject && (
          <MenuItem
            onClick={() => {
              onArchiveProject(project);
              onMenuClose();
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
              onMenuClose();
            }}
          >
            <UnarchiveIcon fontSize="small" sx={{ mr: 1 }} />
            {t('projects.unarchive')}
          </MenuItem>
        )}

        {onDeleteProject && (
          <MenuItem
            onClick={() => {
              onMenuClose();
              onDeleteProject(project);
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            {t('projects.delete')}
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
