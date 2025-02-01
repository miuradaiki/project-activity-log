import React from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Project, TimeEntry } from '../../types';
import { getMonthlyDistribution, getProjectDistribution } from '../../utils/analytics';

interface MonthlySummaryProps {
  projects: Project[];
  timeEntries: TimeEntry[];
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({ projects, timeEntries }) => {
  const [selectedMonth, setSelectedMonth] = React.useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = React.useState(() => new Date().getFullYear());

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
    label: `${i + 1}月`
  }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          月間サマリー
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>年</InputLabel>
            <Select
              value={selectedYear}
              label="年"
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map(year => (
                <MenuItem key={year} value={year}>{year}年</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>月</InputLabel>
            <Select
              value={selectedMonth}
              label="月"
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {months.map(month => (
                <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        月間合計作業時間: {totalHours.toFixed(1)}時間
      </Typography>

      {/* 週別作業時間の推移グラフ */}
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="week" 
              label={{ value: '週', position: 'insideBottom', offset: -5 }}
            />
            <YAxis unit="h" />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(1)}時間`, '作業時間']}
              labelFormatter={(week) => `第${week}週`}
            />
            <Line 
              type="monotone" 
              dataKey="hours" 
              stroke="#8884d8" 
              name="作業時間"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};