import {
  PROJECT_COLORS,
  ProjectColorManager,
  projectColorManager,
} from '../colorUtils';
import { createMockProject } from '../../__tests__/helpers';

// 簡易ファクトリ関数（互換性のため）
const createProject = (id: string, name: string) =>
  createMockProject({ id, name });

describe('colorUtils', () => {
  describe('PROJECT_COLORS', () => {
    test('10色のカラーパレットが定義されている', () => {
      expect(PROJECT_COLORS).toHaveLength(10);
    });

    test('すべての色が有効な16進数カラーコードである', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      PROJECT_COLORS.forEach((color) => {
        expect(color).toMatch(hexColorRegex);
      });
    });
  });

  describe('ProjectColorManager', () => {
    let manager: ProjectColorManager;

    beforeEach(() => {
      // シングルトンの状態をリセットするため、新しいプロジェクトで初期化
      manager = ProjectColorManager.getInstance();
    });

    describe('getInstance', () => {
      test('シングルトンインスタンスを返す', () => {
        const instance1 = ProjectColorManager.getInstance();
        const instance2 = ProjectColorManager.getInstance();

        expect(instance1).toBe(instance2);
      });
    });

    describe('initializeColors', () => {
      test('プロジェクトリストから色のマッピングを初期化する', () => {
        const projects = [
          createProject('p1', 'Project A'),
          createProject('p2', 'Project B'),
          createProject('p3', 'Project C'),
        ];

        manager.initializeColors(projects);

        expect(manager.getColorById('p1')).toBe(PROJECT_COLORS[0]);
        expect(manager.getColorById('p2')).toBe(PROJECT_COLORS[1]);
        expect(manager.getColorById('p3')).toBe(PROJECT_COLORS[2]);
      });

      test('プロジェクト数がカラーパレットを超える場合、循環する', () => {
        const projects = Array.from({ length: 12 }, (_, i) =>
          createProject(`p${i}`, `Project ${i}`)
        );

        manager.initializeColors(projects);

        // 11番目（インデックス10）は最初の色に戻る
        expect(manager.getColorById('p10')).toBe(PROJECT_COLORS[0]);
        expect(manager.getColorById('p11')).toBe(PROJECT_COLORS[1]);
      });

      test('空のプロジェクトリストで初期化できる', () => {
        manager.initializeColors([]);

        expect(manager.getColorById('any-id')).toBe('#CCCCCC');
      });
    });

    describe('getColorById', () => {
      test('存在するプロジェクトIDの色を返す', () => {
        const projects = [createProject('p1', 'Project A')];
        manager.initializeColors(projects);

        expect(manager.getColorById('p1')).toBe(PROJECT_COLORS[0]);
      });

      test('存在しないプロジェクトIDの場合、デフォルト色を返す', () => {
        manager.initializeColors([]);

        expect(manager.getColorById('non-existent')).toBe('#CCCCCC');
      });
    });

    describe('getColorByName', () => {
      test('存在するプロジェクト名の色を返す', () => {
        const projects = [
          createProject('p1', 'Project A'),
          createProject('p2', 'Project B'),
        ];
        manager.initializeColors(projects);

        expect(manager.getColorByName('Project A', projects)).toBe(
          PROJECT_COLORS[0]
        );
        expect(manager.getColorByName('Project B', projects)).toBe(
          PROJECT_COLORS[1]
        );
      });

      test('存在しないプロジェクト名の場合、デフォルト色を返す', () => {
        const projects = [createProject('p1', 'Project A')];
        manager.initializeColors(projects);

        expect(manager.getColorByName('Non-existent', projects)).toBe(
          '#CCCCCC'
        );
      });
    });
  });

  describe('projectColorManager (グローバルインスタンス)', () => {
    test('グローバルインスタンスを使用して色を取得できる', () => {
      const projects = [
        createProject('global-p1', 'Global Project 1'),
        createProject('global-p2', 'Global Project 2'),
      ];

      projectColorManager.initializeColors(projects);

      expect(projectColorManager.getColorById('global-p1')).toBe(
        PROJECT_COLORS[0]
      );
    });
  });
});
