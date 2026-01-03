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
├── app.spec.ts        # 基本的なアプリテスト
├── projects.spec.ts   # プロジェクト管理テスト（予定）
├── timer.spec.ts      # タイマー機能テスト（予定）
└── tsconfig.json      # TypeScript設定
```

## 機能カバレッジ

### カバー済み（22テスト）

| カテゴリ       | 機能                     | テストファイル   |
| -------------- | ------------------------ | ---------------- |
| 起動・表示     | アプリ起動               | app.spec.ts      |
| 起動・表示     | サイドバー表示           | app.spec.ts      |
| 起動・表示     | メインコンテンツ表示     | app.spec.ts      |
| ナビゲーション | 画面遷移                 | app.spec.ts      |
| ダッシュボード | 月間進捗サマリー         | app.spec.ts      |
| ダッシュボード | 活動ヒートマップ         | app.spec.ts      |
| ダッシュボード | 週間/月間サマリー        | app.spec.ts      |
| プロジェクト   | 一覧表示（タブ切り替え） | projects.spec.ts |
| プロジェクト   | カード詳細表示           | projects.spec.ts |
| プロジェクト   | 追加ボタン（FAB）        | projects.spec.ts |
| プロジェクト   | アクションメニュー       | projects.spec.ts |
| タイマー       | 再生ボタン表示           | timer.spec.ts    |
| 設定           | 設定画面ナビゲーション   | settings.spec.ts |
| 設定           | 月間基本時間表示         | settings.spec.ts |

### 未カバー

| カテゴリ     | 機能               | 優先度 |
| ------------ | ------------------ | ------ |
| プロジェクト | 追加ダイアログ操作 | 中     |
| プロジェクト | 編集               | 中     |
| プロジェクト | 削除               | 中     |
| タイマー     | 開始/停止操作      | 中     |
| タイマー     | 記録保存           | 中     |
| データ管理   | CSVインポート      | 低     |
| データ管理   | CSVエクスポート    | 低     |
| その他       | プロジェクト比較   | 低     |

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
