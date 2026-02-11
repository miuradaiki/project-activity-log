# エージェントチーム タスクリスト

**作成日**: 2026年2月11日
**基準ドキュメント**: [技術的負債レポート 2026-02-01](reports/technical-debt-report-2026-02-01.md), [段階的リファクタリング計画](refactoring/phased-refactoring-plan-2026.md)
**現在のブランチ**: `feat/phase5-code-cleanup`

---

## 現状サマリー

| 項目                    | 現在値       | 目標値 |
| ----------------------- | ------------ | ------ |
| テストカバレッジ(Lines) | 65.30%       | 80%    |
| テスト数                | 477          | 500+   |
| セキュリティ脆弱性      | 9件(4中/5高) | 0      |
| 300行超ファイル数       | 10           | 4      |
| aria-labelカバー率      | 100%         | 80%+   |
| ESLint警告              | 0            | 0      |

**完了済みフェーズ**: Phase 0〜4, Phase 6 (React 19, MUI 7, Electron 40)
**未着手フェーズ**: Phase 5 残り (キーボードナビゲーション、コントラスト比検証)
**適用済み**: Phase 1 ヘルパー (timeFormatters) 全ファイル適用完了

---

## タスク一覧

### Task 1: 廃止コードの削除

**優先度**: 高
**並列作業**: 可（Task 2, 3 と並行可能）
**関連**: QW-2 (技術的負債レポート §3.1)

4つの廃止ファイルを削除し、インポートパスを整理する。

| 対象ファイル                | アクション                                                 |
| --------------------------- | ---------------------------------------------------------- |
| `src/utils/analytics.ts`    | 削除。インポート元を `src/utils/analytics/index.ts` へ変更 |
| `src/styles/theme.ts`       | 削除。modernTheme.ts の使用を確認済み                      |
| `src/utils/storage.ts`      | 削除。storageService.ts に統合済み                         |
| `src/utils/storageUtils.ts` | 削除。storageService.ts に統合済み                         |

**手順**:

1. 各ファイルのインポート元を `grep` で特定
2. インポートパスを正しいファイルへ変更
3. `npm test` で全テスト通過を確認
4. ファイルを削除
5. `npm test && npm run lint && npm run build` で最終確認

**完了条件**:

- [x] 4ファイルが削除されている
- [x] 全テスト通過
- [x] ビルド成功
- [x] Lintエラー 0

---

### Task 2: ストレージキーの一元化

**優先度**: 高
**並列作業**: 可（Task 1, 3 と並行可能）
**関連**: QW-3 (技術的負債レポート §1.1.3)

5箇所に分散しているストレージキー定数を新規ファイルに集約する。

**現状の分散箇所**:

| 定数名                    | ファイル                           |
| ------------------------- | ---------------------------------- |
| `ACTIVE_PAGE_STORAGE_KEY` | `src/App.tsx`                      |
| `LANGUAGE_STORAGE_KEY`    | `src/contexts/LanguageContext.tsx` |
| `TEST_SETTINGS_KEY`       | `src/contexts/SettingsContext.tsx` |
| `TIMER_STATE_STORAGE_KEY` | `src/hooks/useTimerController.ts`  |
| `TIMER_STORAGE_KEY`       | `src/hooks/useTimer.ts`            |

**手順**:

1. `src/constants/storageKeys.ts` を新規作成（TDD: テストを先に書く）
2. 全キーを `STORAGE_KEYS` オブジェクトとしてエクスポート
3. 各ファイルのインポートを `storageKeys.ts` へ変更
4. 元のファイルから定数定義を削除
5. `npm test && npm run lint` で確認

**完了条件**:

- [x] `src/constants/storageKeys.ts` が存在する
- [x] 5箇所の定数が集約されている
- [x] 全テスト通過
- [x] Lintエラー 0

---

### Task 3: 時間フォーマットヘルパーの適用

**優先度**: 高
**並列作業**: 可（Task 1, 2 と並行可能。Task 4 と同時作業は避ける）
**関連**: QW-4 / P1-1 (phased-refactoring-plan-2026.md)

