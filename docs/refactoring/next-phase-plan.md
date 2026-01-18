# 次期リファクタリング計画書

**作成日:** 2025-12-14
**最終更新:** 2025-12-27
**ステータス:** 🚧 実施中（Phase 0-2 完了）
**ベース:** tech-debt-report-2025-12-14.md

---

## 概要

本ドキュメントは、2025-12-14付け技術的負債レポートに基づき、Phase 1-5完了後の次期リファクタリング計画を記載します。

### 現在の技術的負債スコア

| 項目                      | 現状                       | 評価      |
| ------------------------- | -------------------------- | --------- |
| **負債スコア**            | 620/1000 → 改善中          | 中程度    |
| **テストカバレッジ**      | 44.3% (Lines), 232件 (+57) | 🔄 改善中 |
| **セキュリティ脆弱性**    | 10件 → 3件                 | ✅ 改善   |
| **古い依存関係**          | 32パッケージ               | 要更新    |
| **300行超コンポーネント** | 9件                        | 要分解    |
| **any型使用数**           | 3件 → 0件                  | ✅ 解消   |

---

## 完了済みリファクタリング

| Phase | 対象                     | Before   | After         | 削減率 |
| ----- | ------------------------ | -------- | ------------- | ------ |
| 1     | analytics.ts             | 519行    | 6ファイル分割 | ✅     |
| 2     | ProjectCard.tsx          | 718行    | 228行         | -68%   |
| 3     | SettingsView.tsx         | 488行    | 98行          | -80%   |
| 4     | TimerFocus.tsx           | 415行    | 199行         | -52%   |
| 5     | ManualTimeEntryForm.tsx  | 380行    | 134行         | -65%   |
| -     | App.tsx                  | 677行    | 277行         | -59%   |
| 0.1   | npm audit fix            | 10脆弱性 | 3脆弱性       | ✅     |
| 0.2   | modernTheme.ts any型     | 3箇所    | 0箇所         | ✅     |
| 1.1   | dateConstants.ts         | -        | 新規作成      | ✅     |
| 1.2   | constants/index.ts       | -        | 新規作成      | ✅     |
| 2.1   | SettingsContext テスト   | 0件      | +4件          | ✅     |
| 2.2   | settingsUtils テスト     | 0件      | +10件         | ✅     |
| 2.3   | importUtils テスト       | 0件      | +7件          | ✅     |
| 2.4   | analytics/heatmap テスト | 0件      | +新規         | ✅     |

---

## 次期リファクタリング計画

### Phase 0: セキュリティ・品質緊急対応（即時） ✅ 完了

**優先度: 🔴 最高**

#### 0.1 セキュリティ脆弱性の修正

```bash
npm audit fix
```

**対象脆弱性:**

| パッケージ           | 深刻度   | 修正方法      |
| -------------------- | -------- | ------------- |
| `form-data`          | **重大** | npm audit fix |
| `glob`               | **高**   | npm audit fix |
| `@babel/runtime`     | 中       | npm audit fix |
| `@eslint/plugin-kit` | 中       | npm audit fix |
| `brace-expansion`    | 中       | npm audit fix |
| `esbuild/vite`       | 中       | npm audit fix |

**完了条件:**

- [x] `npm audit` でhigh/critical脆弱性が0件（10件→3件に削減、残りは破壊的変更が必要）
- [x] 全テストがパス
- [x] アプリが正常動作

---

#### 0.2 型安全性の改善

**対象:** `src/styles/modernTheme.ts`

**現状（3箇所のany型）:**

```typescript
// 修正前
export const getGradient = (theme: any, type: keyof typeof gradients) => {
export const getCustomShadow = (theme: any, type: keyof typeof modernShadows) => {
export const applyGlassmorphism = (theme: any) => ({
```

**修正後:**

```typescript
import { Theme } from '@mui/material/styles';

export const getGradient = (theme: Theme, type: keyof typeof gradients) => {
  return theme.custom?.gradients?.[type] || gradients[type];
};

export const getCustomShadow = (
  theme: Theme,
  type: keyof typeof modernShadows
) => {
  return theme.custom?.shadows?.[type] || modernShadows[type];
};

export const applyGlassmorphism = (theme: Theme) => ({
  background: theme.custom?.glassmorphism?.background,
  backdropFilter: theme.custom?.glassmorphism?.blur,
  border: theme.custom?.glassmorphism?.border,
});
```

**完了条件:**

- [x] any型が0箇所
- [x] TypeScriptエラーなし
- [x] lint通過

---

### Phase 1: 定数・ユーティリティ整理 ✅ 完了

**優先度: 🟠 高**

#### 1.1 日付関連定数の集約

**問題:** MonthlySummary.tsx内で月名配列が2箇所重複定義

