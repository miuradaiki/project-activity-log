# App.tsx リファクタリング実行計画

**更新日:** 2025-12-07
**ステータス:** ✅ 完了
**分析ドキュメント:** `analysis-report.ja.md`, `app-component-decomposition.md`
**対象ファイル:** `src/App.tsx`

---

## リファクタリング結果サマリー

### 達成されたメトリクス

| メトリクス     | 実施前 | 実施後         | 改善率    |
| -------------- | ------ | -------------- | --------- |
| App.tsx行数    | 677行  | 277行          | -59%      |
| テスト数       | 158    | 175            | +17テスト |
| カスタムフック | 3      | 7              | +4        |
| コンポーネント | -      | 1 (PageRouter) | +1        |

### 作成されたファイル

| ファイル                            | 行数  | テスト数 |
| ----------------------------------- | ----- | -------- |
| `src/hooks/useKeyboardShortcuts.ts` | 55行  | 16       |
| `src/hooks/useTimerController.ts`   | 169行 | 16       |
| `src/hooks/useModal.ts`             | 31行  | 9        |
| `src/hooks/useProjectOperations.ts` | 121行 | 11       |
| `src/components/PageRouter.tsx`     | 117行 | 6        |

---

## 実行されたフェーズ

### Phase 1: useKeyboardShortcuts フックの抽出 ✅

**実装ファイル:** `src/hooks/useKeyboardShortcuts.ts`
**テストファイル:** `src/hooks/__tests__/useKeyboardShortcuts.test.ts`

```typescript
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

export const useKeyboardShortcuts = (
  shortcuts: Shortcut[],
  options?: { enabled?: boolean }
) => void;
```

**テストカバレッジ:** 16テスト

- 基本的なキー押下検出
- 修飾キーの組み合わせ (Ctrl, Alt, Shift, Meta)
- disabledショートカットのスキップ
- enabledオプションによる全体無効化
- クリーンアップ処理

---

### Phase 2: useTimerController フックの抽出 ✅

**実装ファイル:** `src/hooks/useTimerController.ts`
**テストファイル:** `src/hooks/__tests__/useTimerController.test.ts`

```typescript
interface TimerController {
  activeProject: Project | null;
  isRunning: boolean;
  startTime: string | null;
  start: (project: Project) => Promise<void>;
  stop: () => Promise<void>;
  toggle: (project?: Project) => Promise<void>;
  canStart: boolean;
  canStop: boolean;
}

export const useTimerController = (
  projects: Project[],
  onTimeEntriesCreated?: (entries: TimeEntry[]) => void
): TimerController;
```

**テストカバレッジ:** 16テスト

- タイマー開始/停止
- localStorage永続化
- 8時間経過時のリセット
- 1分未満エントリーの破棄
- Electron API連携
- アーカイブ済みプロジェクトの復元スキップ

---

### Phase 3: useModal フックの抽出 ✅

**実装ファイル:** `src/hooks/useModal.ts`
**テストファイル:** `src/hooks/__tests__/useModal.test.ts`

```typescript
interface Modal<T = undefined> {
  isOpen: boolean;
  data: T | undefined;
  open: (data?: T) => void;
  close: () => void;
}

export const useModal = <T = undefined>(): Modal<T>;
```

**テストカバレッジ:** 9テスト

- 開閉状態の管理
- ジェネリック型によるデータ型安全性
- closeによるデータクリア
- 複数モーダルの独立管理

---

### Phase 4: useProjectOperations フックの抽出 ✅

**実装ファイル:** `src/hooks/useProjectOperations.ts`
**テストファイル:** `src/hooks/__tests__/useProjectOperations.test.ts`

```typescript
interface ProjectOperations {
  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) => void;
  editProject: (original: Project, data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  archiveProject: (project: Project) => void;
  unarchiveProject: (project: Project) => void;
  deleteProject: (project: Project) => void;
  deleteTimeEntry: (timeEntryId: string) => void;
  saveTimeEntry: (timeEntry: TimeEntry, isEditing: boolean) => void;
}

export const useProjectOperations = (props: UseProjectOperationsProps): ProjectOperations;
```

**テストカバレッジ:** 11テスト

- CRUD操作
- アクティブプロジェクト削除/アーカイブ時のタイマー停止
- タイムエントリーの作成/編集/削除

---

### Phase 5: PageRouter コンポーネントの抽出 ✅

**実装ファイル:** `src/components/PageRouter.tsx`
**テストファイル:** `src/components/__tests__/PageRouter.test.tsx`

```typescript
interface PageRouterProps {
  activePage: string;
  projects: Project[];
  timeEntries: TimeEntry[];
  timer: TimerController;
  projectFormModal: Modal<Project>;
  manualEntryModal: Modal<TimeEntry>;
  projectOps: ProjectOperations;
  onStartTimer: (project: Project) => void;
  onImportCSV: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const PageRouter: React.FC<PageRouterProps>;
```

**テストカバレッジ:** 6テスト

- 各ページのレンダリング (dashboard, projects, timer, settings)
- 未知のページでのnull返却
- コールバックの正しい受け渡し

---

## リファクタリング後のApp.tsx構造

```typescript
const App: React.FC = () => {
  const { t } = useLanguage();
  const { isDarkMode, toggleThemeMode } = useThemeMode();
  const { projects, setProjects, timeEntries, setTimeEntries, isLoading } = useStorage();

  // モーダル管理
  const projectFormModal = useModal<Project>();
  const manualEntryModal = useModal<TimeEntry>();
  const shortcutsModal = useModal();

  // タイマーコントローラー
  const timer = useTimerController(projects, (entries) =>
    setTimeEntries((prev) => [...prev, ...entries])
  );

  // プロジェクト操作
  const projectOps = useProjectOperations({
    projects,
    setProjects,
    setTimeEntries,
    activeProjectId: timer.activeProject?.id || null,
    isTimerRunning: timer.isRunning,
    onTimerStop: () => timer.stop(),
  });

  // キーボードショートカット
  useKeyboardShortcuts(shortcuts, { enabled: !hasOpenModal });

  if (isLoading) return <Loading />;

  return (
    <Layout {...layoutProps}>
      <PageRouter
        activePage={activePage}
        projects={projects}
        timeEntries={timeEntries}
        timer={timer}
        projectFormModal={projectFormModal}
        manualEntryModal={manualEntryModal}
        projectOps={projectOps}
        onStartTimer={handleStartTimer}
        onImportCSV={handleImportCSV}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleThemeMode}
      />
      <ProjectForm {...} />
      <ManualTimeEntryForm {...} />
      <KeyboardShortcutsDialog {...} />
    </Layout>
  );
};
```

---

## TDD (Test-Driven Development) プロセス

各フェーズは以下のサイクルで実行されました：

1. **RED**: テストを先に作成し、失敗を確認
2. **GREEN**: 最小限の実装でテストをパス
3. **REFACTOR**: App.tsxに適用し、全テストが通ることを確認

---

## 今後の改善候補

1. **useNavigationフックの抽出**: ページナビゲーション関連のロジック
2. **useCSVImportフックの抽出**: CSVインポート処理
3. **既存useTimer.tsとの統合検討**: useTimerControllerとの重複部分の整理
