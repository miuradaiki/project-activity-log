# テスト実行ガイド

## 概要

このドキュメントでは、Project Activity Logアプリケーションでのテスト実行方法について詳しく説明します。開発者がテストを効率的に実行し、品質を維持するための手順を提供します。

## 前提条件

### 必要なソフトウェア
- Node.js (v16以上推奨)
- npm (v7以上推奨)

### 初期セットアップ
```bash
# 依存関係のインストール
npm install
```

## テスト実行コマンド

### 基本的なテスト実行

#### 全テスト実行
```bash
npm test
```
すべてのテストファイルを実行します。

#### ウォッチモード
```bash
npm run test:watch
```
ファイルの変更を監視し、関連するテストを自動実行します。開発中に便利です。

#### カバレッジ付きテスト実行
```bash
npm run test:coverage
```
テストカバレッジレポートを生成しながらテストを実行します。

#### CI用テスト実行
```bash
npm run test:ci
```
継続的インテグレーション環境用の設定でテストを実行します（ウォッチモード無効、カバレッジ付き）。

### 特定のテスト実行

#### 特定のファイルをテスト
```bash
# 特定のテストファイルのみ実行
npm test -- --testPathPatterns=Timer.test.tsx

# 特定のディレクトリのテスト実行
npm test -- src/hooks/__tests__/
```

#### 特定のテストケースを実行
```bash
# テスト名で絞り込み
npm test -- --testNamePattern="タイマー"

# describe文で絞り込み
npm test -- --testNamePattern="Timer コンポーネントの特性テスト"
```

#### デバッグモード
```bash
# Verbose出力でテスト実行
npm test -- --verbose

# 失敗したテストのみ再実行
npm test -- --onlyFailures
```

## テストファイルの構成

### ディレクトリ構造
```
src/
├── __tests__/                    # アプリケーション全体のテスト
│   └── setupTest.test.tsx        # テスト環境の動作確認
├── components/
│   └── timer/
│       └── __tests__/
│           └── Timer.test.tsx    # Timerコンポーネントのテスト
└── hooks/
    └── __tests__/
        └── useStorage.test.tsx   # useStorageフックのテスト
```

### テストファイルの命名規則
- `*.test.tsx` - Reactコンポーネントのテスト
- `*.test.ts` - ユーティリティ・フックのテスト
- `*.spec.ts` - より詳細な仕様テスト（将来用）

## 実行例とトラブルシューティング

### 正常な実行例

#### 成功時の出力
```bash
$ npm test

PASS src/__tests__/setupTest.test.tsx
  テスト環境のセットアップ
    ✓ React Testing Libraryが正常に動作する (14 ms)
    ✓ Electron APIのモックが利用可能 (1 ms)
    ✓ MockElectronAPIのリセット機能が動作する
    ✓ ブラウザAPIのモックが動作する (1 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        0.959 s
```

#### カバレッジレポート例
```bash
$ npm run test:coverage

 PASS  src/__tests__/setupTest.test.tsx
----------------------------|---------|----------|---------|---------|-------------------
File                       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------------------------|---------|----------|---------|---------|-------------------
All files                  |    1.25 |     0.39 |    1.02 |     1.2 |                   
 src                       |       0 |        0 |       0 |       0 |                   
  App.tsx                  |       0 |        0 |       0 |       0 | 1-546             
 src/components/timer      |   20.13 |    29.82 |   15.78 |   20.28 |                   
  Timer.tsx                |   96.66 |    94.44 |     100 |     100 | 25                
----------------------------|---------|----------|---------|---------|-------------------
```

### よくある問題と解決方法

#### 1. import.meta エラー
```bash
SyntaxError: Cannot use 'import.meta' outside a module
```

**解決方法**: `setupTests.ts`でimport.metaをモック化済みです。このエラーが出る場合は、新しいファイルでVite固有の環境変数を使用している可能性があります。

#### 2. Electron APIが未定義エラー
```bash
TypeError: Cannot read properties of undefined (reading 'loadProjects')
```

**解決方法**: `setupTests.ts`でElectron APIをモック化済みです。新しいElectron APIを使用する場合は、`src/__mocks__/electron.ts`にモックを追加してください。

