# テストコード リファクタリング計画書

**作成日:** 2025-12-07
**最終更新:** 2026-01-02
**ステータス:** ✅ 完了
**対象:** `src/**/__tests__/*.test.ts(x)`
**現在のテスト数:** 231件（20スイート）

---

## 概要

テストコード全体のレビューにより、以下の問題が特定されました：

- テストデータファクトリの重複定義
- モック実装の冗長性
- テストヘルパーの分散
- 命名規則の不統一
- 低価値テストの存在

本計画では、テストの保守性と可読性を向上させるためのリファクタリングを段階的に実施します。

---

## 現状分析

### 対象テストファイル一覧

| ファイル                       | テスト数 | 問題点                                                  |
| ------------------------------ | -------- | ------------------------------------------------------- |
| `useTimerController.test.ts`   | 16       | localStorage モック重複、useTimer.test.tsx と重複テスト |
| `useStorage.test.tsx`          | 10       | localStorage モック重複、クリーンアップ不足             |
| `useProjectOperations.test.ts` | 11       | モックプロップの繰り返し                                |
| `analytics.test.ts`            | 25+      | ファクトリ関数重複、魔法の数値                          |
| `colorUtils.test.ts`           | 15+      | ファクトリ関数重複、低価値テスト                        |
| `ManualTimeEntryForm.test.tsx` | 10+      | AAA パターン不遵守、UI操作の冗長性                      |
| `useTimer.test.tsx`            | 16       | useTimerController.test.ts と重複                       |
| `setupTest.test.tsx`           | 5        | 低価値テスト                                            |

### 問題の重要度マトリクス

```
影響度 高 ┃ ① ファクトリ重複    ② モック重複
         ┃
         ┃ ③ テスト重複       ④ AAA不遵守
         ┃
影響度 低 ┃ ⑤ 命名不統一       ⑥ 低価値テスト
         ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           修正容易            修正困難
```

---

## リファクタリング計画

### Phase 1: テストヘルパー基盤の構築

**目的:** 共通ユーティリティを一元管理するディレクトリ構造を作成

#### 1.1 ディレクトリ構造の作成

```
src/__tests__/
├── helpers/
│   ├── index.ts              # エクスポート集約
│   ├── testFactories.ts      # テストデータファクトリ
│   ├── localStorageMock.ts   # localStorage モック
│   ├── timerMock.ts          # フェイクタイマーヘルパー
│   └── renderHelpers.tsx     # カスタムrender関数
└── setup.ts                  # 既存のセットアップファイル
```

#### 1.2 testFactories.ts の実装

```typescript
// src/__tests__/helpers/testFactories.ts
import { Project, TimeEntry } from '../../types';

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

// 複数データ生成ヘルパー
export const createMockProjects = (count: number): Project[] =>
  Array.from({ length: count }, (_, i) =>
    createMockProject({ id: `project-${i + 1}`, name: `Project ${i + 1}` })
  );

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
```

#### 1.3 localStorageMock.ts の実装

```typescript
// src/__tests__/helpers/localStorageMock.ts
export interface LocalStorageMockStore {
  store: Record<string, string>;
  reset: () => void;
}

export const setupLocalStorageMock = (): LocalStorageMockStore => {
  const store: Record<string, string> = {};
  const localStorageMock = window.localStorage as jest.Mocked<
    typeof window.localStorage
  >;

  localStorageMock.getItem.mockImplementation(
    (key: string) => store[key] || null
  );
  localStorageMock.setItem.mockImplementation((key: string, value: string) => {
    store[key] = value;
  });
  localStorageMock.removeItem.mockImplementation((key: string) => {
    delete store[key];
  });
  localStorageMock.clear.mockImplementation(() => {
    Object.keys(store).forEach((key) => delete store[key]);
  });

  return {
    store,
    reset: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
  };
};
```

#### 1.4 timerMock.ts の実装

```typescript
// src/__tests__/helpers/timerMock.ts
export interface FakeTimerHelper {
  cleanup: () => void;
  advance: (ms: number) => void;
  setSystemTime: (date: string | Date) => void;
}

export const setupFakeTimers = (
  fixedDate: string = '2025-01-15T12:00:00Z'
): FakeTimerHelper => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(fixedDate));

  return {
    cleanup: () => jest.useRealTimers(),
    advance: (ms: number) => jest.advanceTimersByTime(ms),
    setSystemTime: (date: string | Date) => {
      jest.setSystemTime(typeof date === 'string' ? new Date(date) : date);
    },
  };
};
```

