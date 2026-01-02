# 技術的負債分析レポート

**プロジェクト**: Project Activity Log
**分析日**: 2026年1月2日
**対象ソースコード**: 約20,000行（TypeScript/TSX）

---

## 1. 負債インベントリ

### 1.1 コード負債

#### 1.1.1 大規模ファイル（>300行）

| ファイル                                              | 行数 | 複雑度リスク         |
| ----------------------------------------------------- | ---- | -------------------- |
| `src/styles/modernTheme.ts`                           | 699  | 中                   |
| `src/utils/__tests__/analytics.test.ts`               | 649  | 低（テストファイル） |
| `src/components/ui/ProjectProgressCard.tsx`           | 456  | 高                   |
| `src/components/comparison/ProjectComparisonView.tsx` | 415  | 高                   |
| `src/components/heatmap/ActivityCalendar.tsx`         | 385  | 中                   |
| `src/components/ui/modern/StyledComponents.tsx`       | 376  | 低                   |
| `src/components/dashboard/MonthlyProgressSummary.tsx` | 370  | 高                   |
| `src/hooks/__tests__/useStorage.test.tsx`             | 362  | 低（テストファイル） |
| `src/components/ui/layout/Sidebar.tsx`                | 356  | 高                   |
| `src/components/timer/Timer.tsx`                      | 352  | 高                   |
| `src/components/ui/project/ProjectsGrid.tsx`          | 343  | 高                   |

**問題点**:

- `ProjectProgressCard.tsx`（456行）: UIロジック、状態管理、ダイアログが1つのコンポーネントに集中
- `ProjectComparisonView.tsx`（415行）: 複数のチャートタイプ、データ変換ロジックが混在
- `modernTheme.ts`（699行）: ライト/ダークテーマの定義が重複

#### 1.1.2 コード重複パターン

**時間フォーマット処理の重複（19ファイル）**:

```
src/utils/analytics/monthly.ts
src/components/dashboard/MonthlyProgressSummary.tsx
src/components/dashboard/ActivityHeatmap.tsx
src/components/ui/project/ProjectProgressSection.tsx
src/components/ui/ProjectProgressCard.tsx
... 他14ファイル
```

`.toFixed(1)` による時間表示フォーマットが各所で直接使用されている。

**テーマモード分岐の重複（14ファイル）**:

```typescript
// 以下のパターンが14ファイルで繰り返し使用
theme.palette.mode === 'dark' ? 'ダーク用の値' : 'ライト用の値';
```

対象ファイル:

- `MonthlyProgressSummary.tsx`
- `ActivityHeatmap.tsx`
- `ProjectCard.tsx`
- `Sidebar.tsx`
- 他10ファイル

#### 1.1.3 未使用インポート

```typescript
// src/components/ui/ProjectProgressCard.tsx:32
import { FlagCircle as _TargetIcon } from '@mui/icons-material';
```

アンダースコア付きの未使用インポートが残存。

### 1.2 アーキテクチャ負債

#### 1.2.1 コンポーネント責務の肥大化

**`ProjectProgressCard.tsx`の問題**:

- 進捗計算ロジック
- ステータス判定ロジック
- メニュー制御
- ダイアログ制御（目標時間調整）
- 色計算ロジック

**推奨アクション**: 以下に分割

- `ProjectProgressCard.tsx` - 表示のみ
- `useProjectProgress.ts` - 進捗計算フック
- `ProjectTargetDialog.tsx` - 目標時間調整ダイアログ
- `ProjectCardMenu.tsx` - アクションメニュー

#### 1.2.2 useStorage フックの複雑化

`src/hooks/useStorage.ts`（244行）が以下の責務を持つ:

- 通常データのロード/セーブ
- テストモード状態管理
- テストデータ生成
- ローカルストレージ操作

**推奨アクション**: 責務分離

- `useStorage.ts` - 基本的なデータ永続化
- `useTestMode.ts` - テストモード機能
- `storageService.ts` - ストレージ操作の抽象化

#### 1.2.3 ハードコードされた文字列

`ProjectComparisonView.tsx` に日本語文字列が直接記述:

```typescript
<Typography variant="h6">プロジェクト比較</Typography>
<Typography>複数プロジェクトの進捗状況を比較</Typography>
```

i18n システムを使用すべき箇所で直接文字列が使用されている。

