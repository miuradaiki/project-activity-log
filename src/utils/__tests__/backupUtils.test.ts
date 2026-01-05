import { createBackup, restoreFromBackup } from '../backupUtils';

// window.electronAPI のモック
const mockGetUserDataPath = jest.fn();
const mockCreateDirectory = jest.fn();
const mockLoadProjects = jest.fn();
const mockLoadTimeEntries = jest.fn();
const mockWriteFile = jest.fn();
const mockReadFile = jest.fn();
const mockSaveProjects = jest.fn();
const mockSaveTimeEntries = jest.fn();

beforeAll(() => {
  Object.defineProperty(window, 'electronAPI', {
    value: {
      getUserDataPath: mockGetUserDataPath,
      createDirectory: mockCreateDirectory,
      loadProjects: mockLoadProjects,
      loadTimeEntries: mockLoadTimeEntries,
      writeFile: mockWriteFile,
      readFile: mockReadFile,
      saveProjects: mockSaveProjects,
      saveTimeEntries: mockSaveTimeEntries,
    },
    writable: true,
  });
});

describe('backupUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBackup', () => {
    const mockProjects = [
      {
        id: '1',
        name: 'Project A',
        description: 'Description A',
        monthlyCapacity: 50,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        isArchived: false,
      },
    ];

    const mockTimeEntries = [
      {
        id: 'entry-1',
        projectId: '1',
        startTime: '2026-01-01T09:00:00Z',
        endTime: '2026-01-01T12:00:00Z',
        description: 'Morning work',
        createdAt: '2026-01-01T09:00:00Z',
        updatedAt: '2026-01-01T12:00:00Z',
      },
    ];

    it('バックアップが正常に作成される', async () => {
      mockGetUserDataPath.mockResolvedValueOnce('/user/data');
      mockCreateDirectory.mockResolvedValueOnce(undefined);
      mockLoadProjects.mockResolvedValueOnce(mockProjects);
      mockLoadTimeEntries.mockResolvedValueOnce(mockTimeEntries);
      mockWriteFile.mockResolvedValue(undefined);

      const result = await createBackup();

      expect(result.success).toBe(true);
      expect(result.backupPath).toContain('/user/data/backups/');
      expect(result.projects).toEqual(mockProjects);
      expect(result.timeEntries).toEqual(mockTimeEntries);
    });

    it('バックアップディレクトリが作成される', async () => {
      mockGetUserDataPath.mockResolvedValueOnce('/user/data');
      mockCreateDirectory.mockResolvedValueOnce(undefined);
      mockLoadProjects.mockResolvedValueOnce(mockProjects);
      mockLoadTimeEntries.mockResolvedValueOnce(mockTimeEntries);
      mockWriteFile.mockResolvedValue(undefined);

      await createBackup();

      expect(mockCreateDirectory).toHaveBeenCalledTimes(1);
      expect(mockCreateDirectory.mock.calls[0][0]).toMatch(
        /\/user\/data\/backups\/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/
      );
    });

    it('プロジェクトデータがJSONファイルに保存される', async () => {
      mockGetUserDataPath.mockResolvedValueOnce('/user/data');
      mockCreateDirectory.mockResolvedValueOnce(undefined);
      mockLoadProjects.mockResolvedValueOnce(mockProjects);
      mockLoadTimeEntries.mockResolvedValueOnce(mockTimeEntries);
      mockWriteFile.mockResolvedValue(undefined);

      await createBackup();

      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('/projects.json'),
        JSON.stringify(mockProjects, null, 2)
      );
    });

    it('タイムエントリデータがJSONファイルに保存される', async () => {
      mockGetUserDataPath.mockResolvedValueOnce('/user/data');
      mockCreateDirectory.mockResolvedValueOnce(undefined);
      mockLoadProjects.mockResolvedValueOnce(mockProjects);
      mockLoadTimeEntries.mockResolvedValueOnce(mockTimeEntries);
      mockWriteFile.mockResolvedValue(undefined);

      await createBackup();

      expect(mockWriteFile).toHaveBeenCalledWith(
        expect.stringContaining('/timeEntries.json'),
        JSON.stringify(mockTimeEntries, null, 2)
      );
    });

    it('ディレクトリ作成に失敗した場合、エラーを返す', async () => {
      mockGetUserDataPath.mockResolvedValueOnce('/user/data');
      mockCreateDirectory.mockRejectedValueOnce(new Error('Permission denied'));

      const result = await createBackup();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('ファイル書き込みに失敗した場合、エラーを返す', async () => {
      mockGetUserDataPath.mockResolvedValueOnce('/user/data');
      mockCreateDirectory.mockResolvedValueOnce(undefined);
      mockLoadProjects.mockResolvedValueOnce(mockProjects);
      mockLoadTimeEntries.mockResolvedValueOnce(mockTimeEntries);
      mockWriteFile.mockRejectedValueOnce(new Error('Disk full'));

      const result = await createBackup();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('データ読み込みに失敗した場合、エラーを返す', async () => {
      mockGetUserDataPath.mockResolvedValueOnce('/user/data');
      mockCreateDirectory.mockResolvedValueOnce(undefined);
      mockLoadProjects.mockRejectedValueOnce(new Error('Data corrupted'));

      const result = await createBackup();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('restoreFromBackup', () => {
    const mockProjects = [
      {
        id: '1',
        name: 'Project A',
        description: 'Description A',
        monthlyCapacity: 50,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        isArchived: false,
      },
    ];

    const mockTimeEntries = [
      {
        id: 'entry-1',
        projectId: '1',
        startTime: '2026-01-01T09:00:00Z',
        endTime: '2026-01-01T12:00:00Z',
        description: 'Morning work',
        createdAt: '2026-01-01T09:00:00Z',
        updatedAt: '2026-01-01T12:00:00Z',
      },
    ];

    it('バックアップからデータが正常に復元される', async () => {
      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(mockProjects))
        .mockResolvedValueOnce(JSON.stringify(mockTimeEntries));
      mockSaveProjects.mockResolvedValueOnce(undefined);
      mockSaveTimeEntries.mockResolvedValueOnce(undefined);

      const result = await restoreFromBackup('/backup/2026-01-01');

      expect(result.success).toBe(true);
    });

    it('正しいパスからファイルを読み込む', async () => {
      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(mockProjects))
        .mockResolvedValueOnce(JSON.stringify(mockTimeEntries));
      mockSaveProjects.mockResolvedValueOnce(undefined);
      mockSaveTimeEntries.mockResolvedValueOnce(undefined);

      await restoreFromBackup('/backup/2026-01-01');

      expect(mockReadFile).toHaveBeenCalledWith(
        '/backup/2026-01-01/projects.json',
        { encoding: 'utf8' }
      );
      expect(mockReadFile).toHaveBeenCalledWith(
        '/backup/2026-01-01/timeEntries.json',
        { encoding: 'utf8' }
      );
    });

    it('復元したデータが保存される', async () => {
      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(mockProjects))
        .mockResolvedValueOnce(JSON.stringify(mockTimeEntries));
      mockSaveProjects.mockResolvedValueOnce(undefined);
      mockSaveTimeEntries.mockResolvedValueOnce(undefined);

      await restoreFromBackup('/backup/2026-01-01');

      expect(mockSaveProjects).toHaveBeenCalledWith(mockProjects);
      expect(mockSaveTimeEntries).toHaveBeenCalledWith(mockTimeEntries);
    });

    it('バックアップファイルが存在しない場合、エラーを返す', async () => {
      mockReadFile.mockRejectedValueOnce(new Error('File not found'));

      const result = await restoreFromBackup('/backup/nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('JSONパースに失敗した場合、エラーを返す', async () => {
      mockReadFile.mockResolvedValueOnce('invalid json');

      const result = await restoreFromBackup('/backup/2026-01-01');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('データ保存に失敗した場合、エラーを返す', async () => {
      mockReadFile
        .mockResolvedValueOnce(JSON.stringify(mockProjects))
        .mockResolvedValueOnce(JSON.stringify(mockTimeEntries));
      mockSaveProjects.mockRejectedValueOnce(new Error('Save failed'));

      const result = await restoreFromBackup('/backup/2026-01-01');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
