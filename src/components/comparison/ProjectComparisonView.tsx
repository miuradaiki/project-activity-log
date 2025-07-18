import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Info as InfoIcon,
  ViewWeek as ViewWeekIcon,
  DonutLarge as DonutLargeIcon,
} from '@mui/icons-material';
import { Project, TimeEntry } from '../../types';
import { calculateProjectHours } from '../../utils/analytics';

interface ProjectComparisonViewProps {
  projects: Project[];
  timeEntries: TimeEntry[];
  activeProjects?: string[]; // 選択されたプロジェクトID配列（指定なしの場合は自動選択）
}

type ViewMode = 'bar' | 'pie';

/**
 * プロジェクト比較ビューコンポーネント
 * 複数プロジェクトの進捗や作業時間を比較表示する
 */
export const ProjectComparisonView: React.FC<ProjectComparisonViewProps> = ({
  projects,
  timeEntries,
  activeProjects = [],
}) => {
  const theme = useTheme();
  const [selectedProjects, setSelectedProjects] =
    useState<string[]>(activeProjects);
  const [viewMode, setViewMode] = useState<ViewMode>('bar');

  // アクティブなプロジェクト（アーカイブされていないもの）をフィルタリング
  const activeProjectList = useMemo(() => {
    return projects.filter((project) => !project.isArchived);
  }, [projects]);

  // 初期選択: 最大5つのプロジェクトを自動選択
  useEffect(() => {
    if (selectedProjects.length === 0 && activeProjectList.length > 0) {
      // 最大5つのプロジェクトを選択
      setSelectedProjects(activeProjectList.slice(0, 5).map((p) => p.id));
    }
  }, [activeProjectList, selectedProjects.length]);

  // プロジェクト選択の変更ハンドラ
  const handleProjectChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedProjects(typeof value === 'string' ? value.split(',') : value);
  };

  // 表示モードの切り替え
  const toggleViewMode = () => {
    setViewMode(viewMode === 'bar' ? 'pie' : 'bar');
  };

  // 今月の日付範囲を計算
  const { startOfMonth, endOfMonth } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { startOfMonth: start, endOfMonth: end };
  }, []);

  // カラーマネージャーの代わりに単純な配列を使用
  const colorPalette = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    '#10B981', // エメラルドグリーン
    '#F59E0B', // 琥珀色
    '#8B5CF6', // パープル
    '#EC4899', // ピンク
    '#6366F1', // インディゴ
    '#14B8A6', // ティール
  ];

  // プロジェクトに色を割り当て
  const getProjectColor = (index: number) => {
    return colorPalette[index % colorPalette.length];
  };

  // 選択されたプロジェクトのデータを準備
  const projectData = useMemo(() => {
    return selectedProjects
      .map((projectId, index) => {
        const project = projects.find((p) => p.id === projectId);
        if (!project) return null;

        // 今月の作業時間を計算
        const monthlyHours = calculateProjectHours(
          timeEntries,
          projectId,
          startOfMonth,
          endOfMonth
        );

        // 月間目標時間を計算
        const targetHours = project.monthlyCapacity;

        // 進捗率を計算
        const progressPercentage =
          targetHours > 0
            ? Math.min(100, (monthlyHours / targetHours) * 100)
            : 0;

        return {
          id: project.id,
          name: project.name,
          description: project.description,
          monthlyHours,
          targetHours,
          progressPercentage,
          color: getProjectColor(index),
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      name: string;
      description: string;
      monthlyHours: number;
      targetHours: number;
      progressPercentage: number;
      color: string;
    }>;
  }, [
    selectedProjects,
    projects,
    timeEntries,
    startOfMonth,
    endOfMonth,
    theme,
  ]);

  // 棒グラフデータの準備
  const barChartData = useMemo(() => {
    return [
      {
        name: '実績',
        ...projectData.reduce(
          (acc, project) => {
            acc[project.name] = project.monthlyHours;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
      {
        name: '目標',
        ...projectData.reduce(
          (acc, project) => {
            acc[project.name] = project.targetHours;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
    ];
  }, [projectData]);

  // 円グラフデータの準備
  const pieChartData = useMemo(() => {
    return projectData.map((project) => ({
      name: project.name,
      value: project.monthlyHours,
      color: project.color,
    }));
  }, [projectData]);

  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="medium">
            プロジェクト比較
          </Typography>
          <Typography variant="body2" color="text.secondary">
            複数プロジェクトの進捗状況を比較
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={viewMode === 'bar' ? '円グラフ表示' : '棒グラフ表示'}>
            <IconButton onClick={toggleViewMode}>
              {viewMode === 'bar' ? <DonutLargeIcon /> : <ViewWeekIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* プロジェクト選択 */}
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="project-comparison-select-label">
            比較するプロジェクト
          </InputLabel>
          <Select
            labelId="project-comparison-select-label"
            multiple
            value={selectedProjects}
            onChange={handleProjectChange}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value, index) => {
                  const project = projects.find((p) => p.id === value);
                  return (
                    <Chip
                      key={value}
                      label={project?.name || 'Unknown'}
                      size="small"
                      sx={{
                        backgroundColor: getProjectColor(index),
                        color: theme.palette.getContrastText(
                          getProjectColor(index)
                        ),
                      }}
                    />
                  );
                })}
              </Box>
            )}
          >
            {activeProjectList.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* グラフ表示エリア */}
      <Box sx={{ height: 300, mt: 4, mb: 4 }}>
        {selectedProjects.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Typography variant="body1" color="text.secondary">
              比較するプロジェクトを選択してください
            </Typography>
          </Box>
        ) : viewMode === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" unit="h" />
              <YAxis dataKey="name" type="category" width={80} />
              <RechartsTooltip
                formatter={(value: number) => [`${value.toFixed(1)}時間`, '']}
              />
              <Legend />
              {projectData.map((project) => (
                <Bar
                  key={project.name}
                  dataKey={project.name}
                  fill={project.color}
                  background={{ fill: theme.palette.background.paper }}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}h`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value: number) => [`${value.toFixed(1)}時間`, '']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Box>

      {/* プロジェクト詳細 */}
      {selectedProjects.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            プロジェクト詳細
          </Typography>
          <Grid container spacing={2}>
            {projectData.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Box
                  sx={{
                    p: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    borderLeft: `4px solid ${project.color}`,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[2],
                    },
                  }}
                >
                  <Typography variant="subtitle2" noWrap title={project.name}>
                    {project.name}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mt: 1,
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      進捗:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {project.progressPercentage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={project.progressPercentage}
                    sx={{
                      mb: 1.5,
                      height: 6,
                      borderRadius: 1,
                      backgroundColor:
                        theme.palette.mode === 'light'
                          ? theme.palette.grey[200]
                          : theme.palette.grey[700],
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: project.color,
                      },
                    }}
                  />
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      実績: {project.monthlyHours.toFixed(1)}h
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      目標: {project.targetHours.toFixed(1)}h
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Paper>
  );
};
