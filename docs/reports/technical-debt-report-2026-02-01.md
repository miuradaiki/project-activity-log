# 技術的負債分析レポート

**プロジェクト**: Project Activity Log
**分析日**: 2026年2月1日
**対象ソースコード**: 約14,530行（TypeScript/TSX） - 109ファイル
**前回レポート**: 2026年1月2日

---

## エグゼクティブサマリー

### 負債改善の進捗状況

| 項目                           | 2026年1月2日 | 2026年2月1日 | 変化           |
| ------------------------------ | ------------ | ------------ | -------------- |
| テストカバレッジ（Lines）      | 44.27%       | 65.30%       | **+21.03%** ✅ |
| テスト数                       | -            | 469          | -              |
| 300行超ファイル数              | 11           | 10           | -1 ✅          |
| セキュリティ脆弱性             | 3 (中)       | 9 (4中/5高)  | +6 ⚠️          |
| メジャーバージョン遅れ依存関係 | 7            | 22           | +15 ⚠️         |

### 主要リスク

1. **セキュリティ**: Electron、esbuild、lodash、tarに脆弱性（9件）
2. ~~**依存関係の陳腐化**: MUI 7、React 19、Electron 40等のメジャーアップデート未対応~~ **[RESOLVED]** Phase 6で React 19、MUI 7、Electron 40 移行完了
3. **テストカバレッジ**: 目標80%に対し65%（-15%ギャップ）

---

## 1. 負債インベントリ

### 1.1 コード負債

#### 1.1.1 大規模ファイル（>300行）

| ファイル                                              | 行数 | 複雑度 | 状態           |
| ----------------------------------------------------- | ---- | ------ | -------------- |
| `src/styles/modernTheme.ts`                           | 699  | 中     | 未対応         |
| `src/utils/__tests__/analytics.test.ts`               | 649  | 低     | テストファイル |
| `src/components/heatmap/ActivityCalendar.tsx`         | 406  | 中     | 未対応         |
| `src/components/ui/modern/StyledComponents.tsx`       | 376  | 低     | 許容範囲       |
| `src/components/dashboard/MonthlyProgressSummary.tsx` | 369  | 高     | 未対応         |
| `src/components/ui/layout/Sidebar.tsx`                | 356  | 高     | 未対応         |
| `src/components/ui/project/ProjectsGrid.tsx`          | 343  | 高     | 未対応         |
| `src/components/dashboard/ActivityHeatmap.tsx`        | 329  | 中     | 未対応         |
| `src/components/dashboard/MonthlySummary.tsx`         | 325  | 高     | 未対応         |
| `src/components/ProjectList.tsx`                      | 308  | 高     | 未対応         |

**Phase 2で改善済み**:

- `ProjectProgressCard.tsx`: 456行 → 174行（61%削減）
- `Timer.tsx`: 352行 → 143行（59%削減）

#### 1.1.2 コード重複パターン

**時間フォーマット処理（19ファイル）** - ユーティリティ作成済み、適用待ち

```typescript
// 重複パターン
Number(weeklyHours.toFixed(1));
hours.toFixed(1);
```

**対象ファイル**:

- `src/utils/analytics/monthly.ts`
- `src/components/dashboard/MonthlyProgressSummary.tsx`
- `src/components/dashboard/ActivityHeatmap.tsx`
- `src/components/ui/project/ProjectProgressSection.tsx`
- その他15ファイル

**テーマモード分岐（14ファイル）** - ヘルパー作成済み、適用待ち

```typescript
theme.palette.mode === 'dark' ? darkValue : lightValue;
```

#### 1.1.3 ストレージキーの分散

```typescript
// 異なるファイルに分散している定数
ACTIVE_PAGE_STORAGE_KEY; // App.tsx
LANGUAGE_STORAGE_KEY; // LanguageContext.tsx
TEST_SETTINGS_KEY; // SettingsContext.tsx
TIMER_STATE_STORAGE_KEY; // useTimerController.ts
TIMER_STORAGE_KEY; // useTimer.ts
```

**問題**: 定数の一元管理がされていない

#### 1.1.4 廃止予定コードの残存

