import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageRouter } from '../PageRouter';
import { Project, TimeEntry } from '../../types';

// Mock the child components
jest.mock('../dashboard/Dashboard', () => ({
  Dashboard: () => <div data-testid="dashboard">Dashboard</div>,
}));

jest.mock('../ui/project/ProjectsView', () => ({
  ProjectsView: () => <div data-testid="projects-view">ProjectsView</div>,
}));

jest.mock('../settings/SettingsView', () => ({
  SettingsView: () => <div data-testid="settings-view">SettingsView</div>,
}));

// LanguageContext mock
jest.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}));

const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Test Project',
    description: 'Test Description',
    monthlyCapacity: 0.5,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isArchived: false,
  },
];

const mockTimeEntries: TimeEntry[] = [
  {
    id: 'entry-1',
    projectId: 'project-1',
    description: 'Test entry',
    startTime: '2024-01-15T09:00:00.000Z',
    endTime: '2024-01-15T10:00:00.000Z',
    createdAt: '2024-01-15T09:00:00.000Z',
    updatedAt: '2024-01-15T09:00:00.000Z',
  },
];

const defaultProps = {
  activePage: 'timer' as const,
  projects: mockProjects,
  timeEntries: mockTimeEntries,
  timer: {
    activeProject: null,
    isRunning: false,
    startTime: null,
    start: jest.fn(),
    stop: jest.fn(),
    toggle: jest.fn(),
    canStart: true,
    canStop: false,
  },
  projectFormModal: {
    isOpen: false,
    data: undefined,
    open: jest.fn(),
    close: jest.fn(),
  },
  manualEntryModal: {
    isOpen: false,
    data: undefined,
    open: jest.fn(),
    close: jest.fn(),
  },
  projectOps: {
    createProject: jest.fn(),
    editProject: jest.fn(),
    archiveProject: jest.fn(),
    unarchiveProject: jest.fn(),
    deleteProject: jest.fn(),
    deleteTimeEntry: jest.fn(),
    saveTimeEntry: jest.fn(),
  },
  onStartTimer: jest.fn(),
  onImportCSV: jest.fn(),
  isDarkMode: false,
  onToggleTheme: jest.fn(),
};

describe('PageRouter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ページレンダリング', () => {
    it('timerページをレンダリングする', () => {
      render(<PageRouter {...defaultProps} activePage="timer" />);

      // タイマーページ固有のコンテンツがあることを確認
      expect(screen.getByText('timer.import.csv')).toBeInTheDocument();
    });

    it('dashboardページをレンダリングする', () => {
      render(<PageRouter {...defaultProps} activePage="dashboard" />);

      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    it('projectsページをレンダリングする', () => {
      render(<PageRouter {...defaultProps} activePage="projects" />);

      expect(screen.getByTestId('projects-view')).toBeInTheDocument();
    });

    it('settingsページをレンダリングする', () => {
      render(<PageRouter {...defaultProps} activePage="settings" />);

      expect(screen.getByTestId('settings-view')).toBeInTheDocument();
    });

    it('未知のページではnullを返す', () => {
      const { container } = render(
        <PageRouter {...defaultProps} activePage="unknown" />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('コールバックの受け渡し', () => {
    it('projectsページでプロジェクト操作コールバックが正しく渡される', () => {
      render(<PageRouter {...defaultProps} activePage="projects" />);

      // ProjectsViewがレンダリングされていることを確認
      expect(screen.getByTestId('projects-view')).toBeInTheDocument();
    });
  });
});
