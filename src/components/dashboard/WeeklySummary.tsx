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
  // 今週の開始日を取得
  const getStartOfWeek = () => {
    const now = new Date();
    const day = now.getDay();
    return new Date(now.setDate(now.getDate() - day));
  };

  const startOfWeek = getStartOfWeek();
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  const weeklyData = getWeeklyDistribution(timeEntries, startOfWeek);
  const projectDistribution = getProjectDistribution(timeEntries, projects, startOfWeek, endOfWeek);

  // 円グラフの色
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // カスタムラベルの設定
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    projectName,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="#666"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
      >
        {`${projectName} (${(percent * 100).toFixed(1)}%)`}
      </text>
    ) : null;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        週間サマリー
      </Typography>

      {/* 日別作業時間グラフ */}
      <Box sx={{ width: '100%', height: 200, mb: 4 }}>
        <ResponsiveContainer>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis unit="h" />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(1)}時間`, '作業時間']}
            />
            <Bar dataKey="hours" fill="#8884d8" name="作業時間" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* プロジェクト別作業時間の円グラフ */}
      <Typography variant="subtitle1" gutterBottom>
        プロジェクト別作業時間
      </Typography>
      <Box sx={{ width: '100%', height: 300, position: 'relative' }}>
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
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {projectDistribution.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name) => [`${value.toFixed(1)}時間`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};