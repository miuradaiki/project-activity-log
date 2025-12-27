# アプリ全体リファクタリング計画書

**作成日:** 2025-12-13
**最終更新:** 2025-12-27
**ステータス:** 🚧 実施中（Phase 1-5 完了、next-phase Phase 0-2 完了）

---

## 概要

本ドキュメントは、project-activity-logアプリケーション全体のリファクタリング計画を記載します。
コードベース調査により特定された問題点と、優先度別の改善計画を提示します。

### コードベース全体統計

| カテゴリ       | ファイル数 | 総行数        |
| -------------- | ---------- | ------------- |
| コンポーネント | 37         | 9,482行       |
| フック         | 7          | 829行         |
| ユーティリティ | 13         | 1,237行       |
| コンテキスト   | 2          | 292行         |
| テストコード   | 20         | 4,200行+      |
| **合計**       | **79**     | **16,000行+** |

---

## 実施状況サマリー

### 完了したPhase

| Phase | 対象                    | Before | After             | 削減率   | ステータス |
| ----- | ----------------------- | ------ | ----------------- | -------- | ---------- |
| 1     | analytics.ts            | 519行  | 35-169行/ファイル | 分割完了 | ✅ 完了    |
| 2     | ProjectCard.tsx         | 718行  | 228行             | -68%     | ✅ 完了    |
| 3     | SettingsView.tsx        | 488行  | 98行              | -80%     | ✅ 完了    |
| 4     | TimerFocus.tsx          | 415行  | 199行             | -52%     | ✅ 完了    |
| 5     | ManualTimeEntryForm.tsx | 380行  | 134行             | -65%     | ✅ 完了    |
| 6     | テストカバレッジ向上    | -      | -                 | -        | 📋 計画中  |
| 7     | 重複コード統合          | -      | -                 | -        | 📋 計画中  |

### テスト結果

- 既存テスト: 175件 → 189件 → 210件 → **232件**（+22件 analytics/heatmapテスト追加）
- テストスイート: **20スイート** 全パス ✓
- lint: 0エラー ✓
- セキュリティ脆弱性: 10件 → 3件（Critical/High解消済み）
- any型使用数: 3件 → 0件

### テストカバレッジ詳細（2025-12-27時点）

| メトリクス | カバレッジ |
| ---------- | ---------- |
| Statements | 44.49%     |
| Branch     | 34.2%      |
| Functions  | 41.1%      |
| Lines      | 44.3%      |

**カバレッジが高い部分:**

| ディレクトリ            | Lines  | 備考                       |
| ----------------------- | ------ | -------------------------- |
| `src/utils/analytics/`  | 98.01% | 分割後のテスト充実         |
| `src/hooks/`            | 91.4%  | フック全体の高カバレッジ   |
| `src/components/timer/` | 83.58% | Timer, ManualTimeEntryForm |
| `src/contexts/`         | 77.08% | SettingsContext追加        |

**カバレッジが低い部分（0%）:**

- `src/components/dashboard/` - 全ダッシュボードコンポーネント
- `src/components/settings/` - 設定画面コンポーネント
- `src/components/comparison/` - 比較ビュー
- `src/styles/` - テーマファイル

---

## 既存リファクタリング計画との関連

### 完了済み

| 計画                             | ステータス | 詳細                  |
| -------------------------------- | ---------- | --------------------- |
| App.tsx ゴッドコンポーネント分解 | ✅ 完了    | `refactoring-plan.md` |
| analytics.ts 分割                | ✅ 完了    | Phase 1               |
| ProjectCard 分解                 | ✅ 完了    | Phase 2               |
| SettingsView モジュール化        | ✅ 完了    | Phase 3               |
| TimerFocus 分解                  | ✅ 完了    | Phase 4               |
| ManualTimeEntryForm 改善         | ✅ 完了    | Phase 5               |

**主な成果:**

- App.tsx: 677行 → 277行 (-59%)
- analytics.ts: 519行 → 6ファイルに分割
- ProjectCard.tsx: 718行 → 228行 (-68%)
- SettingsView.tsx: 488行 → 98行 (-80%)
- TimerFocus.tsx: 415行 → 199行 (-52%)
- ManualTimeEntryForm.tsx: 380行 → 134行 (-65%)

### 進行中/計画中

