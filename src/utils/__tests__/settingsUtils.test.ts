import {
  saveSettings,
  loadSettings,
  updateSettings,
  resetSettings,
} from '../settingsUtils';
import { DEFAULT_SETTINGS, AppSettings } from '../../types/settings';

// window.electronAPI のモック
const mockWriteFile = jest.fn();
const mockReadFile = jest.fn();
const mockRemoveFile = jest.fn();

beforeAll(() => {
  Object.defineProperty(window, 'electronAPI', {
    value: {
      writeFile: mockWriteFile,
      readFile: mockReadFile,
      removeFile: mockRemoveFile,
    },
    writable: true,
  });
});

describe('settingsUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('saveSettings', () => {
    it('設定をJSONとして保存する', async () => {
      mockWriteFile.mockResolvedValueOnce(undefined);
      const settings: AppSettings = {
        workHours: { baseMonthlyHours: 160 },
      };

      await saveSettings(settings);

      expect(mockWriteFile).toHaveBeenCalledWith(
        'settings.json',
        JSON.stringify(settings, null, 2)
      );
    });

    it('保存に失敗した場合はエラーをスローする', async () => {
      mockWriteFile.mockRejectedValueOnce(new Error('Write failed'));

      await expect(saveSettings(DEFAULT_SETTINGS)).rejects.toThrow(
        'Write failed'
      );
    });
  });

  describe('loadSettings', () => {
    it('設定ファイルを読み込んで返す', async () => {
      const savedSettings: AppSettings = {
        workHours: { baseMonthlyHours: 180 },
      };
      mockReadFile.mockResolvedValueOnce(JSON.stringify(savedSettings));

      const result = await loadSettings();

      expect(result).toEqual(savedSettings);
    });

    it('ファイルが存在しない場合はデフォルト設定を保存して返す', async () => {
      mockReadFile.mockRejectedValueOnce(new Error('ENOENT: no such file'));
      mockWriteFile.mockResolvedValueOnce(undefined);

      const result = await loadSettings();

      expect(result).toEqual(DEFAULT_SETTINGS);
      expect(mockWriteFile).toHaveBeenCalled();
    });

    it('JSONパースエラーの場合は設定をリセットしてデフォルトを返す', async () => {
      mockReadFile.mockResolvedValueOnce('invalid json');
      mockRemoveFile.mockResolvedValueOnce(undefined);
      mockWriteFile.mockResolvedValueOnce(undefined);

      const result = await loadSettings();

      expect(result).toEqual(DEFAULT_SETTINGS);
      expect(mockRemoveFile).toHaveBeenCalledWith('settings.json');
    });

    it('予期せぬエラーの場合はデフォルト設定を返す', async () => {
      mockReadFile.mockRejectedValueOnce(new Error('Unknown error'));

      const result = await loadSettings();

      expect(result).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe('updateSettings', () => {
    it('設定を更新して保存する', async () => {
      const currentSettings: AppSettings = {
        workHours: { baseMonthlyHours: 140 },
      };
      mockReadFile.mockResolvedValueOnce(JSON.stringify(currentSettings));
      mockWriteFile.mockResolvedValueOnce(undefined);

      const result = await updateSettings((current) => ({
        ...current,
        workHours: { baseMonthlyHours: 200 },
      }));

      expect(result.workHours.baseMonthlyHours).toBe(200);
      expect(mockWriteFile).toHaveBeenCalled();
    });

    it('更新に失敗した場合はエラーをスローする', async () => {
      mockReadFile.mockRejectedValueOnce(new Error('ENOENT: no such file'));
      mockWriteFile.mockResolvedValueOnce(undefined);
      mockWriteFile.mockRejectedValueOnce(new Error('Write failed'));

      await expect(
        updateSettings((current) => ({
          ...current,
          workHours: { baseMonthlyHours: 200 },
        }))
      ).rejects.toThrow('Write failed');
    });
  });

  describe('resetSettings', () => {
    it('設定をデフォルトにリセットする', async () => {
      mockWriteFile.mockResolvedValueOnce(undefined);

      const result = await resetSettings();

      expect(result).toEqual(DEFAULT_SETTINGS);
      expect(mockWriteFile).toHaveBeenCalledWith(
        'settings.json',
        JSON.stringify(DEFAULT_SETTINGS, null, 2)
      );
    });

    it('リセットに失敗した場合はエラーをスローする', async () => {
      mockWriteFile.mockRejectedValueOnce(new Error('Reset failed'));

      await expect(resetSettings()).rejects.toThrow('Reset failed');
    });
  });
});