### 1.3 テスト負債

#### 1.3.1 テストカバレッジ

| メトリクス | 現在値 | 目標値 | ギャップ |
| ---------- | ------ | ------ | -------- |
| Statements | 44.60% | 80%    | -35.4%   |
| Branches   | 34.55% | 70%    | -35.45%  |
| Functions  | 40.95% | 80%    | -39.05%  |
| Lines      | 44.27% | 80%    | -35.73%  |

#### 1.3.2 カバレッジ0%のファイル（重要度順）

| ファイル                         | 重要度 | 理由                       |
| -------------------------------- | ------ | -------------------------- |
| `src/utils/backupUtils.ts`       | 高     | データ保護に関わる         |
| `src/utils/safeImportUtils.ts`   | 高     | インポート時のデータ整合性 |
| `src/styles/modernTheme.ts`      | 中     | UIテーマ定義               |
| `src/styles/theme.ts`            | 中     | 基本テーマ定義             |
| `src/utils/testDataGenerator.ts` | 低     | 開発用ユーティリティ       |
| `src/constants/dateConstants.ts` | 低     | 定数定義のみ               |

#### 1.3.3 テストされていないコンポーネント

主要なダッシュボードコンポーネントにテストが存在しない:

- `Dashboard.tsx`
- `MonthlySummary.tsx`
- `WeeklySummary.tsx`
- `ActivityHeatmap.tsx`
- `ProjectComparisonView.tsx`

### 1.4 依存関係の健全性

#### 1.4.1 セキュリティ脆弱性

| パッケージ | 深刻度 | 説明                        | 修正バージョン |
| ---------- | ------ | --------------------------- | -------------- |
| `electron` | 中     | ASAR Integrity Bypass (CVE) | 35.7.5+        |
| `esbuild`  | 中     | 開発サーバーのCORS問題      | 0.24.3+        |
| `vite`     | 中     | esbuildに依存               | 6.1.7+         |

**合計**: 3件の中程度の脆弱性

#### 1.4.2 古い依存関係（メジャーバージョン遅れ）

| パッケージ            | 現在    | 最新   | バージョン差 |
| --------------------- | ------- | ------ | ------------ |
| `electron`            | 29.4.6  | 39.2.7 | 10メジャー   |
| `@mui/material`       | 5.16.14 | 7.3.6  | 2メジャー    |
| `@mui/icons-material` | 5.16.14 | 7.3.6  | 2メジャー    |
| `recharts`            | 2.15.1  | 3.6.0  | 1メジャー    |
| `react`               | 18.3.1  | 19.2.3 | 1メジャー    |
| `uuid`                | 9.0.1   | 13.0.0 | 4メジャー    |
| `cross-env`           | 7.0.3   | 10.1.0 | 3メジャー    |

### 1.5 アクセシビリティ負債

#### 1.5.1 aria-label の不足

- **IconButton/Tooltip 使用箇所**: 258件
- **aria-label 設定箇所**: 17件
- **カバー率**: 6.6%

多くのインタラクティブ要素でスクリーンリーダー対応が不十分。

---

## 2. 影響分析

### 2.1 開発速度への影響

| 負債項目                   | 影響度 | 月間推定コスト     |
| -------------------------- | ------ | ------------------ |
| 大規模コンポーネントの変更 | 高     | 追加4時間/変更     |
| テーマモード分岐の重複     | 中     | 追加2時間/UI変更   |
| テストカバレッジ不足       | 高     | バグ修正時間+50%   |
| i18n未対応箇所             | 低     | 追加1時間/翻訳対応 |

### 2.2 品質への影響

- **テストカバレッジ44%**: リグレッションリスク高
- **backupUtils未テスト**: データ損失リスク
- **セキュリティ脆弱性3件**: 潜在的なセキュリティリスク

### 2.3 リスク評価

| リスク                   | 深刻度 | 発生確率 | 対応優先度 |
| ------------------------ | ------ | -------- | ---------- |
| Electron脆弱性による攻撃 | 高     | 低       | 高         |
| データバックアップ失敗   | 高     | 低       | 高         |
| UI変更時のリグレッション | 中     | 高       | 中         |
| a11y問題による利用障壁   | 中     | 中       | 中         |

---

## 3. 優先順位付きロードマップ

