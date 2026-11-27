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

  describe('更新中の読み込み状態', () => {
    it('基準時間の更新中に isLoading を true に戻さない（設定画面が再マウントされ入力のフォーカスが外れるため）', async () => {
      const seen: boolean[] = [];
      const { result } = renderHook(
        () => {
          const ctx = useSettingsContext();
          seen.push(ctx.isLoading);
          return ctx;
        },
        { wrapper }
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      seen.length = 0;

      // 保存に時間がかかる状況を再現し、途中の描画を観測する
      const { updateSettings } = jest.requireMock('../../utils/settingsUtils');
      let resolveSave: (v: unknown) => void = () => {};
      updateSettings.mockImplementationOnce(
        () => new Promise((resolve) => (resolveSave = resolve))
      );
      let pending: Promise<void> = Promise.resolve();
      act(() => {
        pending = result.current.updateBaseMonthlyHours(150);
      });
      await act(async () => {
        resolveSave({ workHours: { baseMonthlyHours: 150 } });
        await pending;
      });

      expect(seen).not.toContain(true);
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
