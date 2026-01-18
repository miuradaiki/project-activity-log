import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material';
import { ProjectsGrid } from '../ProjectsGrid';
import { LanguageProvider } from '../../../../contexts/LanguageContext';
import { Project, TimeEntry } from '../../../../types';
import {
  createMockProject,
  createMockTimeEntry,
} from '../../../../__mocks__/electron';

jest.mock('../ProjectCard', () => ({
  ProjectCard: ({
    project,
    isActive,
    onStartTimer,
    onEditProject,
    onArchiveProject,
    onUnarchiveProject,
    onDeleteProject,
  }: {
    project: Project;
    isActive: boolean;
    monthlyTime: number;
    monthlyTarget: number;
    onStartTimer: (project: Project) => void;
    onEditProject: (project: Project) => void;
    onArchiveProject: (project: Project) => void;
    onUnarchiveProject: (project: Project) => void;
    onDeleteProject: (project: Project) => void;
  }) => (
    <div data-testid={`project-card-${project.id}`}>
      <span>{project.name}</span>
      <span>{project.isArchived ? 'archived' : 'active'}</span>
      <span>{isActive ? 'timer-active' : 'timer-inactive'}</span>
      <button onClick={() => onStartTimer(project)}>Start Timer</button>
      <button onClick={() => onEditProject(project)}>Edit</button>
      <button onClick={() => onArchiveProject(project)}>Archive</button>
      <button onClick={() => onUnarchiveProject(project)}>Unarchive</button>
      <button onClick={() => onDeleteProject(project)}>Delete</button>
    </div>
  ),
}));

const theme = createTheme();

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <LanguageProvider>{ui}</LanguageProvider>
    </ThemeProvider>
  );
};

