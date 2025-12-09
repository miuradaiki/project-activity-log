import { renderHook, act } from '@testing-library/react';
import { useProjectOperations } from '../useProjectOperations';
import { Project, TimeEntry } from '../../types';

// uuid mock
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

const mockProject: Project = {
  id: 'project-1',
  name: 'Test Project',
  description: 'Test Description',
  monthlyCapacity: 0.5,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  isArchived: false,
};

const mockTimeEntry: TimeEntry = {
  id: 'entry-1',
  projectId: 'project-1',
  description: 'Test entry',
  startTime: '2024-01-15T09:00:00.000Z',
  endTime: '2024-01-15T10:00:00.000Z',
  createdAt: '2024-01-15T09:00:00.000Z',
  updatedAt: '2024-01-15T09:00:00.000Z',
};

describe('useProjectOperations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('createProject', () => {
    it('新しいプロジェクトを作成できる', () => {
      const setProjects = jest.fn();
      const setTimeEntries = jest.fn();
      const onTimerStop = jest.fn();

      const { result } = renderHook(() =>
        useProjectOperations({
          projects: [],
          setProjects,
          setTimeEntries,
          activeProjectId: null,
          isTimerRunning: false,
          onTimerStop,
        })
      );

      act(() => {
        result.current.createProject({
          name: 'New Project',
          description: 'New Description',
          monthlyCapacity: 0.3,
        });
      });

      expect(setProjects).toHaveBeenCalled();
      const updater = setProjects.mock.calls[0][0];
      const newProjects = updater([]);
      expect(newProjects).toHaveLength(1);
      expect(newProjects[0].name).toBe('New Project');
      expect(newProjects[0].id).toBe('mock-uuid-123');
      expect(newProjects[0].isArchived).toBe(false);
    });
  });

  describe('editProject', () => {
    it('既存のプロジェクトを編集できる', () => {
      const setProjects = jest.fn();
      const setTimeEntries = jest.fn();
      const onTimerStop = jest.fn();

      const { result } = renderHook(() =>
        useProjectOperations({
          projects: [mockProject],
          setProjects,
          setTimeEntries,
          activeProjectId: null,
          isTimerRunning: false,
          onTimerStop,
        })
      );

      act(() => {
        result.current.editProject(mockProject, {
          name: 'Updated Name',
          description: 'Updated Description',
          monthlyCapacity: 0.7,
          isArchived: false,
        });
      });

      expect(setProjects).toHaveBeenCalled();
      const updater = setProjects.mock.calls[0][0];
      const updatedProjects = updater([mockProject]);
      expect(updatedProjects[0].name).toBe('Updated Name');
      expect(updatedProjects[0].description).toBe('Updated Description');
      expect(updatedProjects[0].monthlyCapacity).toBe(0.7);
      expect(updatedProjects[0].updatedAt).toBe('2024-06-15T12:00:00.000Z');
    });
  });

  describe('archiveProject', () => {
    it('プロジェクトをアーカイブできる', () => {
      const setProjects = jest.fn();
      const setTimeEntries = jest.fn();
      const onTimerStop = jest.fn();

      const { result } = renderHook(() =>
        useProjectOperations({
          projects: [mockProject],
          setProjects,
          setTimeEntries,
          activeProjectId: null,
          isTimerRunning: false,
          onTimerStop,
        })
      );

      act(() => {
        result.current.archiveProject(mockProject);
      });

      expect(setProjects).toHaveBeenCalled();
      const updater = setProjects.mock.calls[0][0];
      const updatedProjects = updater([mockProject]);
      expect(updatedProjects[0].isArchived).toBe(true);
      expect(updatedProjects[0].archivedAt).toBe('2024-06-15T12:00:00.000Z');
    });

    it('アクティブなプロジェクトをアーカイブするとタイマーが停止する', () => {
      const setProjects = jest.fn();
      const setTimeEntries = jest.fn();
      const onTimerStop = jest.fn();

      const { result } = renderHook(() =>
        useProjectOperations({
          projects: [mockProject],
          setProjects,
          setTimeEntries,
          activeProjectId: mockProject.id,
          isTimerRunning: true,
          onTimerStop,
        })
      );

      act(() => {
        result.current.archiveProject(mockProject);
      });

      expect(onTimerStop).toHaveBeenCalled();
    });

    it('非アクティブなプロジェクトをアーカイブしてもタイマーは停止しない', () => {
      const setProjects = jest.fn();
      const setTimeEntries = jest.fn();
      const onTimerStop = jest.fn();

      const { result } = renderHook(() =>
        useProjectOperations({
          projects: [mockProject],
          setProjects,
          setTimeEntries,
          activeProjectId: 'other-project',
          isTimerRunning: true,
          onTimerStop,
        })
      );

      act(() => {
        result.current.archiveProject(mockProject);
      });

      expect(onTimerStop).not.toHaveBeenCalled();
    });
  });

  describe('unarchiveProject', () => {
    it('プロジェクトのアーカイブを解除できる', () => {
      const archivedProject = {
        ...mockProject,
        isArchived: true,
        archivedAt: '2024-06-01T00:00:00.000Z',
      };
      const setProjects = jest.fn();
      const setTimeEntries = jest.fn();
      const onTimerStop = jest.fn();

      const { result } = renderHook(() =>
        useProjectOperations({
          projects: [archivedProject],
          setProjects,
          setTimeEntries,
          activeProjectId: null,
          isTimerRunning: false,
          onTimerStop,
        })
      );

      act(() => {
        result.current.unarchiveProject(archivedProject);
      });

      expect(setProjects).toHaveBeenCalled();
      const updater = setProjects.mock.calls[0][0];
      const updatedProjects = updater([archivedProject]);
      expect(updatedProjects[0].isArchived).toBe(false);
      expect(updatedProjects[0].archivedAt).toBeUndefined();
    });
  });

  describe('deleteProject', () => {
    it('プロジェクトを削除できる', () => {
      const setProjects = jest.fn();
      const setTimeEntries = jest.fn();
      const onTimerStop = jest.fn();

      const { result } = renderHook(() =>
        useProjectOperations({
          projects: [mockProject],
          setProjects,
          setTimeEntries,
          activeProjectId: null,
          isTimerRunning: false,
          onTimerStop,
        })
      );

      act(() => {
        result.current.deleteProject(mockProject);
      });

      expect(setProjects).toHaveBeenCalled();
      const projectsUpdater = setProjects.mock.calls[0][0];
      const remainingProjects = projectsUpdater([mockProject]);
      expect(remainingProjects).toHaveLength(0);

      expect(setTimeEntries).toHaveBeenCalled();
      const entriesUpdater = setTimeEntries.mock.calls[0][0];
      const remainingEntries = entriesUpdater([mockTimeEntry]);
      expect(remainingEntries).toHaveLength(0);
    });

    it('アクティブなプロジェクトを削除するとタイマーが停止する', () => {
      const setProjects = jest.fn();
      const setTimeEntries = jest.fn();
      const onTimerStop = jest.fn();

      const { result } = renderHook(() =>
        useProjectOperations({
          projects: [mockProject],
          setProjects,
          setTimeEntries,
          activeProjectId: mockProject.id,
          isTimerRunning: true,
          onTimerStop,
        })
      );

      act(() => {
        result.current.deleteProject(mockProject);
      });

      expect(onTimerStop).toHaveBeenCalled();
    });
  });

  describe('deleteTimeEntry', () => {
    it('時間エントリを削除できる', () => {
      const setProjects = jest.fn();
      const setTimeEntries = jest.fn();
      const onTimerStop = jest.fn();

      const { result } = renderHook(() =>
        useProjectOperations({
          projects: [mockProject],
          setProjects,
          setTimeEntries,
          activeProjectId: null,
          isTimerRunning: false,
          onTimerStop,
        })
      );

      act(() => {
        result.current.deleteTimeEntry('entry-1');
      });

      expect(setTimeEntries).toHaveBeenCalled();
      const updater = setTimeEntries.mock.calls[0][0];
      const remainingEntries = updater([mockTimeEntry]);
      expect(remainingEntries).toHaveLength(0);
    });
  });

  describe('saveTimeEntry', () => {
    it('新しい時間エントリを保存できる', () => {
      const setProjects = jest.fn();
      const setTimeEntries = jest.fn();
      const onTimerStop = jest.fn();

      const { result } = renderHook(() =>
        useProjectOperations({
          projects: [mockProject],
          setProjects,
          setTimeEntries,
          activeProjectId: null,
          isTimerRunning: false,
          onTimerStop,
        })
      );

      const newEntry: TimeEntry = {
        id: 'new-entry',
        projectId: 'project-1',
        description: 'New entry',
        startTime: '2024-01-16T09:00:00.000Z',
        endTime: '2024-01-16T11:00:00.000Z',
        createdAt: '2024-01-16T09:00:00.000Z',
        updatedAt: '2024-01-16T09:00:00.000Z',
      };

      act(() => {
        result.current.saveTimeEntry(newEntry, false);
      });

      expect(setTimeEntries).toHaveBeenCalled();
      const updater = setTimeEntries.mock.calls[0][0];
      const entries = updater([mockTimeEntry]);
      expect(entries).toHaveLength(2);
      expect(entries[1]).toEqual(newEntry);
    });

    it('既存の時間エントリを編集できる', () => {
      const setProjects = jest.fn();
      const setTimeEntries = jest.fn();
      const onTimerStop = jest.fn();

      const { result } = renderHook(() =>
        useProjectOperations({
          projects: [mockProject],
          setProjects,
          setTimeEntries,
          activeProjectId: null,
          isTimerRunning: false,
          onTimerStop,
        })
      );

      const updatedEntry: TimeEntry = {
        ...mockTimeEntry,
        description: 'Updated entry',
      };

      act(() => {
        result.current.saveTimeEntry(updatedEntry, true);
      });

      expect(setTimeEntries).toHaveBeenCalled();
      const updater = setTimeEntries.mock.calls[0][0];
      const entries = updater([mockTimeEntry]);
      expect(entries).toHaveLength(1);
      expect(entries[0].description).toBe('Updated entry');
    });
  });
});
