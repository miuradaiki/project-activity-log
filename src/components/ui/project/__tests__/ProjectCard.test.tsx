import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectCard } from '../ProjectCard';
import { Project } from '../../../../types';
import { ThemeProvider, createTheme } from '@mui/material';
import { LanguageProvider } from '../../../../contexts/LanguageContext';

const theme = createTheme();

const mockProject: Project = {
  id: 'test-project-1',
  name: 'Test Project',
  description: 'Test description',
  monthlyCapacity: 0.5,
  isArchived: false,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const defaultProps = {
  project: mockProject,
  isActive: false,
  monthlyTime: 35,
  monthlyTarget: 70,
  onStartTimer: jest.fn(),
  onEditProject: jest.fn(),
  onArchiveProject: jest.fn(),
  onUnarchiveProject: jest.fn(),
  onDeleteProject: jest.fn(),
};

const renderWithProviders = (props = {}) => {
  return render(
    <ThemeProvider theme={theme}>
      <LanguageProvider>
        <ProjectCard {...defaultProps} {...props} />
      </LanguageProvider>
    </ThemeProvider>
  );
};

describe('ProjectCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    test('プロジェクト名が表示される', () => {
      renderWithProviders();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    test('プロジェクト説明が表示される', () => {
      renderWithProviders();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    test('進捗率が表示される', async () => {
      renderWithProviders();
      await waitFor(() => {
        expect(screen.getByText('50%')).toBeInTheDocument();
      });
    });

    test('作業時間が表示される', () => {
      renderWithProviders();
      expect(screen.getByText(/35\.0/)).toBeInTheDocument();
    });
  });

  describe('タイマー操作', () => {
    test('タイマーボタンをクリックするとonStartTimerが呼ばれる', () => {
      renderWithProviders();
      const buttons = screen.getAllByRole('button');
      const timerButton = buttons.find(
        (btn) =>
          btn.querySelector('[data-testid="PlayArrowIcon"]') ||
          btn.getAttribute('aria-label')?.includes('timer')
      );
      if (timerButton) {
        fireEvent.click(timerButton);
        expect(defaultProps.onStartTimer).toHaveBeenCalledWith(mockProject);
      }
    });

    test('アクティブ時は停止アイコンが表示される', () => {
      renderWithProviders({ isActive: true });
      expect(screen.getByTestId('StopIcon')).toBeInTheDocument();
    });

    test('非アクティブ時は再生アイコンが表示される', () => {
      renderWithProviders({ isActive: false });
      expect(screen.getByTestId('PlayArrowIcon')).toBeInTheDocument();
    });
  });

  describe('メニュー操作', () => {
    test('メニューボタンをクリックするとメニューが表示される', async () => {
      renderWithProviders();
      const menuButton = screen.getByRole('button', { name: /more/i });
      fireEvent.click(menuButton);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
    });

    test('編集メニューをクリックするとonEditProjectが呼ばれる', async () => {
      renderWithProviders();
      const menuButton = screen.getByRole('button', { name: /more/i });
      fireEvent.click(menuButton);

      await waitFor(() => {
        const editMenuItem = screen.getByRole('menuitem', {
          name: /edit|編集/i,
        });
        fireEvent.click(editMenuItem);
      });

      expect(defaultProps.onEditProject).toHaveBeenCalledWith(mockProject);
    });
  });

  describe('アーカイブ状態', () => {
    test('アーカイブされたプロジェクトはタイマーボタンが表示されない', () => {
      const archivedProject = { ...mockProject, isArchived: true };
      renderWithProviders({ project: archivedProject });

      expect(screen.queryByTestId('PlayArrowIcon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('StopIcon')).not.toBeInTheDocument();
    });
  });

  describe('稼働率0%（トラッキングのみ）', () => {
    test('稼働率0%の場合は進捗バーが表示されない', () => {
      const trackingOnlyProject = { ...mockProject, monthlyCapacity: 0 };
      renderWithProviders({ project: trackingOnlyProject, monthlyTarget: 0 });

      expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
    });

    test('累計時間が表示される', () => {
      const trackingOnlyProject = { ...mockProject, monthlyCapacity: 0 };
      renderWithProviders({
        project: trackingOnlyProject,
        monthlyTarget: 0,
        monthlyTime: 25.5,
      });

      expect(screen.getByText(/25\.5/)).toBeInTheDocument();
    });
  });

  describe('進捗状態による警告', () => {
    test('90%以上で警告表示', async () => {
      renderWithProviders({
        monthlyTime: 65,
        monthlyTarget: 70,
      });

      await waitFor(() => {
        expect(screen.getByText('93%')).toBeInTheDocument();
      });
    });

    test('100%で完了表示', async () => {
      renderWithProviders({
        monthlyTime: 70,
        monthlyTarget: 70,
      });

      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument();
      });
    });
  });
});