| 計画                         | ステータス | 詳細                                     |
| ---------------------------- | ---------- | ---------------------------------------- |
| テストコードリファクタリング | 📋 計画中  | `test-refactoring-plan.md`               |
| 次期リファクタリング計画     | 🚧 実施中  | `next-phase-plan.md` Phase 0-2 完了      |
| テストカバレッジ向上         | 🚧 実施中  | Phase 6 / next-phase Phase 2（基礎完了） |
| 重複コード統合               | 📋 計画中  | Phase 7                                  |

### 次期計画の概要（next-phase-plan.md）

| Phase | 内容                           | 優先度    | ステータス  |
| ----- | ------------------------------ | --------- | ----------- |
| 0     | セキュリティ修正・型安全性改善 | 🔴 最高   | ✅ 完了     |
| 1     | 定数・ユーティリティ整理       | 🟠 高     | ✅ 完了     |
| 2     | テストカバレッジ向上           | 🟠 高     | ✅ 基礎完了 |
| 3-4   | ゴッドコンポーネント分解       | 🟡 中     | 📋 計画中   |
| 5     | useStorageリファクタリング     | 🟢 中     | 📋 計画中   |
| 6     | グラフコンポーネント共通化     | 🟢 低     | 📋 計画中   |
| 7     | 依存関係アップデート           | 🔵 計画的 | 📋 計画中   |

---

## 問題点サマリー

### 1. ゴッドコンポーネント（300行以上）

| コンポーネント                  | 行数          | useState | 主な問題                       | ステータス |
| ------------------------------- | ------------- | -------- | ------------------------------ | ---------- |
| ~~**ProjectCard.tsx**~~         | ~~718~~ → 228 | 3        | ~~最大のゴッドコンポーネント~~ | ✅ 解消    |
| ~~**SettingsView.tsx**~~        | ~~488~~ → 98  | 3        | ~~複数の設定セクション混在~~   | ✅ 解消    |
| **ProjectProgressCard.tsx**     | 456           | 4        | ダイアログ処理混在             | 📋 未対応  |
| ~~**TimerFocus.tsx**~~          | ~~415~~ → 199 | 5        | ~~複数責務~~                   | ✅ 解消    |
| **ProjectComparisonView.tsx**   | 415           | 3        | 複雑なレイアウト               | 📋 未対応  |
| **ActivityCalendar.tsx**        | 385           | 3        | 複雑な計算ロジック             | 📋 未対応  |
| ~~**ManualTimeEntryForm.tsx**~~ | ~~380~~ → 134 | 7        | ~~最多useState~~               | ✅ 解消    |
| **MonthlySummary.tsx**          | 378           | 3        | レイアウトと計算混在           | 📋 未対応  |
| **Sidebar.tsx**                 | 356           | 0        | レンダリング複雑               | 📋 未対応  |
| **Timer.tsx**                   | 352           | 2        | アニメーション処理複雑         | 📋 未対応  |
| **ProjectsGrid.tsx**            | 343           | 4        | フィルタリング・並び替え混在   | 📋 未対応  |
| **ProjectList.tsx**             | 308           | 5        | リスト管理複雑                 | 📋 未対応  |
| **ProjectProgressView.tsx**     | 300           | 4        | 進捗表示とメニュー混在         | 📋 未対応  |

### 2. 肥大化ユーティリティ

| ファイル             | 行数    | 関数数 | 問題                 | ステータス |
| -------------------- | ------- | ------ | -------------------- | ---------- |
| ~~**analytics.ts**~~ | ~~519~~ | ~~17~~ | ~~複数の関心事混在~~ | ✅ 解消    |

### 3. テストカバレッジ不足

| カテゴリ       | カバレッジ (Lines) | テストファイル | 状態      |
| -------------- | ------------------ | -------------- | --------- |
| フック         | 91.4%              | 7/7            | ✅ 良好   |
| ユーティリティ | 53.38%             | 6/16           | 🔄 改善中 |
| analytics/     | 98.01%             | 1/1            | ✅ 優秀   |
| コンポーネント | 40%前後            | 6/36           | ⚠️ 不足   |

**テスト追加済み（Phase 2）:**

