import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  InfoOutlined as InfoIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { ProjectCardMenuProps } from './types';

export const ProjectCardMenu: React.FC<ProjectCardMenuProps> = ({
  anchorEl,
  project,
  onClose,
  onEdit,
  onArchive,
  onOpenTargetDialog,
  onViewDetails,
}) => {
  const { t } = useLanguage();

  const handleEdit = () => {
    onEdit?.();
    onClose();
  };

  const handleArchive = () => {
    onArchive?.();
    onClose();
  };

  const handleOpenTargetDialog = () => {
    onOpenTargetDialog?.();
    onClose();
  };

  const handleViewDetails = () => {
    onViewDetails?.();
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        elevation: 3,
        sx: {
          minWidth: 200,
          borderRadius: '8px',
        },
      }}
    >
      <MenuItem onClick={handleEdit} disabled={!onEdit}>
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary={t('projects.edit')} />
      </MenuItem>

      <MenuItem onClick={handleArchive} disabled={!onArchive}>
        <ListItemIcon>
          {project.isArchived ? (
            <UnarchiveIcon fontSize="small" />
          ) : (
            <ArchiveIcon fontSize="small" />
          )}
        </ListItemIcon>
        <ListItemText
          primary={
            project.isArchived ? t('projects.unarchive') : t('projects.archive')
          }
        />
      </MenuItem>

      <MenuItem onClick={handleOpenTargetDialog} disabled={!onOpenTargetDialog}>
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
  );
};
