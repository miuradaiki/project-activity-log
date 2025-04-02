import React, { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  Box,
  Grid,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { Project, TimeEntry } from '../../../types';
import { ProjectCard } from './ProjectCard';

interface ProjectsGridProps {
  projects: Project[];
  activeProjectId: string | null;
  timeEntries: TimeEntry[];
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onArchiveProject: (project: Project) => void;
  onUnarchiveProject: (project: Project) => void;
  onStartTimer: (project: Project) => void;
}

// タブパネルの型定義
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// タブパネルコンポーネント
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`projects-tabpanel-${index}`}
      aria-labelledby={`projects-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

type FilterType = 'all' | 'active' | 'archived';
type SortType = 'name' | 'progress' | 'capacity' | 'recent';

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({
  projects,
  activeProjectId,
  timeEntries,
  onEditProject,
  onDeleteProject,
  onArchiveProject,
  onUnarchiveProject,
  onStartTimer,
}) => {
  const [tabValue, setTabValue] = useState(1);
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('name');
  
  // タブの変更ハンドラー
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 並び替えの変更ハンドラー
  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value as SortType);
  };

  // フィルタータイプに基づいてプロジェクトをフィルタリング
  const getFilteredProjects = (filterType: FilterType) => {
    let filteredProjects = [...projects];
    
    // アクティブ/アーカイブで絞り込み
    if (filterType === 'active') {
      filteredProjects = filteredProjects.filter(p => !p.isArchived);
    } else if (filterType === 'archived') {
      filteredProjects = filteredProjects.filter(p => p.isArchived);
    }
    
    // 検索クエリで絞り込み
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredProjects = filteredProjects.filter(
        p => p.name.toLowerCase().includes(query) || 
             (p.description && p.description.toLowerCase().includes(query))
      );
    }
    
    return filteredProjects;
  };

  // プロジェクトの月間作業時間を計算
  const calculateMonthlyTime = (projectId: string): number => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return timeEntries
      .filter(entry => {
        const entryDate = new Date(entry.startTime);
        return entry.projectId === projectId && entryDate >= startOfMonth;
      })
      .reduce((total, entry) => {
        const start = new Date(entry.startTime);
        const end = new Date(entry.endTime);
        return total + (end.getTime() - start.getTime());
      }, 0) / (1000 * 60 * 60); // Convert to hours
  };

  // 月間目標時間を計算
  const calculateMonthlyTarget = (project: Project): number => {
    return project.monthlyCapacity * 140; // 140時間を基準とした月間目標時間
  };

  // プロジェクトを並び替え
  const sortProjects = (projects: Project[]): Project[] => {
    switch (sortBy) {
      case 'name':
        return [...projects].sort((a, b) => a.name.localeCompare(b.name));
      case 'progress': {
        return [...projects].sort((a, b) => {
          const progressA = calculateMonthlyTime(a.id) / calculateMonthlyTarget(a);
          const progressB = calculateMonthlyTime(b.id) / calculateMonthlyTarget(b);
          return progressB - progressA;
        });
      }
      case 'capacity':
        return [...projects].sort((a, b) => b.monthlyCapacity - a.monthlyCapacity);
      case 'recent': {
        return [...projects].sort((a, b) => {
          // 最終更新日で並べ替え
          const dateA = new Date(a.updatedAt).getTime();
          const dateB = new Date(b.updatedAt).getTime();
          return dateB - dateA;
        });
      }
      default:
        return projects;
    }
  };

  // フィルタリングと並び替えを適用したプロジェクトを取得
  const getFilteredAndSortedProjects = (filterType: FilterType) => {
    return sortProjects(getFilteredProjects(filterType));
  };

  // アクティブとアーカイブ済みプロジェクトの数を取得
  const activeProjects = projects.filter(p => !p.isArchived);
  const archivedProjects = projects.filter(p => p.isArchived);

  // 各タブ用のプロジェクトリスト
  const allProjects = getFilteredAndSortedProjects('all');
  const filteredActiveProjects = getFilteredAndSortedProjects('active');
  const filteredArchivedProjects = getFilteredAndSortedProjects('archived');

  // 現在表示中のプロジェクトリスト
  const currentProjects = tabValue === 0 
    ? allProjects 
    : tabValue === 1 
      ? filteredActiveProjects 
      : filteredArchivedProjects;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* フィルターとソート */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        mb: 3, 
        gap: 2 
      }}>
        <TextField
          placeholder={t('projects.search')}
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: { sm: 300 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="sort-select-label">{t('actions.search')}</InputLabel>
          <Select
            labelId="sort-select-label"
            value={sortBy}
            label={t('actions.search')}
            onChange={handleSortChange}
          >
            <MenuItem value="name">{t('projects.sort.name')}</MenuItem>
            <MenuItem value="progress">{t('projects.sort.progress')}</MenuItem>
            <MenuItem value="capacity">{t('projects.utilization')}</MenuItem>
            <MenuItem value="recent">{t('time.this.month')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* タブ */}
      <Paper sx={{ borderRadius: 2, mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={`${t('projects.filter.all')} (${allProjects.length})`} 
            id="projects-tab-0"
            aria-controls="projects-tabpanel-0"
          />
          <Tab 
            label={`${t('projects.filter.active')} (${activeProjects.length})`} 
            id="projects-tab-1"
            aria-controls="projects-tabpanel-1"
          />
          <Tab 
            label={`${t('projects.archive')} (${archivedProjects.length})`} 
            id="projects-tab-2"
            aria-controls="projects-tabpanel-2"
          />
        </Tabs>
      </Paper>

      {/* プロジェクトグリッド */}
      <TabPanel value={tabValue} index={0}>
        {allProjects.length > 0 ? (
          <Grid container spacing={3}>
            {allProjects.map((project) => (
              <Grid item xs={12} sm={6} md={4} lg={4} key={project.id}>
                <ProjectCard
                  project={project}
                  isActive={project.id === activeProjectId}
                  monthlyTime={calculateMonthlyTime(project.id)}
                  monthlyTarget={calculateMonthlyTarget(project)}
                  onStartTimer={onStartTimer}
                  onEditProject={onEditProject}
                  onArchiveProject={onArchiveProject}
                  onUnarchiveProject={onUnarchiveProject}
                  onDeleteProject={onDeleteProject}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              {t('timer.no.entries')}
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {filteredActiveProjects.length > 0 ? (
          <Grid container spacing={3}>
            {filteredActiveProjects.map((project) => (
              <Grid item xs={12} sm={6} md={4} lg={4} key={project.id}>
                <ProjectCard
                  project={project}
                  isActive={project.id === activeProjectId}
                  monthlyTime={calculateMonthlyTime(project.id)}
                  monthlyTarget={calculateMonthlyTarget(project)}
                  onStartTimer={onStartTimer}
                  onEditProject={onEditProject}
                  onArchiveProject={onArchiveProject}
                  onUnarchiveProject={onUnarchiveProject}
                  onDeleteProject={onDeleteProject}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              {t('timer.no.entries')}
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {filteredArchivedProjects.length > 0 ? (
          <Grid container spacing={3}>
            {filteredArchivedProjects.map((project) => (
              <Grid item xs={12} sm={6} md={4} lg={4} key={project.id}>
                <ProjectCard
                  project={project}
                  isActive={false}
                  monthlyTime={calculateMonthlyTime(project.id)}
                  monthlyTarget={calculateMonthlyTarget(project)}
                  onStartTimer={onStartTimer}
                  onEditProject={onEditProject}
                  onArchiveProject={onArchiveProject}
                  onUnarchiveProject={onUnarchiveProject}
                  onDeleteProject={onDeleteProject}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              {t('timer.no.entries')}
            </Typography>
          </Box>
        )}
      </TabPanel>
    </Box>
  );
};