- ✅ `settingsUtils.ts` - 設定管理（+10件）
- ✅ `importUtils.ts` - CSVインポート（+7件）
- ✅ `SettingsContext.tsx` - 設定コンテキスト（+4件）
- ✅ `analytics/heatmap.ts` - ヒートマップ計算（+新規）

**テストなしの重要ファイル（残り）:**

- `safeImportUtils.ts` - インポート失敗時ロールバック（P0）
- `backupUtils.ts` - バックアップ機能（P1）
- `storageUtils.ts` - データ永続化（P1）
- `storage.ts` - localStorage/Electron APIフォールバック（P1）
- `Dashboard.tsx` - ダッシュボードメイン（P1）

---

## リファクタリング計画

### Phase 1: ユーティリティ分割 ✅ 完了

**対象:** `src/utils/analytics.ts` (519行, 17関数)

**実施結果:**

```text
src/utils/
├── analytics/
│   ├── index.ts              # 再エクスポート (35行)
│   ├── common.ts             # 共通ユーティリティ (57行)
│   ├── daily.ts              # 日別計算 (118行)
│   ├── weekly.ts             # 週別計算 (43行)
│   ├── monthly.ts            # 月別計算 (169行)
│   ├── predictions.ts        # 予測計算 (84行)
│   └── aggregations.ts       # 集計処理 (92行)
├── analytics.ts              # 後方互換のための再エクスポート（33行）
```

**達成効果:**

- 単一ファイル519行 → 各ファイル35-169行に分割
- 後方互換性を維持（既存インポートパスが動作）
- 既存テスト175件全パス

---

### Phase 2: ProjectCard コンポーネント分解 ✅ 完了

**対象:** `src/components/ui/project/ProjectCard.tsx` (718行)

**実施結果:**

```text
src/components/ui/project/
├── ProjectCard.tsx           # メインコンポーネント（228行）
├── ProjectProgressSection.tsx # 進捗表示部分（269行）
├── ProjectCardActions.tsx    # 操作ボタン・メニュー（221行）
├── hooks/
│   └── useProjectCardState.ts # 状態管理ロジック（142行）
└── __tests__/
    └── ProjectCard.test.tsx  # 新規テスト（14件追加）
```

**達成効果:**

- ProjectCard.tsx: 718行 → 228行 (-68%)
- テスト14件追加
- 単一責任原則を適用

---

### Phase 3: 設定画面のモジュール化 ✅ 完了

**対象:** `src/components/settings/SettingsView.tsx` (488行)

**実施結果:**

```text
src/components/settings/
├── SettingsView.tsx          # メイン（98行）
├── WorkHoursSettings.tsx     # 月間基準時間設定（137行）
├── AppearanceSettings.tsx    # テーマ・言語設定（117行）
├── TestModeSettings.tsx      # テストモード（109行）
└── hooks/
    └── useSettingsState.ts   # 設定状態管理（139行）
```

**達成効果:**

- SettingsView.tsx: 488行 → 98行 (-80%)
- 各設定セクションが独立したコンポーネントに
- 状態管理ロジックをフックに抽出

---

### Phase 4: TimerFocus コンポーネント分解 ✅ 完了

**対象:** `src/components/ui/timer/TimerFocus.tsx` (415行)

**実施結果:**

```text
src/components/ui/timer/
├── TimerFocus.tsx            # メイン（199行）
├── TimerDisplay.tsx          # タイマー表示（58行）
├── TimerControls.tsx         # 開始/停止ボタン（107行）
├── NoteEditor.tsx            # ノート編集部分（71行）
└── hooks/
    └── useElapsedTime.ts     # 経過時間計算（90行）
```

**達成効果:**

- TimerFocus.tsx: 415行 → 199行 (-52%)
- 経過時間計算ロジックをフックに抽出
- 8時間自動停止ロジックを分離

---

### Phase 5: ManualTimeEntryForm 状態管理改善 ✅ 完了

**対象:** `src/components/timer/ManualTimeEntryForm.tsx` (380行)

**実施結果:**

```text
src/components/timer/
├── ManualTimeEntryForm.tsx   # メイン（134行）
├── DateTimeFields.tsx        # 日付・時刻入力（175行）
└── hooks/
    └── useTimeEntryForm.ts   # フォーム状態管理（236行）
```

**達成効果:**

