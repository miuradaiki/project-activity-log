import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Grid, Typography, Box } from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { Project, TimeEntry } from '../../types';
import {
  getDailyWorkHours,
  getLongestWorkSession,
  getAverageWorkSession,
} from '../../utils/analytics';
import { KPICard } from '../ui/KPICard';

interface DailySummaryProps {
  projects: Project[];
  timeEntries: TimeEntry[];
}

export const DailySummary: React.FC<DailySummaryProps> = ({
  projects: _projects,
  timeEntries,
}) => {
  const { t } = useLanguage();
  const today = new Date();

  // 昨日の日付を計算
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // 本日と昨日の作業時間を計算
  const totalHoursToday = getDailyWorkHours(timeEntries, today);
  const totalHoursYesterday = getDailyWorkHours(timeEntries, yesterday);

  // 前日比の計算（パーセント）
  const hoursTrend =
    totalHoursYesterday > 0
      ? Math.round(
          ((totalHoursToday - totalHoursYesterday) / totalHoursYesterday) * 100
        )
      : 0;

  // 最も長い作業時間を計算
  const longestWorkTime = getLongestWorkSession(timeEntries, today);

  // 昨日の最も長い作業時間を計算
  const longestWorkTimeYesterday = getLongestWorkSession(
    timeEntries,
    yesterday
  );

  // 最長作業時間の前日比
  const longestTimeTrend =
    longestWorkTimeYesterday > 0
      ? Math.round(
          ((longestWorkTime - longestWorkTimeYesterday) /
            longestWorkTimeYesterday) *
            100
        )
      : 0;

  // 平均作業時間を計算
  const averageWorkTime = getAverageWorkSession(timeEntries, today);

  // 昨日の平均作業時間を計算
  const averageWorkTimeYesterday = getAverageWorkSession(
    timeEntries,
    yesterday
  );

  // 平均作業時間の前日比
  const averageTimeTrend =
    averageWorkTimeYesterday > 0
      ? Math.round(
          ((averageWorkTime - averageWorkTimeYesterday) /
            averageWorkTimeYesterday) *
            100
        )
      : 0;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        {t('dashboard.daily.title')}
      </Typography>
      <Grid container spacing={3}>
        {/* 合計作業時間 */}
        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
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

        {/* 最も長い作業時間 */}
        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <KPICard
            title={t('dashboard.daily.longest')}
            value={`${longestWorkTime} ${t('units.minutes')}`}
            icon={<TrendingUpIcon />}
            trend={{
              value: longestTimeTrend,
              label: t('time.yesterday'),
            }}
            color="#8B5CF6" // パープル
          />
        </Grid>

        {/* 平均作業時間 */}
        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <KPICard
            title={t('dashboard.daily.average')}
            value={`${averageWorkTime} ${t('units.minutes')}`}
            icon={<StarIcon />}
            trend={{
              value: averageTimeTrend,
              label: t('time.yesterday'),
            }}
            color="#F59E0B" // アンバー
          />
        </Grid>
      </Grid>
    </Box>
  );
};
