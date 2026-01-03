import { renderHook } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';
import { useProjectProgress } from '../useProjectProgress';
import { Project } from '../../../../../types';

const mockT = (key: string) => {
  const translations: Record<string, string> = {
    'projects.filter.active': 'Active',
    'projects.filter.tracking': 'Tracking',
    'projects.filter.completed': 'Completed',
    'projects.filter.warning': 'Warning',
  };
  return translations[key] || key;
};

const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'test-project',
  name: 'Test Project',
  description: 'Test Description',
  monthlyCapacity: 0.5,
  isArchived: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const createWrapper = (mode: 'light' | 'dark' = 'light') => {
  const theme = createTheme({ palette: { mode } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(ThemeProvider, { theme }, children);
};

describe('useProjectProgress', () => {
  describe('progress calculation', () => {
    test('should calculate progress percentage correctly', () => {
      const project = createMockProject({ monthlyCapacity: 0.5 });
      const { result } = renderHook(
        () => useProjectProgress(project, 50, 100, mockT),
        { wrapper: createWrapper() }
      );

      expect(result.current.progressPercentage).toBe(50);
    });

    test('should cap progress at 100%', () => {
      const project = createMockProject({ monthlyCapacity: 0.5 });
      const { result } = renderHook(
        () => useProjectProgress(project, 150, 100, mockT),
        { wrapper: createWrapper() }
      );

      expect(result.current.progressPercentage).toBe(100);
    });

    test('should return 0 when target is 0', () => {
      const project = createMockProject({ monthlyCapacity: 0.5 });
      const { result } = renderHook(
        () => useProjectProgress(project, 50, 0, mockT),
        { wrapper: createWrapper() }
      );

      expect(result.current.progressPercentage).toBe(0);
    });
  });

  describe('remaining hours calculation', () => {
    test('should calculate remaining hours correctly', () => {
      const project = createMockProject({ monthlyCapacity: 0.5 });
      const { result } = renderHook(
        () => useProjectProgress(project, 30, 100, mockT),
        { wrapper: createWrapper() }
      );

      expect(result.current.remainingHours).toBe(70);
    });

    test('should not return negative remaining hours', () => {
      const project = createMockProject({ monthlyCapacity: 0.5 });
      const { result } = renderHook(
        () => useProjectProgress(project, 150, 100, mockT),
        { wrapper: createWrapper() }
      );

      expect(result.current.remainingHours).toBe(0);
    });
  });

  describe('tracking only mode', () => {
    test('should identify tracking only when monthlyCapacity is 0', () => {
      const project = createMockProject({ monthlyCapacity: 0 });
      const { result } = renderHook(
        () => useProjectProgress(project, 50, 0, mockT),
        { wrapper: createWrapper() }
      );

      expect(result.current.isTrackingOnly).toBe(true);
      expect(result.current.statusText).toBe('Tracking');
    });

    test('should not be tracking only when monthlyCapacity > 0', () => {
      const project = createMockProject({ monthlyCapacity: 0.5 });
      const { result } = renderHook(
        () => useProjectProgress(project, 50, 100, mockT),
        { wrapper: createWrapper() }
      );

      expect(result.current.isTrackingOnly).toBe(false);
    });
  });

  describe('status determination', () => {
    test('should return completed status when progress >= 100%', () => {
      const project = createMockProject({ monthlyCapacity: 0.5 });
      const { result } = renderHook(
        () => useProjectProgress(project, 100, 100, mockT),
        { wrapper: createWrapper() }
      );

      expect(result.current.statusText).toBe('Completed');
    });

    test('should return warning status when progress >= 90%', () => {
      const project = createMockProject({ monthlyCapacity: 0.5 });
      const { result } = renderHook(
        () => useProjectProgress(project, 90, 100, mockT),
        { wrapper: createWrapper() }
      );

      expect(result.current.statusText).toBe('Warning');
    });

    test('should return active status when progress < 90%', () => {
      const project = createMockProject({ monthlyCapacity: 0.5 });
      const { result } = renderHook(
        () => useProjectProgress(project, 50, 100, mockT),
        { wrapper: createWrapper() }
      );

      expect(result.current.statusText).toBe('Active');
    });
  });
});