- ManualTimeEntryForm.tsx: 380行 → 134行 (-65%)
- 7つのuseStateを1つのフックに統合
- バリデーションロジックを分離

---

### Phase 6: テストカバレッジ向上 🚧 実施中

**現在のカバレッジ:** 44.3% (Lines) → 目標: 60%+

**優先度別テスト追加計画:**

#### P0: データ層（即座に必要）

| ファイル               | テスト内容                              | ステータス      |
| ---------------------- | --------------------------------------- | --------------- |
| ~~`settingsUtils.ts`~~ | ~~設定保存・復元~~                      | ✅ 完了 (+10件) |
| ~~`importUtils.ts`~~   | ~~CSVパース、プロジェクト自動作成~~     | ✅ 完了 (+7件)  |
| `safeImportUtils.ts`   | インポート失敗時ロールバック            | 📋 次期対象     |
| `storageUtils.ts`      | JSONファイル読み書き、バックアップ生成  | 📋 計画中       |
| `storage.ts`           | localStorage/Electron APIフォールバック | 📋 計画中       |

#### P0.5: コンテキスト層

| ファイル                  | テスト内容               | ステータス     |
| ------------------------- | ------------------------ | -------------- |
| ~~`SettingsContext.tsx`~~ | ~~設定の読み込み・保存~~ | ✅ 完了 (+4件) |
| `LanguageContext.tsx`     | 言語切り替え、永続化     | 📋 計画中      |

#### P0.5: Analytics層

| ファイル                   | テスト内容                 | ステータス |
| -------------------------- | -------------------------- | ---------- |
| ~~`analytics/heatmap.ts`~~ | ~~ヒートマップデータ計算~~ | ✅ 完了    |

#### P1: ビジネスロジック層

| ファイル                    | テスト内容               | ステータス |
| --------------------------- | ------------------------ | ---------- |
| `Dashboard.tsx`             | サマリー表示、データ集計 | 📋 計画中  |
| `backupUtils.ts`            | バックアップ生成・復元   | 📋 計画中  |
| `ProjectComparisonView.tsx` | 比較ロジック             | 📋 計画中  |

#### P2: UIコンポーネント層

| ファイル               | テスト内容         | ステータス |
| ---------------------- | ------------------ | ---------- |
| `ActivityCalendar.tsx` | ヒートマップ表示   | 📋 計画中  |
| `TimeEntryList.tsx`    | エントリー一覧表示 | 📋 計画中  |
| `MonthlySummary.tsx`   | 月次サマリー表示   | 📋 計画中  |

---

### Phase 7: 重複コードの統合 📋 計画中

#### 7.1 インポートユーティリティの統合

**対象:**

- `importUtils.ts` (100行)
- `safeImportUtils.ts` (56行)

**計画:**

- 2ファイルを `importUtils.ts` に統合
- セーフインポート機能を標準化

#### 7.2 タイマー関連コンポーネントの共通化

**対象:**

- `GlobalTimer.tsx`
- `TimerFocus.tsx`
- `Timer.tsx`

**計画:**

- 共通のタイマー表示ロジックを `useTimerDisplay` フックに抽出
- 表示コンポーネントを共通化

---

## 実装順序と依存関係

```text
Phase 1: analytics.ts 分割         ✅ 完了
    ↓
Phase 2: ProjectCard 分解          ✅ 完了
    ↓
Phase 3: SettingsView モジュール化  ✅ 完了
    ↓
Phase 4: TimerFocus 分解           ✅ 完了
    ↓
Phase 5: ManualTimeEntryForm       ✅ 完了
    ↓
Phase 6: テストカバレッジ向上       🚧 実施中（44.3% → 60%目標）
    ↓
Phase 7: 重複コード統合            📋 計画中
```

---

## TDDプロセスの遵守

各Phaseは以下のサイクルで実施：

1. **既存テストの確認** - すべてのテストがパスすることを確認 ✓
2. **新規テストの作成** - リファクタリング対象の期待動作をテスト化 ✓
3. **リファクタリング実施** - 小さなステップで変更 ✓
4. **テスト実行** - 各変更後にテスト実行 ✓
5. **コミット** - Green状態でコミット ✓

---

## 達成された効果

### 定量的効果

