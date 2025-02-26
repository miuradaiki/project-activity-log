import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, useTheme, useMediaQuery } from '@mui/material';
import { Project, TimeEntry } from '../../types';
import { DailySummary } from './DailySummary';
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
    <Box sx={{ 
      flexGrow: 1, 
      p: { xs: 2, md: 3 },
      backgroundColor: theme.palette.mode === 'light' 
        ? theme.palette.grey[50] 
        : theme.palette.background.default
    }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="medium">
          ダッシュボード
        </Typography>
        <Typography variant="body2" color="text.secondary">
          作業状況の概要と分析
        </Typography>
      </Box>

      {/* 日次サマリー */}
      <Box sx={{ mb: 4 }}>
        <DailySummary projects={projects} timeEntries={timeEntries} />
      </Box>

      {/* ウィジェット領域 */}
      <Grid container spacing={3}>
        {/* 週次サマリー */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
              }
            }}
          >
            <WeeklySummary projects={projects} timeEntries={timeEntries} />
          </Paper>
        </Grid>

        {/* 月次サマリー */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
              }
            }}
          >
            <MonthlySummary projects={projects} timeEntries={timeEntries} />
          </Paper>
        </Grid>

        {/* プロジェクト進捗カード */}
        <Grid item xs={12}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3,
              transition: 'box-shadow 0.2s',
              '&:hover': {
                boxShadow: theme.shadows[4],
              }
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
                  updatedAt: new Date().toISOString()
                };
                const updatedProjects = projects.map(p => 
                  p.id === project.id ? updatedProject : p
                );
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