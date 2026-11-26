import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  ButtonBase,
  Divider,
  InputBase,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  ChevronRight as ChevronIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { Project, TimeEntry } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { PageHeader } from '../ui/PageHeader';
import { GraphiteCard } from '../ui/graphite/GraphiteCard';
import { SegmentedControl } from '../ui/graphite/SegmentedControl';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';
import { ProjectTableRow, PROJECT_GRID_COLUMNS } from './ProjectTableRow';
import {
  buildProjectRows,
  countByFilter,
  filterProjectRows,
  ProjectFilter,
  ProjectSort,
  sortProjectRows,
} from './project-table-rows';

interface ProjectsViewProps {
  projects: Project[];
  timeEntries: TimeEntry[];
  activeProjectId: string | null;
  baseMonthlyHours: number;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onArchiveProject: (project: Project) => void;
  onUnarchiveProject: (project: Project) => void;
  onStartTimer: (project: Project) => void;
  onAddProject: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  timeEntries,
  activeProjectId,
  baseMonthlyHours,
  onEditProject,
  onDeleteProject,
  onArchiveProject,
  onUnarchiveProject,
  onStartTimer,
  onAddProject,
}) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const [sort, setSort] = useState<ProjectSort>('progress');
  const [query, setQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [menu, setMenu] = useState<{
    anchor: HTMLElement;
    project: Project;
  } | null>(null);
  const [toDelete, setToDelete] = useState<Project | null>(null);

  const rows = useMemo(
    () => buildProjectRows(projects, timeEntries, baseMonthlyHours),
    [projects, timeEntries, baseMonthlyHours]
  );
  const counts = countByFilter(rows.active);
  const visible = sortProjectRows(
    filterProjectRows(rows.active, filter, query),
    sort
  );
  const archived = sortProjectRows(
    filterProjectRows(rows.archived, 'all', query),
    'name'
  );
  const allocated = Math.round(
    rows.active.reduce((sum, r) => sum + r.project.monthlyCapacity, 0) * 100
  );

  const runMenu = (action: (project: Project) => void) => () => {
    if (menu) action(menu.project);
    setMenu(null);
  };

  const renderRow = (row: (typeof visible)[number]) => (
    <ProjectTableRow
      key={row.project.id}
      row={row}
      isRunning={row.project.id === activeProjectId}
      onToggle={() => onStartTimer(row.project)}
      onOpenMenu={(anchor) => setMenu({ anchor, project: row.project })}
    />
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <PageHeader
        title={t('nav.projects')}
        subtitle={t('projects.subtitle', {
          count: rows.active.length,
          base: baseMonthlyHours,
          percent: allocated,
        })}
        action={
          <>
            <Box
              sx={(theme) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: 220,
                height: 34,
                px: 1.5,
                borderRadius: 2.25,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
              })}
            >
              <SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              <InputBase
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('actions.search')}
                inputProps={{ 'aria-label': t('projects.search') }}
                sx={{ fontSize: 13, flex: 1 }}
              />
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddProject}
            >
              {t('projects.new')}
            </Button>
          </>
        }
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <SegmentedControl
          ariaLabel={t('projects.filter.all')}
          value={filter}
          onChange={setFilter}
          options={[
            {
              value: 'all',
              label: t('projects.filter.all'),
              count: counts.all,
            },
            {
              value: 'active',
              label: t('projects.filter.active'),
              count: counts.active,
            },
            {
              value: 'over',
              label: t('projects.filter.completed'),
              count: counts.over,
            },
            {
              value: 'tracking',
              label: t('projects.filter.tracking'),
              count: counts.tracking,
            },
          ]}
        />
        <SegmentedControl
          ariaLabel={t('projects.sort.progress')}
          value={sort}
          onChange={setSort}
          options={[
            { value: 'progress', label: t('projects.sort.progress') },
            { value: 'remaining', label: t('projects.sort.remaining') },
            { value: 'name', label: t('projects.sort.name') },
          ]}
        />
      </Box>

      <GraphiteCard padding={0} sx={{ overflow: 'hidden' }}>
        <Box
          aria-hidden
          sx={{
            display: { xs: 'none', md: 'grid' },
            gridTemplateColumns: PROJECT_GRID_COLUMNS,
            gap: 2,
            px: 2.75,
            height: 38,
            alignItems: 'center',
            fontSize: 11.5,
            color: 'text.disabled',
            '& > :nth-of-type(n+4)': { textAlign: 'right' },
          }}
        >
          <span />
          <span>{t('projects.col.project')}</span>
          <span>{t('projects.col.progress')}</span>
          <span>{t('projects.col.hours')}</span>
          <span>{t('projects.col.remaining')}</span>
          <span />
        </Box>
        {visible.map(renderRow)}
        {visible.length === 0 && (
          <Box
            sx={{
              px: 2.75,
              py: 4,
              borderTop: 1,
              borderColor: 'divider',
              color: 'text.secondary',
              fontSize: 13,
            }}
          >
            {t('projects.empty')}
          </Box>
        )}
        {archived.length > 0 && (
          <>
            <ButtonBase
              onClick={() => setShowArchived((v) => !v)}
              aria-expanded={showArchived}
              sx={{
                width: '100%',
                justifyContent: 'flex-start',
                gap: 0.5,
                px: 2.25,
                py: 1.75,
                borderTop: 1,
                borderColor: 'divider',
                fontSize: 12.5,
                color: 'text.disabled',
              }}
            >
              <ChevronIcon
                sx={{
                  fontSize: 18,
                  transform: showArchived ? 'rotate(90deg)' : 'none',
                  transition: 'transform .15s',
                }}
              />
              {t('projects.archived.count', { count: archived.length })}
            </ButtonBase>
            {showArchived && (
              <Box sx={{ opacity: 0.7 }}>{archived.map(renderRow)}</Box>
            )}
          </>
        )}
      </GraphiteCard>

      <Menu anchorEl={menu?.anchor} open={!!menu} onClose={() => setMenu(null)}>
        <MenuItem onClick={runMenu(onEditProject)}>
          {t('actions.edit')}
        </MenuItem>
        {menu?.project.isArchived ? (
          <MenuItem onClick={runMenu(onUnarchiveProject)}>
            {t('projects.unarchive')}
          </MenuItem>
        ) : (
          <MenuItem onClick={runMenu(onArchiveProject)}>
            {t('projects.archive')}
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={runMenu(setToDelete)} sx={{ color: 'error.main' }}>
          {t('projects.delete.ellipsis')}
        </MenuItem>
      </Menu>

      <DeleteConfirmDialog
        open={!!toDelete}
        title={t('projects.delete.confirm')}
        message={`${toDelete?.name ?? ''}\n${t('projects.delete.warning')}`}
        onConfirm={() => {
          if (toDelete) onDeleteProject(toDelete);
          setToDelete(null);
        }}
        onCancel={() => setToDelete(null)}
      />
    </Box>
  );
};