**対象ファイル:** `src/components/dashboard/MonthlySummary.tsx`

**新規作成:** `src/constants/dateConstants.ts`

```typescript
// src/constants/dateConstants.ts
export const MONTH_NAMES = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  ja: [
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ],
  short: {
    en: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    ja: [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月',
    ],
  },
} as const;

export const DAY_NAMES = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  ja: ['日', '月', '火', '水', '木', '金', '土'],
} as const;
```

**完了条件:**

- [x] 定数ファイル作成（dateConstants.ts）
- [x] MonthlySummary.tsxの重複削除
- [x] 他のコンポーネントでも活用（WorkHoursSettings.tsx）
- [x] 全テストパス

---

#### 1.2 constants/index.ts の整備

**新規作成:** `src/constants/index.ts`

```typescript
export * from './dateConstants';

// 既存のアプリ設定定数
export const APP_CONSTANTS = {
  TIMER: {
    MIN_DURATION_MS: 60000, // 1分
    AUTO_STOP_HOURS: 8,
    SLEEP_THRESHOLD_MS: 10000, // 10秒
  },
  STORAGE: {
    KEYS: {
      PROJECTS: 'projects',
      TIME_ENTRIES: 'timeEntries',
      SETTINGS: 'settings',
      ACTIVE_PAGE: 'activePage',
      TIMER_STATE: 'timerState',
    },
  },
  PROJECT: {
    DEFAULT_MONTHLY_HOURS: 160,
    MIN_MONTHLY_HOURS: 80,
    MAX_MONTHLY_HOURS: 200,
  },
} as const;
```

**完了条件:**

- [x] 定数が一元管理されている
- [x] マジックナンバーが削減されている

---

### Phase 2: テストカバレッジ向上 ✅ 完了（基礎部分）

**優先度: 🟠 高**

#### 2.1 0%カバレッジファイルのテスト追加

**優先度順:**

| ファイル               | テスト内容                              | 優先度 | ステータス      |
| ---------------------- | --------------------------------------- | ------ | --------------- |
| `SettingsContext.tsx`  | 設定の読み込み・保存・デフォルト値      | P0     | ✅ +4件         |
| `settingsUtils.ts`     | 設定バリデーション、型変換              | P0     | ✅ +10件        |
| `importUtils.ts`       | CSVパース、プロジェクト自動作成         | P0     | ✅ +7件         |
| `analytics/heatmap.ts` | ヒートマップデータ計算                  | P0     | ✅ 新規         |
| `safeImportUtils.ts`   | ロールバック機能、エラーハンドリング    | P0     | 📋 **次期対象** |
| `LanguageContext.tsx`  | 言語切り替え、永続化                    | P0.5   | 📋 未着手       |
| `backupUtils.ts`       | バックアップ生成・復元                  | P1     | 📋 未着手       |
| `storageUtils.ts`      | JSONファイル読み書き                    | P1     | 📋 未着手       |
| `storage.ts`           | localStorage/Electron APIフォールバック | P1     | 📋 未着手       |

#### 2.2 SettingsContext テスト

**新規作成:** `src/contexts/__tests__/SettingsContext.test.tsx`

```typescript
import { renderHook, act } from '@testing-library/react';
import { SettingsProvider, useSettingsContext } from '../SettingsContext';

describe('SettingsContext', () => {
  describe('初期化', () => {
    it('デフォルト設定を提供する', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );
      const { result } = renderHook(() => useSettingsContext(), { wrapper });

      expect(result.current.settings).toBeDefined();
      expect(result.current.settings.workHours.baseMonthlyHours).toBe(160);
    });
  });

  describe('設定更新', () => {
    it('月間基準時間を更新できる', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );
      const { result } = renderHook(() => useSettingsContext(), { wrapper });

      await act(async () => {
        await result.current.updateBaseMonthlyHours(180);
      });

      expect(result.current.settings.workHours.baseMonthlyHours).toBe(180);
    });

    it('無効な値は拒否する', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );
      const { result } = renderHook(() => useSettingsContext(), { wrapper });

      await act(async () => {
        await result.current.updateBaseMonthlyHours(-10);
      });

      expect(result.current.settings.workHours.baseMonthlyHours).toBe(160);
    });
  });
});
```

#### 2.3 importUtils テスト

**新規作成:** `src/utils/__tests__/importUtils.test.ts`

```typescript
import { parseCSV, validateCSVRow, importTimeEntries } from '../importUtils';
import { createMockProject } from '../../__tests__/helpers';

describe('importUtils', () => {
  describe('parseCSV', () => {
    it('有効なCSVをパースできる', () => {
      const csv = `projectName,date,startTime,endTime,note
