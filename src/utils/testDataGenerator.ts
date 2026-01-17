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
      name: testPrefix + 'EC開発',
      description: 'ECサイトのフルリニューアル',
      monthlyCapacity: 0.4, // 40%
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
    },
    {
      id: uuidv4(),
      name: testPrefix + '在庫管理システム改修',
      description: '在庫管理システムの機能追加・改修',
      monthlyCapacity: 0.3, // 30%
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
    },
    {
      id: uuidv4(),
      name: testPrefix + '顧客管理基盤',
      description: '顧客情報の一元管理基盤構築',
      monthlyCapacity: 0.2, // 20%
      createdAt: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
    },
    {
      id: uuidv4(),
      name: testPrefix + '社内ポータル',
      description: '社内情報共有ポータル構築',
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
        '機能実装',
        '不具合対応',
        'コードレビュー',
        'テスト作成・実行',
        '設計・技術検討',
        '定例MTG',
        'クライアント打ち合わせ',
        '仕様確認・ドキュメント作成',
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
