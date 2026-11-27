import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { LanguageProvider } from '../../../../contexts/LanguageContext';
import { SettingsProvider } from '../../../../contexts/SettingsContext';
import { ToastProvider } from '../../../../contexts/ToastContext';
import {
  StorageProvider,
  StorageValue,
} from '../../../../contexts/StorageContext';
import { useSettingsState } from '../useSettingsState';

const createStorage = (): StorageValue =>
  ({
    projects: [],
    timeEntries: [],
    setProjects: jest.fn(),
    setTimeEntries: jest.fn(),
    isLoading: false,
    isDataLoaded: true,
    reloadData: jest.fn(),
    isTestMode: true,
    toggleTestMode: jest.fn(),
    testDataStats: { projectCount: 0, timeEntryCount: 0 },
  }) as unknown as StorageValue;

describe('useSettingsState', () => {
  it('テストデータを作り直すと、App と共有しているストレージに反映する', async () => {
    const storage = createStorage();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LanguageProvider>
        <SettingsProvider>
          <ToastProvider>
            <StorageProvider value={storage}>{children}</StorageProvider>
          </ToastProvider>
        </SettingsProvider>
      </LanguageProvider>
    );
    const { result } = renderHook(() => useSettingsState(), { wrapper });

    await act(async () => {
      await result.current.handleRegenerateTestData();
    });

    expect(storage.setProjects).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: expect.any(String) }),
      ])
    );
    expect(storage.setTimeEntries).toHaveBeenCalled();
  });
});