Project A,2025-01-15,09:00,17:00,Working on feature`;

      const result = parseCSV(csv);

      expect(result).toHaveLength(1);
      expect(result[0].projectName).toBe('Project A');
    });

    it('空行をスキップする', () => {
      const csv = `projectName,date,startTime,endTime,note
Project A,2025-01-15,09:00,17:00,Note

Project B,2025-01-16,10:00,18:00,Note`;

      const result = parseCSV(csv);

      expect(result).toHaveLength(2);
    });
  });

  describe('validateCSVRow', () => {
    it('有効な行を検証する', () => {
      const row = {
        projectName: 'Test',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '17:00',
      };

      expect(validateCSVRow(row)).toBe(true);
    });

    it('開始時間が終了時間より後の場合はエラー', () => {
      const row = {
        projectName: 'Test',
        date: '2025-01-15',
        startTime: '18:00',
        endTime: '09:00',
      };

      expect(validateCSVRow(row)).toBe(false);
    });
  });
});
```

**完了条件:**

- [ ] 0%カバレッジファイルにテスト追加
- [ ] 各ファイル80%以上のカバレッジ
- [ ] 全テストパス

---

### Phase 3: ゴッドコンポーネント分解（第1弾）

**優先度: 🟡 中**

#### 3.1 ProjectProgressCard.tsx (456行)

**問題:** カード表示+メニュー+ダイアログが1ファイル

**分解計画:**

```text
src/components/ui/project/
├── ProjectProgressCard/
│   ├── index.tsx              # メインコンポーネント (~150行)
│   ├── ProjectCardHeader.tsx  # ヘッダー部分 (~80行)
│   ├── ProjectCardProgress.tsx # 進捗バー表示 (~100行)
│   ├── ProjectCardMenu.tsx    # アクションメニュー (~80行)
│   ├── ProjectTargetDialog.tsx # 目標設定ダイアログ (~120行)
│   └── hooks/
│       └── useProjectCardState.ts # 状態管理 (~80行)
```

**TDDサイクル:**

1. 既存動作のテスト作成
2. ProjectCardHeader抽出 → テスト
3. ProjectCardProgress抽出 → テスト
4. ProjectCardMenu抽出 → テスト
5. ProjectTargetDialog抽出 → テスト
6. 状態管理をhook化 → テスト

**完了条件:**

- [ ] メインファイルが200行以下
- [ ] 各サブコンポーネントにテスト
- [ ] 既存機能が維持されている

---

#### 3.2 MonthlySummary.tsx (378行)

**問題:** レイアウトと計算ロジックが混在

**分解計画:**

```text
src/components/dashboard/
├── MonthlySummary/
│   ├── index.tsx                # メインコンポーネント (~100行)
│   ├── MonthlyChart.tsx         # グラフ表示 (~120行)
│   ├── MonthlyStats.tsx         # 統計表示 (~80行)
│   └── hooks/
│       └── useMonthlyData.ts    # データ計算ロジック (~100行)
```

**完了条件:**

- [ ] メインファイルが150行以下
- [ ] 計算ロジックがhookに分離
- [ ] 定数がdateConstants.tsを使用

---

### Phase 4: ゴッドコンポーネント分解（第2弾）

**優先度: 🟡 中**

#### 4.1 ActivityCalendar.tsx (385行)

**分解計画:**

```text
src/components/heatmap/
├── ActivityCalendar/
│   ├── index.tsx                  # メイン (~100行)
│   ├── CalendarGrid.tsx           # グリッド表示 (~120行)
│   ├── CalendarTooltip.tsx        # ツールチップ (~60行)
│   ├── CalendarLegend.tsx         # 凡例 (~50行)
│   └── hooks/
│       └── useCalendarData.ts     # カレンダーデータ計算 (~100行)
```

**完了条件:**

- [ ] 各コンポーネントが200行以下
- [ ] 計算ロジックがhookに分離
- [ ] 全テストパス

---

### Phase 5: useStorage リファクタリング

**優先度: 🟢 中**

**問題:** データ永続化とテストモード管理の責務混在

**現状:** `src/hooks/useStorage.ts` (245行)

**分解計画:**

```text
src/hooks/
├── useStorage.ts              # データ永続化のみ (~150行)
├── useTestMode.ts             # テストモード管理 (~50行)
└── useStorageWithTestMode.ts  # 統合版（既存互換） (~50行)
```

**useTestMode.ts:**

```typescript
export interface TestModeController {
  isTestMode: boolean;
  enableTestMode: () => void;
  disableTestMode: () => void;
  generateTestData: () => void;
  clearTestData: () => void;
}

export const useTestMode = (
  onDataGenerated?: (projects: Project[], entries: TimeEntry[]) => void
): TestModeController => {
  // 実装
};
```

