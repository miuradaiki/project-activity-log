import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from './contexts/LanguageContext';
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
import { SettingsView } from './components/settings/SettingsView';
import { KeyboardShortcutsDialog } from './components/shortcuts/KeyboardShortcuts';

// アクティブページをローカルストレージに保存するためのキー
const ACTIVE_PAGE_STORAGE_KEY = 'project_activity_log_active_page';

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
  // 多言語対応
  const { t } = useLanguage();
  // テーマとレイアウト管理
  const { isDarkMode, toggleThemeMode } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // アクティブページの初期値をローカルストレージから取得
  const getInitialActivePage = (): string => {
    const storedPage = localStorage.getItem(ACTIVE_PAGE_STORAGE_KEY);
    return storedPage || 'timer'; // デフォルトはタイマー画面
  };

  // 状態管理
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState(getInitialActivePage);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isManualEntryFormOpen, setIsManualEntryFormOpen] = useState(false);
  const [editingTimeEntry, setEditingTimeEntry] = useState<TimeEntry | undefined>(undefined);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);

  // データの読み込み
  const { projects, setProjects, timeEntries, setTimeEntries, isLoading } = useStorage();

  // コールバック関数
  const openShortcutsDialog = useCallback(() => {
    setShowShortcutsDialog(true);
  }, []);
  
  const closeShortcutsDialog = useCallback(() => {
    setShowShortcutsDialog(false);
  }, []);

  const handleOpenProjectForm = useCallback((project?: Project) => {
    setEditingProject(project);
    setIsProjectFormOpen(true);
  }, []);

  const handleCloseProjectForm = useCallback(() => {
    setIsProjectFormOpen(false);
    setEditingProject(undefined);
  }, []);

  const handleStopTimer = useCallback(async () => {
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

    setTimeEntries(prev => [...prev, newTimeEntry]);
    setIsTimerRunning(false);
    setStartTime(null);
    setActiveProject(null);
    
    // トレイにタイマー停止を通知
    if (window.electronAPI?.timerStop) {
      await window.electronAPI.timerStop();
    }
  }, [activeProject, startTime, setTimeEntries]);

  const handleStartTimer = useCallback(async (project: Project) => {
    if (isTimerRunning) {
      handleStopTimer();
    }

    const startTime = new Date().toISOString();
    setStartTime(startTime);
    setIsTimerRunning(true);
    setActiveProject(project);
    
    // トレイにタイマー開始を通知
    if (window.electronAPI?.timerStart) {
      await window.electronAPI.timerStart(project.name);
    }
  }, [isTimerRunning, handleStopTimer]);

  const handleCreateProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => {
    const timestamp = new Date().toISOString();
    const newProject: Project = {
      ...projectData,
      id: uuidv4(),
      createdAt: timestamp,
      updatedAt: timestamp,
      isArchived: false,
    };
    setProjects(prev => [...prev, newProject]);
  }, [setProjects]);

  const handleEditProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingProject) return;

    const updatedProject: Project = {
      ...editingProject,
      ...projectData,
      updatedAt: new Date().toISOString(),
    };

    setProjects(prev => prev.map((p) => (p.id === editingProject.id ? updatedProject : p)));
    setEditingProject(undefined);
  }, [editingProject, setProjects]);

  const handleArchiveProject = useCallback((project: Project) => {
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

    setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
  }, [activeProject, isTimerRunning, handleStopTimer, setProjects]);

  const handleUnarchiveProject = useCallback((project: Project) => {
    const updatedProject: Project = {
      ...project,
      isArchived: false,
      archivedAt: undefined,
      updatedAt: new Date().toISOString(),
    };

    setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
  }, [setProjects]);

  const handleDeleteProject = useCallback((project: Project) => {
    if (activeProject?.id === project.id && isTimerRunning) {
      handleStopTimer();
    }
    setProjects(prev => prev.filter((p) => p.id !== project.id));
    setTimeEntries(prev => prev.filter((t) => t.projectId !== project.id));
  }, [activeProject, isTimerRunning, handleStopTimer, setProjects, setTimeEntries]);

  const handleDeleteTimeEntry = useCallback((timeEntryId: string) => {
    setTimeEntries(prev => prev.filter((t) => t.id !== timeEntryId));
  }, [setTimeEntries]);

  const handleSaveTimeEntry = useCallback((timeEntry: TimeEntry) => {
    if (editingTimeEntry) {
      setTimeEntries(prev => prev.map(t => t.id === timeEntry.id ? timeEntry : t));
      setEditingTimeEntry(undefined);
    } else {
      setTimeEntries(prev => [...prev, timeEntry]);
    }
  }, [editingTimeEntry, setTimeEntries]);

  // CSV インポート関数
  const handleImportCSV = useCallback(async () => {
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
  }, [projects, timeEntries, setProjects, setTimeEntries]);

  // ナビゲーション処理
  const handleNavigate = useCallback((page: string) => {
    // アクティブページを設定
    setActivePage(page);
    // ローカルストレージに保存
    localStorage.setItem(ACTIVE_PAGE_STORAGE_KEY, page);
  }, []);

  // ページタイトルの取得
  const getPageTitle = useCallback(() => {
    switch (activePage) {
      case 'dashboard':
        return t('nav.dashboard');
      case 'projects':
        return t('nav.projects');
      case 'timer':
        return t('nav.timer');
      case 'settings':
        return t('nav.settings');
      default:
        return t('app.name');
    }
  }, [activePage, t]);

  // フローティングアクションボタンの設定
  const getAddButtonConfig = useCallback(() => {
    switch (activePage) {
      case 'projects':
        return {
          show: true,
          tooltip: t('projects.new'),
          onClick: () => handleOpenProjectForm(),
        };
      case 'timer':
        return {
          show: true,
          tooltip: t('timer.manual'),
          onClick: () => setIsManualEntryFormOpen(true),
        };
      default:
        return {
          show: false,
          tooltip: '',
          onClick: () => {},
        };
    }
  }, [activePage, handleOpenProjectForm, t]);

  // キーボードショートカットの処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // モーダルが開いているときは処理しない
      if (isProjectFormOpen || isManualEntryFormOpen || showShortcutsDialog) return;

      // ナビゲーション関連
      if (e.ctrlKey) {
        // ページ切替
        if (e.key === '1') {
          e.preventDefault();
          handleNavigate('dashboard');
        } else if (e.key === '2') {
          e.preventDefault();
          handleNavigate('projects');
        } else if (e.key === '3') {
          e.preventDefault();
          handleNavigate('timer');
        
        } else if (e.key === ',') {
          e.preventDefault();
          handleNavigate('settings');
        }

        // プロジェクト操作
        if (e.key === 'n') {
          e.preventDefault();
          handleOpenProjectForm();
        }

        // ヘルプを表示
        if (e.key === 'h' || e.key === '/') {
          e.preventDefault();
          openShortcutsDialog();
        }
      }

      // ダークモード切替: Alt+L
      if (e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleThemeMode();
      }

      // タイマー操作: スペース
      if (e.key === ' ' && activePage === 'timer') {
        e.preventDefault();
        if (isTimerRunning) {
          handleStopTimer();
        } else if (activeProject) {
          handleStartTimer(activeProject);
        }
      }

      // タイマー停止: Escape
      if (e.key === 'Escape' && isTimerRunning) {
        e.preventDefault();
        handleStopTimer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    activePage,
    handleOpenProjectForm,
    handleNavigate,
    toggleThemeMode,
    openShortcutsDialog,
    isProjectFormOpen,
    isManualEntryFormOpen,
    showShortcutsDialog,
    isTimerRunning,
    activeProject,
    handleStartTimer,
    handleStopTimer,
    t
  ]);

  // トレイからのタイマー停止イベントの処理
  useEffect(() => {
    if (window.electronAPI?.onTrayStopTimer) {
      window.electronAPI.onTrayStopTimer(() => {
        handleStopTimer();
      });
    }
  }, [handleStopTimer]);

  // 現在のページに応じたコンテンツをレンダリング
  const renderPageContent = useCallback(() => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard 
            projects={projects} 
            timeEntries={timeEntries} 
            onStartTimer={(projectId) => {
              const project = projects.find(p => p.id === projectId);
              if (project) handleStartTimer(project);
            }}
            onEditProject={handleOpenProjectForm}
            onArchiveProject={handleArchiveProject}
            onUnarchiveProject={handleUnarchiveProject}
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
                {t('timer.title')}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={handleImportCSV}
              >
                {t('timer.import.csv')}
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

      case 'settings':
        return (
          <SettingsView />
        );
      default:
        return null;
    }
  }, [
    activePage,
    projects,
    timeEntries,
    activeProject,
    isTimerRunning,
    startTime,
    handleOpenProjectForm,
    handleDeleteProject,
    handleArchiveProject,
    handleUnarchiveProject,
    handleStartTimer,
    handleStopTimer,
    handleDeleteTimeEntry,
    handleImportCSV,
    t
  ]);

  // ローディング表示
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // フローティングボタンの設定を取得
  const addButtonConfig = getAddButtonConfig();

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
      // グローバルタイマー関連のプロパティを渡す
      activeProject={activeProject}
      isTimerRunning={isTimerRunning}
      startTime={startTime}
      onStopTimer={handleStopTimer}
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

      {/* キーボードショートカットダイアログ */}
      <KeyboardShortcutsDialog
        open={showShortcutsDialog}
        onClose={closeShortcutsDialog}
      />
    </Layout>
  );
};

export default App;