#### 1.5 index.ts の実装

```typescript
// src/__tests__/helpers/index.ts
export * from './testFactories';
export * from './localStorageMock';
export * from './timerMock';
```

**完了条件:**

- [x] ディレクトリ構造が作成されている
- [x] 各ヘルパーファイルが実装されている
- [x] TypeScript エラーがない
- [x] 既存テストが全てパスする

---

### Phase 2: テストファイルへのヘルパー適用

**目的:** 既存テストファイルを新しいヘルパーを使用するようにリファクタリング

#### 2.1 analytics.test.ts のリファクタリング

**Before:**

```typescript
const createProject = (
  id: string,
  name: string,
  isArchived = false
): Project => ({
  id,
  name,
  description: '',
  monthlyCapacity: 0.5,
  isArchived,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
});
```

**After:**

```typescript
import {
  createMockProject,
  createMockTimeEntry,
} from '../../__tests__/helpers';

// 使用例
const project = createMockProject({ id: 'p1', name: 'Project 1' });
```

#### 2.2 colorUtils.test.ts のリファクタリング

同様にファクトリ関数を置き換え

#### 2.3 useTimerController.test.ts のリファクタリング

**Before:**

```typescript
let localStorageStore: Record<string, string> = {};

beforeEach(() => {
  localStorageStore = {};
  localStorageMock.getItem.mockImplementation(
    (key: string) => localStorageStore[key] || null
  );
  // ... 長いセットアップ
});
```

**After:**

```typescript
import {
  setupLocalStorageMock,
  setupFakeTimers,
} from '../../__tests__/helpers';

describe('useTimerController', () => {
  let localStorage: LocalStorageMockStore;
  let timer: FakeTimerHelper;

  beforeEach(() => {
    localStorage = setupLocalStorageMock();
    timer = setupFakeTimers('2025-01-15T12:00:00Z');
  });

  afterEach(() => {
    localStorage.reset();
    timer.cleanup();
  });
});
```

#### 2.4 useStorage.test.tsx のリファクタリング

同様のパターンを適用

**完了条件:**

- [x] 全対象ファイルでローカルファクトリが削除されている
- [x] 共通ヘルパーがインポートされている
- [x] 全テストがパスする

---

### Phase 3: useProjectOperations.test.ts のリファクタリング

**目的:** モックプロップの繰り返しを解消

#### 3.1 プロップファクトリの作成

```typescript
// useProjectOperations.test.ts 内に定義
const createDefaultProps = (
  overrides: Partial<Parameters<typeof useProjectOperations>[0]> = {}
) => ({
  projects: [createMockProject({ id: 'p1', name: 'Test Project' })],
  setProjects: jest.fn(),
  setTimeEntries: jest.fn(),
  activeProjectId: null,
  isTimerRunning: false,
  onTimerStop: jest.fn(),
  ...overrides,
});
```

#### 3.2 テストの簡素化

**Before:**

```typescript
it('プロジェクトを作成できる', () => {
  const setProjects = jest.fn();
  const setTimeEntries = jest.fn();
  const onTimerStop = jest.fn();

  const { result } = renderHook(() =>
    useProjectOperations({
      projects: [mockProject],
      setProjects,
      setTimeEntries,
      activeProjectId: null,
      isTimerRunning: false,
      onTimerStop,
    })
  );
  // ...
});
```

**After:**

```typescript
it('プロジェクトを作成できる', () => {
  const props = createDefaultProps();
  const { result } = renderHook(() => useProjectOperations(props));
  // ...
});
```

**完了条件:**

- [x] プロップファクトリが実装されている
- [x] 全テストで使用されている
- [x] テストの可読性が向上している

---

### Phase 4: ManualTimeEntryForm.test.tsx の改善

**目的:** AAA パターンの遵守と UI 操作のヘルパー化

#### 4.1 テストヘルパークラスの作成