Phase 1 で作成済みの `src/utils/formatters/timeFormatters.ts` を対象19ファイルに適用する。

**重複パターン**:

```typescript
// Before（各ファイルにインラインで存在）
Number(weeklyHours.toFixed(1));
hours.toFixed(1);

// After
import { formatHours } from '../utils/formatters/timeFormatters';
formatHours(weeklyHours);
```

**対象ファイル** (phased-refactoring-plan-2026.md §P1-1):

- [ ] `src/utils/analytics/monthly.ts`
- [ ] `src/components/dashboard/MonthlyProgressSummary.tsx`
- [ ] `src/components/dashboard/ActivityHeatmap.tsx`
- [ ] `src/components/ui/project/ProjectProgressSection.tsx`
- [ ] `src/components/ui/ProjectProgressCard.tsx`
- [ ] その他14ファイル（`toFixed` パターンを grep で特定）

**手順**:

1. `toFixed` パターンを含むファイルを全て特定
2. 1ファイルずつ `formatHours` / `formatHoursWithUnit` に置換
3. 各ファイル置換後に `npm test` を実行
4. 全ファイル完了後に `npm run lint && npm run build` で最終確認

**完了条件**:

- [x] `toFixed` による時間フォーマットのインライン処理が 0 件
- [x] 全テスト通過
- [x] Lintエラー 0

---

### Task 4: テーマモードヘルパーの適用

**優先度**: 高
**並列作業**: 可（Task 1, 2 と並行可能。Task 3 と同時作業は避ける）
**関連**: QW-4 / P1-2 (phased-refactoring-plan-2026.md)

Phase 1 で作成済みの `src/utils/theme/themeHelpers.ts` を対象14ファイルに適用する。

**重複パターン**:

```typescript
// Before
theme.palette.mode === 'dark' ? darkValue : lightValue;

// After
import { getModeValue } from '../utils/theme/themeHelpers';
getModeValue(theme, darkValue, lightValue);
```

**対象ファイル** (phased-refactoring-plan-2026.md §P1-2):

- [ ] `src/components/dashboard/MonthlyProgressSummary.tsx`
- [ ] `src/components/dashboard/ActivityHeatmap.tsx`
- [ ] `src/components/ui/project/ProjectCard.tsx`
- [ ] `src/components/ui/layout/Sidebar.tsx`
- [ ] その他10ファイル（`palette.mode` パターンを grep で特定）

**手順**:

1. `theme.palette.mode === 'dark'` パターンを含むファイルを全て特定
2. 1ファイルずつ `getModeValue` / `getModeAlpha` に置換
3. 各ファイル置換後に `npm test` を実行
4. 全ファイル完了後に `npm run lint && npm run build` で最終確認

**完了条件**:

- [ ] `theme.palette.mode === 'dark'` のインライン三項演算子が 0 件
- [ ] 全テスト通過
- [ ] UIの見た目に変更なし（ライト/ダーク両モード確認）

---

### Task 5: デザインガイドライン違反の修正

**優先度**: 中
**並列作業**: 可（Task 1, 2 と並行可能。Task 3, 4 の完了後が望ましい）
**関連**: [design-guidelines-violation-fix-plan.md](refactoring/design-guidelines-violation-fix-plan.md)

ハードコードされた色・グラデーション・rgba を `theme.palette` / `theme.custom` に置換する。

**Phase A: テーマ拡張** (`src/styles/modernTheme.ts`)

- `theme.custom.chartColors` 配列の追加
- `theme.custom.heatmapColors` (light/dark) の追加
- Theme 型定義の更新

**Phase B: コンポーネント修正** (11ファイル)