### 3.1 クイックウィン（1-2週目）

#### QW-1: セキュリティ脆弱性の修正

```bash
npm update electron vite
npm audit fix
```

- **工数**: 2-4時間
- **効果**: セキュリティリスク解消
- **ROI**: 即時

#### QW-2: 時間フォーマットユーティリティの共通化

```typescript
// src/utils/formatters.ts
export const formatHours = (hours: number, precision = 1): string =>
  hours.toFixed(precision);

export const formatHoursWithUnit = (hours: number, t: TFunction): string =>
  `${formatHours(hours)} ${t('units.hours')}`;
```

- **工数**: 4時間
- **効果**: 19ファイルの重複削減
- **ROI**: 初月で200%

#### QW-3: テーマモードヘルパーの作成

```typescript
// src/utils/themeHelpers.ts
export const getModeValue = <T>(
  theme: Theme,
  darkValue: T,
  lightValue: T
): T => (theme.palette.mode === 'dark' ? darkValue : lightValue);
```

- **工数**: 4時間
- **効果**: 14ファイルの分岐簡素化
- **ROI**: 初月で150%

#### QW-4: 未使用インポートの削除

- **工数**: 1時間
- **効果**: コードクリーンアップ
- **ROI**: 即時

### 3.2 中期的改善（1-2ヶ月目）

#### M-1: ProjectProgressCardのリファクタリング

**現状**: 456行の単一コンポーネント

**目標構成**:

```
components/ui/project/
├── ProjectProgressCard/
│   ├── index.tsx (メインコンポーネント ~150行)
│   ├── ProjectCardHeader.tsx (~50行)
│   ├── ProjectCardProgress.tsx (~80行)
│   ├── ProjectCardMenu.tsx (~60行)
│   └── ProjectTargetDialog.tsx (~100行)
└── hooks/
    └── useProjectProgress.ts (~50行)
```

- **工数**: 16時間
- **効果**: 保守性向上、テスト容易化

#### M-2: テストカバレッジ向上（優先度高のファイル）

1. `backupUtils.ts` のテスト追加
2. `safeImportUtils.ts` のテスト追加
3. `useStorage.ts` のテストカバレッジ向上

- **工数**: 24時間
- **効果**: カバレッジ +15%、データ保護の信頼性向上

#### M-3: i18n未対応箇所の修正

`ProjectComparisonView.tsx` の日本語ハードコード解消

- **工数**: 4時間
- **効果**: 多言語対応完全化

#### M-4: useStorageフックの分割

```typescript
// hooks/useStorage.ts - 純粋なストレージ操作のみ
// hooks/useTestMode.ts - テストモード機能
// services/storageService.ts - Electron IPC抽象化
```

- **工数**: 12時間
- **効果**: 単一責任原則の遵守、テスト容易化

### 3.3 長期的改善（3-6ヶ月目）

#### L-1: 依存関係のメジャーアップデート

**Phase 1**: React 19対応

- React 18 → 19
- @types/react 更新
- 破壊的変更への対応

**Phase 2**: MUI 7対応

- @mui/material 5 → 7
- テーマ設定の移行
- コンポーネントAPIの更新

**Phase 3**: Electron更新

- Electron 29 → 35+
- セキュリティ修正の適用
- 新機能の活用

- **工数**: 80-120時間（合計）
- **効果**: セキュリティ向上、パフォーマンス改善

#### L-2: テストカバレッジ80%達成

**目標**:

- Statements: 44% → 80%
- Branches: 34% → 70%
- Functions: 40% → 80%

**戦略**:

1. 新規コードは100%カバレッジ必須
2. 既存コードは変更時にテスト追加
3. 重要度高のファイルを優先

- **工数**: 80時間
- **効果**: バグ率50%削減、リファクタリング安全性向上

#### L-3: アクセシビリティ改善

1. 全IconButtonにaria-label追加
2. フォーム要素のラベル関連付け
3. キーボードナビゲーションの改善
4. コントラスト比の検証

- **工数**: 40時間
- **効果**: a11yスコア向上、利用者層拡大

---

## 4. 実装ガイド

### 4.1 段階的リファクタリング戦略