```typescript
// src/components/timer/__tests__/helpers/ManualTimeEntryFormHelper.ts
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export class ManualTimeEntryFormTestHelper {
  async selectProject(projectName: string) {
    const projectSelect = screen.getByRole('combobox');
    await userEvent.click(projectSelect);
    await userEvent.click(screen.getByText(projectName));
  }

  async setTimeRange(startTime: string, endTime: string) {
    const timeInputs = screen.getAllByDisplayValue(/^\d{2}:\d{2}$/);
    fireEvent.change(timeInputs[0], { target: { value: startTime } });
    fireEvent.change(timeInputs[1], { target: { value: endTime } });
  }

  async setDates(startDate: string, endDate: string) {
    const dateInputs = screen.getAllByRole('textbox', { name: /date/i });
    if (dateInputs.length >= 2) {
      fireEvent.change(dateInputs[0], { target: { value: startDate } });
      fireEvent.change(dateInputs[1], { target: { value: endDate } });
    }
  }

  getSaveButton() {
    return screen.getByRole('button', { name: /保存|save|update/i });
  }

  async clickSave() {
    await userEvent.click(this.getSaveButton());
  }

  async fillAndSubmit(options: {
    project: string;
    startTime: string;
    endTime: string;
  }) {
    await this.selectProject(options.project);
    await this.setTimeRange(options.startTime, options.endTime);
    await this.clickSave();
  }
}
```

#### 4.2 テストのリファクタリング

**Before:**

```typescript
it('終了時間が開始時間より前の場合、エラーを表示', async () => {
  const onSave = jest.fn();
  renderManualTimeEntryForm({ onSave });

  const projectSelect = screen.getByRole('combobox');
  await userEvent.click(projectSelect);
  await userEvent.click(screen.getByText('Project 1'));

  const timeInputs = screen.getAllByDisplayValue(/^\d{2}:\d{2}$/);
  fireEvent.change(timeInputs[0], { target: { value: '10:00' } });
  fireEvent.change(timeInputs[1], { target: { value: '09:00' } });

  const saveButton = screen.getByRole('button', { name: /保存/i });
  await userEvent.click(saveButton);

  expect(mockAlert).toHaveBeenCalledWith(
    '終了時間は開始時間より後である必要があります。'
  );
  expect(onSave).not.toHaveBeenCalled();
});
```

**After:**

```typescript
it('終了時間が開始時間より前の場合、エラーを表示', async () => {
  // Arrange
  const onSave = jest.fn();
  renderManualTimeEntryForm({ onSave });
  const helper = new ManualTimeEntryFormTestHelper();

  // Act
  await helper.selectProject('Project 1');
  await helper.setTimeRange('10:00', '09:00');
  await helper.clickSave();

  // Assert
  expect(mockAlert).toHaveBeenCalledWith(
    '終了時間は開始時間より後である必要があります。'
  );
  expect(onSave).not.toHaveBeenCalled();
});
```

**完了条件:**

- [x] ヘルパークラスが実装されている
- [x] 全テストで AAA パターンが明確
- [x] テストの可読性が向上している

---

### Phase 5: 重複テストの統合

**目的:** useTimerController.test.ts と useTimer.test.tsx の重複を解消

#### 5.1 重複テストの特定

| テスト内容                       | useTimerController | useTimer |
| -------------------------------- | ------------------ | -------- |
| タイマー開始時のlocalStorage保存 | ✅                 | ✅       |
| 1分未満エントリーの破棄          | ✅                 | ✅       |
| 8時間以上の古い状態リセット      | ✅                 | ✅       |
| 基本的な開始/停止                | ✅                 | ✅       |

#### 5.2 役割分担の明確化

**useTimer.test.tsx（低レベル）:**

- タイマーの基本動作（カウント、状態管理）
- ブラウザAPI との連携（localStorage、通知）

**useTimerController.test.ts（高レベル）:**

- プロジェクトとの連携
- TimeEntry の生成
- Electron API 連携
- ビジネスロジック（8時間制限など）

#### 5.3 テストの再配置

```typescript
// useTimer.test.tsx - 基本機能に集中
describe('useTimer', () => {
  describe('基本動作', () => {
    test('開始するとisRunningがtrueになる');
    test('停止するとisRunningがfalseになる');
    test('経過時間が正しく計算される');
  });

  describe('永続化', () => {
    test('状態がlocalStorageに保存される');
    test('ページリロード時に状態が復元される');
  });
});

// useTimerController.test.ts - ビジネスロジックに集中
describe('useTimerController', () => {
  describe('プロジェクト連携', () => {
    test('プロジェクトを指定してタイマーを開始できる');
    test('アーカイブ済みプロジェクトでは開始できない');
  });

  describe('TimeEntry生成', () => {
    test('停止時にTimeEntryが作成される');
    test('1分未満のエントリーは破棄される');
  });

  describe('安全機能', () => {
    test('8時間以上経過した状態はリセットされる');
  });
});
```

**完了条件:**

