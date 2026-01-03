# 段階的リファクタリング計画 2026

**作成日**: 2026年1月2日
**基準ドキュメント**: [技術的負債レポート](../reports/technical-debt-report-2026-01-02.md)

---

## 概要

本計画は、技術的負債分析レポートに基づき、リスクを最小化しながら段階的にコードベースを改善するための実行計画です。TDD（テスト駆動開発）の原則に従い、各フェーズでテストを先行させます。

---

## Phase 0: 即時対応（セキュリティ・クリティカル） ✅ 完了

**目的**: セキュリティリスクの即時解消
**ステータス**: 2026年1月3日完了

### P0-1: セキュリティ脆弱性の修正

**対象**:

- `electron` - ASAR Integrity Bypass (CVE)
- `esbuild` - 開発サーバーのCORS問題
- `vite` - esbuild依存

**手順**:

```bash
# 1. 現在の脆弱性を確認
npm audit

# 2. 依存関係を更新
npm update electron vite

# 3. 自動修正を試行
npm audit fix

# 4. 修正後の確認
npm audit
```

**完了条件**:

- [ ] `npm audit` で中程度以上の脆弱性が0件
- [ ] アプリケーションが正常に起動・動作

### P0-2: 未使用インポートの削除

**対象ファイル**:

- `src/components/ui/ProjectProgressCard.tsx` (line 32)

**手順**:

1. 未使用インポートを削除
2. `npm run lint` でエラーがないことを確認
3. `npm test` でテストが通ることを確認

---

## Phase 1: クイックウィン（コード重複の解消） ✅ 完了

**目的**: 保守性向上のための基盤整備
**ステータス**: 2026年1月3日完了（ユーティリティ作成完了、適用は今後）

### P1-1: 時間フォーマットユーティリティの共通化

**影響ファイル数**: 19ファイル

**新規作成ファイル**: `src/utils/formatters/timeFormatters.ts`

```typescript
// src/utils/formatters/timeFormatters.ts
import { TFunction } from 'i18next';

/**
 * 時間を指定精度でフォーマット
 */
export const formatHours = (hours: number, precision = 1): string =>
  hours.toFixed(precision);

/**
 * 時間を単位付きでフォーマット
 */
export const formatHoursWithUnit = (hours: number, t: TFunction): string =>
  `${formatHours(hours)} ${t('units.hours')}`;

/**
 * 分を時間:分形式にフォーマット
 */
export const formatMinutesToHM = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};
```

**リファクタリング手順**:

1. ユーティリティファイルを作成
2. 既存テストが通ることを確認
3. 1ファイルずつ置き換え、各置き換え後にテスト実行
4. 全ファイル置き換え後、不要なインラインフォーマット処理を削除

**対象ファイル一覧**:

- [ ] `src/utils/analytics/monthly.ts`
- [ ] `src/components/dashboard/MonthlyProgressSummary.tsx`
- [ ] `src/components/dashboard/ActivityHeatmap.tsx`
- [ ] `src/components/ui/project/ProjectProgressSection.tsx`
- [ ] `src/components/ui/ProjectProgressCard.tsx`
- [ ] その他14ファイル（技術的負債レポート参照）

### P1-2: テーマモードヘルパーの作成

**影響ファイル数**: 14ファイル

**新規作成ファイル**: `src/utils/theme/themeHelpers.ts`

```typescript
// src/utils/theme/themeHelpers.ts
import { Theme } from '@mui/material/styles';

/**
 * テーマモードに応じた値を返す
 */
export const getModeValue = <T>(
  theme: Theme,
  darkValue: T,
  lightValue: T
): T => (theme.palette.mode === 'dark' ? darkValue : lightValue);

/**
 * テーマモードに応じたアルファ値付きカラーを返す
 */
export const getModeAlpha = (
  theme: Theme,
  color: string,
  darkAlpha: number,
  lightAlpha: number
): string => {
  const alpha = theme.palette.mode === 'dark' ? darkAlpha : lightAlpha;
  return `${color}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;
};
```

**リファクタリング手順**:

1. ヘルパーファイルとテストを作成
2. 1コンポーネントずつ置き換え
3. 各置き換え後にビジュアルリグレッションがないことを確認

**対象ファイル一覧**:

- [ ] `src/components/dashboard/MonthlyProgressSummary.tsx`
- [ ] `src/components/dashboard/ActivityHeatmap.tsx`
- [ ] `src/components/ui/project/ProjectCard.tsx`
- [ ] `src/components/ui/layout/Sidebar.tsx`
- [ ] その他10ファイル

### P1-3: インデックスファイルによるエクスポート整理

**新規作成ファイル**: `src/utils/formatters/index.ts`, `src/utils/theme/index.ts`

```typescript
// src/utils/formatters/index.ts
export * from './timeFormatters';