```typescript
// Step 1: 既存インターフェースを維持しつつ内部を分割
// ProjectProgressCard.tsx
export const ProjectProgressCard: React.FC<Props> = (props) => {
  // 新しいフックを使用
  const progress = useProjectProgress(props.project, props.currentHours);

  return (
    <>
      <ProjectCardContainer {...props} progress={progress} />
      <ProjectTargetDialog {...dialogProps} />
    </>
  );
};

// Step 2: 段階的に子コンポーネントを独立
// Step 3: 十分なテストを追加後、古いコードを削除
```

### 4.2 テスト追加のベストプラクティス

```typescript
// 新しいテストファイルのテンプレート
describe('ComponentName', () => {
  // Arrange: 共通セットアップ
  const defaultProps = { /* ... */ };

  describe('レンダリング', () => {
    test('should render correctly with default props', () => {
      // Act
      render(<Component {...defaultProps} />);
      // Assert
      expect(screen.getByRole('...')).toBeInTheDocument();
    });
  });

  describe('ユーザーインタラクション', () => {
    test('should handle click event', async () => {
      // Arrange
      const handleClick = jest.fn();
      // Act
      render(<Component {...defaultProps} onClick={handleClick} />);
      await userEvent.click(screen.getByRole('button'));
      // Assert
      expect(handleClick).toHaveBeenCalled();
    });
  });
});
```

---

## 5. 予防戦略

### 5.1 品質ゲート

```yaml
# .github/workflows/quality-gate.yml
quality_checks:
  - lint: 'npm run lint'
  - test_coverage:
      minimum: 80%
      fail_on_decrease: true
  - security_audit:
      allow: 'moderate'
  - bundle_size:
      max_increase: '5%'
```

### 5.2 コードレビューチェックリスト

- [ ] 新規コードにテストが含まれている
- [ ] aria-labelが適切に設定されている
- [ ] i18n関数を使用している
- [ ] テーマカラーを直接使用している（ハードコードなし）
- [ ] コンポーネントが200行以下

### 5.3 技術的負債バジェット

| メトリクス                      | 許容値 | 現在値 | ステータス |
| ------------------------------- | ------ | ------ | ---------- |
| テストカバレッジ低下            | 0%     | -      | ✅         |
| 新規ESLint警告                  | 0      | -      | ✅         |
| セキュリティ脆弱性（高/致命的） | 0      | 0      | ✅         |
| 大規模ファイル追加（>300行）    | 0      | -      | ✅         |

---

## 6. ROI予測

### 6.1 投資対効果

| 施策                 | 投資工数 | 年間節約                 | ROI  |
| -------------------- | -------- | ------------------------ | ---- |
| クイックウィン全体   | 15時間   | 60時間/年                | 300% |
| コンポーネント分割   | 40時間   | 80時間/年                | 100% |
| テストカバレッジ向上 | 80時間   | 120時間/年               | 50%  |
| 依存関係更新         | 100時間  | 40時間/年 + セキュリティ | -    |

### 6.2 期待される改善

- **開発速度**: 20-30%向上（リファクタリング後）
- **バグ率**: 40-50%削減（テストカバレッジ向上後）
- **オンボーディング時間**: 30%短縮（コード可読性向上後）

---

## 7. 成功メトリクス

### 7.1 月次トラッキング

| メトリクス         | 現在    | 1ヶ月後 | 3ヶ月後 | 6ヶ月後 |
| ------------------ | ------- | ------- | ------- | ------- |
| テストカバレッジ   | 44%     | 55%     | 70%     | 80%     |
| セキュリティ脆弱性 | 3       | 0       | 0       | 0       |
| 大規模ファイル数   | 11      | 9       | 6       | 4       |
| ESLint警告         | 100上限 | 80      | 50      | 20      |

### 7.2 四半期レビュー項目

1. 負債スコアの推移
2. 開発者満足度（主観評価）
3. バグ発生頻度
4. コードレビュー時間
5. 新機能開発速度

---

## 付録

### A. 分析に使用したツール

- Jest（テストカバレッジ）
- npm audit（セキュリティ）
- npm outdated（依存関係）
- ESLint（静的解析）

### B. 参考ドキュメント

- `docs/design-guidelines.md` - UIデザインガイドライン
- `docs/refactoring/phased-refactoring-plan-2026.md` - 段階的リファクタリング計画
- `CLAUDE.md` - 開発規約

### C. 関連PR/Issue

（今後の改善施策実施時に追記）
