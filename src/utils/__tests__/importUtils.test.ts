import { importWorkLog } from '../importUtils';
import { Project, TimeEntry } from '../../types';

// window.electronAPI のモック
const mockReadFile = jest.fn();

beforeAll(() => {
  Object.defineProperty(window, 'electronAPI', {
    value: {
      readFile: mockReadFile,
    },
    writable: true,
  });
});

// uuid のモック
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
}));

describe('importUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('importWorkLog', () => {
    const sampleCSV = `date,start_time,end_time,duration_minutes,project_name,project_description,notes
2025/01/15,09:00:00,12:00:00,180,Project A,Description A,Morning work
2025/01/15,13:00:00,17:00:00,240,Project A,Description A,Afternoon work
2025/01/16,10:00:00,18:00:00,480,Project B,Description B,Full day work`;

    it('CSVファイルをパースしてプロジェクトとタイムエントリを作成する', async () => {
      mockReadFile.mockResolvedValueOnce(sampleCSV);

      const result = await importWorkLog('/path/to/file.csv', [], []);

      expect(result.projects).toHaveLength(2);
      expect(result.projects[0].name).toBe('Project A');
      expect(result.projects[1].name).toBe('Project B');
      expect(result.timeEntries).toHaveLength(3);
    });

    it('既存のプロジェクトがある場合は新規作成しない', async () => {
      mockReadFile.mockResolvedValueOnce(sampleCSV);
      const existingProject: Project = {
        id: 'existing-project-id',
        name: 'Project A',
        description: 'Existing description',
        monthlyCapacity: 0.5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isArchived: false,
      };

      const result = await importWorkLog(
        '/path/to/file.csv',
        [existingProject],
        []
      );

      expect(result.projects).toHaveLength(2);
      expect(result.projects[0]).toEqual(existingProject);
      expect(result.projects[1].name).toBe('Project B');
    });

    it('タイムエントリに正しいプロジェクトIDが設定される', async () => {
      mockReadFile.mockResolvedValueOnce(sampleCSV);
      const existingProject: Project = {
        id: 'existing-project-id',
        name: 'Project A',
        description: 'Existing description',
        monthlyCapacity: 0.5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isArchived: false,
      };

      const result = await importWorkLog(
        '/path/to/file.csv',
        [existingProject],
        []
      );

      const projectAEntries = result.timeEntries.filter(
        (entry) => entry.projectId === 'existing-project-id'
      );
      expect(projectAEntries).toHaveLength(2);
    });

    it('既存のタイムエントリを保持する', async () => {
      mockReadFile.mockResolvedValueOnce(sampleCSV);
      const existingEntry: TimeEntry = {
        id: 'existing-entry-id',
        projectId: 'some-project-id',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        description: 'Existing entry',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const result = await importWorkLog(
        '/path/to/file.csv',
        [],
        [existingEntry]
      );

      expect(result.timeEntries).toHaveLength(4);
      expect(result.timeEntries[0]).toEqual(existingEntry);
    });

    it('空行をスキップする', async () => {
      const csvWithEmptyLines = `date,start_time,end_time,duration_minutes,project_name,project_description,notes
2025/01/15,09:00:00,12:00:00,180,Project A,Description A,Work

2025/01/16,10:00:00,18:00:00,480,Project B,Description B,Work`;
      mockReadFile.mockResolvedValueOnce(csvWithEmptyLines);

      const result = await importWorkLog('/path/to/file.csv', [], []);

      expect(result.timeEntries).toHaveLength(2);
    });

    it('日付と時刻を正しくパースする', async () => {
      const singleEntryCSV = `date,start_time,end_time,duration_minutes,project_name,project_description,notes
2025/03/20,14:30:00,16:45:00,135,Test Project,Test,Note`;
      mockReadFile.mockResolvedValueOnce(singleEntryCSV);

      const result = await importWorkLog('/path/to/file.csv', [], []);

      const entry = result.timeEntries[0];
      const startTime = new Date(entry.startTime);
      const endTime = new Date(entry.endTime);

      expect(startTime.getFullYear()).toBe(2025);
      expect(startTime.getMonth()).toBe(2); // March is 2 (0-indexed)
      expect(startTime.getDate()).toBe(20);
      expect(startTime.getHours()).toBe(14);
      expect(startTime.getMinutes()).toBe(30);

      expect(endTime.getHours()).toBe(16);
      expect(endTime.getMinutes()).toBe(45);
    });

    it('ノートが空の場合でも正しく処理する', async () => {
      const csvWithoutNotes = `date,start_time,end_time,duration_minutes,project_name,project_description,notes
2025/01/15,09:00:00,12:00:00,180,Project A,Description A,`;
      mockReadFile.mockResolvedValueOnce(csvWithoutNotes);

      const result = await importWorkLog('/path/to/file.csv', [], []);

      expect(result.timeEntries[0].description).toBe('');
    });
  });
});