- [x] 重複テストが削除されている
- [x] 各ファイルの責務が明確
- [x] カバレッジが維持されている

---

### Phase 6: 低価値テストの削除・改善

**目的:** 保守コストに見合わない価値のテストを整理

#### 6.1 削除候補

**colorUtils.test.ts:**

```typescript
// 削除: インスタンス存在確認は他でカバー
test('グローバルインスタンスが利用可能', () => {
  expect(projectColorManager).toBeDefined();
});
```

**setupTest.test.tsx:**

```typescript
// 削除または統合: 環境確認は CI で十分
test('テスト環境が正しくセットアップされている');
```

#### 6.2 改善候補

**analytics.test.ts の魔法の数値:**

**Before:**

```typescript
test('完了予定日を予測する', () => {
  const result = predictCompletionDate(10, 40, 5);
  expect(result!.getDate()).toBe(21);
});
```

**After:**

```typescript
describe('predictCompletionDate', () => {
  const TEST_CASES = {
    standardPace: {
      currentHours: 10,
      targetHours: 40,
      dailyAverage: 5,
      description: '残り30時間、1日5時間ペースで6日後',
    },
  };

  test('標準ペースでの完了日予測', () => {
    const { currentHours, targetHours, dailyAverage } = TEST_CASES.standardPace;
    const baseDate = new Date('2025-01-15');
    jest.setSystemTime(baseDate);

    const result = predictCompletionDate(
      currentHours,
      targetHours,
      dailyAverage
    );

    const expectedDate = new Date(baseDate);
    expectedDate.setDate(expectedDate.getDate() + 6);
    expect(result!.getDate()).toBe(expectedDate.getDate());
  });
});
```

**完了条件:**

- [x] 低価値テストが削除されている
- [x] 魔法の数値が定数化されている
- [x] テストの意図が明確になっている

---

### Phase 7: 命名規則の統一

**目的:** テスト全体で一貫した命名規則を適用

#### 7.1 命名規則ガイドライン

```typescript
// describe: 機能・クラス・関数名
describe('useTimerController', () => {
  // describe: 機能カテゴリ
  describe('タイマー開始', () => {
    // test/it: 「〜できる」「〜される」形式
    test('プロジェクトを指定してタイマーを開始できる', () => {});
    test('開始時刻がlocalStorageに保存される', () => {});
  });

  describe('エラーケース', () => {
    test('アーカイブ済みプロジェクトでは開始できない', () => {});
  });
});
```

#### 7.2 適用対象

全テストファイルで以下を統一：

- `describe` の第一引数: 機能名（日本語）
- `test/it` の第一引数: 動作説明（日本語、「〜できる」「〜される」形式）
- ネストは最大3階層まで

**完了条件:**

- [x] 全テストで命名規則が統一されている
- [x] コードレビューでの指摘がない

---

## 実行スケジュール

```
Phase 1: テストヘルパー基盤の構築
    ↓
Phase 2: テストファイルへのヘルパー適用
    ↓
Phase 3: useProjectOperations.test.ts のリファクタリング
    ↓
Phase 4: ManualTimeEntryForm.test.tsx の改善
    ↓
Phase 5: 重複テストの統合
    ↓
Phase 6: 低価値テストの削除・改善
    ↓
Phase 7: 命名規則の統一
```

---

## 期待される効果

### 定量的効果

| メトリクス                     | 現状    | 目標    |
| ------------------------------ | ------- | ------- |
| 重複コード行数                 | 約200行 | 約50行  |
| テストファイルあたりの平均行数 | 約250行 | 約180行 |
| 新規テスト作成時間             | 基準    | -30%    |

### 定性的効果

1. **保守性向上**: 共通ヘルパーにより変更箇所が一元化
2. **可読性向上**: AAA パターンの徹底で意図が明確に
3. **一貫性向上**: 命名規則統一でコードベース全体の品質向上
4. **オンボーディング改善**: 新規開発者がテストパターンを理解しやすい

---

## 注意事項

### TDD プロセスの遵守

各 Phase は以下のサイクルで実施：

1. **既存テストが全てパスすることを確認**
2. **リファクタリング実施**
3. **テストが全てパスすることを確認**
4. **コミット**

### ロールバック計画

各 Phase 完了後にコミットし、問題発生時は該当コミットまでロールバック可能な状態を維持する。

---

## 参考資料

- [Jest 公式ドキュメント](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [t-wada TDD 実践ガイド](https://github.com/twada/power-assert)
