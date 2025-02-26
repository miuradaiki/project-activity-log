import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add as AddIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { Project, TimeEntry } from './types';

import { v4 as uuidv4 } from 'uuid';
import { ProjectList } from './components/ProjectList';
import { ProjectForm } from './components/ProjectForm';
import { Timer } from './components/timer/Timer';
import { TimeEntryList } from './components/timer/TimeEntryList';
import { ManualTimeEntryForm } from './components/timer/ManualTimeEntryForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { useStorage } from './hooks/useStorage';
import { Layout } from './components/ui/layout/Layout';
import { useThemeMode } from './components/ui/ThemeProvider';
import { TimerFocus } from './components/ui/timer/TimerFocus';
import { ProjectsView } from './components/ui/project/ProjectsView';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const App: React.FC = () => {
  // テーマとレイアウト管理
  const { isDarkMode, toggleThemeMode } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [activePage, setActivePage] = useState('timer'); // デフォルトはタイマー画面

  // CSV インポート関数
  const handleImportCSV = async () => {
    try {
      const filePath = await window.electronAPI.showOpenFileDialog();
      if (!filePath) return; // ユーザーがキャンセルした場合

      const { safeImportWorkLog } = await import('./utils/safeImportUtils');
      const result = await safeImportWorkLog(
        filePath,
        projects,
        timeEntries,
        (updatedProjects, updatedTimeEntries) => {
          setProjects(updatedProjects);
          setTimeEntries(updatedTimeEntries);
        }
      );

      if (result.success) {
        console.log('インポートが成功しました。バックアップ:', result.backupPath);
      } else {
        console.error('インポートに失敗しました:', result.error);
      }
    } catch (error) {
      console.error('インポート処理中にエラーが発生しました:', error);
    }
  };

  const { projects, setProjects, timeEntries, setTimeEntries, isLoading } = useStorage();
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isManualEntryFormOpen, setIsManualEntryFormOpen] = useState(false);
  const [editingTimeEntry, setEditingTimeEntry] = useState<TimeEntry | undefined>(undefined);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);

  // ページタイトルの取得
  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'ダッシュボード';
      case 'projects':
        return 'プロジェクト';
      case 'timer':
        return 'タイマー';
      case 'reports':
        return 'レポート';
      case 'settings':
        return '設定';
      default:
        return 'Project Activity Log';
    }
  };

  // フローティングアクションボタンの設定
  const getAddButtonConfig = () => {
    switch (activePage) {
      case 'projects':
        return {
          show: true,
          tooltip: '新規プロジェクト',
          onClick: () => handleOpenProjectForm(),
        };
      case 'timer':
        return {
          show: true,
          tooltip: '作業時間を手動入力',
          onClick: () => setIsManualEntryFormOpen(true),
        };
      default:
        return {
          show: false,
          tooltip: '',
          onClick: () => {},
        };
    }
  };

  // ローディング表示
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleCreateProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
    const timestamp = new Date().toISOString();
    const newProject: Project = {
      ...projectData,
      id: uuidv4(),
      createdAt: timestamp,
      updatedAt: timestamp,
      isArchived: false,
    };
    setProjects([...projects, newProject]);
  };

  const handleEditProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingProject) return;

    const updatedProject: Project = {
      ...editingProject,
      ...projectData,
      updatedAt: new Date().toISOString(),
    };

    setProjects(projects.map((p) => (p.id === editingProject.id ? updatedProject : p)));
    setEditingProject(undefined);
  };

  const handleArchiveProject = (project: Project) => {
    const updatedProject: Project = {
      ...project,
      isArchived: true,
      archivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // アクティブなプロジェクトがアーカイブされる場合、タイマーを停止
    if (activeProject?.id === project.id && isTimerRunning) {
      handleStopTimer();
    }

    setProjects(projects.map(p => p.id === project.id ? updatedProject : p));
  };

  const handleUnarchiveProject = (project: Project) => {
    const updatedProject: Project = {
      ...project,
      isArchived: false,
      archivedAt: undefined,
      updatedAt: new Date().toISOString(),
    };

    setProjects(projects.map(p => p.id === project.id ? updatedProject : p));
  };

  const handleDeleteProject = (project: Project) => {
    if (activeProject?.id === project.id && isTimerRunning) {
      handleStopTimer();
    }
    setProjects(projects.filter((p) => p.id !== project.id));
    setTimeEntries(timeEntries.filter((t) => t.projectId !== project.id));
  };

  const handleStartTimer = (project: Project) => {
    if (isTimerRunning) {
      handleStopTimer();
    }

    const startTime = new Date().toISOString();
    setStartTime(startTime);
    setIsTimerRunning(true);
    setActiveProject(project);
  };

  const handleStopTimer = () => {
    if (!activeProject || !startTime) return;

    const endTime = new Date().toISOString();
    const newTimeEntry: TimeEntry = {
      id: uuidv4(),
      projectId: activeProject.id,
      startTime,
      endTime,
      description: '',
      createdAt: endTime,
      updatedAt: endTime,
    };

    setTimeEntries([...timeEntries, newTimeEntry]);
    setIsTimerRunning(false);
    setStartTime(null);
    setActiveProject(null);
  };

  const handleDeleteTimeEntry = (timeEntryId: string) => {
    setTimeEntries(timeEntries.filter((t) => t.id !== timeEntryId));
  };

  const handleOpenProjectForm = (project?: Project) => {
    setEditingProject(project);
    setIsProjectFormOpen(true);
  };

  const handleCloseProjectForm = () => {
    setIsProjectFormOpen(false);
    setEditingProject(undefined);
  };

  const handleSaveTimeEntry = (timeEntry: TimeEntry) => {
    if (editingTimeEntry) {
      setTimeEntries(timeEntries.map(t => t.id === timeEntry.id ? timeEntry : t));
      setEditingTimeEntry(undefined);
    } else {
      setTimeEntries([...timeEntries, timeEntry]);
    }
  };

  // ナビゲーション処理
  const handleNavigate = (page: string) => {
    setActivePage(page);
  };

  // フローティングボタンの設定を取得
  const addButtonConfig = getAddButtonConfig();

  // 現在のページに応じたコンテンツをレンダリング
  const renderPageContent = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard 
            projects={projects} 
            timeEntries={timeEntries} 
          />
        );
      case 'projects':
        return (
          <ProjectsView
            projects={projects}
            timeEntries={timeEntries}
            activeProjectId={activeProject?.id || null}
            onEditProject={handleOpenProjectForm}
            onDeleteProject={handleDeleteProject}
            onArchiveProject={handleArchiveProject}
            onUnarchiveProject={handleUnarchiveProject}
            onStartTimer={handleStartTimer}
            onAddProject={() => handleOpenProjectForm()}
          />
        );
      case 'timer':
        return (
          <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" component="h1" fontWeight="bold">
                タイマー
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={handleImportCSV}
              >
                CSVインポート
              </Button>
            </Box>

            <TimerFocus
              project={activeProject}
              isRunning={isTimerRunning}
              startTime={startTime}
              onStart={() => activeProject && handleStartTimer(activeProject)}
              onStop={handleStopTimer}
            />

            <ProjectList
              projects={projects}
              onEditProject={handleOpenProjectForm}
              onDeleteProject={handleDeleteProject}
              onArchiveProject={handleArchiveProject}
              onUnarchiveProject={handleUnarchiveProject}
              onStartTimer={handleStartTimer}
              activeProjectId={activeProject?.id || null}
              timeEntries={timeEntries}
            />

            <TimeEntryList
              timeEntries={timeEntries}
              projects={projects}
              onDeleteTimeEntry={handleDeleteTimeEntry}
              onEditTimeEntry={(entry) => {
                setEditingTimeEntry(entry);
                setIsManualEntryFormOpen(true);
              }}
            />
          </Box>
        );
      case 'reports':
        return (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="text.secondary">
              レポート機能は開発中です
            </Typography>
          </Box>
        );
      case 'settings':
        return (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="text.secondary">
              設定画面は開発中です
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Layout
      title={getPageTitle()}
      activePage={activePage}
      onNavigate={handleNavigate}
      onToggleTheme={toggleThemeMode}
      isDarkMode={isDarkMode}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      showAddButton={addButtonConfig.show}
      onAddButtonClick={addButtonConfig.onClick}
      addButtonTooltip={addButtonConfig.tooltip}
    >
      {renderPageContent()}

      {/* モーダル */}
      <ProjectForm
        open={isProjectFormOpen}
        onClose={handleCloseProjectForm}
        onSave={editingProject ? handleEditProject : handleCreateProject}
        project={editingProject}
        projects={projects}
      />

      <ManualTimeEntryForm
        open={isManualEntryFormOpen}
        onClose={() => {
          setIsManualEntryFormOpen(false);
          setEditingTimeEntry(undefined);
        }}
        onSave={handleSaveTimeEntry}
        projects={projects}
        timeEntry={editingTimeEntry}
      />
    </Layout>
  );
};

export default App;
