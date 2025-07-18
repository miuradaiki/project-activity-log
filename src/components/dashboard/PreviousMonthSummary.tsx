import React, { useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Box, Typography, useTheme } from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Project, TimeEntry } from '../../types';
import { getPreviousMonthProjectDistribution } from '../../utils/analytics';
import { projectColorManager } from '../../utils/colorUtils';

interface PreviousMonthSummaryProps {
  projects: Project[];
  timeEntries: TimeEntry[];
}

export const PreviousMonthSummary: React.FC<PreviousMonthSummaryProps> = ({
  projects,
  timeEntries,
}) => {
  const { t, language } = useLanguage();
  const theme = useTheme();
  const isEnglish = language === 'en';

  // 先月の日付を計算（表示用）
  const prevMonth = useMemo(() => {
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const monthNames = {
      en: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
      ja: [
        '1月',
        '2月',
        '3月',
        '4月',
        '5月',
        '6月',
        '7月',
        '8月',
        '9月',
        '10月',
        '11月',
        '12月',
      ],
    };

    const year = prevMonth.getFullYear();
    const month = prevMonth.getMonth();

    return {
      year,
      month,
      display: isEnglish
        ? `${monthNames.en[month]} ${year}`
        : `${year}年${monthNames.ja[month]}`,
    };
  }, [isEnglish]);

  // 先月のプロジェクト稼働データを取得
  const projectData = useMemo(() => {
    const data = getPreviousMonthProjectDistribution(timeEntries, projects);
    // 0時間のプロジェクトはフィルタリング
    return data.filter((item) => item.hours > 0);
  }, [timeEntries, projects]);

  // 合計時間を計算
  const totalHours = useMemo(() => {
    return projectData.reduce((sum, item) => sum + item.hours, 0);
  }, [projectData]);

  // プロジェクトごとのパーセンテージを計算
  const chartData = useMemo(() => {
    return projectData.map((item) => ({
      name: item.projectName,
      value: item.hours,
      percentage:
        totalHours > 0 ? Math.round((item.hours / totalHours) * 100) : 0,
    }));
  }, [projectData, totalHours]);

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { name: string; color: string } }> }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            p: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            boxShadow: theme.shadows[2],
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {payload[0].name}
          </Typography>
          <Typography variant="body2">
            {payload[0].value.toFixed(1)} {t('units.hours')} (
            {payload[0].payload.percentage}%)
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6">
          {isEnglish ? 'Previous Month Activity' : '先月の稼働状況'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {prevMonth.display}
        </Typography>
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        {isEnglish ? 'Total Hours:' : '合計時間:'} {totalHours.toFixed(1)}{' '}
        {t('units.hours')}
      </Typography>

      {projectData.length > 0 ? (
        <Box sx={{ width: '100%', height: 300, mt: 2 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                dataKey="value"
                nameKey="name"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={projectColorManager.getColorByName(
                      entry.name,
                      projects
                    )}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: theme.palette.text.primary }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 200,
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: 2,
            mt: 3,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            {isEnglish
              ? 'No activity data for the previous month'
              : '先月の稼働データがありません'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
