import { storageService } from '../storageService';
import { Project, TimeEntry } from '../../types';

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

describe('storageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadProjects', () => {
    test('should load projects via Electron IPC', async () => {
      window.electronAPI.loadProjects = jest
        .fn()
        .mockResolvedValue(mockProjects);

      const result = await storageService.loadProjects();

      expect(window.electronAPI.loadProjects).toHaveBeenCalled();
      expect(result).toEqual(mockProjects);
    });

    test('should return empty array when API returns non-array', async () => {
      window.electronAPI.loadProjects = jest.fn().mockResolvedValue(null);

      const result = await storageService.loadProjects();

      expect(result).toEqual([]);
    });

    test('should throw error on API failure', async () => {
      window.electronAPI.loadProjects = jest
        .fn()
        .mockRejectedValue(new Error('IPC Error'));

      await expect(storageService.loadProjects()).rejects.toThrow('IPC Error');
    });
  });

  describe('loadTimeEntries', () => {
    test('should load time entries via Electron IPC', async () => {
      window.electronAPI.loadTimeEntries = jest
        .fn()
        .mockResolvedValue(mockTimeEntries);

      const result = await storageService.loadTimeEntries();

      expect(window.electronAPI.loadTimeEntries).toHaveBeenCalled();
      expect(result).toEqual(mockTimeEntries);
    });

    test('should return empty array when API returns non-array', async () => {
      window.electronAPI.loadTimeEntries = jest
        .fn()
        .mockResolvedValue(undefined);

      const result = await storageService.loadTimeEntries();

      expect(result).toEqual([]);
    });
  });

  describe('saveProjects', () => {
    test('should save projects via Electron IPC', async () => {
      window.electronAPI.saveProjects = jest.fn().mockResolvedValue(undefined);

      await storageService.saveProjects(mockProjects);

      expect(window.electronAPI.saveProjects).toHaveBeenCalledWith(
        mockProjects
      );
    });

    test('should throw error on save failure', async () => {
      window.electronAPI.saveProjects = jest
        .fn()
        .mockRejectedValue(new Error('Save failed'));

      await expect(storageService.saveProjects(mockProjects)).rejects.toThrow(
        'Save failed'
      );
    });
  });

  describe('saveTimeEntries', () => {
    test('should save time entries via Electron IPC', async () => {
      window.electronAPI.saveTimeEntries = jest
        .fn()
        .mockResolvedValue(undefined);

      await storageService.saveTimeEntries(mockTimeEntries);

      expect(window.electronAPI.saveTimeEntries).toHaveBeenCalledWith(
        mockTimeEntries
      );
    });
  });

  describe('saveAll', () => {
    test('should save both projects and time entries', async () => {
      window.electronAPI.saveProjects = jest.fn().mockResolvedValue(undefined);
      window.electronAPI.saveTimeEntries = jest
        .fn()
        .mockResolvedValue(undefined);

      await storageService.saveAll(mockProjects, mockTimeEntries);

      expect(window.electronAPI.saveProjects).toHaveBeenCalledWith(
        mockProjects
      );
      expect(window.electronAPI.saveTimeEntries).toHaveBeenCalledWith(
        mockTimeEntries
      );
    });

    test('should filter out time entries with non-existent project IDs', async () => {
      window.electronAPI.saveProjects = jest.fn().mockResolvedValue(undefined);
      window.electronAPI.saveTimeEntries = jest
        .fn()
        .mockResolvedValue(undefined);

      const orphanedEntry: TimeEntry = {
        id: 'orphan',
        projectId: 'non-existent',
        startTime: '2026-01-01T09:00:00Z',
        endTime: '2026-01-01T10:00:00Z',
        description: '',
        createdAt: '2026-01-01T09:00:00Z',
        updatedAt: '2026-01-01T10:00:00Z',
      };

      await storageService.saveAll(mockProjects, [
        ...mockTimeEntries,
        orphanedEntry,
      ]);

      expect(window.electronAPI.saveTimeEntries).toHaveBeenCalledWith(
        mockTimeEntries
      );
    });
  });

  describe('loadAll', () => {
    test('should load both projects and time entries', async () => {
      window.electronAPI.loadProjects = jest
        .fn()
        .mockResolvedValue(mockProjects);
      window.electronAPI.loadTimeEntries = jest
        .fn()
        .mockResolvedValue(mockTimeEntries);

      const result = await storageService.loadAll();

      expect(result).toEqual({
        projects: mockProjects,
        timeEntries: mockTimeEntries,
      });
    });
  });
});
