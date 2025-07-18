import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Box, 
  Typography, 
  Grid, 
  Tabs, 
  Tab,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { Project, TimeEntry } from '../../types';
import { ProjectProgressCard } from '../ui/ProjectProgressCard';
import { calculateProjectHours, calculateMonthlyTargetHours } from '../../utils/analytics';
import { useSettingsContext } from '../../contexts/SettingsContext';

interface ProjectProgressViewProps {
  projects: Project[];
  timeEntries: TimeEntry[];
  onStartTimer: (projectId: string) => void;
  onEditProject?: (project: Project) => void;
  onArchiveProject?: (project: Project) => void;
  onUnarchiveProject?: (project: Project) => void;
  onViewDetails?: (project: Project) => void;
  onUpdateTarget?: (project: Project, newMonthlyCapacity: number) => void;
}

type FilterType = 'all' | 'active' | 'completed' | 'at-risk';
type SortType = 'name' | 'progress' | 'remaining';

/**
 * プロジェクト進捗ビューコンポーネント
 * プロジェクト別の進捗状況を表示し、フィルタリングとソート機能を提供
 */
export const ProjectProgressView: React.FC<ProjectProgressViewProps> = ({
  projects,
  timeEntries,
  onStartTimer,
  onEditProject,
  onArchiveProject,
  onUnarchiveProject,
  onViewDetails,
  onUpdateTarget,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { settings } = useSettingsContext(); // 設定から基準時間を取得
  
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('progress');
  const [searchTerm, setSearchTerm] = useState('');

  // 月初から月末までの期間を設定
  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    return { firstDay, lastDay };
  };

  const { firstDay, lastDay } = getCurrentMonthRange();

  // 各プロジェクトの進捗データを計算
  const projectProgressData = useMemo(() => {
    return projects.map(project => {
      // 月間の目標時間を計算
      const targetHours = calculateMonthlyTargetHours(
        project.monthlyCapacity * 100 || 0,
        settings.workHours.baseMonthlyHours // 設定から基準時間を取得
      );
      
      // 今月の実績時間を計算
      const currentHours = calculateProjectHours(
        timeEntries,
        project.id,
        firstDay,
        lastDay
      );
      
      // 進捗率を計算
      const progressPercentage = targetHours > 0 
        ? Math.min(Math.round((currentHours / targetHours) * 100), 100)
        : 0;

      // 進捗状況のステータスを判定
      let status: FilterType = 'active';
      if (progressPercentage >= 100) {
        status = 'completed';
      } else if (progressPercentage >= 90 && progressPercentage < 100) {
        status = 'at-risk';
      }

      return {
        project,
        currentHours,
        targetHours,
        progressPercentage,
        status,
      };
    });
  }, [projects, timeEntries, firstDay, lastDay, settings.workHours.baseMonthlyHours]);

  // フィルタリング
  const filteredProjects = useMemo(() => {
    return projectProgressData.filter(item => {
      // アーカイブされたプロジェクトは非表示にする
      if (item.project.isArchived) {
        return false;
      }

      // フィルターに基づいてプロジェクトをフィルタリング
      const filterMatch = 
        filterType === 'all' || 
        item.status === filterType ||
        (filterType === 'active' && item.status !== 'completed');
      
      // 検索語に基づいてプロジェクトをフィルタリング
      const searchMatch = 
        searchTerm === '' || 
        item.project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.project.description && 
          item.project.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return filterMatch && searchMatch;
    });
  }, [projectProgressData, filterType, searchTerm]);

  // ソート
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      if (sortType === 'name') {
        return a.project.name.localeCompare(b.project.name);
      } else if (sortType === 'progress') {
        return b.progressPercentage - a.progressPercentage;
      } else if (sortType === 'remaining') {
        const remainingA = a.targetHours - a.currentHours;
        const remainingB = b.targetHours - b.currentHours;
        return remainingA - remainingB;
      }
      return 0;
    });
  }, [filteredProjects, sortType]);

  const handleFilterChange = (_event: React.SyntheticEvent, newValue: FilterType) => {
    setFilterType(newValue);
  };

  const handleSortChange = (event: SelectChangeEvent<SortType>) => {
    setSortType(event.target.value as SortType);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Box>
      {/* ヘッダー */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">
          {t('dashboard.progress.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('dashboard.progress.subtitle')}
        </Typography>
      </Box>

      {/* フィルターとツールバー */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          mb: 2
        }}>
          {/* 検索フィールド */}
          <TextField
            placeholder={t('projects.search')}
            size="small"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: { sm: 250 } }}
          />

          {/* ソート選択 */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="sort-select-label">{t('actions.search')}</InputLabel>
            <Select
              labelId="sort-select-label"
              value={sortType}
              label={t('actions.search')}
              onChange={handleSortChange}
            >
              <MenuItem value="name">{t('projects.name')}</MenuItem>
              <MenuItem value="progress">{t('projects.sort.progress')}</MenuItem>
              <MenuItem value="remaining">{t('projects.sort.remaining')}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* フィルタータブ */}
        <Tabs
          value={filterType}
          onChange={handleFilterChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
        >
          <Tab label={t('projects.filter.all')} value="all" />
          <Tab label={t('projects.filter.active')} value="active" />
          <Tab label={t('projects.filter.warning')} value="at-risk" />
          <Tab label={t('projects.filter.completed')} value="completed" />
        </Tabs>
      </Box>

      {/* プロジェクトカードグリッド */}
      {sortedProjects.length > 0 ? (
        <Grid container spacing={3}>
          {sortedProjects.map(({ project, currentHours, targetHours }) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <ProjectProgressCard
                project={project}
                currentHours={currentHours}
                targetHours={targetHours}
                onStartTimer={onStartTimer}
                onEditProject={onEditProject}
                onArchiveProject={onArchiveProject}
                onUnarchiveProject={onUnarchiveProject}
                onViewDetails={onViewDetails}
                onUpdateTarget={onUpdateTarget}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 200 
          }}
        >
          <Typography color="text.secondary">
            {t('timer.no.entries')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