| ファイル                    | 状態                   | 問題                                           |
| --------------------------- | ---------------------- | ---------------------------------------------- |
| `src/utils/analytics.ts`    | @deprecated            | 後方互換性のため残存、二重インポートパスの原因 |
| `src/styles/theme.ts`       | 未使用（0%カバレッジ） | modernTheme.ts使用へ移行済み                   |
| `src/utils/storage.ts`      | 0%カバレッジ           | storageService.ts と重複                       |
| `src/utils/storageUtils.ts` | 0%カバレッジ           | storageService.ts と重複                       |

### 1.2 アーキテクチャ負債

#### 1.2.1 localStorage直接アクセス

**31箇所**でlocalStorage直接アクセスが発生:

| ファイル                | アクセス内容     |
| ----------------------- | ---------------- |
| `App.tsx`               | ページ状態       |
| `LanguageContext.tsx`   | 言語設定         |
| `SettingsContext.tsx`   | テストモード設定 |
| `useTimer.ts`           | タイマー状態     |
| `useTimerController.ts` | タイマー復元     |

**問題**: サービス層抽象化の欠如、テスト困難

#### 1.2.2 Electron IPC直接アクセス

**6ファイル以上**でwindow.electronAPI直接呼び出し:

```typescript
// 抽象化なしの直接呼び出し
await window.electronAPI.saveProjects(projects);
```

**問題**: モック困難、null安全性の不統一

#### 1.2.3 高結合コンポーネント

**App.tsx（279行）**:

- サイドバー状態管理
- アクティブページ管理
- モーダル制御
- タイマー制御
- ストレージ操作
- キーボードショートカット

**PageRouter.tsx（128行）**:

- 12個のpropsを子コンポーネントに分配
- メモ化なし

### 1.3 テスト負債

#### 1.3.1 テストカバレッジ

| メトリクス | 現在値 | 目標値 | ギャップ |
| ---------- | ------ | ------ | -------- |
| Statements | 65.59% | 80%    | -14.41%  |
| Branches   | 53.46% | 70%    | -16.54%  |
| Functions  | 61.65% | 80%    | -18.35%  |
| Lines      | 65.30% | 80%    | -14.70%  |

#### 1.3.2 カバレッジ0%のファイル

| ファイル                         | 行数 | 重要度 | 理由                        |
| -------------------------------- | ---- | ------ | --------------------------- |
| `src/styles/theme.ts`            | 178  | 低     | 廃止予定（modernTheme使用） |
| `src/utils/testDataGenerator.ts` | 168  | 低     | 開発用ユーティリティ        |
| `src/utils/storage.ts`           | 28   | 中     | 重複実装（要整理）          |
| `src/utils/storageUtils.ts`      | 27   | 中     | 重複実装（要整理）          |
| `src/utils/env.ts`               | 13   | 低     | 環境変数定義                |
| `src/utils/env.dev.ts`           | 7    | 低     | 開発環境定義                |

**改善済み**（前回0%→現在100%）:

- `src/utils/backupUtils.ts`
- `src/utils/safeImportUtils.ts`

#### 1.3.3 テストされていない主要コンポーネント

Phase 3で多くのダッシュボードコンポーネントにテスト追加済み:

- Dashboard.tsx (86.95%)
- MonthlySummary.tsx (82%)
- WeeklySummary.tsx (84.21%)
- ActivityHeatmap.tsx (98.14%)

**残存課題**:

- Settings.tsx（設定画面）のカバレッジ確認が必要
- GlobalTimer.tsx（グローバルタイマー）の統合テスト

### 1.4 依存関係の健全性

#### 1.4.1 セキュリティ脆弱性（9件）

| パッケージ | 深刻度 | 説明                                               | 修正バージョン |
| ---------- | ------ | -------------------------------------------------- | -------------- |
| `electron` | 中     | ASAR Integrity Bypass                              | 35.7.5+        |
| `esbuild`  | 中     | 開発サーバーのCORS問題                             | 0.24.3+        |
| `lodash`   | 中     | Prototype Pollution (_.unset, _.omit)              | -              |
| `tar`      | 高×3   | Path Traversal、Race Condition、Hardlink Traversal | 7.6.0+         |

**注意**: tar脆弱性はelectron-builder経由の依存

#### 1.4.2 メジャーバージョン遅れ（重要なもの）