| ファイル                                               | 修正内容                                    |
| ------------------------------------------------------ | ------------------------------------------- |
| `src/components/ui/layout/Sidebar.tsx`                 | #FFFFFF → theme.palette, フォールバック削除 |
| `src/components/timer/Timer/index.tsx`                 | #FFFFFF → theme.palette, rgba → alpha()     |
| `src/components/dashboard/ActivityHeatmap.tsx`         | ハードコード色 → theme.custom.heatmapColors |
| `src/components/dashboard/DailySummary.tsx`            | ハードコード色 → theme.palette              |
| `src/components/dashboard/WeeklySummary.tsx`           | #8884d8 → theme.palette.primary.main        |
| `src/components/ui/KPICard.tsx`                        | グラデーション → theme.custom.gradients     |
| `src/components/ui/project/ProjectCard.tsx`            | rgba → alpha()                              |
| `src/components/ui/project/ProjectCardActions.tsx`     | ハードコード色確認・修正                    |
| `src/components/ui/project/ProjectProgressSection.tsx` | rgba → alpha()                              |
| `src/components/dashboard/MonthlySummary.tsx`          | ハードコード色確認・修正                    |
| `src/styles/modernTheme.ts`                            | chartColors, heatmapColors 追加             |

**完了条件**:

- [ ] ハードコードされた色定数（`#FFFFFF`, `#8884d8` 等）が 0 件
- [ ] `rgba()` 直書きが `alpha()` に置換済み
- [ ] グラデーションフォールバックが削除済み
- [ ] ライトモード・ダークモード両方で表示確認
- [ ] 全テスト通過

---

### Task 6: アクセシビリティ改善 (Phase 5)

**優先度**: 中
**並列作業**: 可（他の全タスクと並行可能）
**関連**: P5-1, P5-2 (phased-refactoring-plan-2026.md)

#### 6a: aria-label の追加

**現状**: 258箇所中17箇所のみ（6.6%）

全 IconButton / Tooltip 付きインタラクティブ要素に i18n 対応の aria-label を追加する。

**手順**:

1. `IconButton` / `Tooltip` の使用箇所を全て列挙
2. `src/i18n/translations.ts` に aria 用のキーを追加（`aria.` ネームスペース）
3. 各コンポーネントに `aria-label={t('aria.xxx')}` を追加
4. テストを更新

**対象コンポーネント例**:

- Sidebar（ナビゲーションボタン）
- Timer（開始/停止/リセットボタン）
- ProjectsGrid（フィルター、ソートボタン）
- Settings（設定項目の操作ボタン）
- Layout（FAB、メニューボタン）

#### 6b: キーボードナビゲーション改善

1. フォーカス順序の確認・修正
2. フォーカスインジケータの視認性改善
3. Lighthouse a11y スコア 90 以上を目標

**完了条件**:

- [x] aria-label カバー率 80% 以上 (100% 達成)
- [x] i18n キーとして管理されている
- [x] 全テスト通過

---

### Task 7: テストカバレッジ拡充

**優先度**: 中
**並列作業**: 可（他の全タスクと並行可能）
**関連**: 技術的負債レポート §1.3

65% → 80% (Lines) を目標にテストを追加する。

**現在のギャップ**:

| メトリクス | 現在   | 目標 | ギャップ |
| ---------- | ------ | ---- | -------- |
| Statements | 65.59% | 80%  | -14.41%  |
| Branches   | 53.46% | 70%  | -16.54%  |
| Functions  | 61.65% | 80%  | -18.35%  |
| Lines      | 65.30% | 80%  | -14.70%  |

**優先テスト対象**:

| ファイル/コンポーネント | 理由                         |
| ----------------------- | ---------------------------- |
| `Settings.tsx`          | カバレッジ未確認、設定画面   |
| `GlobalTimer.tsx`       | カバレッジ未確認、統合テスト |
| `ProjectList.tsx`       | 308行、高複雑度              |
| `ProjectsGrid.tsx`      | 343行、高複雑度              |
| `Sidebar.tsx`           | 356行、高複雑度              |

**テスト方針** (CLAUDE.md TDD ルール準拠):

- AAA パターン（Arrange-Act-Assert）
- 1テスト1振る舞い
- 正常系・異常系・境界値をカバー
- i18n モック、Electron API モックを活用

**完了条件**:

- [ ] Lines カバレッジ 80% 以上
- [ ] Branches カバレッジ 70% 以上
- [ ] 全テスト通過

---

### Task 8: 大規模コンポーネント分割

