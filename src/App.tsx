import React, { useState, useCallback } from 'react';
import { useLanguage } from './contexts/LanguageContext';
import { Box, CircularProgress } from '@mui/material';
import { Project, TimeEntry } from './types';

import { ProjectForm } from './components/ProjectForm';
import { ManualTimeEntryForm } from './components/timer/ManualTimeEntryForm';
import { useStorage } from './hooks/useStorage';
import { useKeyboardShortcuts, Shortcut } from './hooks/useKeyboardShortcuts';
import { useTimerController } from './hooks/useTimerController';
import { useModal } from './hooks/useModal';
import { useProjectOperations } from './hooks/useProjectOperations';
import { Layout } from './components/ui/layout/Layout';
import { useThemeMode } from './components/ui/ThemeProvider';
import { KeyboardShortcutsDialog } from './components/shortcuts/KeyboardShortcuts';
import { PageRouter } from './components/PageRouter';

// アクティブページをローカルストレージに保存するためのキー
const ACTIVE_PAGE_STORAGE_KEY = 'project_activity_log_active_page';

const App: React.FC = () => {
  // 多言語対応
  const { t } = useLanguage();
  // テーマとレイアウト管理
  const { isDarkMode, toggleThemeMode } = useThemeMode();

  // アクティブページの初期値をローカルストレージから取得
  const getInitialActivePage = (): string => {
    const storedPage = localStorage.getItem(ACTIVE_PAGE_STORAGE_KEY);
    return storedPage || 'timer'; // デフォルトはタイマー画面
  };

  // 状態管理
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState(getInitialActivePage);

  // データの読み込み
  const { projects, setProjects, timeEntries, setTimeEntries, isLoading } =
    useStorage();

  // モーダル管理
  const projectFormModal = useModal<Project>();
  const manualEntryModal = useModal<TimeEntry>();
  const shortcutsModal = useModal();

  // タイマーコントローラー
  const timer = useTimerController(projects, (entries) => {
    setTimeEntries((prev) => [...prev, ...entries]);
  });

  // プロジェクト操作
  const projectOps = useProjectOperations({
    projects,
    setProjects,
    setTimeEntries,
    activeProjectId: timer.activeProject?.id || null,
    isTimerRunning: timer.isRunning,
    onTimerStop: () => timer.stop(),
  });

  const handleStartTimer = useCallback(
    async (project: Project) => {
      if (timer.isRunning) {
        await timer.stop();
      }
      await timer.start(project);
    },
    [timer]
  );

  const handleEditProject = useCallback(
    (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!projectFormModal.data) return;
      projectOps.editProject(projectFormModal.data, projectData);
      projectFormModal.close();
    },
    [projectFormModal, projectOps]
  );

  const handleSaveTimeEntry = useCallback(
    (timeEntry: TimeEntry) => {
      projectOps.saveTimeEntry(timeEntry, !!manualEntryModal.data);
      manualEntryModal.close();
    },
    [manualEntryModal, projectOps]
  );

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
        // インポート成功時の処理は不要
      } else {
        // インポート失敗時の処理は不要
      }
    } catch {
      // エラーハンドリングは不要
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
          onClick: () => projectFormModal.open(),
        };
      case 'timer':
        return {
          show: true,
          tooltip: t('timer.manual'),
          onClick: () => manualEntryModal.open(),
        };
      default:
        return {
          show: false,
          tooltip: '',
          onClick: () => {},
        };
    }
  }, [activePage, projectFormModal, manualEntryModal, t]);

  // モーダルが開いているかどうか
  const hasOpenModal =
    projectFormModal.isOpen || manualEntryModal.isOpen || shortcutsModal.isOpen;

  // キーボードショートカットの定義
  const shortcuts: Shortcut[] = [
    // ナビゲーション
    { key: '1', ctrlKey: true, action: () => handleNavigate('dashboard') },
    { key: '2', ctrlKey: true, action: () => handleNavigate('projects') },
    { key: '3', ctrlKey: true, action: () => handleNavigate('timer') },
    { key: ',', ctrlKey: true, action: () => handleNavigate('settings') },
    // プロジェクト操作
    { key: 'n', ctrlKey: true, action: () => projectFormModal.open() },
    // ヘルプ
    { key: 'h', ctrlKey: true, action: () => shortcutsModal.open() },
    { key: '/', ctrlKey: true, action: () => shortcutsModal.open() },
    // テーマ切替
    { key: 'l', altKey: true, action: toggleThemeMode },
    { key: 'L', altKey: true, action: toggleThemeMode },
    // タイマー操作
    {
      key: ' ',
      action: () => {
        if (timer.isRunning) {
          timer.stop();
        } else if (timer.activeProject) {
          timer.start(timer.activeProject);
        }
      },
      disabled: activePage !== 'timer',
    },
    { key: 'Escape', action: () => timer.stop(), disabled: !timer.isRunning },
  ];

  // キーボードショートカットの処理
  useKeyboardShortcuts(shortcuts, { enabled: !hasOpenModal });

  // ローディング表示
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
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
      activeProject={timer.activeProject}
      isTimerRunning={timer.isRunning}
      startTime={timer.startTime}
      onStopTimer={() => timer.stop()}
    >
      <PageRouter
        activePage={activePage}
        projects={projects}
        timeEntries={timeEntries}
        timer={timer}
        projectFormModal={projectFormModal}
        manualEntryModal={manualEntryModal}
        projectOps={projectOps}
        onStartTimer={handleStartTimer}
        onImportCSV={handleImportCSV}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleThemeMode}
      />

      {/* モーダル */}
      <ProjectForm
        open={projectFormModal.isOpen}
        onClose={projectFormModal.close}
        onSave={
          projectFormModal.data ? handleEditProject : projectOps.createProject
        }
        project={projectFormModal.data}
        projects={projects}
      />

      <ManualTimeEntryForm
        open={manualEntryModal.isOpen}
        onClose={manualEntryModal.close}
        onSave={handleSaveTimeEntry}
        projects={projects}
        timeEntry={manualEntryModal.data}
      />

      {/* キーボードショートカットダイアログ */}
      <KeyboardShortcutsDialog
        open={shortcutsModal.isOpen}
        onClose={shortcutsModal.close}
      />
    </Layout>
  );
};

export default App;