**完了条件:**

- [ ] 責務が明確に分離
- [ ] 既存のuseStorage利用箇所が正常動作
- [ ] テストモード機能が独立してテスト可能

---

### Phase 6: グラフコンポーネント共通化

**優先度: 🟢 低**

**問題:** Rechartsグラフ設定が3つのダッシュボードコンポーネントで重複

**対象:**

- `DailySummary.tsx`
- `WeeklySummary.tsx`
- `MonthlySummary.tsx`

**新規作成:**

```text
src/components/charts/
├── index.ts
├── BaseChart.tsx              # 共通設定・スタイル
├── ChartTooltip.tsx           # 共通ツールチップ
├── LineChartWrapper.tsx       # 折れ線グラフ
├── BarChartWrapper.tsx        # 棒グラフ
├── PieChartWrapper.tsx        # 円グラフ
└── chartTheme.ts              # グラフテーマ定数
```

**完了条件:**

- [ ] 共通コンポーネントが作成されている
- [ ] 重複コードが25%以上削減
- [ ] ダッシュボードで共通コンポーネントを使用

---

### Phase 7: 依存関係アップデート

**優先度: 🔵 計画的**

#### 7.1 Electronアップデート（高リスク）

**現在:** 29.x → **目標:** 39.x

**確認項目:**

- [ ] Electron API互換性
- [ ] preload.jsの動作確認
- [ ] IPC通信のテスト
- [ ] electron-builderの設定更新
- [ ] 各OSでのビルド確認

**段階的アップデート計画:**

```text
29.x → 31.x → 35.x → 39.x
```

#### 7.2 その他の依存関係

| パッケージ      | 現在 | 目標 | 優先度 |
| --------------- | ---- | ---- | ------ |
| `vite`          | 5.x  | 6.x  | 高     |
| `@mui/material` | 5.x  | 7.x  | 中     |
| `recharts`      | 2.x  | 3.x  | 低     |

**完了条件:**

- [ ] 各アップデート後に全テストパス
- [ ] 互換性問題が解決されている
- [ ] ビルドが正常に完了

---

## テストコード改善（並行実施）

詳細は `test-refactoring-plan.md` を参照

**主な項目:**

1. テストヘルパー基盤の構築
2. テストファクトリの共通化
3. モック実装の一元化
4. 重複テストの統合
5. 命名規則の統一

---

## 実装スケジュール

```text
Phase 0: セキュリティ・品質緊急対応   ← 即時実施
    ↓
Phase 1: 定数・ユーティリティ整理
    ↓
Phase 2: テストカバレッジ向上        ← 並行してテスト改善
    ↓
Phase 3: ゴッドコンポーネント分解（第1弾）
    ↓
Phase 4: ゴッドコンポーネント分解（第2弾）
    ↓
Phase 5: useStorage リファクタリング
    ↓
Phase 6: グラフコンポーネント共通化
    ↓
Phase 7: 依存関係アップデート
```

---

## 成功メトリクス

### 目標値

| メトリクス               | 現在      | Phase 2完了 | Phase 4完了 | 最終目標 |
| ------------------------ | --------- | ----------- | ----------- | -------- |
| テストカバレッジ (Lines) | **44.3%** | 55%         | 65%         | 75%+     |
| テスト総数               | **232件** | 260件       | 300件       | 350件+   |
| any型使用数              | **0** ✅  | 0           | 0           | 0        |
| セキュリティ脆弱性       | 3         | 0           | 0           | 0        |
| 300行超ファイル数        | 9         | 7           | 4           | 2以下    |
| 負債スコア               | 550       | 450         | 380         | 350以下  |

### 各Phase完了時のチェックリスト

- [ ] 全テストがパス
- [ ] lint/formatエラーなし
- [ ] TypeScriptエラーなし
- [ ] アプリが正常動作
- [ ] ドキュメント更新済み
- [ ] コミット完了

---

## リスク管理

### 高リスク項目

1. **Electronアップデート**
   - 対策: 段階的アップデート、各バージョンでの動作確認

2. **MUIアップデート（5→7）**
   - 対策: 移行ガイドの事前確認、コンポーネント単位での移行

### ロールバック計画

- 各Phase完了後にタグ付け
- 問題発生時は該当タグまでロールバック
- feature branchでの作業を推奨

---

## 関連ドキュメント

- `tech-debt-report-2025-12-14.md` - 技術的負債分析レポート
- `comprehensive-refactoring-plan.md` - 全体リファクタリング計画
- `app-component-decomposition.md` - App.tsx分解詳細
- `test-refactoring-plan.md` - テストコードリファクタリング計画
- `refactoring-plan.md` - App.tsx実行計画（完了）
