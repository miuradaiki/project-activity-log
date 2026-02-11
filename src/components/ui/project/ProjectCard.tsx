import React from 'react';
import {
  CardContent,
  Typography,
  Box,
  IconButton,
  Divider,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { GlassCard, StatusBadge } from '../modern/StyledComponents';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Project } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useProjectCardState } from './hooks/useProjectCardState';
import { ProjectProgressSection } from './ProjectProgressSection';
import { ProjectCardActions } from './ProjectCardActions';

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

  const {
    anchorEl,
    animatedProgress,
    progress,
    progressColor,
    statusInfo,
    isTrackingOnly,
    handleMenuClick,
    handleMenuClose,
  } = useProjectCardState({
    project,
    isActive,
    monthlyTime,
    monthlyTarget,
  });

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
        {/* Progress indicator bar */}
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
          {/* Header */}
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
              data-testid="project-more-button"
              size="small"
              onClick={handleMenuClick}
              sx={{ mt: -0.5, mr: -0.5 }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Status badge */}
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

          {/* Description */}
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

          {/* Progress section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <ProjectProgressSection
              project={project}
              isActive={isActive}
              monthlyTime={monthlyTime}
              monthlyTarget={monthlyTarget}
              progress={progress}
              animatedProgress={animatedProgress}
              progressColor={progressColor}
              isTrackingOnly={isTrackingOnly}
            />
          </motion.div>
        </CardContent>

        {/* Actions */}
        <ProjectCardActions
          project={project}
          isActive={isActive}
          anchorEl={anchorEl}
          onStartTimer={onStartTimer}
          onEditProject={onEditProject}
          onArchiveProject={onArchiveProject}
          onUnarchiveProject={onUnarchiveProject}
          onDeleteProject={onDeleteProject}
          onMenuClose={handleMenuClose}
        />
      </GlassCard>
    </motion.div>
  );
};
