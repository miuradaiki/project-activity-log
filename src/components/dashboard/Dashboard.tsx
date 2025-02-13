import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { Project, TimeEntry } from '../../types';
import { DailySummary } from './DailySummary';
import { WeeklySummary } from './WeeklySummary';
import { MonthlySummary } from './MonthlySummary';
import { projectColorManager } from '../../utils/colorUtils';

interface DashboardProps {
  projects: Project[];
  timeEntries: TimeEntry[];
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, timeEntries }) => {
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
    <Box sx={{ flexGrow: 1, p: 2 }}>
      {/* 日次サマリー */}
      <Box sx={{ mb: 4 }}>
        <DailySummary projects={projects} timeEntries={timeEntries} />
      </Box>

      {/* 週次サマリーと月次サマリー */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
        gap: 4 
      }}>
        <Box>
          <WeeklySummary projects={projects} timeEntries={timeEntries} />
        </Box>
        <Box>
          <MonthlySummary projects={projects} timeEntries={timeEntries} />
        </Box>
      </Box>
    </Box>
  );
};