import { safeImportWorkLog } from '../safeImportUtils';
import { createBackup, restoreFromBackup } from '../backupUtils';
import { importWorkLog } from '../importUtils';
import { Project, TimeEntry } from '../../types';

// backupUtilsとimportUtilsをモック
jest.mock('../backupUtils');
jest.mock('../importUtils');

const mockCreateBackup = createBackup as jest.MockedFunction<
  typeof createBackup
>;
const mockRestoreFromBackup = restoreFromBackup as jest.MockedFunction<
  typeof restoreFromBackup
>;
const mockImportWorkLog = importWorkLog as jest.MockedFunction<
  typeof importWorkLog
>;

// window.electronAPI のモック
const mockSaveProjects = jest.fn();
const mockSaveTimeEntries = jest.fn();

beforeAll(() => {
  Object.defineProperty(window, 'electronAPI', {
    value: {
      saveProjects: mockSaveProjects,
      saveTimeEntries: mockSaveTimeEntries,
    },
    writable: true,
  });
});

describe('safeImportUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('safeImportWorkLog', () => {
    const mockCurrentProjects: Project[] = [
      {
        id: 'existing-1',
        name: 'Existing Project',
        description: 'Existing description',
        monthlyCapacity: 50,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        isArchived: false,
      },
    ];

    const mockCurrentTimeEntries: TimeEntry[] = [
      {
        id: 'entry-1',
        projectId: 'existing-1',
        startTime: '2026-01-01T09:00:00Z',
        endTime: '2026-01-01T12:00:00Z',
        description: 'Existing work',
        createdAt: '2026-01-01T09:00:00Z',
        updatedAt: '2026-01-01T12:00:00Z',
      },
    ];

    const mockImportedProjects: Project[] = [
      ...mockCurrentProjects,
      {
        id: 'new-1',
        name: 'Imported Project',
        description: 'Imported description',
        monthlyCapacity: 1,
        createdAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-01-02T00:00:00Z',
        isArchived: false,
      },
    ];

    const mockImportedTimeEntries: TimeEntry[] = [
      ...mockCurrentTimeEntries,
      {
        id: 'entry-2',
        projectId: 'new-1',
        startTime: '2026-01-02T10:00:00Z',
        endTime: '2026-01-02T15:00:00Z',
        description: 'Imported work',
        createdAt: '2026-01-02T10:00:00Z',
        updatedAt: '2026-01-02T15:00:00Z',
      },
    ];

    it('正常にインポートが完了する', async () => {
      mockCreateBackup.mockResolvedValueOnce({
        success: true,
        backupPath: '/backup/2026-01-01',
        projects: mockCurrentProjects,
        timeEntries: mockCurrentTimeEntries,
      });
      mockImportWorkLog.mockResolvedValueOnce({
        projects: mockImportedProjects,
        timeEntries: mockImportedTimeEntries,
      });
      mockSaveProjects.mockResolvedValueOnce(undefined);
      mockSaveTimeEntries.mockResolvedValueOnce(undefined);

      const onSuccess = jest.fn();

      const result = await safeImportWorkLog(
        '/path/to/file.csv',
        mockCurrentProjects,
        mockCurrentTimeEntries,
        onSuccess
      );

      expect(result.success).toBe(true);
      expect(result.backupPath).toBe('/backup/2026-01-01');
    });

    it('バックアップが作成される', async () => {
      mockCreateBackup.mockResolvedValueOnce({
        success: true,
        backupPath: '/backup/2026-01-01',
        projects: mockCurrentProjects,
        timeEntries: mockCurrentTimeEntries,
      });
      mockImportWorkLog.mockResolvedValueOnce({
        projects: mockImportedProjects,
        timeEntries: mockImportedTimeEntries,
      });
      mockSaveProjects.mockResolvedValueOnce(undefined);
      mockSaveTimeEntries.mockResolvedValueOnce(undefined);

      const onSuccess = jest.fn();

      await safeImportWorkLog(
        '/path/to/file.csv',
        mockCurrentProjects,
        mockCurrentTimeEntries,
        onSuccess
      );

      expect(mockCreateBackup).toHaveBeenCalledTimes(1);
    });

    it('インポート結果が保存される', async () => {
      mockCreateBackup.mockResolvedValueOnce({
        success: true,
        backupPath: '/backup/2026-01-01',
        projects: mockCurrentProjects,
        timeEntries: mockCurrentTimeEntries,
      });
      mockImportWorkLog.mockResolvedValueOnce({
        projects: mockImportedProjects,
        timeEntries: mockImportedTimeEntries,
      });
      mockSaveProjects.mockResolvedValueOnce(undefined);
      mockSaveTimeEntries.mockResolvedValueOnce(undefined);

      const onSuccess = jest.fn();

      await safeImportWorkLog(
        '/path/to/file.csv',
        mockCurrentProjects,
        mockCurrentTimeEntries,
        onSuccess
      );

      expect(mockSaveProjects).toHaveBeenCalledWith(mockImportedProjects);
      expect(mockSaveTimeEntries).toHaveBeenCalledWith(mockImportedTimeEntries);
    });

    it('成功コールバックが呼ばれる', async () => {
      mockCreateBackup.mockResolvedValueOnce({
        success: true,
        backupPath: '/backup/2026-01-01',
        projects: mockCurrentProjects,
        timeEntries: mockCurrentTimeEntries,
      });
      mockImportWorkLog.mockResolvedValueOnce({
        projects: mockImportedProjects,
        timeEntries: mockImportedTimeEntries,
      });
      mockSaveProjects.mockResolvedValueOnce(undefined);
      mockSaveTimeEntries.mockResolvedValueOnce(undefined);

      const onSuccess = jest.fn();

      await safeImportWorkLog(
        '/path/to/file.csv',
        mockCurrentProjects,
        mockCurrentTimeEntries,
        onSuccess
      );

      expect(onSuccess).toHaveBeenCalledWith(
        mockImportedProjects,
        mockImportedTimeEntries
      );
    });

    it('バックアップ作成に失敗した場合、エラーを返す', async () => {
      mockCreateBackup.mockResolvedValueOnce({
        success: false,
        error: new Error('Backup failed'),
      });

      const onSuccess = jest.fn();

      const result = await safeImportWorkLog(
        '/path/to/file.csv',
        mockCurrentProjects,
        mockCurrentTimeEntries,
        onSuccess
      );

      expect(result.success).toBe(false);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('インポートに失敗した場合、バックアップから復元される', async () => {
      mockCreateBackup.mockResolvedValueOnce({
        success: true,
        backupPath: '/backup/2026-01-01',
        projects: mockCurrentProjects,
        timeEntries: mockCurrentTimeEntries,
      });
      mockImportWorkLog.mockRejectedValueOnce(new Error('Import failed'));
      mockRestoreFromBackup.mockResolvedValueOnce({ success: true });

      const onSuccess = jest.fn();

      const result = await safeImportWorkLog(
        '/path/to/file.csv',
        mockCurrentProjects,
        mockCurrentTimeEntries,
        onSuccess
      );

      expect(result.success).toBe(false);
      expect(mockRestoreFromBackup).toHaveBeenCalledWith('/backup/2026-01-01');
    });

    it('データ保存に失敗した場合、バックアップから復元される', async () => {
      mockCreateBackup.mockResolvedValueOnce({
        success: true,
        backupPath: '/backup/2026-01-01',
        projects: mockCurrentProjects,
        timeEntries: mockCurrentTimeEntries,
      });
      mockImportWorkLog.mockResolvedValueOnce({
        projects: mockImportedProjects,
        timeEntries: mockImportedTimeEntries,
      });
      mockSaveProjects.mockRejectedValueOnce(new Error('Save failed'));
      mockRestoreFromBackup.mockResolvedValueOnce({ success: true });

      const onSuccess = jest.fn();

      const result = await safeImportWorkLog(
        '/path/to/file.csv',
        mockCurrentProjects,
        mockCurrentTimeEntries,
        onSuccess
      );

      expect(result.success).toBe(false);
      expect(mockRestoreFromBackup).toHaveBeenCalledWith('/backup/2026-01-01');
    });

    it('復元に失敗しても結果はエラーとして返される', async () => {
      mockCreateBackup.mockResolvedValueOnce({
        success: true,
        backupPath: '/backup/2026-01-01',
        projects: mockCurrentProjects,
        timeEntries: mockCurrentTimeEntries,
      });
      mockImportWorkLog.mockRejectedValueOnce(new Error('Import failed'));
      mockRestoreFromBackup.mockResolvedValueOnce({
        success: false,
        error: new Error('Restore failed'),
      });

      const onSuccess = jest.fn();

      const result = await safeImportWorkLog(
        '/path/to/file.csv',
        mockCurrentProjects,
        mockCurrentTimeEntries,
        onSuccess
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('importWorkLogに正しい引数が渡される', async () => {
      mockCreateBackup.mockResolvedValueOnce({
        success: true,
        backupPath: '/backup/2026-01-01',
        projects: mockCurrentProjects,
        timeEntries: mockCurrentTimeEntries,
      });
      mockImportWorkLog.mockResolvedValueOnce({
        projects: mockImportedProjects,
        timeEntries: mockImportedTimeEntries,
      });
      mockSaveProjects.mockResolvedValueOnce(undefined);
      mockSaveTimeEntries.mockResolvedValueOnce(undefined);

      const onSuccess = jest.fn();

      await safeImportWorkLog(
        '/path/to/file.csv',
        mockCurrentProjects,
        mockCurrentTimeEntries,
        onSuccess
      );

      expect(mockImportWorkLog).toHaveBeenCalledWith(
        '/path/to/file.csv',
        mockCurrentProjects,
        mockCurrentTimeEntries
      );
    });
  });
});
