// src/components/dashboard/WeeklySummary.tsx

import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Box,
  Typography,
  IconButton,
  ButtonGroup,
  Button,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { Project, TimeEntry } from '../../types';
import {
  getWeeklyDistribution,
  getProjectDistribution,
} from '../../utils/analytics';
import { projectColorManager } from '../../utils/colorUtils';

interface WeeklySummaryProps {
  projects: Project[];
  timeEntries: TimeEntry[];
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({
  projects,
  timeEntries,
}) => {
  const { t, language } = useLanguage();
  const [weekOffset, setWeekOffset] = useState(0);

  const getStartOfWeek = (offset: number = 0) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff + offset * 7);
    return monday;
  };

  const startOfWeek = getStartOfWeek(weekOffset);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const isEnglish = language === 'en';
  const weeklyData = getWeeklyDistribution(
    timeEntries,
    projects,
    startOfWeek,
    isEnglish
  );
  const projectDistribution = getProjectDistribution(
    timeEntries,
    projects,
    startOfWeek,
    endOfWeek
  ).sort((a, b) => b.hours - a.hours);

  // 週の移動ハンドラー
  const handlePrevWeek = () => setWeekOffset((prev) => prev - 1);
  const handleNextWeek = () => setWeekOffset((prev) => prev + 1);
  const handleCurrentWeek = () => setWeekOffset(0);

  // 週の表示文字列を生成
  const formatWeekDisplay = (start: Date, end: Date) => {
    // 言語に応じて表示形式を切り替え
    if (isEnglish) {
      // 英語形式: "Mar 3, 2025 - Mar 9, 2025"
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };

      return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    } else {
      // 日本語形式: "2025年3月3日 〜 3月9日"
      return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 〜 ${
        end.getMonth() + 1
      }月${end.getDate()}日`;
    }
  };

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; color: string; dataKey: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      const totalHours = payload.reduce(
        (sum: number, item: { value?: number }) => sum + (item.value || 0),
        0
      );

      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {isEnglish ? label : `${label}曜日`}
          </Typography>
          {payload.map(
            (item: { value?: number; color: string; dataKey: string }, index: number) =>
              item.value > 0 && (
                <Box key={index} sx={{ mt: 0.5 }}>
                  <Typography variant="body2" sx={{ color: item.color }}>
                    {item.name}: {item.value.toFixed(1)} {t('units.hours')}
                  </Typography>
                </Box>
              )
          )}
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              pt: 1,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            {t('dashboard.daily.total')}: {totalHours.toFixed(1)}{' '}
            {t('units.hours')}
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
          mb: 2,
        }}
      >
        <Typography variant="h6">{t('dashboard.weekly.title')}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ButtonGroup
            size="small"
            aria-label={isEnglish ? 'Week navigation' : '週の移動'}
          >
            <IconButton onClick={handlePrevWeek}>
              <ChevronLeftIcon />
            </IconButton>
            <Button
              onClick={handleCurrentWeek}
              variant={weekOffset === 0 ? 'contained' : 'outlined'}
            >
              {t('time.this.week')}
            </Button>
            <IconButton onClick={handleNextWeek}>
              <ChevronRightIcon />
            </IconButton>
          </ButtonGroup>
        </Box>
      </Box>

      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {formatWeekDisplay(startOfWeek, endOfWeek)}
      </Typography>

      {/* 日別作業時間グラフ（プロジェクト別に積み上げ） */}
      <Box sx={{ width: '100%', height: 300, mb: 4 }}>
        <ResponsiveContainer>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis unit="h" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {projects
              .filter((project) => !project.isArchived)
              .map((project) => (
                <Bar
                  key={project.id}
                  dataKey={project.name}
                  stackId="a"
                  fill={projectColorManager.getColorById(project.id)}
                />
              ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* プロジェクト別作業時間の円グラフ */}
      <Typography variant="subtitle1" gutterBottom>
        {t('dashboard.weekly.byproject')}
      </Typography>
      {projectDistribution.length > 0 ? (
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={projectDistribution}
                dataKey="hours"
                nameKey="projectName"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={2}
              >
                {projectDistribution.map((entry) => {
                  const project = projects.find(
                    (p) => p.name === entry.projectName
                  );
                  return (
                    <Cell
                      key={entry.projectName}
                      fill={
                        project
                          ? projectColorManager.getColorById(project.id)
                          : '#CCCCCC'
                      }
                    />
                  );
                })}
              </Pie>
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value, entry: { payload: { hours: number } }) => {
                  const { payload } = entry;
                  return `${value} (${payload.hours.toFixed(1)}h)`;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {t('timer.no.entries')}
        </Typography>
      )}
    </Box>
  );
};