| メトリクス                     | リファクタリング前 | 現在              | 目標               | 達成状況  |
| ------------------------------ | ------------------ | ----------------- | ------------------ | --------- |
| 300行超コンポーネント数        | 13                 | 9                 | 3以下              | 🔄 進行中 |
| 最大コンポーネント行数         | 718行              | 456行             | 250行以下          | 🔄 進行中 |
| analytics.ts 行数              | 519行              | 35-169行/ファイル | 100行以下/ファイル | ✅ 達成   |
| テストカバレッジ（全体Lines）  | 約30%              | 44.3%             | 60%以上            | 🔄 進行中 |
| テストカバレッジ（hooks）      | 約70%              | 91.4%             | 90%以上            | ✅ 達成   |
| テストカバレッジ（analytics/） | 約50%              | 98.01%            | 90%以上            | ✅ 達成   |
| セキュリティ脆弱性             | 10件               | 3件               | 0件                | 🔄 進行中 |
| any型使用数                    | 3件                | 0件               | 0件                | ✅ 達成   |
| テスト総数                     | 175件              | **232件**         | 300件+             | 🔄 増加中 |
| テストスイート数               | 15                 | **20**            | 25+                | 🔄 増加中 |

### 定性的効果

1. **保守性向上** - 単一責任原則の適用 ✅
2. **テスト容易性** - 小さなユニットでのテスト ✅
3. **再利用性** - 共通コンポーネント・フックの活用 ✅
4. **可読性** - 各ファイルの責務が明確 ✅
5. **開発効率** - 変更影響範囲の限定 ✅

---

## 作成されたファイル一覧

### Phase 1: analytics分割

- `src/utils/analytics/common.ts`
- `src/utils/analytics/daily.ts`
- `src/utils/analytics/weekly.ts`
- `src/utils/analytics/monthly.ts`
- `src/utils/analytics/predictions.ts`
- `src/utils/analytics/aggregations.ts`
- `src/utils/analytics/index.ts`

### Phase 2: ProjectCard分解

- `src/components/ui/project/ProjectProgressSection.tsx`
- `src/components/ui/project/ProjectCardActions.tsx`
- `src/components/ui/project/hooks/useProjectCardState.ts`
- `src/components/ui/project/__tests__/ProjectCard.test.tsx`

### Phase 3: SettingsView分解

- `src/components/settings/WorkHoursSettings.tsx`
- `src/components/settings/AppearanceSettings.tsx`
- `src/components/settings/TestModeSettings.tsx`
- `src/components/settings/hooks/useSettingsState.ts`

### Phase 4: TimerFocus分解

- `src/components/ui/timer/TimerDisplay.tsx`
- `src/components/ui/timer/TimerControls.tsx`
- `src/components/ui/timer/NoteEditor.tsx`
- `src/components/ui/timer/hooks/useElapsedTime.ts`

### Phase 5: ManualTimeEntryForm分解

- `src/components/timer/DateTimeFields.tsx`
- `src/components/timer/hooks/useTimeEntryForm.ts`

### next-phase Phase 0-2: セキュリティ・品質改善

- `src/constants/dateConstants.ts` - 日付関連定数
- `src/constants/index.ts` - アプリ定数の一元管理
- `src/contexts/__tests__/SettingsContext.test.tsx` - Contextテスト
- `src/utils/__tests__/settingsUtils.test.ts` - 設定ユーティリティテスト
- `src/utils/__tests__/importUtils.test.ts` - インポートユーティリティテスト
- `src/styles/modernTheme.ts` - any型をTheme型に修正

---

## 注意事項

### 後方互換性

- `analytics.ts` は再エクスポートファイルとして維持 ✅
- 既存のインポートパスを破壊しない ✅
- 段階的な移行をサポート ✅

### リスク管理

- 各Phaseは独立してロールバック可能 ✅
- 大きな変更は機能ブランチで実施 ✅
- CI/CDでのテスト自動実行を確認 ✅

---

## 関連ドキュメント

- `refactoring-plan.md` - App.tsx リファクタリング計画（完了）
- `app-component-decomposition.md` - App.tsx 詳細分析（完了）
- `test-refactoring-plan.md` - テストコードリファクタリング計画
- `next-phase-plan.md` - 次期リファクタリング計画（技術的負債対応）
- `../tech-debt-report-2025-12-14.md` - 技術的負債分析レポート
