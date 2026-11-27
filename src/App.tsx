import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useLanguage } from './contexts/LanguageContext';
import { useCsvImport } from './hooks/useCsvImport';
import { useToast } from './contexts/ToastContext';
import { useSettingsContext } from './contexts/SettingsContext';
import { Project, TimeEntry } from './types';

import { ProjectForm } from './components/ProjectForm';
import { ManualTimeEntryForm } from './components/timer/ManualTimeEntryForm';
import { useStorage } from './hooks/useStorage';
import { useKeyboardShortcuts, Shortcut } from './hooks/useKeyboardShortcuts';
import { useTimerController } from './hooks/useTimerController';
import { useModal } from './hooks/useModal';
import { useProjectOperations } from './hooks/useProjectOperations';
import { useUndoableProjectOperations } from './hooks/useUndoableProjectOperations';
import { Layout } from './components/ui/layout/Layout';
import { useThemeMode } from './components/ui/ThemeProvider';
import { KeyboardShortcutsDialog } from './components/shortcuts/KeyboardShortcuts';
import { PageRouter } from './components/PageRouter';
import { STORAGE_KEYS } from './constants/storageKeys';
import { projectColorManager } from './utils/colorUtils';

const App: React.FC = () => {
  const { t } = useLanguage();
  const { settings } = useSettingsContext();
  // テーマとレイアウト管理
  const { isDarkMode, toggleThemeMode } = useThemeMode();

  // アクティブページの初期値をローカルストレージから取得
  const getInitialActivePage = (): string => {
    const storedPage = localStorage.getItem(STORAGE_KEYS.ACTIVE_PAGE);
    return storedPage || 'timer'; // デフォルトはタイマー画面
  };

  // 状態管理
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState(getInitialActivePage);

  // データの読み込み
  const { projects, setProjects, timeEntries, setTimeEntries, isLoading } =
    useStorage();

  // 色はどの画面から開いても同じになるよう、描画前にプロジェクト一覧から割り当てる
  useMemo(() => projectColorManager.initializeColors(projects), [projects]);

  // モーダル管理
  const projectFormModal = useModal<Project>();
  const manualEntryModal = useModal<TimeEntry>();
  const shortcutsModal = useModal();

  // タイマーコントローラー
  const { showToast } = useToast();
  const handleTimerDiscarded = useCallback(
    () => showToast({ message: t('timer.discarded') }),
    [showToast, t]
  );
  const timer = useTimerController(
    projects,
    (entries) => {
      setTimeEntries((prev) => [...prev, ...entries]);
    },
    handleTimerDiscarded
  );

  // プロジェクト操作
  const baseProjectOps = useProjectOperations({
    projects,
    setProjects,
    setTimeEntries,
    activeProjectId: timer.activeProject?.id || null,
    isTimerRunning: timer.isRunning,
    onTimerStop: () => timer.stop(),
  });
  const projectOps = useUndoableProjectOperations({
    projectOps: baseProjectOps,
    projects,
    timeEntries,
    setProjects,
    setTimeEntries,
  });

  // 安定した参照にして、Layout の自動停止監視（毎秒のインターバル）を作り直さない
  const { stop: stopTimer } = timer;
  const handleStopTimer = useCallback(() => stopTimer(), [stopTimer]);

  const handleStartTimer = useCallback(
    (project: Project) => timer.toggle(project),
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

  // Modal closing is handled by the form's onClose callback (manualEntryModal.close),
  // so handleSaveTimeEntry only saves data to avoid duplicate close calls during
  // multi-day entry creation where onSave is called once per split entry.
  const handleSaveTimeEntry = useCallback(
    (timeEntry: TimeEntry) => {
      projectOps.saveTimeEntry(timeEntry, !!manualEntryModal.data);
    },
    [manualEntryModal, projectOps]
  );

  const csvImport = useCsvImport({
    projects,
    timeEntries,
    setProjects,
    setTimeEntries,
  });
  const { result: importResult, dismiss: dismissImport } = csvImport;
  useEffect(() => {
    if (!importResult) return;
    showToast(
      importResult.kind === 'success'
        ? {
            kind: 'success',
            message: t('import.success', {
              entries: importResult.addedEntries,
              projects: importResult.addedProjects,
            }),
          }
        : { kind: 'error', message: t('import.error') }
    );
    dismissImport();
  }, [importResult, dismissImport, showToast, t]);

  // ナビゲーション処理
  const handleNavigate = useCallback((page: string) => {
    // アクティブページを設定
    setActivePage(page);
    // ローカルストレージに保存
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PAGE, page);
  }, []);

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
  ];

  // キーボードショートカットの処理
  useKeyboardShortcuts(shortcuts, { enabled: !hasOpenModal });

  // ローディング表示
  if (isLoading) {
    return (
      <Box
        role="progressbar"
        aria-label={t('app.loading')}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress
          size={20}
          thickness={5}
          sx={{ color: 'text.disabled' }}
        />
      </Box>
    );
  }

  return (
    <Layout
      activePage={activePage}
      onNavigate={handleNavigate}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      projects={projects}
      timeEntries={timeEntries}
      activeProject={timer.activeProject}
      isTimerRunning={timer.isRunning}
      startTime={timer.startTime}
      onStopTimer={handleStopTimer}
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
        onImportCSV={csvImport.importCSV}
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
        baseMonthlyHours={settings.workHours.baseMonthlyHours}
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
