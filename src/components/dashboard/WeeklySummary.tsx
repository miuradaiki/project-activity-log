import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { Project, TimeEntry } from '../../types';
import { getWeeklyDistribution, getProjectDistribution } from '../../utils/analytics';

interface WeeklySummaryProps {
  projects: Project[];
  timeEntries: TimeEntry[];
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({ projects, timeEntries }) => {
  // 今日を含む週の開始日（月曜日）を取得
  const getStartOfWeek = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const day = now.getDay();
    // 日曜日は0なので、月曜日を基準にした調整が必要
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    return monday;
  };

  const startOfWeek = getStartOfWeek();
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const weeklyData = getWeeklyDistribution(timeEntries, startOfWeek);
  const projectDistribution = getProjectDistribution(timeEntries, projects, startOfWeek, endOfWeek)
    .sort((a, b) => b.hours - a.hours); // 時間の降順でソート

  // 円グラフの色
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ 
          bgcolor: 'background.paper', 
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {payload[0].payload.projectName || payload[0].name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {payload[0].value.toFixed(1)}時間
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        週間サマリー
      </Typography>

      {/* 日別作業時間グラフ */}
      <Box sx={{ width: '100%', height: 300, mb: 4 }}>
        <ResponsiveContainer>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis unit="h" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="hours" fill="#8884d8" name="作業時間" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* プロジェクト別作業時間の円グラフ */}
      <Typography variant="subtitle1" gutterBottom>
        プロジェクト別作業時間
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
                {projectDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value, entry: any) => {
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
          この期間の作業記録はありません
        </Typography>
      )}
      
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="caption" component="div">
          集計期間: {startOfWeek.toLocaleDateString()} 〜 {endOfWeek.toLocaleDateString()}
        </Typography>
      </Box>
    </Box>
  );
};