import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { SettingsProvider, useSettingsContext } from '../SettingsContext';
import { DEFAULT_SETTINGS } from '../../types/settings';

// settingsUtils のモック
jest.mock('../../utils/settingsUtils', () => ({
  loadSettings: jest.fn().mockResolvedValue({
    workHours: {
      baseMonthlyHours: 140,
    },
  }),
  updateSettings: jest.fn().mockImplementation((updater) => {
    const current = { workHours: { baseMonthlyHours: 140 } };
    return Promise.resolve(updater(current));
  }),
}));

// env のモック
jest.mock('../../utils/env', () => ({
  isTestDataEnabled: jest.fn().mockReturnValue(false),
}));

describe('SettingsContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SettingsProvider>{children}</SettingsProvider>
  );

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('初期化', () => {
    it('デフォルト設定を提供する', async () => {
      const { result } = renderHook(() => useSettingsContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings).toBeDefined();
      expect(result.current.settings.workHours.baseMonthlyHours).toBe(140);
    });

    it('初期状態ではisLoadingがtrueである', async () => {
      const { result } = renderHook(() => useSettingsContext(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('設定更新', () => {
    it('月間基準時間を更新できる', async () => {
      const { result } = renderHook(() => useSettingsContext(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateBaseMonthlyHours(180);
      });

      await waitFor(() => {
        expect(result.current.settings.workHours.baseMonthlyHours).toBe(180);
      });
    });
  });

  describe('useSettingsContext', () => {
    it('SettingsProvider外で使用してもデフォルト値が返される', () => {
      const { result } = renderHook(() => useSettingsContext());

      expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
      expect(result.current.isLoading).toBe(true);
    });
  });
});
