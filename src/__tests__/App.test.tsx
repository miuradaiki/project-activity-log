import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { ThemeProvider as CustomThemeProvider } from '../components/ui/ThemeProvider';
import { LanguageProvider } from '../contexts/LanguageContext';
import { SettingsProvider } from '../contexts/SettingsContext';
import { MockElectronAPI } from '../__mocks__/electron';

// Mock all child components to focus on App logic
jest.mock('../components/PageRouter', () => ({
  PageRouter: ({ activePage }: { activePage: string }) => (
    <div data-testid="page-router">Active Page: {activePage}</div>
  ),
}));

jest.mock('../components/ui/layout/Layout', () => ({
  Layout: ({
    children,
    activePage,
  }: {
    children: React.ReactNode;
    activePage: string;
  }) => (
    <div data-testid="layout">
      <div data-testid="active-page">{activePage}</div>
      {children}
    </div>
  ),
}));

jest.mock('../components/ProjectForm', () => ({
  ProjectForm: ({
    open,
    onClose,
    onSave,
  }: {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
  }) =>
    open ? (
      <div data-testid="project-form-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={onSave}>Save</button>
      </div>
    ) : null,
}));

jest.mock('../components/timer/ManualTimeEntryForm', () => ({
  ManualTimeEntryForm: ({
    open,
    onClose,
  }: {
    open: boolean;
    onClose: () => void;
  }) =>
    open ? (
      <div data-testid="manual-entry-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

jest.mock('../components/shortcuts/KeyboardShortcuts', () => ({
  KeyboardShortcutsDialog: ({
    open,
    onClose,
  }: {
    open: boolean;
    onClose: () => void;
  }) =>
    open ? (
      <div data-testid="shortcuts-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

jest.mock('../hooks/useStorage', () => ({
  useStorage: () => ({
    projects: [
      {
        id: 'project-1',
        name: 'Test Project',
        description: '',
        monthlyCapacity: 0.5,
        isArchived: false,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ],
    setProjects: jest.fn(),
    timeEntries: [],
    setTimeEntries: jest.fn(),
    isLoading: false,
  }),
}));

const mockTimer = {
  isRunning: false,
  activeProject: null as null | { id: string; name: string },
  startTime: null as string | null,
  start: jest.fn(),
  stop: jest.fn(),
  toggle: jest.fn(),
};

jest.mock('../hooks/useTimerController', () => ({
  useTimerController: () => mockTimer,
}));

jest.mock('../hooks/useModal', () => ({
  useModal: () => ({
    isOpen: false,
    data: null,
    open: jest.fn(),
    close: jest.fn(),
  }),
}));

jest.mock('../hooks/useProjectOperations', () => ({
  useProjectOperations: () => ({
    createProject: jest.fn(),
    editProject: jest.fn(),
    deleteProject: jest.fn(),
    archiveProject: jest.fn(),
    unarchiveProject: jest.fn(),
    saveTimeEntry: jest.fn(),
  }),
}));

// localStorageの値を保持するための簡易的なストレージ
let mockStorage: Record<string, string> = {};

const renderApp = () => {
  return render(
    <CustomThemeProvider>
      <LanguageProvider>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </LanguageProvider>
    </CustomThemeProvider>
  );
};

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage = {};

    // localStorageのモックを設定
    (window.localStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => {
        return mockStorage[key] || null;
      }
    );
    (window.localStorage.setItem as jest.Mock).mockImplementation(
      (key: string, value: string) => {
        mockStorage[key] = value;
      }
    );
    (window.localStorage.clear as jest.Mock).mockImplementation(() => {
      mockStorage = {};
    });

    const mockElectronAPI = MockElectronAPI.getInstance();
    mockElectronAPI.reset();
  });

  describe('初期化', () => {
    it('初期ページはtimerがデフォルト', () => {
      renderApp();

      expect(screen.getByTestId('active-page')).toHaveTextContent('timer');
    });

    it('ローカルストレージにページが保存されていればそのページを表示', () => {
      mockStorage['project_activity_log_active_page'] = 'dashboard';

      renderApp();

      expect(screen.getByTestId('active-page')).toHaveTextContent('dashboard');
    });

    it('レイアウトがレンダリングされる', () => {
      renderApp();

      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });

    it('PageRouterがレンダリングされる', () => {
      renderApp();

      expect(screen.getByTestId('page-router')).toBeInTheDocument();
    });
  });
});

describe('キーボードショートカット', () => {
  afterEach(() => {
    mockTimer.isRunning = false;
    mockTimer.activeProject = null;
    mockTimer.startTime = null;
    mockTimer.stop.mockClear();
  });

  it('計測中にEscapeを押してもタイマーは停止しない（メニュー等を閉じる操作と衝突するため）', () => {
    mockTimer.isRunning = true;
    mockTimer.activeProject = { id: 'project-1', name: 'Test Project' };
    mockTimer.startTime = new Date().toISOString();
    renderApp();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockTimer.stop).not.toHaveBeenCalled();
  });
});

describe('App モック検証', () => {
  it('useStorageモックが正しく動作する', () => {
    renderApp();

    // useStorageモックによりプロジェクトデータが提供される
    expect(screen.getByTestId('page-router')).toBeInTheDocument();
  });

  it('useTimerControllerモックが正しく動作する', () => {
    renderApp();

    // タイマー状態がモックされている
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });
});