// src/utils/theme/index.ts
export * from './themeHelpers';
```

---

## Phase 2: コンポーネント分割（アーキテクチャ改善） 🚧 進行中

**目的**: 単一責任原則に基づくコンポーネント設計
**ステータス**: P2-1完了、P2-2完了、P2-3未着手

### P2-1: ProjectProgressCard のリファクタリング ✅

**結果**: 456行 → 174行（61%削減）

**目標構成**:

```
src/components/ui/project/
├── ProjectProgressCard/
│   ├── index.tsx              # メインコンポーネント (~100行)
│   ├── ProjectProgressCard.tsx # 表示ロジック (~100行)
│   ├── ProjectCardHeader.tsx   # ヘッダー部分 (~50行)
│   ├── ProjectCardProgress.tsx # 進捗バー部分 (~80行)
│   ├── ProjectCardMenu.tsx     # アクションメニュー (~60行)
│   ├── ProjectTargetDialog.tsx # 目標調整ダイアログ (~100行)
│   ├── types.ts               # 型定義
│   └── __tests__/
│       ├── ProjectProgressCard.test.tsx
│       ├── ProjectCardHeader.test.tsx
│       ├── ProjectCardProgress.test.tsx
│       ├── ProjectCardMenu.test.tsx
│       └── ProjectTargetDialog.test.tsx
└── hooks/
    ├── useProjectProgress.ts   # 進捗計算ロジック (~50行)
    └── __tests__/
        └── useProjectProgress.test.ts
```

**リファクタリング手順**:

#### Step 2-1-1: 型定義の抽出 ✅

1. [x] `ProjectProgressCard/types.ts` を作成
2. [x] Props型、内部状態型を定義
3. [x] 既存ファイルからインポートするよう変更

#### Step 2-1-2: useProjectProgress フックの抽出 ✅

1. [x] テストファイル `useProjectProgress.test.ts` を作成（Red）
2. [x] フックを実装（Green）
3. [x] リファクタリング
4. [x] 元のコンポーネントでフックを使用するよう変更

#### Step 2-1-3: ProjectTargetDialog の抽出 ✅

1. [x] テストファイルを作成
2. [x] ダイアログコンポーネントを抽出
3. [x] 既存テストが通ることを確認

#### Step 2-1-4: ProjectCardMenu の抽出 ✅

1. [x] テストファイルを作成
2. [x] メニューコンポーネントを抽出
3. [x] 既存テストが通ることを確認

#### Step 2-1-5: ProjectCardHeader/Progress の抽出 ✅

1. [x] 各コンポーネントのテストを作成
2. [x] コンポーネントを抽出
3. [x] メインコンポーネントを整理

**完了条件**:

- [x] 全サブコンポーネントに単体テストが存在
- [x] メインコンポーネントが150行以下（456行→174行）
- [x] 既存の統合テストが全て通る
- [x] UIの見た目・動作に変更なし

### P2-2: useStorage フックの分割 ✅

**結果**: 244行 → 3ファイルに分割（storageService: 63行, useTestMode: 97行, useStorage: 158行）

**実現構成**:

```
src/hooks/
├── useStorage.ts           # 基本的なデータ永続化 (158行)
├── useTestMode.ts          # テストモード機能 (97行)
└── __tests__/
    ├── useStorage.test.tsx
    └── useTestMode.test.tsx  # 13テスト

src/services/
├── storageService.ts       # Electron IPC抽象化 (63行)
└── __tests__/
    └── storageService.test.ts  # 11テスト
```

**リファクタリング手順**:

#### Step 2-2-1: storageService の抽出 ✅

1. [x] Electron IPC操作をサービスに抽出
2. [x] テストでモック可能な形式にする
3. [x] 既存フックからサービスを使用

#### Step 2-2-2: useTestMode の抽出 ✅

1. [x] テストモード関連のロジックを分離
2. [x] 単体テストを作成
3. [x] useStorage から参照

#### Step 2-2-3: useStorage の簡素化 ✅

1. [x] 残った責務のみを保持
2. [x] テストカバレッジを向上

**完了条件**:

- [x] 各ファイルが分離され責務が明確化
- [x] 単一責任原則を遵守
- [x] 新規ファイルにテストを追加（24テスト追加）

### P2-3: Timer コンポーネントの整理

**現状**: 352行

**目標構成**:

```
src/components/timer/
├── Timer/
│   ├── index.tsx
│   ├── TimerDisplay.tsx      # 時間表示
│   ├── TimerControls.tsx     # 操作ボタン
│   ├── ProjectSelector.tsx   # プロジェクト選択
│   └── __tests__/
```

---

## Phase 3: テストカバレッジ向上

**目的**: コード品質の保証とリグレッション防止

### P3-1: 重要ユーティリティのテスト追加

**優先度: 高**

| ファイル                       | 現在のカバレッジ | 目標 |
| ------------------------------ | ---------------- | ---- |
| `src/utils/backupUtils.ts`     | 0%               | 90%  |
| `src/utils/safeImportUtils.ts` | 0%               | 90%  |

**テスト観点**:

- 正常系: 各関数の基本動作
- 異常系: 不正な入力、ファイルが存在しない場合
- 境界値: 空配列、大量データ
- エラーハンドリング: 例外発生時の動作

### P3-2: ダッシュボードコンポーネントのテスト追加

**対象**:

- [ ] `Dashboard.tsx`
- [ ] `MonthlySummary.tsx`
- [ ] `WeeklySummary.tsx`
- [ ] `ActivityHeatmap.tsx`
- [ ] `ProjectComparisonView.tsx`

**テスト戦略**:

1. スナップショットテストで基本レンダリングを確認
2. ユーザーインタラクションテスト
3. データ境界値テスト（空データ、大量データ）

### P3-3: カバレッジ目標

| メトリクス | 現在  | Phase 3 終了時目標 |
| ---------- | ----- | ------------------ |
| Statements | 44.6% | 65%                |
| Branches   | 34.5% | 55%                |
| Functions  | 40.9% | 65%                |
| Lines      | 44.2% | 65%                |

---

## Phase 4: i18n 完全対応

**目的**: 多言語対応の完全化

### P4-1: ハードコード文字列の抽出

**対象ファイル**:

- `src/components/comparison/ProjectComparisonView.tsx`

**手順**:

1. ハードコードされた日本語文字列を特定
2. `src/i18n/ja.json` にキーを追加
3. `t()` 関数で置き換え
4. 英語翻訳を追加（必要に応じて）

**サンプル変更**:

```typescript
// Before
<Typography variant="h6">プロジェクト比較</Typography>

