# テスト環境構築ドキュメント

## 概要

このドキュメントでは、Project Activity Logアプリケーションに導入したテスト環境について説明します。t-wada（和田卓人）氏が推奨する「テストファーストによる安全なリファクタリング」アプローチに基づき、レガシーコードを安全に改善するための基盤を構築しました。

## 導入の背景

### 現状の課題
- テストが一切存在しない状態（テストカバレッジ0%）
- App.tsxが549行の巨大コンポーネントとなっている
- 責務が分離されておらず、保守性が低い
- リファクタリング時にデグレードが発生するリスクが高い

### t-wadaアプローチの採用理由
1. **「テストがないコードはレガシーコード」**の原則
2. **特性テスト（Characterization Test）**による現状動作の保護
3. **安全なリファクタリング**の実現

## 技術スタック

### テストフレームワーク
- **Jest 30.0.3**: JavaScriptテストフレームワーク
- **React Testing Library 16.3.0**: Reactコンポーネントのテスト
- **@testing-library/user-event 14.6.1**: ユーザーインタラクションのシミュレーション
- **ts-jest 29.4.0**: TypeScriptサポート
- **jest-environment-jsdom 30.0.2**: ブラウザ環境のシミュレーション

### 主要な設定ファイル
- `jest.config.js`: Jest設定
- `src/setupTests.ts`: テスト環境のセットアップ
- `.github/workflows/test.yml`: CI/CD設定

## ファイル構成

```
├── docs/
│   └── testing-setup.md              # このドキュメント
├── src/
│   ├── __mocks__/
│   │   └── electron.ts               # Electron APIのモック
│   ├── __tests__/
│   │   └── setupTest.test.tsx        # 環境確認テスト
│   ├── components/
│   │   └── timer/
│   │       └── __tests__/
│   │           └── Timer.test.tsx    # Timerコンポーネントの特性テスト
│   ├── hooks/
│   │   └── __tests__/
│   │       └── useStorage.test.tsx   # useStorageフックの特性テスト
│   └── setupTests.ts                 # テスト環境設定
├── .github/
│   └── workflows/
│       └── test.yml                  # GitHub Actions CI設定
├── jest.config.js                    # Jest設定ファイル
└── coverage/                         # カバレッジレポート（生成される）
```

## テスト環境の特徴

### 1. Electron環境のモック

Electronアプリケーションのテストのため、`src/__mocks__/electron.ts`でElectron APIを完全にモック化：

```typescript
export class MockElectronAPI {
  // プロジェクトデータの管理
  loadProjects = jest.fn()
  saveProjects = jest.fn()
  
  // タイムエントリーの管理
  loadTimeEntries = jest.fn()
  saveTimeEntries = jest.fn()
  
  // 設定の管理
  loadSettings = jest.fn()
  saveSettings = jest.fn()
  
  // ファイル操作
  exportCSV = jest.fn()
  importCSV = jest.fn()
  showOpenDialog = jest.fn()
  
  // タイマー・通知機能
  updateTrayTimer = jest.fn()
  showNotification = jest.fn()
}
```

### 2. ブラウザAPIのモック

MUIやRechartsで使用されるブラウザAPIのモック化：
- `ResizeObserver`
- `IntersectionObserver`
- `matchMedia`
- `Notification`
- `localStorage`

### 3. Vite環境変数のモック

`import.meta.env`のモック化により、テスト環境でのVite環境変数をサポート。

### 4. 特性テスト（Characterization Test）

現在の動作を保護するため、以下のコンポーネント・機能をテスト：

#### useStorageフック
- データの初期化
- プロジェクトのCRUD操作
- タイムエントリーのCRUD操作
- 設定の管理
- データ整合性チェック

#### Timerコンポーネント
- タイマーの開始・停止
- 時間表示の正確性
- 8時間制限機能
- デスクトップ通知
- プロップスの処理

## 設定詳細

### Jest設定 (`jest.config.js`)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
}
```

### NPMスクリプト

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:ci": "jest --ci --coverage --watchAll=false"
}
```

### GitHub Actions CI

Node.js 18.x と 20.x でのマトリックステスト、型チェック、カバレッジレポートの自動生成を実行。

## セキュリティ考慮事項

### テストデータの分離
- 本番データとテストデータの完全分離
- `MockElectronAPI.reset()`による各テスト間のデータクリア
- LocalStorageの適切なモック化

### 機密情報の除外
- カバレッジ対象から型定義ファイルを除外
- エントリーポイントファイルを除外
- 設定ファイルの適切な管理

## 今後の展開

### Phase 1完了: テスト基盤構築 ✅
- [x] Jest + React Testing Library設定
- [x] Electronモック環境構築
- [x] 特性テスト作成
- [x] CI/CD設定

### Phase 2予定: ドメインロジック抽出
- [ ] タイマービジネスロジックの抽出
- [ ] プロジェクト管理ロジックの統一
- [ ] 稼働率計算の共通化

### Phase 3予定: 状態管理改善
- [ ] Context APIによる状態分離
- [ ] カスタムフックへのロジック移行
- [ ] プロップドリリング解消

### Phase 4予定: コンポーネント分離
- [ ] App.tsxの責務分離
- [ ] 表示ロジックとビジネスロジックの分離
- [ ] 共通コンポーネントの抽出

## 参考資料

- [Jest公式ドキュメント](https://jestjs.io/)
- [React Testing Library公式ドキュメント](https://testing-library.com/docs/react-testing-library/intro/)
- [t-wada「レガシーコードからの脱却」](https://www.amazon.co.jp/dp/4873118867)
- [Working Effectively with Legacy Code](https://www.amazon.com/dp/0131177052)