#### 3. MUI関連のエラー
```bash
TypeError: Cannot read properties of undefined (reading 'ResizeObserver')
```

**解決方法**: `setupTests.ts`でResizeObserverなどをモック化済みです。追加のブラウザAPIが必要な場合は、同ファイルにモックを追加してください。

#### 4. タイムゾーン関連のテスト失敗
```bash
Expected: "00:01:00"
Received: "00:01:01"
```

**解決方法**: テストで`jest.useFakeTimers()`と`jest.setSystemTime()`を使用して時刻を固定してください。

```typescript
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2024-01-01T10:00:00.000Z'));
});

afterEach(() => {
  jest.useRealTimers();
});
```

## カバレッジレポートの見方

### HTML レポート
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

### コンソール出力の説明
- **% Stmts**: 実行された文の割合
- **% Branch**: 実行された分岐の割合
- **% Funcs**: 実行された関数の割合
- **% Lines**: 実行された行の割合
- **Uncovered Line #s**: カバーされていない行番号

### 目標値
- **ユニットテスト**: 80%以上
- **重要なビジネスロジック**: 90%以上
- **UI表示コンポーネント**: 60%以上（視覚的テストで補完）

## デバッグ手法

### 1. テストデバッグ
```bash
# Node.js デバッガーを使用
node --inspect-brk node_modules/.bin/jest --runInBand --no-cache Timer.test.tsx
```

### 2. コンポーネントのデバッグ
```typescript
import { screen, render } from '@testing-library/react';

test('デバッグ例', () => {
  render(<Timer {...props} />);
  
  // DOM構造を出力
  screen.debug();
  
  // 特定の要素を出力
  const element = screen.getByRole('button');
  console.log(element.outerHTML);
});
```

### 3. ユーザーイベントのデバッグ
```typescript
import userEvent from '@testing-library/user-event';

test('ユーザーイベントデバッグ', async () => {
  const user = userEvent.setup({ delay: null });
  
  // ポインターイベントの詳細ログ
  await user.click(button, { detail: 1 });
});
```

## 継続的インテグレーション

### GitHub Actions
プルリクエスト作成時とmainブランチへのpush時に自動でテストが実行されます。

```yaml
# .github/workflows/test.yml
name: Test
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
```

### ローカルでCI環境をシミュレート
```bash
# CI環境と同じ条件でテスト実行
npm run test:ci

# 型チェックも同時に実行
npx tsc --noEmit && npm run test:ci
```

## テスト作成のベストプラクティス

### 1. テストファイルの構成
```typescript
describe('コンポーネント名 の特性テスト', () => {
  // セットアップ
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('機能グループ名', () => {
    test('具体的な動作の説明', () => {
      // Given (前提条件)
      // When (実行)
      // Then (期待結果)
    });
  });
});
```

### 2. モックの使用
```typescript
// 関数のモック
const mockCallback = jest.fn();

// モジュールのモック
jest.mock('../utils/api', () => ({
  fetchData: jest.fn(),
}));

// Electronモックの使用
const mockAPI = MockElectronAPI.getInstance();
```

### 3. 非同期テスト
```typescript
test('非同期処理のテスト', async () => {
  await act(async () => {
    await user.click(button);
  });
  
  expect(screen.getByText('結果')).toBeInTheDocument();
});
```

## パフォーマンス最適化

### テスト実行速度の向上
```bash
# 並列実行数を制限
npm test -- --maxWorkers=4

# キャッシュをクリア
npm test -- --clearCache

# 変更されたファイルのみテスト
npm test -- --onlyChanged
```

### メモリ使用量の最適化
```bash
# メモリ使用量を制限
npm test -- --logHeapUsage --maxWorkers=2
```

## まとめ

このテスト実行ガイドにより、開発者は効率的にテストを実行し、コードの品質を維持できます。問題が発生した場合は、トラブルシューティングセクションを参照し、それでも解決しない場合は開発チームに相談してください。

定期的なテスト実行により、リファクタリング時の安全性を確保し、アプリケーションの品質向上を目指しましょう。