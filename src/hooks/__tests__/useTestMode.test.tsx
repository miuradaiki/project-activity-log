import { renderHook, act } from '@testing-library/react';
import { useTestMode } from '../useTestMode';
import { Project, TimeEntry } from '../../types';
import { isTestDataEnabled } from '../../utils/env';

jest.mock('../../utils/env');
const mockIsTestDataEnabled = isTestDataEnabled as jest.MockedFunction<
  typeof isTestDataEnabled
>;

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Test Project',
    description: 'Test project description',
    monthlyCapacity: 50,
    isArchived: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

const mockTimeEntries: TimeEntry[] = [
  {
    id: 'entry-1',
    projectId: '1',
    startTime: '2026-01-01T09:00:00Z',
    endTime: '2026-01-01T10:00:00Z',
    description: '',
    createdAt: '2026-01-01T09:00:00Z',
    updatedAt: '2026-01-01T10:00:00Z',
  },
];

const TEST_MODE_KEY = 'project_activity_log_test_mode';
const TEST_PROJECTS_KEY = 'project_activity_log_test_projects';
const TEST_TIME_ENTRIES_KEY = 'project_activity_log_test_time_entries';

jest.mock('../../utils/testDataGenerator', () => ({
  generateTestData: jest.fn(() => ({
    projects: mockProjects,
    timeEntries: mockTimeEntries,
  })),
}));

// localStorageの実際の値を格納するストア
let localStorageStore: Record<string, string> = {};

describe('useTestMode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageStore = {};

    // localStorageモックの動作を設定
    (window.localStorage.getItem as jest.Mock).mockImplementation(
      (key: string) => localStorageStore[key] || null
    );
    (window.localStorage.setItem as jest.Mock).mockImplementation(
      (key: string, value: string) => {
        localStorageStore[key] = value;
      }
    );
    (window.localStorage.clear as jest.Mock).mockImplementation(() => {
      localStorageStore = {};
    });

    // デフォルトではテストモード有効
    mockIsTestDataEnabled.mockReturnValue(true);
  });

  describe('initialization', () => {
    test('should initialize with test mode disabled by default', () => {
      const { result } = renderHook(() => useTestMode());

      expect(result.current.isTestMode).toBe(false);
    });

    test('should initialize test mode as true when localStorage has test mode enabled', () => {
      localStorageStore[TEST_MODE_KEY] = 'true';
      localStorageStore[TEST_PROJECTS_KEY] = JSON.stringify(mockProjects);
      localStorageStore[TEST_TIME_ENTRIES_KEY] =
        JSON.stringify(mockTimeEntries);

      const { result } = renderHook(() => useTestMode());

      expect(result.current.isTestMode).toBe(true);
      expect(result.current.testProjects).toEqual(mockProjects);
      expect(result.current.testTimeEntries).toEqual(mockTimeEntries);
    });
  });

  describe('toggleTestMode', () => {
    test('should enable test mode and update state', async () => {
      const { result } = renderHook(() => useTestMode());

      await act(async () => {
        await result.current.toggleTestMode(true);
      });

      expect(result.current.isTestMode).toBe(true);
      expect(localStorageStore[TEST_MODE_KEY]).toBe('true');
    });

    test('should disable test mode and update state', async () => {
      localStorageStore[TEST_MODE_KEY] = 'true';
      localStorageStore[TEST_PROJECTS_KEY] = JSON.stringify(mockProjects);

      const { result } = renderHook(() => useTestMode());

      await act(async () => {
        await result.current.toggleTestMode(false);
      });

      expect(result.current.isTestMode).toBe(false);
      expect(localStorageStore[TEST_MODE_KEY]).toBe('false');
    });

    test('should not enable test mode when env is disabled', async () => {
      mockIsTestDataEnabled.mockReturnValue(false);
      const { result } = renderHook(() => useTestMode());

      await act(async () => {
        await result.current.toggleTestMode(true);
      });

      expect(result.current.isTestMode).toBe(false);
    });

    test('should dispatch testModeChanged event when toggled', async () => {
      const { result } = renderHook(() => useTestMode());
      const eventSpy = jest.fn();
      window.addEventListener('testModeChanged', eventSpy);

      await act(async () => {
        await result.current.toggleTestMode(true);
      });

      expect(eventSpy).toHaveBeenCalled();
      window.removeEventListener('testModeChanged', eventSpy);
    });

    test('should generate test data when enabling with no saved data', async () => {
      const { generateTestData } = require('../../utils/testDataGenerator');
      const { result } = renderHook(() => useTestMode());

      await act(async () => {
        await result.current.toggleTestMode(true);
      });

      expect(generateTestData).toHaveBeenCalled();
      expect(result.current.testProjects.length).toBeGreaterThan(0);
    });
  });

  describe('setTestProjects', () => {
    test('should update test projects directly', () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.setTestProjects(mockProjects);
      });

      expect(result.current.testProjects).toEqual(mockProjects);
    });

    test('should accept function updater', () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.setTestProjects(mockProjects);
      });

      const newProject: Project = {
        id: '2',
        name: 'New Project',
        description: 'New project description',
        monthlyCapacity: 30,
        isArchived: false,
        createdAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
      };

      act(() => {
        result.current.setTestProjects((prev) => [...prev, newProject]);
      });

      expect(result.current.testProjects).toHaveLength(2);
    });
  });

  describe('setTestTimeEntries', () => {
    test('should update test time entries', () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.setTestTimeEntries(mockTimeEntries);
      });

      expect(result.current.testTimeEntries).toEqual(mockTimeEntries);
    });
  });

  describe('saveTestData', () => {
    test('should persist test data to localStorage', () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.saveTestData(mockProjects, mockTimeEntries);
      });

      expect(localStorageStore[TEST_PROJECTS_KEY]).toEqual(
        JSON.stringify(mockProjects)
      );
      expect(localStorageStore[TEST_TIME_ENTRIES_KEY]).toEqual(
        JSON.stringify(mockTimeEntries)
      );
    });
  });

  describe('testDataStats', () => {
    test('should return correct counts after setting data', () => {
      const { result } = renderHook(() => useTestMode());

      act(() => {
        result.current.setTestProjects(mockProjects);
        result.current.setTestTimeEntries(mockTimeEntries);
      });

      expect(result.current.testDataStats).toEqual({
        projectCount: 1,
        timeEntryCount: 1,
      });
    });

    test('should return zero counts initially', () => {
      const { result } = renderHook(() => useTestMode());

      expect(result.current.testDataStats).toEqual({
        projectCount: 0,
        timeEntryCount: 0,
      });
    });
  });
});