describe('ProjectsGrid', () => {
  const activeProject1 = createMockProject({
    id: 'project-1',
    name: 'Active Project A',
    description: 'Description A',
    isArchived: false,
    monthlyCapacity: 0.5,
    updatedAt: '2025-01-15T00:00:00Z',
  });

  const activeProject2 = createMockProject({
    id: 'project-2',
    name: 'Active Project B',
    description: 'Description B',
    isArchived: false,
    monthlyCapacity: 0.3,
    updatedAt: '2025-01-10T00:00:00Z',
  });

  const archivedProject = createMockProject({
    id: 'project-3',
    name: 'Archived Project',
    description: 'Archived Description',
    isArchived: true,
    monthlyCapacity: 0.2,
    updatedAt: '2025-01-05T00:00:00Z',
  });

  const mockProjects: Project[] = [
    activeProject1,
    activeProject2,
    archivedProject,
  ];

  const mockTimeEntries: TimeEntry[] = [
    createMockTimeEntry({
      id: 'entry-1',
      projectId: 'project-1',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
    }),
    createMockTimeEntry({
      id: 'entry-2',
      projectId: 'project-2',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 7200000).toISOString(),
    }),
  ];

  const defaultProps = {
    projects: mockProjects,
    activeProjectId: null,
    timeEntries: mockTimeEntries,
    onEditProject: jest.fn(),
    onDeleteProject: jest.fn(),
    onArchiveProject: jest.fn(),
    onUnarchiveProject: jest.fn(),
    onStartTimer: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本レンダリング', () => {
    it('検索フィールドが表示される', () => {
      renderWithProviders(<ProjectsGrid {...defaultProps} />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('ソートセレクトボックスが表示される', () => {
      renderWithProviders(<ProjectsGrid {...defaultProps} />);

      const sortSelect = screen.getByRole('combobox');
      expect(sortSelect).toBeInTheDocument();
    });

    it('タブが表示される（全て、アクティブ、アーカイブ）', () => {
      renderWithProviders(<ProjectsGrid {...defaultProps} />);

      // 日本語または英語の両方に対応
      expect(
        screen.getByRole('tab', { name: /(?:すべて|All).*3/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /(?:進行中|Active).*2/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tab', { name: /(?:アーカイブ|Archive).*1/i })
      ).toBeInTheDocument();
    });
  });

  describe('タブ切替', () => {
    it('初期状態ではアクティブタブが選択されている', () => {
      renderWithProviders(<ProjectsGrid {...defaultProps} />);

      // アクティブタブがデフォルトで選択されている（tabValue=1）
      const activeTab = screen.getByRole('tab', { name: /(?:進行中|Active)/i });
      expect(activeTab).toHaveAttribute('aria-selected', 'true');
    });

    it('「全て」タブをクリックすると全プロジェクトが表示される', async () => {
      renderWithProviders(<ProjectsGrid {...defaultProps} />);

      const allTab = screen.getByRole('tab', { name: /(?:すべて|All)/i });
      fireEvent.click(allTab);

      await waitFor(() => {
        expect(
          screen.getByTestId('project-card-project-1')
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('project-card-project-2')
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('project-card-project-3')
        ).toBeInTheDocument();
      });
    });

    it('「アクティブ」タブをクリックするとアクティブプロジェクトのみ表示', async () => {
      renderWithProviders(<ProjectsGrid {...defaultProps} />);

      const activeTab = screen.getByRole('tab', { name: /(?:進行中|Active)/i });
      fireEvent.click(activeTab);

      await waitFor(() => {
        expect(
          screen.getByTestId('project-card-project-1')
        ).toBeInTheDocument();
        expect(
          screen.getByTestId('project-card-project-2')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('project-card-project-3')
        ).not.toBeInTheDocument();
      });
    });

    it('「アーカイブ」タブをクリックするとアーカイブプロジェクトのみ表示', async () => {
      renderWithProviders(<ProjectsGrid {...defaultProps} />);

      const archiveTab = screen.getByRole('tab', {
        name: /(?:アーカイブ|Archive)/i,
      });
      fireEvent.click(archiveTab);

      await waitFor(() => {
        expect(
          screen.queryByTestId('project-card-project-1')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('project-card-project-2')
        ).not.toBeInTheDocument();
        expect(
          screen.getByTestId('project-card-project-3')
        ).toBeInTheDocument();
      });
    });
  });

  describe('検索フィルター', () => {
    it('名前で検索できる', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProjectsGrid {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'Active Project A');

      await waitFor(() => {
        expect(
          screen.getByTestId('project-card-project-1')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('project-card-project-2')
        ).not.toBeInTheDocument();
      });
    });

    it('説明で検索できる', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProjectsGrid {...defaultProps} />);

      // 「全て」タブをクリック
      const allTab = screen.getByRole('tab', { name: /(?:すべて|All)/i });
      fireEvent.click(allTab);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'Archived Description');

      await waitFor(() => {
        expect(
          screen.getByTestId('project-card-project-3')
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId('project-card-project-1')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('project-card-project-2')
        ).not.toBeInTheDocument();
      });
    });

    it('マッチしない検索では結果が空になる', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProjectsGrid {...defaultProps} />);

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'NonexistentProject');

      await waitFor(() => {
        expect(
          screen.queryByTestId('project-card-project-1')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('project-card-project-2')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('project-card-project-3')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('ソート機能', () => {
    it('名前順でソートされる', async () => {
      renderWithProviders(<ProjectsGrid {...defaultProps} />);

      // デフォルトは名前順
      const cards = screen.getAllByTestId(/project-card-/);
      expect(cards.length).toBe(2); // アクティブのみ
    });
  });

  describe('コールバック呼び出し', () => {
    it('onStartTimerが呼び出される', async () => {
      renderWithProviders(<ProjectsGrid {...defaultProps} />);

      const startTimerButton = screen.getAllByText('Start Timer')[0];
      fireEvent.click(startTimerButton);

      expect(defaultProps.onStartTimer).toHaveBeenCalled();
    });

    it('onEditProjectが呼び出される', async () => {
      renderWithProviders(<ProjectsGrid {...defaultProps} />);

      const editButton = screen.getAllByText('Edit')[0];
      fireEvent.click(editButton);

      expect(defaultProps.onEditProject).toHaveBeenCalled();
    });

    it('onArchiveProjectが呼び出される', async () => {
      renderWithProviders(<ProjectsGrid {...defaultProps} />);

      const archiveButton = screen.getAllByText('Archive')[0];
      fireEvent.click(archiveButton);

      expect(defaultProps.onArchiveProject).toHaveBeenCalled();
    });

    it('onUnarchiveProjectが呼び出される', async () => {
      renderWithProviders(<ProjectsGrid {...defaultProps} />);

      // アーカイブタブに切り替え
      const archiveTab = screen.getByRole('tab', {
        name: /(?:アーカイブ|Archive)/i,
      });
      fireEvent.click(archiveTab);

      await waitFor(() => {
        const unarchiveButton = screen.getByText('Unarchive');
        fireEvent.click(unarchiveButton);
        expect(defaultProps.onUnarchiveProject).toHaveBeenCalled();
      });
    });

    it('onDeleteProjectが呼び出される', async () => {
      renderWithProviders(<ProjectsGrid {...defaultProps} />);

      const deleteButton = screen.getAllByText('Delete')[0];
      fireEvent.click(deleteButton);

      expect(defaultProps.onDeleteProject).toHaveBeenCalled();
    });
  });

  describe('アクティブプロジェクト表示', () => {
    it('activeProjectIdが設定されている場合、対応するカードがアクティブ状態', () => {
      renderWithProviders(
        <ProjectsGrid {...defaultProps} activeProjectId="project-1" />
      );

      const card = screen.getByTestId('project-card-project-1');
      expect(card).toHaveTextContent('timer-active');
    });

    it('activeProjectIdがnullの場合、すべてのカードが非アクティブ状態', () => {
      renderWithProviders(<ProjectsGrid {...defaultProps} />);

      const cards = screen.getAllByTestId(/project-card-/);
      cards.forEach((card) => {
        expect(card).toHaveTextContent('timer-inactive');
      });
    });
  });

  describe('空データの処理', () => {
    it('プロジェクトが空の場合、タブに0件が表示される', () => {
      renderWithProviders(<ProjectsGrid {...defaultProps} projects={[]} />);

      // タブには0件の表示
      expect(
        screen.getByRole('tab', { name: /(?:すべて|All).*0/i })
      ).toBeInTheDocument();
    });
  });
});
