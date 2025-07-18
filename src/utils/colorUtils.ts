// src/utils/colorUtils.ts

import { Project } from '../types';

// プロジェクトの色パレット
export const PROJECT_COLORS = [
  '#0088FE', // ブルー
  '#00C49F', // ティール
  '#FFBB28', // イエロー
  '#FF8042', // オレンジ
  '#8884D8', // パープル
  '#82CA9D', // グリーン
  '#FFC658', // ライトオレンジ
  '#FF6B6B', // レッド
  '#4ECDC4', // ターコイズ
  '#45B7D1', // スカイブルー
];

// プロジェクトIDと色のマッピングを管理するクラス
export class ProjectColorManager {
  private static instance: ProjectColorManager;
  private colorMap: Map<string, string> = new Map();

  private constructor() {}

  public static getInstance(): ProjectColorManager {
    if (!ProjectColorManager.instance) {
      ProjectColorManager.instance = new ProjectColorManager();
    }
    return ProjectColorManager.instance;
  }

  // プロジェクトリストから色のマッピングを初期化
  public initializeColors(projects: Project[]): void {
    this.colorMap.clear();
    projects.forEach((project, index) => {
      this.colorMap.set(
        project.id,
        PROJECT_COLORS[index % PROJECT_COLORS.length]
      );
    });
  }

  // プロジェクトIDから色を取得
  public getColorById(projectId: string): string {
    return this.colorMap.get(projectId) || '#CCCCCC'; // デフォルト色
  }

  // プロジェクト名から色を取得（プロジェクトリストが必要）
  public getColorByName(projectName: string, projects: Project[]): string {
    const project = projects.find((p) => p.name === projectName);
    return project ? this.getColorById(project.id) : '#CCCCCC';
  }
}

export const projectColorManager = ProjectColorManager.getInstance();
