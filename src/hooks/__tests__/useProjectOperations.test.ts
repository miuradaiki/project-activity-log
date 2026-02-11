import { renderHook, act } from '@testing-library/react';
import { useProjectOperations } from '../useProjectOperations';
import { TimeEntry } from '../../types';
import {
  createMockProject,
  createMockTimeEntry,
} from '../../__tests__/helpers';

// uuid mock
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

const mockProject = createMockProject({
  id: 'project-1',
  name: 'Test Project',
  description: 'Test Description',
});

const mockTimeEntry = createMockTimeEntry({
  id: 'entry-1',
  projectId: 'project-1',
  description: 'Test entry',
  startTime: '2024-01-15T09:00:00.000Z',
  endTime: '2024-01-15T10:00:00.000Z',
});

// プロップファクトリ
const createDefaultProps = (
  overrides: Partial<Parameters<typeof useProjectOperations>[0]> = {}
) => ({
  projects: [mockProject],
  setProjects: jest.fn(),
  setTimeEntries: jest.fn(),
  activeProjectId: null as string | null,
  isTimerRunning: false,
  onTimerStop: jest.fn(),
  ...overrides,
});

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
      const props = createDefaultProps({ projects: [] });
      const { result } = renderHook(() => useProjectOperations(props));

      act(() => {
        result.current.createProject({
          name: 'New Project',
          description: 'New Description',
          monthlyCapacity: 0.3,
        });
      });

      expect(props.setProjects).toHaveBeenCalled();
      const updater = (props.setProjects as jest.Mock).mock.calls[0][0];
      const newProjects = updater([]);
      expect(newProjects).toHaveLength(1);
      expect(newProjects[0].name).toBe('New Project');
      expect(newProjects[0].id).toBe('mock-uuid-123');
      expect(newProjects[0].isArchived).toBe(false);
    });
  });

  describe('editProject', () => {
    it('既存のプロジェクトを編集できる', () => {
      const props = createDefaultProps();
      const { result } = renderHook(() => useProjectOperations(props));

      act(() => {
        result.current.editProject(mockProject, {
          name: 'Updated Name',
          description: 'Updated Description',
          monthlyCapacity: 0.7,
          isArchived: false,
        });
      });

      expect(props.setProjects).toHaveBeenCalled();
      const updater = (props.setProjects as jest.Mock).mock.calls[0][0];
      const updatedProjects = updater([mockProject]);
      expect(updatedProjects[0].name).toBe('Updated Name');
      expect(updatedProjects[0].description).toBe('Updated Description');
      expect(updatedProjects[0].monthlyCapacity).toBe(0.7);
      expect(updatedProjects[0].updatedAt).toBe('2024-06-15T12:00:00.000Z');
    });
  });

  describe('archiveProject', () => {
    it('プロジェクトをアーカイブできる', () => {
      const props = createDefaultProps();
      const { result } = renderHook(() => useProjectOperations(props));

      act(() => {
        result.current.archiveProject(mockProject);
      });

      expect(props.setProjects).toHaveBeenCalled();
      const updater = (props.setProjects as jest.Mock).mock.calls[0][0];
      const updatedProjects = updater([mockProject]);
      expect(updatedProjects[0].isArchived).toBe(true);
      expect(updatedProjects[0].archivedAt).toBe('2024-06-15T12:00:00.000Z');
    });

    it('アクティブなプロジェクトをアーカイブするとタイマーが停止する', () => {
      const props = createDefaultProps({
        activeProjectId: mockProject.id,
        isTimerRunning: true,
      });
      const { result } = renderHook(() => useProjectOperations(props));

      act(() => {
        result.current.archiveProject(mockProject);
      });

      expect(props.onTimerStop).toHaveBeenCalled();
    });

    it('非アクティブなプロジェクトをアーカイブしてもタイマーは停止しない', () => {
      const props = createDefaultProps({
        activeProjectId: 'other-project',
        isTimerRunning: true,
      });
      const { result } = renderHook(() => useProjectOperations(props));

      act(() => {
        result.current.archiveProject(mockProject);
      });

      expect(props.onTimerStop).not.toHaveBeenCalled();
    });
  });

  describe('unarchiveProject', () => {
    it('プロジェクトのアーカイブを解除できる', () => {
      const archivedProject = {
        ...mockProject,
        isArchived: true,
        archivedAt: '2024-06-01T00:00:00.000Z',
      };
      const props = createDefaultProps({ projects: [archivedProject] });
      const { result } = renderHook(() => useProjectOperations(props));

      act(() => {
        result.current.unarchiveProject(archivedProject);
      });

      expect(props.setProjects).toHaveBeenCalled();
      const updater = (props.setProjects as jest.Mock).mock.calls[0][0];
      const updatedProjects = updater([archivedProject]);
      expect(updatedProjects[0].isArchived).toBe(false);
      expect(updatedProjects[0].archivedAt).toBeUndefined();
    });
  });

  describe('deleteProject', () => {
    it('プロジェクトを削除できる', () => {
      const props = createDefaultProps();
      const { result } = renderHook(() => useProjectOperations(props));

      act(() => {
        result.current.deleteProject(mockProject);
      });

      expect(props.setProjects).toHaveBeenCalled();
      const projectsUpdater = (props.setProjects as jest.Mock).mock.calls[0][0];
      const remainingProjects = projectsUpdater([mockProject]);
      expect(remainingProjects).toHaveLength(0);

      expect(props.setTimeEntries).toHaveBeenCalled();
      const entriesUpdater = (props.setTimeEntries as jest.Mock).mock
        .calls[0][0];
      const remainingEntries = entriesUpdater([mockTimeEntry]);
      expect(remainingEntries).toHaveLength(0);
    });

    it('アクティブなプロジェクトを削除するとタイマーが停止する', () => {
      const props = createDefaultProps({
        activeProjectId: mockProject.id,
        isTimerRunning: true,
      });
      const { result } = renderHook(() => useProjectOperations(props));

      act(() => {
        result.current.deleteProject(mockProject);
      });

      expect(props.onTimerStop).toHaveBeenCalled();
    });
  });

  describe('deleteTimeEntry', () => {
    it('時間エントリを削除できる', () => {
      const props = createDefaultProps();
      const { result } = renderHook(() => useProjectOperations(props));

      act(() => {
        result.current.deleteTimeEntry('entry-1');
      });

      expect(props.setTimeEntries).toHaveBeenCalled();
      const updater = (props.setTimeEntries as jest.Mock).mock.calls[0][0];
      const remainingEntries = updater([mockTimeEntry]);
      expect(remainingEntries).toHaveLength(0);
    });
  });

  describe('saveTimeEntry', () => {
    it('新しい時間エントリを保存できる', () => {
      const props = createDefaultProps();
      const { result } = renderHook(() => useProjectOperations(props));

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

      expect(props.setTimeEntries).toHaveBeenCalled();
      const updater = (props.setTimeEntries as jest.Mock).mock.calls[0][0];
      const entries = updater([mockTimeEntry]);
      expect(entries).toHaveLength(2);
      expect(entries[1]).toEqual(newEntry);
    });

    it('日跨ぎ分割エントリを連続保存しても既存エントリが複製されない（Bug #4）', () => {
      const props = createDefaultProps();
      const { result } = renderHook(() => useProjectOperations(props));

      const existingEntries: TimeEntry[] = [
        {
          id: 'existing-1',
          projectId: 'project-1',
          description: 'Morning work',
          startTime: '2024-01-15T05:40:00.000Z',
          endTime: '2024-01-15T06:50:00.000Z',
          createdAt: '2024-01-15T06:50:00.000Z',
          updatedAt: '2024-01-15T06:50:00.000Z',
        },
        {
          id: 'existing-2',
          projectId: 'project-1',
          description: 'Afternoon work',
          startTime: '2024-01-15T07:27:00.000Z',
          endTime: '2024-01-15T08:59:00.000Z',
          createdAt: '2024-01-15T08:59:00.000Z',
          updatedAt: '2024-01-15T08:59:00.000Z',
        },
      ];

      // Simulate saving two split entries from a multi-day entry
      const splitEntry1: TimeEntry = {
        id: 'split-1',
        projectId: 'project-1',
        description: 'Night work',
        startTime: '2024-01-15T09:33:00.000Z',
        endTime: '2024-01-15T14:59:59.999Z',
        createdAt: '2024-01-15T15:09:00.000Z',
        updatedAt: '2024-01-15T15:09:00.000Z',
      };

      const splitEntry2: TimeEntry = {
        id: 'split-2',
        projectId: 'project-1',
        description: 'Night work (2日目)',
        startTime: '2024-01-16T00:00:00.000Z',
        endTime: '2024-01-15T15:09:00.000Z',
        createdAt: '2024-01-15T15:09:00.000Z',
        updatedAt: '2024-01-15T15:09:00.000Z',
      };

      // Save first split entry
      act(() => {
        result.current.saveTimeEntry(splitEntry1, false);
      });

      // Save second split entry
      act(() => {
        result.current.saveTimeEntry(splitEntry2, false);
      });

      // Verify setTimeEntries was called twice
      expect(props.setTimeEntries).toHaveBeenCalledTimes(2);

      // Simulate the state updates sequentially
      const updater1 = (props.setTimeEntries as jest.Mock).mock.calls[0][0];
      const afterFirst = updater1(existingEntries);
      expect(afterFirst).toHaveLength(3);
      expect(afterFirst[0]).toEqual(existingEntries[0]);
      expect(afterFirst[1]).toEqual(existingEntries[1]);
      expect(afterFirst[2]).toEqual(splitEntry1);

      const updater2 = (props.setTimeEntries as jest.Mock).mock.calls[1][0];
      const afterSecond = updater2(afterFirst);
      expect(afterSecond).toHaveLength(4);
      expect(afterSecond[0]).toEqual(existingEntries[0]);
      expect(afterSecond[1]).toEqual(existingEntries[1]);
      expect(afterSecond[2]).toEqual(splitEntry1);
      expect(afterSecond[3]).toEqual(splitEntry2);
    });

    it('既存の時間エントリを編集できる', () => {
      const props = createDefaultProps();
      const { result } = renderHook(() => useProjectOperations(props));

      const updatedEntry: TimeEntry = {
        ...mockTimeEntry,
        description: 'Updated entry',
      };

      act(() => {
        result.current.saveTimeEntry(updatedEntry, true);
      });

      expect(props.setTimeEntries).toHaveBeenCalled();
      const updater = (props.setTimeEntries as jest.Mock).mock.calls[0][0];
      const entries = updater([mockTimeEntry]);
      expect(entries).toHaveLength(1);
      expect(entries[0].description).toBe('Updated entry');
    });
  });
});
