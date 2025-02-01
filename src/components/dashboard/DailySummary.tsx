import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { 
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { Project, TimeEntry } from '../../types';
import { getDailyWorkHours, getMostActiveProject } from '../../utils/analytics';

interface DailySummaryProps {
  projects: Project[];
  timeEntries: TimeEntry[];
}

export const DailySummary: React.FC<DailySummaryProps> = ({ projects, timeEntries }) => {
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));

  const totalHours = getDailyWorkHours(timeEntries, today);
  const mostActive = getMostActiveProject(timeEntries, projects, todayStart, todayEnd);

  const todayEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    return entryDate >= todayStart && entryDate <= todayEnd;
  });

  const activeProjects = new Set(todayEntries.map(entry => entry.projectId)).size;

  const StatBox = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box sx={{ mr: 2, color: 'primary.main' }}>{icon}</Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h6">
          {value}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        本日の集計
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <StatBox
            icon={<AccessTimeIcon />}
            label="合計作業時間"
            value={`${totalHours.toFixed(1)}時間`}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatBox
            icon={<AssignmentIcon />}
            label="作業したプロジェクト数"
            value={`${activeProjects}個`}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatBox
            icon={<StarIcon />}
            label="最も作業したプロジェクト"
            value={`${mostActive.projectName} (${mostActive.hours.toFixed(1)}時間)`}
          />
        </Grid>
      </Grid>
    </Box>
  );
};