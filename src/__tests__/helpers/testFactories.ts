import { Project, TimeEntry } from '../../types';

/**
 * テスト用のプロジェクトモックを作成する
 */
export const createMockProject = (
  overrides: Partial<Project> = {}
): Project => ({
  id: `project-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Project',
  description: '',
  monthlyCapacity: 0.5,
  isArchived: false,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

/**
 * テスト用のタイムエントリーモックを作成する
 */
export const createMockTimeEntry = (
  overrides: Partial<TimeEntry> = {}
): TimeEntry => ({
  id: `entry-${Math.random().toString(36).substr(2, 9)}`,
  projectId: 'project-1',
  startTime: '2025-01-01T09:00:00Z',
  endTime: '2025-01-01T10:00:00Z',
  description: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * 複数のプロジェクトモックを生成する
 */
export const createMockProjects = (count: number): Project[] =>
  Array.from({ length: count }, (_, i) =>
    createMockProject({ id: `project-${i + 1}`, name: `Project ${i + 1}` })
  );

/**
 * 複数のタイムエントリーモックを生成する
 */
export const createMockTimeEntries = (
  projectId: string,
  count: number
): TimeEntry[] =>
  Array.from({ length: count }, (_, i) =>
    createMockTimeEntry({
      id: `entry-${i + 1}`,
      projectId,
      startTime: `2025-01-${String(i + 1).padStart(2, '0')}T09:00:00Z`,
      endTime: `2025-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
    })
  );