| パッケージ      | 現在              | 最新   | 差      | 影響                         |
| --------------- | ----------------- | ------ | ------- | ---------------------------- |
| `electron`      | 29.4.6            | 40.1.0 | 11      | セキュリティ、パフォーマンス |
| `@mui/material` | ~~5.18.0~~ 7.3.7  | 7.3.7  | ~~2~~ 0 | **[DONE]** P6-2で移行済み    |
| `react`         | ~~18.3.1~~ 19.2.4 | 19.2.4 | ~~1~~ 0 | **[DONE]** P6-1で移行済み    |
| `recharts`      | 2.15.4            | 3.7.0  | 1       | API変更の可能性              |
| `vite`          | 5.4.21            | 6.4.1  | 1       | ビルドパフォーマンス         |
| `uuid`          | 9.0.1             | 13.0.0 | 4       | マイナー                     |

### 1.5 アクセシビリティ負債

#### 1.5.1 aria-labelの不足

- **IconButton/Tooltip使用箇所**: 約258件
- **aria-label設定箇所**: 約17件
- **カバー率**: 6.6%

多くのインタラクティブ要素でスクリーンリーダー対応が不十分。

---

## 2. 影響分析

### 2.1 開発速度への影響

| 負債項目                          | 影響度 | 影響内容                                 |
| --------------------------------- | ------ | ---------------------------------------- |
| 大規模コンポーネント（6ファイル） | 高     | 変更時の理解・テストに追加工数           |
| テーマモード分岐の重複            | 中     | UI変更時に複数ファイル修正               |
| ストレージ実装の重複（3ファイル） | 中     | 新機能追加時の混乱                       |
| テストカバレッジ不足（-15%）      | 高     | リファクタリング時のリグレッションリスク |

### 2.2 品質への影響

| 負債項目                  | 影響度 | 影響内容                   |
| ------------------------- | ------ | -------------------------- |
| セキュリティ脆弱性（9件） | 高     | 潜在的なセキュリティリスク |
| localStorage直接アクセス  | 中     | テスト困難、バグ検出遅延   |
| 廃止コードの残存          | 低     | 新規開発者の混乱           |

### 2.3 リスク評価

| リスク                          | 深刻度 | 発生確率 | 対応優先度 |
| ------------------------------- | ------ | -------- | ---------- |
| tar脆弱性による攻撃（ビルド時） | 高     | 低       | **高**     |
| Electron脆弱性による攻撃        | 高     | 低       | **高**     |
| lodash Prototype Pollution      | 中     | 低       | 中         |
| UI変更時のリグレッション        | 中     | 高       | 中         |
| a11y問題による利用障壁          | 中     | 中       | 中         |

---

## 3. 優先順位付きロードマップ

### 3.1 クイックウィン（即時実行可能）

#### QW-1: セキュリティ脆弱性の修正

```bash
# 自動修正可能なもの
npm audit fix

# 手動対応が必要なもの
npm update lodash
```

**期待効果**: 4件の脆弱性解消（lodash、自動修正可能な依存）

#### QW-2: 廃止予定コードの削除

| 対象ファイル                | アクション                                     |
| --------------------------- | ---------------------------------------------- |
| `src/utils/analytics.ts`    | 削除（インポートを`analytics/index.ts`へ変更） |
| `src/styles/theme.ts`       | 削除（modernTheme使用を確認後）                |
| `src/utils/storage.ts`      | storageService.tsに統合後削除                  |
| `src/utils/storageUtils.ts` | storageService.tsに統合後削除                  |

**期待効果**: 約250行の廃止コード削減、インポートパスの一元化

#### QW-3: ストレージキーの一元化

```typescript
// src/constants/storageKeys.ts（新規）
export const STORAGE_KEYS = {
  ACTIVE_PAGE: 'activePage',
  LANGUAGE: 'language',
  TEST_SETTINGS: 'testSettings',
  TIMER_STATE: 'timerState',
  TIMER: 'timer',
} as const;
```

**期待効果**: 定数管理の一元化、typoによるバグ防止

#### QW-4: 時間フォーマット・テーマヘルパーの適用

Phase 1で作成済みのユーティリティを全19ファイル・14ファイルに適用。

**対象**:

