import React, { useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  useTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Project, TimeEntry } from '../../types';
import {
  getMonthlyDistribution,
  getProjectDistribution,
} from '../../utils/analytics';
import { projectColorManager } from '../../utils/colorUtils';

interface MonthlySummaryProps {
  projects: Project[];
  timeEntries: TimeEntry[];
}

// タブの種類を定義
type TabType = 'weekly' | 'projects';

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  projects,
  timeEntries,
}) => {
  const { t, language } = useLanguage();
  const theme = useTheme();
  const [selectedMonth, setSelectedMonth] = React.useState(() =>
    new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = React.useState(() =>
    new Date().getFullYear()
  );
  const [activeTab, setActiveTab] = React.useState<TabType>('projects');

  const isEnglish = language === 'en';

  // 週別作業時間データ
  const monthlyData = useMemo(
    () => getMonthlyDistribution(timeEntries, selectedYear, selectedMonth),
    [timeEntries, selectedYear, selectedMonth]
  );

  // 月の表示名を計算
  const displayMonth = useMemo(() => {
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

    return isEnglish
      ? `${monthNames.en[selectedMonth]} ${selectedYear}`
      : `${selectedYear}年${monthNames.ja[selectedMonth]}`;
  }, [selectedYear, selectedMonth, isEnglish]);

  // プロジェクト分布データ
  const projectDistribution = useMemo(() => {
    const startOfMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
    return getProjectDistribution(
      timeEntries,
      projects,
      startOfMonth,
      endOfMonth
    );
  }, [timeEntries, projects, selectedYear, selectedMonth]);

  // 合計作業時間を計算
  const totalHours = useMemo(
    () => projectDistribution.reduce((sum, item) => sum + item.hours, 0),
    [projectDistribution]
  );

  // プロジェクトごとのパーセンテージを計算
  const chartData = useMemo(() => {
    return projectDistribution.map((item) => ({
      name: item.projectName,
      value: item.hours,
      percentage:
        totalHours > 0 ? Math.round((item.hours / totalHours) * 100) : 0,
    }));
  }, [projectDistribution, totalHours]);

  // 年の選択肢を生成（現在年から3年前まで）
  const years = Array.from(
    { length: 4 },
    (_, i) => new Date().getFullYear() - i
  );

  // 月の選択肢を生成
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: isEnglish ? `Month ${i + 1}` : `${i + 1}月`,
  }));

  // 英語の月名（フルスペル）
  const englishMonthNames = [
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
  ];

  // カスタムツールチップ（プロジェクト分布用）
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      name: string;
      payload: { name: string; color: string; percentage: number };
    }>;
  }) => {
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
          mb: 2,
        }}
      >
        <Typography variant="h6">{t('dashboard.monthly.title')}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>{isEnglish ? 'Year' : '年'}</InputLabel>
            <Select
              value={selectedYear}
              label={isEnglish ? 'Year' : '年'}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                  {isEnglish ? '' : '年'}
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

      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {displayMonth}
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        {t('dashboard.monthly.total')}: {totalHours.toFixed(1)}{' '}
        {t('units.hours')}
      </Typography>

      {/* タブ切り替え */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2, mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab
            label={isEnglish ? 'Project Distribution' : 'プロジェクト分布'}
            value="projects"
          />
          <Tab label={isEnglish ? 'Weekly Trend' : '週別推移'} value="weekly" />
        </Tabs>
      </Box>

      {/* 週別作業時間の推移グラフ */}
      {activeTab === 'weekly' && (
        <Box sx={{ width: '100%', height: 280 }}>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="week"
                  label={{
                    value: isEnglish ? 'Week' : '週',
                    position: 'insideBottom',
                    offset: -5,
                  }}
                />
                <YAxis unit="h" />
                <Tooltip
                  formatter={(value: number) => [
                    `${value.toFixed(1)} ${t('units.hours')}`,
                    t('timer.title'),
                  ]}
                  labelFormatter={(week) =>
                    isEnglish ? `Week ${week}` : `第${week}週`
                  }
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
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <Typography variant="body1" color="text.secondary">
                {isEnglish
                  ? 'No activity data for this month'
                  : 'この月の稼働データがありません'}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* プロジェクト分布のパイチャート */}
      {activeTab === 'projects' && (
        <Box sx={{ width: '100%', height: 280 }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer>
              <PieChart margin={{ top: 25, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={55}
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
                  verticalAlign="bottom"
                  height={36}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <Typography variant="body1" color="text.secondary">
                {isEnglish
                  ? 'No project data for this month'
                  : 'この月のプロジェクトデータがありません'}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
