import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Grid, Typography, Box } from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { Project, TimeEntry } from '../../types';
import { getDailyWorkHours, getMostActiveProject } from '../../utils/analytics';
import { KPICard } from '../ui/KPICard';

interface DailySummaryProps {
  projects: Project[];
  timeEntries: TimeEntry[];
}

export const DailySummary: React.FC<DailySummaryProps> = ({ projects, timeEntries }) => {
  const { t } = useLanguage();
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));

  // 昨日の日付を計算
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0));
  const yesterdayEnd = new Date(yesterday.setHours(23, 59, 59, 999));

  // 本日と昨日の作業時間を計算
  const totalHoursToday = getDailyWorkHours(timeEntries, today);
  const totalHoursYesterday = getDailyWorkHours(timeEntries, yesterday);

  // 前日比の計算（パーセント）
  const hoursTrend = totalHoursYesterday > 0
    ? Math.round(((totalHoursToday - totalHoursYesterday) / totalHoursYesterday) * 100)
    : 0;

  const mostActive = getMostActiveProject(timeEntries, projects, todayStart, todayEnd);

  const todayEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    return entryDate >= todayStart && entryDate <= todayEnd;
  });

  // 昨日のアクティブプロジェクト数
  const yesterdayEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    return entryDate >= yesterdayStart && entryDate <= yesterdayEnd;
  });

  const activeProjects = new Set(todayEntries.map(entry => entry.projectId)).size;
  const activeProjectsYesterday = new Set(yesterdayEntries.map(entry => entry.projectId)).size;

  // プロジェクト数の前日比
  const projectsTrend = activeProjectsYesterday > 0
    ? Math.round(((activeProjects - activeProjectsYesterday) / activeProjectsYesterday) * 100)
    : 0;

  // プロジェクト作業割合の計算（totalHoursToday が 0 の場合のエラー防止）
  const projectPercentage = totalHoursToday > 0
    ? Math.round((mostActive.hours / totalHoursToday) * 100)
    : 0;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        {t('dashboard.daily.title')}
      </Typography>
      <Grid container spacing={3}>
        {/* 合計作業時間 */}
        <Grid item xs={12} md={4}>
          <KPICard
            title={t('dashboard.daily.total')}
            value={`${totalHoursToday.toFixed(1)} ${t('units.hours')}`}
            icon={<AccessTimeIcon />}
            trend={{
              value: hoursTrend,
              label: t('time.yesterday'),
            }}
          />
        </Grid>

        {/* 作業したプロジェクト数 */}
        <Grid item xs={12} md={4}>
          <KPICard
            title={t('dashboard.daily.projects')}
            value={`${activeProjects}`}
            icon={<AssignmentIcon />}
            trend={{
              value: projectsTrend,
              label: t('time.yesterday'),
            }}
            color="#8B5CF6" // パープル
          />
        </Grid>

        {/* 最も作業したプロジェクト */}
        <Grid item xs={12} md={4}>
          <KPICard
            title={t('dashboard.daily.most')}
            value={mostActive.projectName || '-'}
            icon={<StarIcon />}
            trend={{
              value: projectPercentage,
              label: t('dashboard.weekly.byproject'),
            }}
            color="#F59E0B" // アンバー
          />
        </Grid>
      </Grid>
    </Box>
  );
};