- `src/utils/formatters/timeFormatters.ts` → 19ファイル
- `src/utils/theme/themeHelpers.ts` → 14ファイル

**期待効果**: 重複コード削減、保守性向上

### 3.2 中期的改善（Phase 5継続）

#### M-1: 大規模コンポーネントのリファクタリング

| コンポーネント         | 現在行数 | 目標行数 | 分割案                                      |
| ---------------------- | -------- | -------- | ------------------------------------------- |
| MonthlyProgressSummary | 369      | <150     | ProgressCard, TrendChart, SummaryStats      |
| Sidebar                | 356      | <150     | NavigationList, SidebarHeader, ThemeToggle  |
| ProjectsGrid           | 343      | <150     | GridFilters, GridItem, GridLayout           |
| MonthlySummary         | 325      | <150     | ChartSection, DistributionSection           |
| ActivityCalendar       | 406      | <150     | CalendarGrid, CalendarHeader, HeatmapLegend |

#### M-2: テストカバレッジ80%達成

**追加テスト必要ファイル**:

| ファイル                | 現在カバレッジ | 目標 |
| ----------------------- | -------------- | ---- |
| `Settings.tsx`          | 確認必要       | 80%  |
| `GlobalTimer.tsx`       | 確認必要       | 80%  |
| `useTimerController.ts` | 97.14%         | 維持 |
| `modernTheme.ts`        | 87.5%          | 90%  |

#### M-3: アクセシビリティ改善（Phase 5）

1. 全IconButtonにaria-label追加
2. フォーム要素のラベル関連付け
3. キーボードナビゲーション改善
4. Lighthouseスコア90以上達成

### 3.3 長期的改善（Phase 6）

#### L-1: React 19移行 [DONE]

**完了日**: 2026/02/08

- React 18.3.1 → 19.2.4、@types/react 18 → 19
- types-react-codemod preset-19 適用（15ファイル）
- 469テスト全パス、ビルド成功

**振り返り: codemod の盲目的適用に関する反省**

`types-react-codemod preset-19` の `react-element-default-any-props` 変換により、
テストファイル15箇所で `React.ReactElement` → `React.ReactElement<any>` に変換された。
React 19 では `ReactElement` のデフォルト型引数が `any` → `unknown` に変更されたが、
codemod は互換性維持のため暗黙の `any` を明示化しただけであり、型安全性が後退する変更だった。

実際にはこれらの関数は `ui` の props にアクセスせず子要素として渡すだけであるため、
`React.ReactElement`（`unknown` デフォルト）のままで問題なく動作する。
`<any>` を除去した結果、TypeScript・テスト・ビルド全て通過し、
lint 警告も 45 → 30 件（ベースライン値）に回復した。

**教訓**:

- codemod の出力は「スタート地点」であり「完成品」ではない。変更後に「この変更を外しても通るか？」を検証すべき
- lint 警告の増加は合理化せず、原因に対処するか明確な判断根拠を持つべき
- 「テスト・ビルドが通る」は必要条件であり十分条件ではない。型安全性の後退のような質の問題は別途評価が必要

#### L-2: MUI 7移行 [DONE]

**完了日**: 2026/02/08

- @mui/material 5.18.0 → 7.3.7、@mui/icons-material 5.18.0 → 7.3.7
- Grid v1 → v2 移行（9ファイル: codemod + 手動確認）
- 469テスト全パス、ビルド成功

#### L-3: Electron 40移行 [DONE]

**完了日**: 2026/02/01（PR #28）

- Electron 29 → 40 アップグレード

---

## 4. 実装ガイド

### 4.1 廃止コード削除手順

```bash
# 1. 影響範囲確認
grep -r "from.*analytics'" src/ --include="*.ts" --include="*.tsx"

# 2. インポート置換（analytics.tsの場合）
# 変更前: import { ... } from '../utils/analytics';
# 変更後: import { ... } from '../utils/analytics/index';

# 3. テスト実行
npm test

# 4. ファイル削除
rm src/utils/analytics.ts

# 5. 再テスト
npm test && npm run lint
```

### 4.2 ストレージ実装統合手順

