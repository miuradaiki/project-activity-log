# App.tsx ゴッドコンポーネント問題 - 詳細分析とリファクタリング計画

**ファイル:** `src/App.tsx`
**現在のサイズ:** 587行
**重大度:** 重大
**優先度:** 1 (最高)

---

## 目次

1. [問題の概要](#問題の概要)
2. [現在の状態分析](#現在の状態分析)
3. [具体的な問題](#具体的な問題)
4. [依存関係グラフ](#依存関係グラフ)
5. [詳細なリファクタリング計画](#詳細なリファクタリング計画)
6. [ステップバイステップ実装ガイド](#ステップバイステップ実装ガイド)
7. [テスト戦略](#テスト戦略)
8. [移行チェックリスト](#移行チェックリスト)

---

## 問題の概要

`App.tsx`コンポーネントは、あまりにも多くの責任を処理する「ゴッドコンポーネント」に進化しており、保守、テスト、拡張が困難になっています。これはReactアプリケーションで最も一般的なアンチパターンの1つであり、コード品質に大きな影響を与えます。

### 主な問題

1. **状態の爆発**: 11個の独立した状態を管理
2. **関数の過負荷**: 15個以上のコールバック関数を含む
3. **関心の混在**: UI、ビジネスロジック、ルーティング、キーボードイベント、データ管理を処理
4. **テストの困難性**: 個々の機能を個別にテストすることがほぼ不可能
5. **再利用性の低さ**: ロジックを他のコンポーネントと共有できない
6. **高い認知的負荷**: 開発者は変更を行うために全体のコンポーネントを理解する必要がある

### 症状

- ✗ 13個以上の依存関係を持つuseEffect (Lines 390-404)
- ✗ 単一コンポーネントに500行以上のコード
- ✗ 関連性のない複数の状態変数
- ✗ 特定の機能を見つけることが困難
- ✗ 1つの領域の変更が関連のない機能に影響
- ✗ コールバックの依存関係が連鎖的な再レンダリングを引き起こす

---

## 現在の状態分析

### 状態管理の内訳

**ファイル:** `src/App.tsx:37-51`

```typescript
// UI状態 (4変数)
const [sidebarOpen, setSidebarOpen] = useState(false); // Line 38
const [activePage, setActivePage] = useState(getInitialActivePage); // Line 39
const [showShortcutsDialog, setShowShortcutsDialog] = useState(false); // Line 40

// モーダル状態 (4変数)
const [isProjectFormOpen, setIsProjectFormOpen] = useState(false); // Line 41
const [isManualEntryFormOpen, setIsManualEntryFormOpen] = useState(false); // Line 42
const [editingTimeEntry, setEditingTimeEntry] = useState<TimeEntry | undefined>(
  undefined
); // Line 43
const [editingProject, setEditingProject] = useState<Project | undefined>(
  undefined
); // Line 46

// タイマー状態 (3変数)
const [activeProject, setActiveProject] = useState<Project | null>(null); // Line 49
const [isTimerRunning, setIsTimerRunning] = useState(false); // Line 50
const [startTime, setStartTime] = useState<string | null>(null); // Line 51
```

**合計: 11個の状態変数** (推奨最大値: コンポーネントあたり3-5個)

### 関数の内訳

**コールバック関数 (15個):**

1. `openShortcutsDialog` (Line 58) - ダイアログ管理
2. `closeShortcutsDialog` (Line 62) - ダイアログ管理
3. `handleOpenProjectForm` (Line 66) - モーダル管理
4. `handleCloseProjectForm` (Line 71) - モーダル管理
5. `handleStopTimer` (Line 76) - タイマーロジック
6. `handleStartTimer` (Line 119) - タイマーロジック
7. `handleCreateProject` (Line 138) - プロジェクトCRUD
8. `handleEditProject` (Line 158) - プロジェクトCRUD
9. `handleArchiveProject` (Line 176) - プロジェクトCRUD
10. `handleUnarchiveProject` (Line 197) - プロジェクトCRUD
11. `handleDeleteProject` (Line 213) - プロジェクトCRUD
12. `handleDeleteTimeEntry` (Line 230) - 時間エントリCRUD
13. `handleSaveTimeEntry` (Line 237) - 時間エントリCRUD
14. `handleImportCSV` (Line 252) - インポート機能
15. `handleNavigate` (Line 279) - ナビゲーション
16. `getPageTitle` (Line 287) - UIヘルパー
17. `getAddButtonConfig` (Line 303) - UI設定
18. `renderPageContent` (Line 416) - レンダリングロジック

**合計: 18個の関数** (推奨最大値: コンポーネントあたり5-7個)

### エフェクトの内訳

**useEffectフック (2個):**

1. **キーボードイベントハンドラー** (Lines 327-404) - 78行
   - 依存関係: 13個の変数
   - ナビゲーション、プロジェクト操作、テーマ切り替え、タイマー制御を処理
   - 単一のエフェクトに関心が混在

2. **トレイイベントリスナー** (Lines 407-413) - 7行
   - 依存関係: 1個の変数
   - Electron IPCリスナーをセットアップ

---

## 具体的な問題

### 問題1: 巨大なキーボードイベントハンドラー

**場所:** `src/App.tsx:327-404` (78行)

**問題:**

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // モーダルチェック
    if (isProjectFormOpen || isManualEntryFormOpen || showShortcutsDialog)
      return;

    // ナビゲーション (Ctrl+1, Ctrl+2, Ctrl+3, Ctrl+,)
    if (e.ctrlKey) {
      if (e.key === '1') {
        /* ... */
      } else if (e.key === '2') {
        /* ... */
      } else if (e.key === '3') {
        /* ... */
      } else if (e.key === ',') {
        /* ... */
      }
      if (e.key === 'n') {
        /* ... */
      }
      if (e.key === 'h' || e.key === '/') {
        /* ... */
      }
    }

    // テーマ切り替え (Alt+L)
    if (e.altKey && e.key.toLowerCase() === 'l') {
      /* ... */
    }

    // タイマー制御 (Space, Escape)
    if (e.key === ' ' && activePage === 'timer') {
      /* ... */
    }
    if (e.key === 'Escape' && isTimerRunning) {
      /* ... */
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [
  activePage, // 1
  handleOpenProjectForm, // 2
  handleNavigate, // 3
  toggleThemeMode, // 4
  openShortcutsDialog, // 5
  isProjectFormOpen, // 6
  isManualEntryFormOpen, // 7
  showShortcutsDialog, // 8
  isTimerRunning, // 9
  activeProject, // 10
  handleStartTimer, // 11
  handleStopTimer, // 12
  t, // 13
]);
```

**結果:**

- **状態変更のたびにイベントリスナーが再作成される** - 13個の依存関係は頻繁な更新を意味する
- **メモリリークのリスク** - イベントリスナーが適切にクリーンアップされない可能性
- **パフォーマンスの低下** - アクティブな使用中に1秒間に複数回リスナーを追加/削除
- **テストが困難** - キーボードショートカットを個別にテストできない
- **拡張が困難** - 新しいショートカットを追加するには、この巨大な関数を変更する必要がある

**推奨:** カスタムフック`useKeyboardShortcuts`に抽出

---

### 問題2: タイマーロジックの混在

**場所:** 複数箇所

**タイマー関連のコードが散在:**

1. 状態宣言 (Lines 49-51)
2. `handleStartTimer` (Lines 119-136)
3. `handleStopTimer` (Lines 76-117)
4. キーボードイベントハンドラー (Lines 370-383)
5. アーカイブプロジェクトハンドラー (Lines 186-188)
6. プロジェクト削除ハンドラー (Lines 215-217)
7. トレイイベントリスナー (Lines 407-413)
8. `renderPageContent` タイマーセクション (Lines 460-466)

**問題:**

タイマーロジックが以下と絡み合っている:

- プロジェクト管理 (アーカイブ/削除はタイマーを停止する必要がある)
- キーボード処理 (スペース/エスケープキー)
- Electron IPC (トレイイベント)
- UIレンダリング (TimerFocusコンポーネント)

**例 - タイマー停止ロジックの重複:**

```typescript
// handleStopTimerで (Line 76)
const handleStopTimer = useCallback(async () => {
  if (!activeProject || !startTime) return;

  const endTime = new Date().toISOString();
  // ... 検証ロジック
  // ... 時間エントリを作成
  // ... 状態を更新

  if (window.electronAPI?.timerStop) {
    await window.electronAPI.timerStop();
  }
}, [activeProject, startTime, setTimeEntries]);

// handleArchiveProjectで (Line 186)
if (activeProject?.id === project.id && isTimerRunning) {
  handleStopTimer();
}

// handleDeleteProjectで (Line 215)
if (activeProject?.id === project.id && isTimerRunning) {
  handleStopTimer();
}

// キーボードハンドラーで (Line 380)
if (e.key === 'Escape' && isTimerRunning) {
  e.preventDefault();
  handleStopTimer();
}
```

**推奨:** `useTimerController`フックに抽出

---

### 問題3: モーダル状態管理

**場所:** Lines 41-48, 66-74, 559-582

**問題:**

モーダル管理のための4つの独立した状態:

```typescript
const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
const [isManualEntryFormOpen, setIsManualEntryFormOpen] = useState(false);
const [editingTimeEntry, setEditingTimeEntry] = useState<TimeEntry | undefined>(
  undefined
);
const [editingProject, setEditingProject] = useState<Project | undefined>(
  undefined
);
```

各モーダルには以下が必要:

- 開閉状態
- 編集エンティティ状態
- 開くハンドラー
- 閉じるハンドラー
- 保存ハンドラー

**結果:**

- モーダルごとに繰り返しパターン
- 新しいモーダルの追加が困難
- 状態更新がアトミックでない (競合状態の可能性)

**推奨:** `useModalManager`フックに抽出

---

### 問題4: ページルーティングロジック

**場所:** Lines 279-284, 287-300, 303-324, 416-517

**問題:**

ルーティングロジックがコンポーネントと混在:

```typescript
// 状態
const [activePage, setActivePage] = useState(getInitialActivePage);

// ナビゲーションハンドラー
const handleNavigate = useCallback((page: string) => {
  setActivePage(page);
  localStorage.setItem(ACTIVE_PAGE_STORAGE_KEY, page);
}, []);

// ページタイトルロジック
const getPageTitle = useCallback(() => {
  switch (activePage) {
    case 'dashboard': return t('nav.dashboard');
    case 'projects': return t('nav.projects');
    case 'timer': return t('nav.timer');
    case 'settings': return t('nav.settings');
    default: return t('app.name');
  }
}, [activePage, t]);

// FAB設定ロジック
const getAddButtonConfig = useCallback(() => {
  switch (activePage) {
    case 'projects': return { show: true, tooltip: t('projects.new'), onClick: () => handleOpenProjectForm() };
    case 'timer': return { show: true, tooltip: t('timer.manual'), onClick: () => setIsManualEntryFormOpen(true) };
    default: return { show: false, tooltip: '', onClick: () => {} };
  }
}, [activePage, handleOpenProjectForm, t]);

// ページコンテンツレンダリング (100行以上)
const renderPageContent = useCallback(() => {
  switch (activePage) {
    case 'dashboard': return <Dashboard {...props} />;
    case 'projects': return <ProjectsView {...props} />;
    case 'timer': return <Box>...</Box>;
    case 'settings': return <SettingsView {...props} />;
    default: return null;
  }
}, [16個の依存関係]);
```

**推奨:** `usePageRouter`フックまたは別コンポーネントに抽出

---

### 問題5: プロジェクトCRUD操作

**場所:** Lines 138-228

**問題:**

Appコンポーネント内のプロジェクト操作用の5つの別々のハンドラー:

1. `handleCreateProject` (Lines 138-156) - 19行
2. `handleEditProject` (Lines 158-174) - 17行
3. `handleArchiveProject` (Lines 176-195) - 20行
4. `handleUnarchiveProject` (Lines 197-211) - 15行
5. `handleDeleteProject` (Lines 213-228) - 16行

**合計: Appコンポーネントにプロジェクト管理ロジックが87行**

これらの操作は:

- ルートコンポーネントに属していない
- 専用のサービスまたはフックにあるべき
- 検証ロジックが必要 (欠落)
- エラー処理が必要 (欠落)

**推奨:** `useProjectOperations`フックまたはサービス層に抽出

---

## 依存関係グラフ

### 現在の依存関係チェーン

```
App.tsx (587行)
├── 状態 (11変数)
│   ├── UI状態
│   │   ├── sidebarOpen
│   │   ├── activePage
│   │   └── showShortcutsDialog
│   ├── モーダル状態
│   │   ├── isProjectFormOpen
│   │   ├── isManualEntryFormOpen
│   │   ├── editingTimeEntry
│   │   └── editingProject
│   └── タイマー状態
│       ├── activeProject
│       ├── isTimerRunning
│       └── startTime
│
├── フック (4個)
│   ├── useLanguage
│   ├── useThemeMode
│   └── useStorage (projects, timeEntries)
│
├── コールバック関数 (18個)
│   ├── ダイアログ管理 (2個)
│   ├── モーダル管理 (2個)
│   ├── タイマー制御 (2個)
│   ├── プロジェクトCRUD (5個)
│   ├── 時間エントリCRUD (2個)
│   ├── インポート (1個)
│   ├── ナビゲーション (1個)
│   └── UIヘルパー (3個)
│
└── エフェクト (2個)
    ├── キーボードハンドラー (13個の依存関係)
    └── トレイリスナー (1個の依存関係)
```

### 循環依存

```
handleStartTimer
  ↓
handleStopTimer (handleStartTimerに依存)
  ↓
handleArchiveProject (handleStopTimerに依存)
  ↓
handleDeleteProject (handleStopTimerに依存)
  ↓
renderPageContent (すべてのハンドラーに依存)
  ↓
useEffect keyboard (すべてのハンドラー + 状態に依存)
```

**問題:** ハンドラーへの変更がコンポーネント全体に連鎖する可能性がある

---

## 詳細なリファクタリング計画

### フェーズ1: キーボードショートカットフックの抽出

**目標:** App.tsxを約80行削減、13個の依存関係を持つuseEffectを削除

**新規ファイル:** `src/hooks/useKeyboardShortcuts.ts`

**アプローチ:**

1. 宣言的なショートカット定義システムを作成
2. キーボードイベントロジックをカスタムフックに抽出
3. ショートカット登録用のAPIを提供
4. 条件付き有効/無効をサポート

**API設計:**

```typescript
interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  disabled?: boolean;
  description?: string; // ヘルプダイアログ用
}

export const useKeyboardShortcuts = (
  shortcuts: Shortcut[],
  options?: {
    preventDefault?: boolean;
    enabled?: boolean;
  }
) => {
  // 実装
};
```

**App.tsxでの使用:**

```typescript
const shortcuts: Shortcut[] = [
  // ナビゲーションショートカット
  {
    key: '1',
    ctrlKey: true,
    action: () => handleNavigate('dashboard'),
    description: 'Dashboard',
  },
  {
    key: '2',
    ctrlKey: true,
    action: () => handleNavigate('projects'),
    description: 'Projects',
  },
  {
    key: '3',
    ctrlKey: true,
    action: () => handleNavigate('timer'),
    description: 'Timer',
  },
  {
    key: ',',
    ctrlKey: true,
    action: () => handleNavigate('settings'),
    description: 'Settings',
  },

  // モーダルショートカット
  {
    key: 'n',
    ctrlKey: true,
    action: handleOpenProjectForm,
    disabled: showModals,
    description: 'New Project',
  },
  {
    key: 'h',
    ctrlKey: true,
    action: openShortcutsDialog,
    disabled: showModals,
    description: 'Help',
  },
  {
    key: '/',
    ctrlKey: true,
    action: openShortcutsDialog,
    disabled: showModals,
    description: 'Help',
  },

  // テーマ切り替え
  {
    key: 'l',
    altKey: true,
    action: toggleThemeMode,
    description: 'Toggle Dark Mode',
  },

  // タイマー制御
  {
    key: ' ',
    action: () =>
      isTimerRunning
        ? handleStopTimer()
        : activeProject && handleStartTimer(activeProject),
    disabled: activePage !== 'timer',
    description: 'Start/Stop Timer',
  },
  {
    key: 'Escape',
    action: handleStopTimer,
    disabled: !isTimerRunning,
    description: 'Stop Timer',
  },
];

const showModals =
  isProjectFormOpen || isManualEntryFormOpen || showShortcutsDialog;

useKeyboardShortcuts(shortcuts);
```

**メリット:**

- ✓ App.tsxを78行削減
- ✓ 単一の依存関係 (shortcutsの配列)
- ✓ 個別にテスト可能
- ✓ コンポーネント間で再利用可能
- ✓ 宣言的で読みやすい
- ✓ 拡張が容易
- ✓ 説明から自動的にヘルプダイアログを生成可能

**実装ファイル:**

```typescript
// src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  disabled?: boolean;
  description?: string;
}

interface Options {
  preventDefault?: boolean;
  enabled?: boolean;
}

export const useKeyboardShortcuts = (
  shortcuts: Shortcut[],
  options: Options = {}
) => {
  const { preventDefault = true, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // マッチするショートカットを検索
      const shortcut = shortcuts.find(
        (s) =>
          !s.disabled &&
          s.key === event.key &&
          (s.ctrlKey === undefined || s.ctrlKey === event.ctrlKey) &&
          (s.altKey === undefined || s.altKey === event.altKey) &&
          (s.shiftKey === undefined || s.shiftKey === event.shiftKey) &&
          (s.metaKey === undefined || s.metaKey === event.metaKey)
      );

      if (shortcut) {
        if (preventDefault) {
          event.preventDefault();
        }
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, preventDefault, enabled]);
};

// ヘルプダイアログ用のショートカット説明を抽出するヘルパー
export const getShortcutDescriptions = (shortcuts: Shortcut[]) => {
  return shortcuts
    .filter((s) => s.description)
    .map((s) => ({
      key: formatShortcutKey(s),
      description: s.description!,
    }));
};

const formatShortcutKey = (shortcut: Shortcut): string => {
  const parts: string[] = [];
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.metaKey) parts.push('Cmd');
  parts.push(shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase());
  return parts.join('+');
};
```

---

### フェーズ2: タイマーコントローラーフックの抽出

**目標:** タイマーロジックを統合し、プロジェクト操作との結合を減らす

**新規ファイル:** `src/hooks/useTimerController.ts`

**現在のタイマーロジックの場所:**

1. 状態: Lines 49-51 (3変数)
2. 開始ハンドラー: Lines 119-136 (18行)
3. 停止ハンドラー: Lines 76-117 (42行)
4. アーカイブとの統合: Lines 186-188
5. 削除との統合: Lines 215-217
6. トレイリスナー: Lines 407-413

**API設計:**

```typescript
interface TimerController {
  // 状態
  activeProject: Project | null;
  isRunning: boolean;
  startTime: string | null;
  elapsedTime: number;

  // アクション
  start: (project: Project) => Promise<void>;
  stop: () => Promise<void>;
  toggle: (project?: Project) => Promise<void>;

  // ユーティリティ
  canStart: boolean;
  canStop: boolean;
  currentDuration: number;
}

export const useTimerController = (
  onTimeEntryCreated?: (entries: TimeEntry[]) => void
): TimerController => {
  // 実装
};
```

**App.tsxでの使用:**

```typescript
const timer = useTimerController((entries) => {
  setTimeEntries((prev) => [...prev, ...entries]);
});

// 散在するタイマーロジックを以下に置き換え:
<TimerFocus
  project={timer.activeProject}
  isRunning={timer.isRunning}
  startTime={timer.startTime}
  onStart={() => timer.activeProject && timer.start(timer.activeProject)}
  onStop={timer.stop}
/>

// アーカイブハンドラーで
const handleArchiveProject = useCallback(
  (project: Project) => {
    if (timer.activeProject?.id === project.id && timer.isRunning) {
      timer.stop();
    }
    // ... 残りのアーカイブロジック
  },
  [timer, setProjects]
);
```

**実装:**

```typescript
// src/hooks/useTimerController.ts
import { useState, useCallback, useEffect } from 'react';
import { Project, TimeEntry } from '../types';
import { createTimerEntries } from '../utils/timeEntryUtils';

interface TimerController {
  activeProject: Project | null;
  isRunning: boolean;
  startTime: string | null;
  elapsedTime: number;

  start: (project: Project) => Promise<void>;
  stop: () => Promise<void>;
  toggle: (project?: Project) => Promise<void>;

  canStart: boolean;
  canStop: boolean;
  currentDuration: number;
}

const MIN_DURATION_MS = 60000; // 1分

export const useTimerController = (
  onTimeEntryCreated?: (entries: TimeEntry[]) => void
): TimerController => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // タイマー実行中は1秒ごとに経過時間を更新
  useEffect(() => {
    if (!isRunning || !startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(startTime);
      setElapsedTime(now.getTime() - start.getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const start = useCallback(async (project: Project) => {
    const now = new Date().toISOString();
    setStartTime(now);
    setIsRunning(true);
    setActiveProject(project);

    // Electronに通知
    if (window.electronAPI?.timerStart) {
      await window.electronAPI.timerStart(project.name);
    }
  }, []);

  const stop = useCallback(async () => {
    if (!activeProject || !startTime) return;

    const endTime = new Date().toISOString();
    const startTimeDate = new Date(startTime);
    const endTimeDate = new Date(endTime);
    const duration = endTimeDate.getTime() - startTimeDate.getTime();

    // 最小時間を検証
    if (duration < MIN_DURATION_MS) {
      alert('1分未満の時間エントリは保存できません。');
      setIsRunning(false);
      setStartTime(null);
      setActiveProject(null);
      setElapsedTime(0);

      if (window.electronAPI?.timerStop) {
        await window.electronAPI.timerStop();
      }
      return;
    }

    // 時間エントリを作成 (日付境界を処理)
    const newTimeEntries = createTimerEntries(
      activeProject.id,
      startTime,
      endTime,
      ''
    );

    // 新しいエントリでコールバック
    onTimeEntryCreated?.(newTimeEntries);

    // 状態をリセット
    setIsRunning(false);
    setStartTime(null);
    setActiveProject(null);
    setElapsedTime(0);

    // Electronに通知
    if (window.electronAPI?.timerStop) {
      await window.electronAPI.timerStop();
    }
  }, [activeProject, startTime, onTimeEntryCreated]);

  const toggle = useCallback(
    async (project?: Project) => {
      if (isRunning) {
        await stop();
      } else if (project) {
        await start(project);
      }
    },
    [isRunning, start, stop]
  );

  // トレイ停止イベントをリッスン
  useEffect(() => {
    if (window.electronAPI?.onTrayStopTimer) {
      window.electronAPI.onTrayStopTimer(() => {
        stop();
      });
    }
  }, [stop]);

  return {
    activeProject,
    isRunning,
    startTime,
    elapsedTime,
    start,
    stop,
    toggle,
    canStart: !isRunning,
    canStop: isRunning,
    currentDuration: elapsedTime,
  };
};
```

**メリット:**

- ✓ App.tsxを約60行削減
- ✓ タイマーロジックを集中化
- ✓ タイマー機能を個別にテスト可能
- ✓ 他のコンポーネントで再利用可能
- ✓ 関心の明確な分離
- ✓ Electron IPCを内部で処理

---

### フェーズ3: モーダルマネージャーフックの抽出

**目標:** モーダル状態管理を簡素化

**新規ファイル:** `src/hooks/useModalManager.ts`

**現在のモーダルロジック:**

```typescript
// 4つの状態変数
const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
const [isManualEntryFormOpen, setIsManualEntryFormOpen] = useState(false);
const [editingTimeEntry, setEditingTimeEntry] = useState<TimeEntry | undefined>(
  undefined
);
const [editingProject, setEditingProject] = useState<Project | undefined>(
  undefined
);

// 4つのハンドラー
const handleOpenProjectForm = useCallback((project?: Project) => {
  setEditingProject(project);
  setIsProjectFormOpen(true);
}, []);

const handleCloseProjectForm = useCallback(() => {
  setIsProjectFormOpen(false);
  setEditingProject(undefined);
}, []);

// 手動エントリモーダルも同様...
```

**API設計:**

```typescript
interface Modal<T> {
  isOpen: boolean;
  data: T | undefined;
  open: (data?: T) => void;
  close: () => void;
}

export const useModal = <T = undefined>(): Modal<T> => {
  // 実装
};
```

**App.tsxでの使用:**

```typescript
const projectFormModal = useModal<Project>();
const manualEntryModal = useModal<TimeEntry>();
const shortcutsModal = useModal();

// 散在するモーダルロジックを以下に置き換え:
<ProjectForm
  open={projectFormModal.isOpen}
  onClose={projectFormModal.close}
  onSave={projectFormModal.data ? handleEditProject : handleCreateProject}
  project={projectFormModal.data}
  projects={projects}
/>

<ManualTimeEntryForm
  open={manualEntryModal.isOpen}
  onClose={manualEntryModal.close}
  onSave={handleSaveTimeEntry}
  projects={projects}
  timeEntry={manualEntryModal.data}
/>

<KeyboardShortcutsDialog
  open={shortcutsModal.isOpen}
  onClose={shortcutsModal.close}
/>
```

**実装:**

```typescript
// src/hooks/useModal.ts
import { useState, useCallback } from 'react';

interface Modal<T> {
  isOpen: boolean;
  data: T | undefined;
  open: (data?: T) => void;
  close: () => void;
}

export const useModal = <T = undefined>(): Modal<T> => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | undefined>(undefined);

  const open = useCallback((modalData?: T) => {
    setData(modalData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(undefined);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
  };
};
```

**メリット:**

- ✓ App.tsxを約40行削減
- ✓ 4つの状態変数を削除
- ✓ モーダル管理を簡素化
- ✓ 型安全なモーダルデータ
- ✓ 再利用可能なパターン
- ✓ 新しいモーダルの追加が容易

---

### フェーズ4: プロジェクト操作フックの抽出

**目標:** プロジェクトCRUD操作をAppコンポーネントから移動

**新規ファイル:** `src/hooks/useProjectOperations.ts`

**API設計:**

```typescript
interface ProjectOperations {
  create: (
    data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>
  ) => void;
  update: (id: string, data: Partial<Project>) => void;
  archive: (project: Project) => void;
  unarchive: (project: Project) => void;
  delete: (project: Project) => void;
}

export const useProjectOperations = (
  projects: Project[],
  setProjects: (projects: Project[] | ((prev: Project[]) => Project[])) => void,
  options?: {
    onBeforeDelete?: (project: Project) => boolean; // falseを返すとキャンセル
    onAfterArchive?: (project: Project) => void;
  }
): ProjectOperations => {
  // 実装
};
```

**App.tsxでの使用:**

```typescript
const projectOps = useProjectOperations(projects, setProjects, {
  onBeforeDelete: (project) => {
    // プロジェクトがアクティブな場合はタイマーを停止
    if (timer.activeProject?.id === project.id && timer.isRunning) {
      timer.stop();
    }
    // 時間エントリも削除
    setTimeEntries((prev) => prev.filter((t) => t.projectId !== project.id));
    return true; // 削除を続行
  },
  onAfterArchive: (project) => {
    // プロジェクトがアクティブな場合はタイマーを停止
    if (timer.activeProject?.id === project.id && timer.isRunning) {
      timer.stop();
    }
  },
});

// 散在するハンドラーを以下に置き換え:
<ProjectsView
  projects={projects}
  timeEntries={timeEntries}
  activeProjectId={timer.activeProject?.id || null}
  onEditProject={projectFormModal.open}
  onDeleteProject={projectOps.delete}
  onArchiveProject={projectOps.archive}
  onUnarchiveProject={projectOps.unarchive}
  onStartTimer={timer.start}
  onAddProject={() => projectFormModal.open()}
/>
```

**メリット:**

- ✓ App.tsxを約90行削減
- ✓ プロジェクト操作を集中化
- ✓ 検証の追加が容易
- ✓ 元に戻す/やり直しの追加が可能
- ✓ 個別にテスト可能

---

### フェーズ5: ページルーターの抽出

**目標:** ルーティングロジックをAppコンポーネントから移動

**新規ファイル:** `src/components/PageRouter.tsx`

**現在のルーティングロジック:**

- `activePage`状態 (Line 39)
- `handleNavigate` (Lines 279-284)
- `getPageTitle` (Lines 287-300)
- `getAddButtonConfig` (Lines 303-324)
- `renderPageContent` (Lines 416-517) - **100行以上!**

**新しいコンポーネント構造:**

```typescript
// src/components/PageRouter.tsx
interface PageRouterProps {
  projects: Project[];
  timeEntries: TimeEntry[];
  timer: TimerController;
  projectOps: ProjectOperations;
  onOpenProjectForm: (project?: Project) => void;
  onOpenManualEntry: () => void;
  onImportCSV: () => void;
}

export const PageRouter: React.FC<PageRouterProps> = ({
  projects,
  timeEntries,
  timer,
  projectOps,
  onOpenProjectForm,
  onOpenManualEntry,
  onImportCSV,
}) => {
  const [activePage, setActivePage] = useState(getInitialActivePage);

  const handleNavigate = useCallback((page: string) => {
    setActivePage(page);
    localStorage.setItem(ACTIVE_PAGE_STORAGE_KEY, page);
  }, []);

  // レンダリングロジックをここに移動
  switch (activePage) {
    case 'dashboard':
      return <Dashboard {...props} />;
    case 'projects':
      return <ProjectsView {...props} />;
    case 'timer':
      return <TimerPage {...props} />;
    case 'settings':
      return <SettingsView />;
    default:
      return null;
  }
};
```

**メリット:**

- ✓ App.tsxを約140行削減
- ✓ ルーティング責任の明確化
- ✓ 新しいページの追加が容易
- ✓ 必要に応じて後でReact Routerに移行可能

---

## ステップバイステップ実装ガイド

### ステップ1: キーボードショートカットフックの抽出 (1日目午前)

**時間:** 2-3時間

1. `src/hooks/useKeyboardShortcuts.ts`を作成
2. App.tsxからキーボードイベントハンドラーロジックをコピー
3. 宣言的なショートカットシステムにリファクタリング
4. フックのテストを記述
5. App.tsxのuseEffectをフックの使用に置き換え
6. すべてのキーボードショートカットが機能することをテスト
7. 変更をコミット

**テスト:**

```typescript
// src/hooks/__tests__/useKeyboardShortcuts.test.ts
import { renderHook } from '@testing-library/react-hooks';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  it('should call action when shortcut is pressed', () => {
    const action = jest.fn();
    const shortcuts = [{ key: 'a', ctrlKey: true, action }];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    // Ctrl+Aをシミュレート
    const event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true });
    window.dispatchEvent(event);

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should not call action when disabled', () => {
    const action = jest.fn();
    const shortcuts = [{ key: 'a', ctrlKey: true, action, disabled: true }];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    const event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true });
    window.dispatchEvent(event);

    expect(action).not.toHaveBeenCalled();
  });
});
```

---

### ステップ2: タイマーコントローラーフックの抽出 (1日目午後)

**時間:** 3-4時間

1. `src/hooks/useTimerController.ts`を作成
2. App.tsxからタイマー状態とロジックを移動
3. すべてのタイマー関連ハンドラーを更新
4. フックのテストを記述
5. App.tsxを新しいフックを使用するように更新
6. タイマー機能をエンドツーエンドでテスト
7. 変更をコミット

**テスト:**

```typescript
// src/hooks/__tests__/useTimerController.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useTimerController } from '../useTimerController';

const mockProject = {
  id: '1',
  name: 'Test Project',
  monthlyCapacity: 0.5,
  // ... その他のフィールド
};

describe('useTimerController', () => {
  it('should start timer', async () => {
    const { result } = renderHook(() => useTimerController());

    await act(async () => {
      await result.current.start(mockProject);
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.activeProject).toEqual(mockProject);
  });

  it('should stop timer and create time entry', async () => {
    const onTimeEntryCreated = jest.fn();
    const { result } = renderHook(() => useTimerController(onTimeEntryCreated));

    await act(async () => {
      await result.current.start(mockProject);
    });

    // 最小時間を超えるために2分待機
    jest.advanceTimersByTime(120000);

    await act(async () => {
      await result.current.stop();
    });

    expect(result.current.isRunning).toBe(false);
    expect(onTimeEntryCreated).toHaveBeenCalled();
  });
});
```

---

### ステップ3: モーダルマネージャーフックの抽出 (2日目午前)

**時間:** 2時間

1. `src/hooks/useModal.ts`を作成
2. App.tsxのモーダル状態を置き換え
3. モーダルの開閉ハンドラーを更新
4. すべてのモーダルが正しく機能することをテスト
5. 変更をコミット

---

### ステップ4: プロジェクト操作フックの抽出 (2日目午後)

**時間:** 3時間

1. `src/hooks/useProjectOperations.ts`を作成
2. App.tsxからプロジェクトCRUDハンドラーを移動
3. 検証とエラー処理を追加
4. テストを記述
5. App.tsxを新しいフックを使用するように更新
6. すべてのプロジェクト操作をテスト
7. 変更をコミット

---

### ステップ5: ページルーターコンポーネントの抽出 (3日目)

**時間:** 4-5時間

1. `src/components/PageRouter.tsx`を作成
2. App.tsxからルーティングロジックを移動
3. 必要に応じてページ固有のコンポーネントを抽出
4. App.tsxをPageRouterを使用するように更新
5. すべてのページナビゲーションをテスト
6. 変更をコミット

---

## テスト戦略

### ユニットテスト

**抽出した各フック/コンポーネントを個別にテスト:**

1. `useKeyboardShortcuts`
   - ショートカットのアクティベーション
   - 修飾キーの組み合わせ
   - 無効化されたショートカット
   - preventDefaultの動作

2. `useTimerController`
   - タイマーの開始/停止
   - 最小時間の検証
   - 時間エントリの作成
   - 日付境界の処理
   - Electron IPC通信

3. `useModal`
   - モーダルの開閉
   - データの受け渡し
   - 状態のクリーンアップ

4. `useProjectOperations`
   - プロジェクトの作成
   - プロジェクトの更新
   - アーカイブ/アーカイブ解除
   - プロジェクトの削除
   - コールバックフック

### 統合テスト

**コンポーネントがどのように連携するかをテスト:**

1. タイマー + プロジェクトアーカイブ
   - アクティブなプロジェクトをアーカイブするとタイマーが停止する

2. タイマー + プロジェクト削除
   - アクティブなプロジェクトを削除するとタイマーが停止する

3. キーボードショートカット + モーダル
   - モーダルが開いているときにショートカットが無効化される

4. ナビゲーション + FAB
   - アクティブなページに基づいてFABが変化する

### エンドツーエンドテスト

**完全なユーザーフローをテスト:**

1. タイマー開始 → 作業 → タイマー停止 → 時間エントリの検証
2. プロジェクト作成 → タイマー開始 → プロジェクトアーカイブ → タイマー停止の検証
3. ページ間のナビゲーション → 状態の永続性を検証
4. キーボードショートカットの使用 → すべてのショートカットが機能することを検証

---

## 移行チェックリスト

### 開始前

- [ ] フィーチャーブランチを作成: `refactor/decompose-app-component`
- [ ] 既存のすべてのテストが合格することを確認
- [ ] 現在の動作をドキュメント化
- [ ] コードベースをバックアップ

### フェーズ1: キーボードショートカット

- [ ] `useKeyboardShortcuts.ts`を作成
- [ ] フックのテストを記述
- [ ] App.tsxをフックを使用するように更新
- [ ] すべてのショートカットが機能することを検証
- [ ] 古いキーボードイベントハンドラーコードを削除
- [ ] 変更をコミット

### フェーズ2: タイマーコントローラー

- [ ] `useTimerController.ts`を作成
- [ ] フックのテストを記述
- [ ] App.tsxをフックを使用するように更新
- [ ] タイマーの開始/停止をテスト
- [ ] アーカイブ/削除との統合をテスト
- [ ] Electron IPC通信をテスト
- [ ] 変更をコミット

### フェーズ3: モーダルマネージャー

- [ ] `useModal.ts`を作成
- [ ] フックのテストを記述
- [ ] App.tsxをフックを使用するように更新
- [ ] すべてのモーダルをテスト
- [ ] 変更をコミット

### フェーズ4: プロジェクト操作

- [ ] `useProjectOperations.ts`を作成
- [ ] フックのテストを記述
- [ ] 検証ロジックを追加
- [ ] App.tsxをフックを使用するように更新
- [ ] すべてのCRUD操作をテスト
- [ ] 変更をコミット

### フェーズ5: ページルーター

- [ ] `PageRouter.tsx`を作成
- [ ] ルーティングロジックを移動
- [ ] App.tsxを更新
- [ ] すべてのページナビゲーションをテスト
- [ ] 変更をコミット

### 最終ステップ

- [ ] すべてのテストを実行
- [ ] テストカバレッジを確認 (70%以上が望ましい)
- [ ] ドキュメントを更新
- [ ] コードレビュー
- [ ] メインブランチにマージ

---

## 期待される結果

### リファクタリング前

```
App.tsx
├── 587行
├── 11個の状態変数
├── 18個のコールバック関数
├── 2個のuseEffectフック (1つは13個の依存関係を持つ)
└── テストが困難
```

### リファクタリング後

```
App.tsx (~150行)
├── 1-2個の状態変数
├── 3-4個のコールバック関数
├── 0個のuseEffectフック
└── テストが容易

新規ファイル:
├── hooks/useKeyboardShortcuts.ts (~80行)
├── hooks/useTimerController.ts (~120行)
├── hooks/useModal.ts (~30行)
├── hooks/useProjectOperations.ts (~100行)
└── components/PageRouter.tsx (~150行)

合計: 約480行 (整理され、テスト可能)
```

### メトリクスの改善

| メトリクス        | リファクタリング前 | リファクタリング後 | 改善  |
| ----------------- | ------------------ | ------------------ | ----- |
| App.tsx行数       | 587                | 150                | -74%  |
| 状態変数          | 11                 | 2                  | -82%  |
| コールバック関数  | 18                 | 4                  | -78%  |
| useEffect依存関係 | 13                 | 0                  | -100% |
| テスト可能性      | 低                 | 高                 | ✓     |
| 保守性            | 低                 | 高                 | ✓     |
| 再利用性          | なし               | 高                 | ✓     |

---

## 結論

App.tsxのリファクタリングは、コードベースで最優先の項目です。この詳細な計画は、ゴッドコンポーネントを管理可能で、テスト可能で、再利用可能な部品に分解するための段階的なアプローチを提供します。

**重要なポイント:**

1. **キーボードショートカットの抽出** - 宣言的、テスト可能、再利用可能
2. **タイマーコントローラーの抽出** - タイマーロジックを集中化、結合を減少
3. **モーダルマネージャーの抽出** - モーダル状態管理を簡素化
4. **プロジェクト操作の抽出** - CRUDをUIコンポーネントから移動
5. **ページルーターの抽出** - ルーティングの関心を分離

**リスク:** 低 - 各ステップでテストを行う段階的な変更

**影響:** 高 - コード品質と保守性を劇的に改善
