import { v4 as uuidv4 } from 'uuid';
import { Project, TimeEntry } from '../types';

// テストデータを生成する関数（既存データに追加）
export const generateTestData = (
  existingProjects: Project[],
  existingTimeEntries: TimeEntry[]
) => {

  const now = new Date();

  // テスト用のプレフィックスを追加して識別可能にする
  const testPrefix = '[TEST] ';

  // 複数のプロジェクトを生成
  const newProjects: Project[] = [
    {
      id: uuidv4(),
      name: testPrefix + 'Webアプリケーション開発',
      description: 'ReactとTypeScriptを使用したフロントエンド開発',
      monthlyCapacity: 0.4, // 40%
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
    },
    {
      id: uuidv4(),
      name: testPrefix + 'APIサーバー開発',
      description: 'Node.jsとExpressを使用したバックエンド開発',
      monthlyCapacity: 0.3, // 30%
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
    },
    {
      id: uuidv4(),
      name: testPrefix + 'データベース設計',
      description: 'PostgreSQLのスキーマ設計と最適化',
      monthlyCapacity: 0.2, // 20%
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
    },
    {
      id: uuidv4(),
      name: testPrefix + 'ドキュメント作成',
      description: '技術仕様書と操作マニュアルの作成',
      monthlyCapacity: 0.1, // 10%
      createdAt: new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        15
      ).toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: true,
      archivedAt: new Date(now.getFullYear(), now.getMonth(), 5).toISOString(),
    },
  ];


  // 時間エントリーを生成（過去30日分）
  const newTimeEntries: TimeEntry[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // 週末は作業を少なくする
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const numEntries = isWeekend
      ? Math.floor(Math.random() * 2)
      : Math.floor(Math.random() * 4) + 1;

    for (let j = 0; j < numEntries; j++) {
      const projectIndex = Math.floor(Math.random() * 3); // アーカイブされていないプロジェクトから選択
      const project = newProjects[projectIndex];

      // ランダムな開始時間（9-18時の間）
      const startHour = 9 + Math.floor(Math.random() * 8);
      const startMinute = Math.floor(Math.random() * 60);
      const startTime = new Date(date);
      startTime.setHours(startHour, startMinute, 0, 0);

      // ランダムな作業時間（30分から3時間）
      const duration = 30 + Math.floor(Math.random() * 150);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);

      const descriptions = [
        'コンポーネントの実装',
        'バグ修正',
        'コードレビュー',
        'テストコード作成',
        'リファクタリング',
        'ミーティング',
        '設計検討',
        'ドキュメント更新',
      ];

      newTimeEntries.push({
        id: uuidv4(),
        projectId: project.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        description:
          descriptions[Math.floor(Math.random() * descriptions.length)],
        createdAt: endTime.toISOString(),
        updatedAt: endTime.toISOString(),
      });
    }
  }


  // 今日の実行中のタイマーを追加（50%の確率）
  if (Math.random() > 0.5) {
    const runningProject = newProjects[Math.floor(Math.random() * 3)];
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - Math.floor(Math.random() * 2));
    startTime.setMinutes(
      startTime.getMinutes() - Math.floor(Math.random() * 60)
    );

    newTimeEntries.push({
      id: uuidv4(),
      projectId: runningProject.id,
      startTime: startTime.toISOString(),
      endTime: '', // 実行中
      description: '現在作業中...',
      createdAt: startTime.toISOString(),
      updatedAt: startTime.toISOString(),
    });
  }

  // 既存のデータと新規データをマージして返す
  const result = {
    projects: [...existingProjects, ...newProjects],
    timeEntries: [...existingTimeEntries, ...newTimeEntries],
  };


  return result;
};

// テストデータのみを削除する関数（既存データは保持）
export const clearTestData = async (
  projects: Project[],
  timeEntries: TimeEntry[]
) => {
  const testPrefix = '[TEST] ';

  // テストデータ以外のプロジェクトを保持
  const nonTestProjects = projects.filter(
    (p) => !p.name.startsWith(testPrefix)
  );
  const nonTestProjectIds = new Set(nonTestProjects.map((p) => p.id));

  // テストプロジェクトに関連しない時間エントリーを保持
  const nonTestTimeEntries = timeEntries.filter((t) =>
    nonTestProjectIds.has(t.projectId)
  );

  return {
    projects: nonTestProjects,
    timeEntries: nonTestTimeEntries,
  };
};

// すべてのデータを削除する関数（オプション）
export const clearAllData = async () => {
  if (window.electronAPI) {
    await window.electronAPI.deleteData('projects');
    await window.electronAPI.deleteData('timeEntries');
  }
};
