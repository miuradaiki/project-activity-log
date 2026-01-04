# E2Eテスト

## 概要

PlaywrightをベースとしたElectronアプリのE2Eテスト環境。

## セットアップ

### 必要な依存関係

```bash
npm install -D @playwright/test playwright
npx playwright install chromium
```

### 設定ファイル

- `playwright.config.ts` - Playwright設定
- `e2e/tsconfig.json` - E2E用TypeScript設定

## コマンド

```bash
# E2Eテスト実行
npm run test:e2e

# デバッグモード（ステップ実行可能）
npm run test:e2e:debug

# UIモード（視覚的に確認）
npm run test:e2e:ui
```

## テストファイル構成

```
e2e/
├── app.spec.ts        # 基本的なアプリテスト（8テスト）
├── projects.spec.ts   # プロジェクト管理テスト（9テスト）
├── settings.spec.ts   # 設定画面テスト（4テスト）
├── timer.spec.ts      # タイマー機能テスト（1テスト）
└── tsconfig.json      # TypeScript設定
```

## 機能カバレッジ

**カバー率: 約60%**（22テスト / 主要機能36項目中22項目）

### カバー済み（22テスト）

| カテゴリ             | 機能                              | テスト数 | テストファイル   |
| -------------------- | --------------------------------- | -------- | ---------------- |
| **起動・表示**       | アプリ起動                        | 1        | app.spec.ts      |
|                      | サイドバー表示                    | 1        | app.spec.ts      |
|                      | メインコンテンツ表示              | 1        | app.spec.ts      |
| **ナビゲーション**   | サイドバーでの画面遷移            | 1        | app.spec.ts      |
|                      | プロジェクト一覧表示              | 1        | app.spec.ts      |
| **ダッシュボード**   | 月間進捗サマリー                  | 1        | app.spec.ts      |
|                      | 活動ヒートマップ                  | 1        | app.spec.ts      |
|                      | 週間/月間サマリータブ             | 1        | app.spec.ts      |
| **プロジェクト管理** | 一覧表示（進行中/アーカイブタブ） | 1        | projects.spec.ts |
|                      | 既存プロジェクト表示              | 1        | projects.spec.ts |
|                      | カード詳細（稼働率等）            | 1        | projects.spec.ts |
|                      | 追加ボタン（FAB）表示             | 1        | projects.spec.ts |
|                      | 再生ボタン表示                    | 1        | projects.spec.ts |
|                      | メニューボタン表示                | 1        | projects.spec.ts |
|                      | メニュー開閉                      | 1        | projects.spec.ts |
|                      | アーカイブタブ切替                | 1        | projects.spec.ts |
|                      | 進行中タブ切替                    | 1        | projects.spec.ts |
| **設定**             | 設定画面ナビゲーション            | 1        | settings.spec.ts |
|                      | 設定アイコン表示                  | 1        | settings.spec.ts |
|                      | 月間基本時間表示                  | 1        | settings.spec.ts |
|                      | 入力フィールド表示                | 1        | settings.spec.ts |
| **タイマー**         | 再生ボタン表示                    | 1        | timer.spec.ts    |

### 未カバー（14項目）

| カテゴリ             | 機能                   | 理由                               | 優先度 |
| -------------------- | ---------------------- | ---------------------------------- | ------ |
| **プロジェクト管理** | 追加ダイアログ操作     | ダイアログの状態管理が不安定       | 中     |
|                      | プロジェクト編集       | 未実装                             | 中     |
|                      | プロジェクト削除       | 未実装                             | 中     |
|                      | プロジェクトアーカイブ | 未実装                             | 中     |
| **タイマー**         | タイマー開始           | アプリクローズ時のタイムアウト問題 | 中     |
|                      | タイマー停止           | 同上                               | 中     |
|                      | 経過時間表示           | 同上                               | 中     |
|                      | 記録保存確認           | 未実装                             | 中     |
| **データ管理**       | CSVインポート          | ファイルダイアログのテストが困難   | 低     |
|                      | CSVエクスポート        | 同上                               | 低     |
|                      | データバックアップ     | 未実装                             | 低     |
| **その他**           | プロジェクト比較       | 未実装                             | 低     |
|                      | ダークモード切替       | 未実装                             | 低     |
|                      | 言語切替               | 未実装                             | 低     |

### カバレッジサマリー

```
カバー済み:  22 機能
未カバー:   14 機能
-----------------------
合計:       36 機能
カバー率:   約 61%
```

## テスト作成ガイドライン

### セレクタの優先順位

1. `data-testid` 属性（推奨）
2. MUIのクラス名（例: `[class*="MuiDrawer"]`）
3. テキストコンテンツ（例: `text=プロジェクト`）
4. ARIA属性（例: `[aria-label="追加"]`）

### テスト構造

```typescript
test.describe('機能カテゴリ', () => {
  test('should 期待する動作', async () => {
    // Arrange: 準備
    // Act: 操作
    // Assert: 検証
  });
});
```

### 注意事項

- Electronアプリのため `workers: 1` で直列実行
- ビルド時は `ELECTRON=true` が必要（アセットパスのため）
- `beforeAll` でアプリ起動、`afterAll` でクローズ

## テストデータの分離

E2Eテスト実行時（`NODE_ENV=test`）は、本番のuserDataとは別の `.test-user-data/` ディレクトリにデータが保存されます。これにより、テストが本番データを汚すことはありません。

```javascript
// main.js
if (process.env.NODE_ENV === 'test') {
  const testUserDataPath = path.join(__dirname, '.test-user-data');
  app.setPath('userData', testUserDataPath);
}
```
