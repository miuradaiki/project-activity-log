import { renderHook, act, waitFor } from '@testing-library/react';
import { useSettings } from '../useSettings';
import { DEFAULT_SETTINGS, AppSettings } from '../../types/settings';

// settingsUtils のモック
jest.mock('../../utils/settingsUtils', () => ({
  loadSettings: jest.fn(),
  saveSettings: jest.fn(),
  updateSettings: jest.fn(),
}));

import {
  loadSettings,
  saveSettings,
  updateSettings,
} from '../../utils/settingsUtils';

const mockLoadSettings = loadSettings as jest.MockedFunction<
  typeof loadSettings
>;
const mockSaveSettings = saveSettings as jest.MockedFunction<
  typeof saveSettings
>;
const mockUpdateSettings = updateSettings as jest.MockedFunction<
  typeof updateSettings
>;

describe('useSettings フック', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadSettings.mockResolvedValue(DEFAULT_SETTINGS);
    mockSaveSettings.mockResolvedValue(undefined);
    mockUpdateSettings.mockImplementation(async (updater) => {
      const updated = updater(DEFAULT_SETTINGS);
      return updated;
    });
  });

  describe('初期化', () => {
    test('初期状態はデフォルト設定とisLoading=trueで開始される', () => {
      const { result } = renderHook(() => useSettings());

      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    test('設定の読み込み完了後、isLoadingがfalseになる', async () => {
      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockLoadSettings).toHaveBeenCalledTimes(1);
      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    });

    test('カスタム設定が読み込まれる', async () => {
      const customSettings: AppSettings = {
        workHours: {
          baseMonthlyHours: 160,
        },
      };
      mockLoadSettings.mockResolvedValue(customSettings);

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toEqual(customSettings);
    });

    test('読み込みエラー時にerrorが設定される', async () => {
      const testError = new Error('読み込み失敗');
      mockLoadSettings.mockRejectedValue(testError);
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(testError);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateSettings', () => {
    test('設定を更新できる', async () => {
      const updatedSettings: AppSettings = {
        workHours: {
          baseMonthlyHours: 180,
        },
      };
      mockUpdateSettings.mockResolvedValue(updatedSettings);

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateSettings((current) => ({
          ...current,
          workHours: { baseMonthlyHours: 180 },
        }));
      });

      expect(result.current.settings).toEqual(updatedSettings);
      expect(mockUpdateSettings).toHaveBeenCalled();
    });

    test('更新エラー時にerrorが設定される', async () => {
      const testError = new Error('更新失敗');
      mockUpdateSettings.mockRejectedValue(testError);
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let thrownError: Error | undefined;
      await act(async () => {
        try {
          await result.current.updateSettings((current) => current);
        } catch (e) {
          thrownError = e as Error;
        }
      });

      expect(thrownError?.message).toBe('更新失敗');
      expect(result.current.error).toEqual(testError);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateBaseMonthlyHours', () => {
    test('月間基準時間を更新できる', async () => {
      const updatedSettings: AppSettings = {
        workHours: {
          baseMonthlyHours: 200,
        },
      };
      mockUpdateSettings.mockResolvedValue(updatedSettings);

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateBaseMonthlyHours(200);
      });

      expect(mockUpdateSettings).toHaveBeenCalledWith(expect.any(Function));
      expect(result.current.settings.workHours.baseMonthlyHours).toBe(200);
    });
  });

  describe('resetAllSettings', () => {
    test('設定をデフォルトにリセットできる', async () => {
      const customSettings: AppSettings = {
        workHours: {
          baseMonthlyHours: 200,
        },
      };
      mockLoadSettings.mockResolvedValue(customSettings);

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings.workHours.baseMonthlyHours).toBe(200);

      await act(async () => {
        await result.current.resetAllSettings();
      });

      expect(mockSaveSettings).toHaveBeenCalledWith(DEFAULT_SETTINGS);
      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
    });

    test('リセットエラー時にerrorが設定される', async () => {
      const testError = new Error('リセット失敗');
      mockSaveSettings.mockRejectedValue(testError);
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.resetAllSettings();
      });

      expect(result.current.error).toEqual(testError);
      consoleErrorSpy.mockRestore();
    });
  });
});
