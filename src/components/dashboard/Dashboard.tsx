import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, useTheme, useMediaQuery } from '@mui/material';
import { Project, TimeEntry } from '../../types';
import { MonthlyProgressSummary } from './MonthlyProgressSummary';
import { ActivityHeatmap } from './ActivityHeatmap';
import { WeeklySummary } from './WeeklySummary';
import { MonthlySummary } from './MonthlySummary';
import { ProjectProgressView } from './ProjectProgressView';
import { projectColorManager } from '../../utils/colorUtils';

interface DashboardProps {
  projects: Project[];
  timeEntries: TimeEntry[];
  onStartTimer: (projectId: string) => void;
  onEditProject?: (project: Project) => void;
  onArchiveProject?: (project: Project) => void;
  onUnarchiveProject?: (project: Project) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  timeEntries,
  onStartTimer,
  onEditProject,
  onArchiveProject,
  onUnarchiveProject,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // 将来のレスポンシブ対応のために保持
  void isMobile;
  const [isColorInitialized, setIsColorInitialized] = useState(false);

  // プロジェクトの色を初期化
  useEffect(() => {
    projectColorManager.initializeColors(projects);
    setIsColorInitialized(true);
  }, [projects]);

  if (!isColorInitialized) {
    return null; // 色の初期化が完了するまでレンダリングを待機
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: { xs: 2, md: 3 },
        backgroundColor:
          theme.palette.mode === 'light'
            ? theme.palette.grey[50]
            : theme.palette.background.default,
      }}
    >
      {/* 月間進捗サマリー */}
      <Box sx={{ mb: 3 }}>
        <MonthlyProgressSummary projects={projects} timeEntries={timeEntries} />
      </Box>
      {/* 活動ヒートマップ */}
      <Box sx={{ mb: 3 }}>
        <ActivityHeatmap timeEntries={timeEntries} />
      </Box>
      {/* ウィジェット領域 */}
      <Grid container spacing={3}>
        {/* 週次サマリー */}
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <Paper
            elevation={1}
            sx={{
              p: 3,
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <WeeklySummary projects={projects} timeEntries={timeEntries} />
          </Paper>
        </Grid>

        {/* 月次サマリー */}
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <Paper
            elevation={1}
            sx={{
              p: 3,
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <MonthlySummary projects={projects} timeEntries={timeEntries} />
          </Paper>
        </Grid>

        {/* プロジェクト進捗カード */}
        <Grid
          size={{
            xs: 12,
            lg: 12,
          }}
        >
          <Paper
            elevation={1}
            sx={{
              p: 3,
              transition: 'box-shadow 0.2s',
              '&:hover': {
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <ProjectProgressView
              projects={projects}
              timeEntries={timeEntries}
              onStartTimer={onStartTimer}
              onEditProject={onEditProject}
              onArchiveProject={onArchiveProject}
              onUnarchiveProject={onUnarchiveProject}
              onUpdateTarget={(project, newMonthlyCapacity) => {
                // 稼働率を更新
                const updatedProject = {
                  ...project,
                  monthlyCapacity: newMonthlyCapacity,
                  updatedAt: new Date().toISOString(),
                };
                // App.tsxのsetProjectsを直接使えないため、onEditProjectを使用
                if (onEditProject) {
                  onEditProject(updatedProject);
                }
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
