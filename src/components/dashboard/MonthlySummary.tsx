import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Project, TimeEntry } from '../../types';
import { getMonthlyDistribution, getProjectDistribution } from '../../utils/analytics';

interface MonthlySummaryProps {
  projects: Project[];
  timeEntries: TimeEntry[];
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({ projects, timeEntries }) => {
  const { t, language } = useLanguage();
  const [selectedMonth, setSelectedMonth] = React.useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = React.useState(() => new Date().getFullYear());

  const isEnglish = language === 'en';
  const monthlyData = getMonthlyDistribution(timeEntries, selectedYear, selectedMonth);
  
  const startOfMonth = new Date(selectedYear, selectedMonth, 1);
  const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
  const projectDistribution = getProjectDistribution(timeEntries, projects, startOfMonth, endOfMonth);

  // 合計作業時間を計算
  const totalHours = projectDistribution.reduce((sum, item) => sum + item.hours, 0);

  // 年の選択肢を生成（現在年から2年前まで）
  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

  // 月の選択肢を生成
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: isEnglish ? `Month ${i + 1}` : `${i + 1}月`
  }));

  // 英語の月名（フルスペル）
  const englishMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {t('dashboard.monthly.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>{isEnglish ? 'Year' : '年'}</InputLabel>
            <Select
              value={selectedYear}
              label={isEnglish ? 'Year' : '年'}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map(year => (
                <MenuItem key={year} value={year}>
                  {year}{isEnglish ? '' : '年'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{isEnglish ? 'Month' : '月'}</InputLabel>
            <Select
              value={selectedMonth}
              label={isEnglish ? 'Month' : '月'}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {months.map((month, index) => (
                <MenuItem key={month.value} value={month.value}>
                  {isEnglish ? englishMonthNames[index] : month.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        {t('dashboard.monthly.total')}: {totalHours.toFixed(1)} {t('units.hours')}
      </Typography>

      {/* 週別作業時間の推移グラフ */}
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="week" 
              label={{ value: isEnglish ? 'Week' : '週', position: 'insideBottom', offset: -5 }}
            />
            <YAxis unit="h" />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(1)} ${t('units.hours')}`, t('timer.title')]}
              labelFormatter={(week) => isEnglish ? `Week ${week}` : `第${week}週`}
            />
            <Line 
              type="monotone" 
              dataKey="hours" 
              stroke="#8884d8" 
              name={t('timer.title')}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};