```typescript
// Step 1: storageService.tsに機能を集約
// src/services/storageService.ts
export const storageService = {
  // localStorage操作
  get: <T>(key: string, defaultValue: T): T => { ... },
  set: <T>(key: string, value: T): void => { ... },
  remove: (key: string): void => { ... },

  // Electron IPC操作
  loadProjects: async (): Promise<Project[]> => { ... },
  saveProjects: async (projects: Project[]): Promise<void> => { ... },
  ...
};

// Step 2: 各ファイルでstorageServiceを使用
// Step 3: storage.ts, storageUtils.tsを削除
```

### 4.3 セキュリティ更新手順

```bash
# 1. 現状確認
npm audit

# 2. 自動修正
npm audit fix

# 3. 残存脆弱性確認
npm audit

# 4. 破壊的変更を伴う更新（必要な場合）
npm update electron --save
npm update electron-builder --save

# 5. テスト・ビルド確認
npm test && npm run build && npm run electron:dev
```

---

## 5. 予防戦略

### 5.1 品質ゲート

```yaml
# CI/CDパイプライン品質チェック
quality_checks:
  lint: 'npm run lint'
  test_coverage:
    statements: 65% # 現在値
    branches: 53% # 現在値
    fail_on_decrease: true
  security_audit:
    allow: 'low'
    block: 'moderate+'
  bundle_size:
    max_increase: '5%'
```

### 5.2 コードレビューチェックリスト

- [ ] 新規コードにテストが含まれている
- [ ] aria-labelが適切に設定されている
- [ ] i18n関数（t()）を使用している
- [ ] テーマカラーをハードコードしていない
- [ ] コンポーネントが200行以下
- [ ] localStorage直接アクセスを避けている
- [ ] 共通ユーティリティを使用している

### 5.3 依存関係更新ポリシー

| 更新タイプ         | 頻度   | 承認レベル   |
| ------------------ | ------ | ------------ |
| パッチバージョン   | 週次   | 自動         |
| マイナーバージョン | 月次   | レビュー必要 |
| メジャーバージョン | 四半期 | 計画的移行   |
| セキュリティ修正   | 即時   | 優先対応     |

---

## 6. 成功メトリクス

### 6.1 月次トラッキング

| メトリクス                      | 2026/01 | 2026/02 | 目標 |
| ------------------------------- | ------- | ------- | ---- |
| テストカバレッジ（Lines）       | 44%     | 65%     | 80%  |
| セキュリティ脆弱性（高/致命的） | 0       | 5       | 0    |
| セキュリティ脆弱性（中）        | 3       | 4       | 0    |
| 300行超ファイル数               | 11      | 10      | 4    |
| ESLint警告                      | -       | 0       | 0    |
| テスト数                        | -       | 469     | 500+ |

### 6.2 四半期レビュー項目

1. 負債スコアの推移
2. 開発者満足度（主観評価）
3. バグ発生頻度
4. コードレビュー時間
5. 新機能開発速度

---

## 付録

### A. 完了済みフェーズ

| フェーズ | 完了日     | 主な成果                                                                 |
| -------- | ---------- | ------------------------------------------------------------------------ |
| Phase 0  | 2026/01/03 | セキュリティ修正、未使用インポート削除                                   |
| Phase 1  | 2026/01/03 | 時間フォーマット・テーマヘルパー作成                                     |
| Phase 2  | 2026/01/XX | ProjectProgressCard分割（61%削減）、Timer分割（59%削減）、useStorage分割 |
| Phase 3  | 2026/01/XX | テストカバレッジ44%→65%、469テスト                                       |
| Phase 4  | 2026/01/31 | ハードコード抽出、26未使用キー削除、ネームスペース整理                   |
| Phase 6  | 2026/02/08 | React 19移行、MUI 7移行（Electron 40は2026/02/01完了済み）               |

### B. 次アクション優先順位

1. **即時**: セキュリティ脆弱性対応（npm audit fix）
2. **今週**: 廃止コード削除、ストレージキー一元化
3. **今月**: Phase 5（アクセシビリティ改善）開始
4. **今四半期**: テストカバレッジ80%達成、依存関係更新計画策定

### C. 関連ドキュメント

- [段階的リファクタリング計画 2026](../refactoring/phased-refactoring-plan-2026.md)
- [デザインガイドライン](../design-guidelines.md)
- [CLAUDE.md](../../CLAUDE.md)