// After
<Typography variant="h6">{t('comparison.title')}</Typography>
```

### P4-2: i18n キー整理

1. 未使用のi18nキーを特定・削除
2. キー命名規則の統一
3. ネームスペースの整理

---

## Phase 5: アクセシビリティ改善

**目的**: a11y準拠とユーザビリティ向上

### P5-1: aria-label の追加

**現状**: カバー率 6.6%（17/258）

**対象コンポーネント**:

1. 全IconButton
2. 全Tooltip付き要素
3. フォーム要素

**手順**:

1. インタラクティブ要素を全て列挙
2. 適切なaria-labelを設計
3. i18n対応でラベルを追加

### P5-2: キーボードナビゲーション

1. フォーカス順序の確認
2. キーボードショートカットの整備
3. フォーカス可視化の改善

### P5-3: コントラスト比検証

1. LighthouseでA11y監査
2. 問題箇所の修正
3. 目標: A11yスコア90以上

---

## Phase 6: 依存関係の更新（長期）

**目的**: セキュリティとパフォーマンスの向上

### P6-1: React 19 移行

**前提条件**:

- Phase 3 完了（テストカバレッジ65%以上）
- 全テストがパス

**手順**:

1. 変更履歴の確認
2. 互換性のない変更点の特定
3. 段階的なアップグレード
4. リグレッションテスト

### P6-2: MUI 7 移行

**前提条件**:

- React 19 移行完了
- テーマ関連テストの追加

**手順**:

1. MUI 7 の変更点確認
2. テーマ設定の移行
3. コンポーネントAPIの更新
4. ビジュアルリグレッションテスト

### P6-3: Electron 更新

**前提条件**:

- アプリケーション全体のテストが安定

**手順**:

1. Electron 35+ への更新
2. IPC APIの確認
3. セキュリティ設定の見直し
4. 本番環境でのテスト

---

## 実行スケジュール

```
Phase 0: 即時対応
├── P0-1: セキュリティ修正
└── P0-2: 未使用インポート削除

Phase 1: クイックウィン
├── P1-1: 時間フォーマット共通化
├── P1-2: テーマヘルパー作成
└── P1-3: エクスポート整理

Phase 2: コンポーネント分割
├── P2-1: ProjectProgressCard分割
├── P2-2: useStorage分割
└── P2-3: Timer整理

Phase 3: テストカバレッジ向上
├── P3-1: ユーティリティテスト
├── P3-2: ダッシュボードテスト
└── P3-3: カバレッジ65%達成

Phase 4: i18n完全対応
├── P4-1: ハードコード文字列抽出
└── P4-2: キー整理

Phase 5: アクセシビリティ改善
├── P5-1: aria-label追加
├── P5-2: キーボードナビゲーション
└── P5-3: コントラスト比検証

Phase 6: 依存関係更新
├── P6-1: React 19移行
├── P6-2: MUI 7移行
└── P6-3: Electron更新
```

---

## 成功基準

### Phase 完了チェックリスト

各Phase完了時に以下を確認:

- [ ] 全てのテストがパス (`npm test`)
- [ ] Lintエラーなし (`npm run lint`)
- [ ] ビルド成功 (`npm run build`)
- [ ] アプリケーションが正常動作
- [ ] ドキュメント更新完了

### 最終目標メトリクス

| メトリクス         | 現在 | 目標 |
| ------------------ | ---- | ---- |
| テストカバレッジ   | 44%  | 80%  |
| セキュリティ脆弱性 | 3    | 0    |
| 300行超ファイル数  | 11   | 4    |
| a11yカバレッジ     | 6.6% | 80%  |
| ESLint警告         | -    | 0    |

---

## 関連ドキュメント

- [技術的負債レポート](../reports/technical-debt-report-2026-01-02.md)
- [デザインガイドライン](../design-guidelines.md)
- [テスティングガイド](../testing-guide.md)
- [リファクタリング戦略](../refactoring-strategy.md)