**優先度**: 低（Task 7 のテスト拡充後が安全）
**並列作業**: コンポーネント単位で並列可能
**関連**: 技術的負債レポート §1.1.1, M-1

300行超のコンポーネントを 150〜200行以下に分割する。

| コンポーネント               | 現在行数 | 複雑度 | 分割案                                      |
| ---------------------------- | -------- | ------ | ------------------------------------------- |
| `ActivityCalendar.tsx`       | 406      | 中     | CalendarGrid, CalendarHeader, HeatmapLegend |
| `MonthlyProgressSummary.tsx` | 369      | 高     | ProgressCard, TrendChart, SummaryStats      |
| `Sidebar.tsx`                | 356      | 高     | NavigationList, SidebarHeader, ThemeToggle  |
| `ProjectsGrid.tsx`           | 343      | 高     | GridFilters, GridItem, GridLayout           |
| `ActivityHeatmap.tsx`        | 329      | 中     | HeatmapGrid, HeatmapRenderer                |
| `MonthlySummary.tsx`         | 325      | 高     | ChartSection, DistributionSection           |
| `ProjectList.tsx`            | 308      | 高     | リスト表示ロジックの分離                    |

**手順** (TDD サイクル):

1. 既存テストでカバレッジを確認（不足なら先にテスト追加）
2. サブコンポーネントのテストを作成（Red）
3. サブコンポーネントを抽出・実装（Green）
4. リファクタリング（Refactor）
5. 既存テスト + 新規テストが全て通ることを確認

**完了条件**:

- [ ] 300行超ファイル数が 4 以下
- [ ] 各サブコンポーネントにテストが存在
- [ ] UIの見た目・動作に変更なし
- [ ] 全テスト通過

---

### Task 9: Bug #4 修正 — 日付を跨いだ記録の複製バグ

**優先度**: 中
**並列作業**: 可（他の全タスクと並行可能）
**関連**: [GitHub Issue #4](https://github.com/daikimiura/project-activity-log/issues/4)

日付を跨いだ記録作成時に既存記録の複製が誤って追加される問題の修正。

**手順** (TDD):

1. バグを再現するテストを作成（Red）
2. 原因を特定し修正（Green）
3. リファクタリング（Refactor）
4. 回帰テストとして永続化

**完了条件**:

- [x] 再現テストが存在する
- [x] バグが修正されている
- [x] 全テスト通過

---

## チーム編成の推奨

### 並列実行グループ

```
Group A (コード整理 — 互いに独立):
├── Agent 1: Task 1 (廃止コード削除)
├── Agent 2: Task 2 (ストレージキー一元化)
└── Agent 3: Task 3 or 4 (ヘルパー適用、片方ずつ)

Group B (UI/UX 改善 — 互いに独立):
├── Agent 4: Task 6 (アクセシビリティ)
└── Agent 5: Task 9 (Bug #4)

Group C (Group A 完了後):
├── Agent: Task 5 (デザインガイドライン違反修正)
└── Agent: Task 4 or 3 (残りのヘルパー適用)

Group D (品質向上 — Group A〜C と独立):
├── Agent: Task 7 (テストカバレッジ拡充)
└── Agent: Task 8 (コンポーネント分割、Task 7 の後が安全)
```

### 依存関係

```
Task 1, 2, 6, 7, 9 → 独立（即時開始可能）
Task 3, 4           → 互いに同時作業を避ける（同じファイルを触る可能性）
Task 5              → Task 3, 4 の完了後が望ましい（テーマ関連の変更が重複）
Task 8              → Task 7 の完了後が安全（テストカバレッジで安全網を確保）
```

---

## 共通ルール

1. **TDD 必須**: テストを先に書く → 実装 → リファクタリング
2. **各変更後に検証**: `npm test && npm run lint && npm run build`
3. **コミット単位**: 1つの論理的変更につき1コミット
4. **CLAUDE.md 準拠**: コメントは WHY のみ、過剰なエンジニアリングを避ける
5. **i18n**: 新規文字列は必ず `t()` 経由、ハードコード禁止
