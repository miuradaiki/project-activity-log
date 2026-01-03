import React from 'react';
import { Project } from '../../../../types';

export interface ProjectProgressCardProps {
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

export interface ProjectProgress {
  isTrackingOnly: boolean;
  progressPercentage: number;
  remainingHours: number;
  statusColor: string;
  statusText: string;
  progressColor: string;
}

export interface ProjectCardMenuProps {
  anchorEl: HTMLElement | null;
  project: Project;
  onClose: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
  onOpenTargetDialog?: () => void;
  onViewDetails?: () => void;
}

export interface ProjectTargetDialogProps {
  open: boolean;
  project: Project;
  baseMonthlyHours: number;
  onClose: () => void;
  onSave: (newMonthlyCapacity: number) => void;
}

export interface ProjectCardHeaderProps {
  statusText: string;
  statusColor: string;
  monthlyCapacity: number;
  projectId: string;
  onStartTimer: (projectId: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface ProjectCardProgressProps {
  isTrackingOnly: boolean;
  currentHours: number;
  targetHours: number;
  progressPercentage: number;
  progressColor: string;
  remainingHours: number;
}
