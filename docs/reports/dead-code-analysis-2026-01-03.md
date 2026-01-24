# デッドコード分析レポート

**調査日**: 2026-01-03
**調査ツール**: ESLint, TypeScript Compiler, ts-prune

## 概要

プロジェクト内のデッドコード（未使用のエクスポート）を調査しました。

## 調査方法

1. **ESLint**: 未使用変数・インポートの検出
2. **TypeScript Compiler** (`tsc --noEmit`): 型エラーと未使用コードの検出
3. **ts-prune**: 未使用エクスポートの検出

## 検出結果

### 未使用コンポーネント

| ファイル                                                  | エクスポート                | 備考                       |
| --------------------------------------------------------- | --------------------------- | -------------------------- |
| `src/components/TimeTracker.tsx`                          | `TimeTracker`               | コンポーネント全体が未使用 |
| ~~`src/components/comparison/ProjectComparisonView.tsx`~~ | ~~`ProjectComparisonView`~~ | **削除済み (2026-01-19)**  |

### 未使用ユーティリティ関数

| ファイル                    | エクスポート           | 備考                     |
| --------------------------- | ---------------------- | ------------------------ |
| `src/styles/modernTheme.ts` | `getGradient`          | テーマユーティリティ     |
| `src/styles/modernTheme.ts` | `getCustomShadow`      | テーマユーティリティ     |
| `src/styles/modernTheme.ts` | `applyGlassmorphism`   | テーマユーティリティ     |
| `src/styles/theme.ts`       | `responsiveTheme`      | テーマ設定               |
| `src/utils/storageUtils.ts` | `importAndSaveWorkLog` | ストレージユーティリティ |

### 未使用テストヘルパー・モック

| ファイル                         | エクスポート            | 備考           |
| -------------------------------- | ----------------------- | -------------- |
| `src/__tests__/helpers/index.ts` | `createMockProjects`    | テストヘルパー |
| `src/__tests__/helpers/index.ts` | `createMockTimeEntries` | テストヘルパー |
| `src/__tests__/helpers/index.ts` | `FakeTimerHelper`       | テストヘルパー |
| `src/__tests__/helpers/index.ts` | `setupFakeTimers`       | テストヘルパー |
| `src/__mocks__/electron.ts`      | `createMockSettings`    | モック関数     |

## 推奨アクション

### 削除推奨（優先度: 高）

- `TimeTracker` コンポーネント: 完全に未使用のため削除可能
- `importAndSaveWorkLog`: 使用箇所がないため削除可能

### 削除検討（優先度: 中）

- `modernTheme.ts` のユーティリティ関数群: 将来的に使用する可能性があれば保持
- `responsiveTheme`: 現在未使用だが、レスポンシブ対応時に必要になる可能性あり

### 保留（優先度: 低）

- テストヘルパー・モック関数: 将来のテスト拡充時に使用する可能性があるため保留推奨

## 注記

- `(used in module)` とマークされているエクスポートは、同一モジュール内で使用されているため対象外
- 定数 `MONTH_NAMES` は `MonthlySummary.tsx` で使用されていることを確認
- `isTestDataEnabled` は複数ファイルでインポートされていることを確認

## 参考: ESLint警告

デッドコード以外に以下の警告が検出されました（参考情報）：

- `react-hooks/exhaustive-deps`: 依存配列の警告 (4件)
- `no-console`: console文の使用 (20件以上)
- `@typescript-eslint/no-explicit-any`: any型の使用 (1件)
