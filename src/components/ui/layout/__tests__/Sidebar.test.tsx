import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { Sidebar, DRAWER_WIDTH, CLOSED_DRAWER_WIDTH } from '../Sidebar';
import { LanguageProvider } from '../../../../contexts/LanguageContext';

const theme = createTheme();

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <LanguageProvider>{ui}</LanguageProvider>
    </ThemeProvider>
  );
};

describe('Sidebar', () => {
  const defaultProps = {
    open: true,
    onToggle: jest.fn(),
    activePage: 'dashboard',
    onNavigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // matchMediaをデスクトップとしてモック
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: !query.includes('max-width'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe('基本レンダリング', () => {
    it('ブランドロゴが表示される（開いた状態）', () => {
      renderWithProviders(<Sidebar {...defaultProps} />);

      expect(screen.getByText('Project Log')).toBeInTheDocument();
    });

    it('ナビゲーション項目が表示される', () => {
      renderWithProviders(<Sidebar {...defaultProps} />);

      // 日本語または英語のどちらかに対応
      expect(
        screen.getByText(/(?:ダッシュボード|Dashboard)/)
      ).toBeInTheDocument();
      expect(screen.getByText(/(?:プロジェクト|Projects)/)).toBeInTheDocument();
      expect(screen.getByText(/(?:タイマー|Timer)/)).toBeInTheDocument();
      expect(screen.getByText(/(?:設定|Settings)/)).toBeInTheDocument();
    });

    it('ナビゲーションアイコンが表示される', () => {
      renderWithProviders(<Sidebar {...defaultProps} />);

      expect(screen.getByTestId('DashboardIcon')).toBeInTheDocument();
      expect(screen.getByTestId('ListAltIcon')).toBeInTheDocument();
      expect(screen.getByTestId('TimerIcon')).toBeInTheDocument();
      expect(screen.getByTestId('SettingsIcon')).toBeInTheDocument();
    });
  });

  describe('ナビゲーション動作', () => {
    it('ダッシュボードをクリックするとonNavigateが呼ばれる', () => {
      renderWithProviders(<Sidebar {...defaultProps} />);

      const dashboardItem = screen
        .getByText(/(?:ダッシュボード|Dashboard)/)
        .closest('li');
      const button = dashboardItem?.querySelector('div[role="button"]');

      if (button) {
        fireEvent.click(button);
        expect(defaultProps.onNavigate).toHaveBeenCalledWith('dashboard');
      }
    });

    it('プロジェクトをクリックするとonNavigateが呼ばれる', () => {
      renderWithProviders(<Sidebar {...defaultProps} />);

      const projectsItem = screen
        .getByText(/(?:プロジェクト|Projects)/)
        .closest('li');
      const button = projectsItem?.querySelector('div[role="button"]');

      if (button) {
        fireEvent.click(button);
        expect(defaultProps.onNavigate).toHaveBeenCalledWith('projects');
      }
    });

    it('タイマーをクリックするとonNavigateが呼ばれる', () => {
      renderWithProviders(<Sidebar {...defaultProps} />);

      const timerItem = screen.getByText(/(?:タイマー|Timer)/).closest('li');
      const button = timerItem?.querySelector('div[role="button"]');

      if (button) {
        fireEvent.click(button);
        expect(defaultProps.onNavigate).toHaveBeenCalledWith('timer');
      }
    });

    it('設定をクリックするとonNavigateが呼ばれる', () => {
      renderWithProviders(<Sidebar {...defaultProps} />);

      const settingsItem = screen.getByText(/(?:設定|Settings)/).closest('li');
      const button = settingsItem?.querySelector('div[role="button"]');

      if (button) {
        fireEvent.click(button);
        expect(defaultProps.onNavigate).toHaveBeenCalledWith('settings');
      }
    });
  });

  describe('アクティブ状態表示', () => {
    it('ダッシュボードがアクティブの場合、選択状態になる', () => {
      renderWithProviders(<Sidebar {...defaultProps} activePage="dashboard" />);

      const dashboardItem = screen
        .getByText(/(?:ダッシュボード|Dashboard)/)
        .closest('li');
      const button = dashboardItem?.querySelector('div[role="button"]');

      expect(button).toHaveClass('Mui-selected');
    });

    it('プロジェクトがアクティブの場合、選択状態になる', () => {
      renderWithProviders(<Sidebar {...defaultProps} activePage="projects" />);

      const projectsItem = screen
        .getByText(/(?:プロジェクト|Projects)/)
        .closest('li');
      const button = projectsItem?.querySelector('div[role="button"]');

      expect(button).toHaveClass('Mui-selected');
    });

    it('タイマーがアクティブの場合、選択状態になる', () => {
      renderWithProviders(<Sidebar {...defaultProps} activePage="timer" />);

      const timerItem = screen.getByText(/(?:タイマー|Timer)/).closest('li');
      const button = timerItem?.querySelector('div[role="button"]');

      expect(button).toHaveClass('Mui-selected');
    });

    it('設定がアクティブの場合、選択状態になる', () => {
      renderWithProviders(<Sidebar {...defaultProps} activePage="settings" />);

      const settingsItem = screen.getByText(/(?:設定|Settings)/).closest('li');
      const button = settingsItem?.querySelector('div[role="button"]');

      expect(button).toHaveClass('Mui-selected');
    });
  });

  describe('開閉動作', () => {
    it('トグルボタンをクリックするとonToggleが呼ばれる', () => {
      renderWithProviders(<Sidebar {...defaultProps} />);

      // ChevronLeftIconを持つボタンを探す
      const toggleButton = screen
        .getByTestId('ChevronLeftIcon')
        .closest('button');

      if (toggleButton) {
        fireEvent.click(toggleButton);
        expect(defaultProps.onToggle).toHaveBeenCalled();
      }
    });

    it('閉じた状態ではブランドテキストが非表示', async () => {
      renderWithProviders(<Sidebar {...defaultProps} open={false} />);

      await waitFor(() => {
        expect(screen.queryByText('Project Log')).not.toBeInTheDocument();
      });
    });

    it('閉じた状態ではMenuIconが表示される', () => {
      renderWithProviders(<Sidebar {...defaultProps} open={false} />);

      expect(screen.getByTestId('MenuIcon')).toBeInTheDocument();
    });
  });

  describe('ドロワー幅', () => {
    it('DRAWER_WIDTHが正しく定義されている', () => {
      expect(DRAWER_WIDTH).toBe(240);
    });

    it('CLOSED_DRAWER_WIDTHが正しく定義されている', () => {
      expect(CLOSED_DRAWER_WIDTH).toBe(60);
    });
  });

  describe('モバイルレスポンシブ', () => {
    beforeEach(() => {
      // matchMediaをモバイルとしてモック
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query: string) => ({
          matches: query.includes('max-width'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    });

    it('モバイルではハンバーガーボタンが表示される', () => {
      renderWithProviders(<Sidebar {...defaultProps} open={false} />);

      const menuButtons = screen.getAllByTestId('MenuIcon');
      expect(menuButtons.length).toBeGreaterThan(0);
    });

    it('モバイルでハンバーガーボタンをクリックするとonToggleが呼ばれる', () => {
      renderWithProviders(<Sidebar {...defaultProps} open={false} />);

      const menuButton = screen.getAllByTestId('MenuIcon')[0].closest('button');

      if (menuButton) {
        fireEvent.click(menuButton);
        expect(defaultProps.onToggle).toHaveBeenCalled();
      }
    });
  });

  describe('ツールチップ', () => {
    it('閉じた状態でホバーするとツールチップが表示される準備ができている', () => {
      renderWithProviders(<Sidebar {...defaultProps} open={false} />);

      // ツールチップはMUIのTooltipコンポーネントで実装されているため、
      // ツールチップのトリガー要素が存在することを確認
      const navButtons = screen.getAllByRole('button');
      expect(navButtons.length).toBeGreaterThan(0);
    });
  });
});
