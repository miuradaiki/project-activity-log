# タイマー日跨ぎ記録修正ログ

## 問題概要

**発生日時**: 2025-09-27
**問題内容**: タイマーで日を跨いだ記録を行うと、単一のエントリーとして保存され、日別統計が正しく計算されない。手動登録では日跨ぎ対応が実装済みだが、タイマー機能には未実装。

## 関連ログ

- [cross_date_entry_fix_20250918.md](./cross_date_entry_fix_20250918.md) - 手動登録の日跨ぎ対応実装

## 原因分析

### 根本原因

`App.tsx`の`handleStopTimer`関数で、タイマー停止時に単一の`TimeEntry`を作成していました。日跨ぎを検知して分割する処理が実装されていませんでした。

```typescript
// 修正前の問題コード
const newTimeEntry: TimeEntry = {
  id: uuidv4(),
  projectId: activeProject.id,
  startTime,    // 例: 2025-01-26 23:50
  endTime,      // 例: 2025-01-27 00:10
  description: '',
  createdAt: endTime,
  updatedAt: endTime,
};
```

### 手動登録との差異

手動登録（`ManualTimeEntryForm.tsx`）では以下の処理が実装済み：

1. 日跨ぎ検知（`isSameDay`）
2. 自動分割機能（`createSplitEntries`）
3. 複数エントリーの生成

タイマーではこれらの機能が欠落していました。

## 実装した解決策

### 1. 共通ユーティリティの作成

**ファイル**: `src/utils/timeEntryUtils.ts`

```typescript
export const createSplitEntries = (
  projectId: string,
  startDateTime: Date,
  endDateTime: Date,
  description: string = ''
): TimeEntry[]
```

機能：
- 同日内: 単一エントリーを返す
- 日跨ぎ: 日別に分割したエントリー配列を返す
- 各日の境界は23:59:59.999で区切る

### 2. タイマー機能の修正

**ファイル**: `src/App.tsx`

```typescript
// 修正後
const newTimeEntries = createTimerEntries(
  activeProject.id,
  startTime,
  endTime,
  ''
);
setTimeEntries((prev) => [...prev, ...newTimeEntries]);
```

変更内容：
- 単一エントリー作成から複数エントリー作成に変更
- `createTimerEntries`ユーティリティ関数を使用
- 分割されたエントリーを全て保存

### 3. コード重複の解消

**ファイル**: `src/components/timer/ManualTimeEntryForm.tsx`

- ローカルの`createSplitEntries`関数を削除
- 共通ユーティリティをインポートして使用
- タイマーと手動登録で同じロジックを共有

## テストケース

### 1. 同日内のタイマー記録
- 開始: 10:00
- 終了: 11:00
- 期待結果: 1つのエントリー（10:00 - 11:00）

### 2. 日跨ぎタイマー記録
- 開始: 23:50
- 終了: 翌日00:10
- 期待結果: 2つのエントリー
  - 1日目: 23:50 - 23:59:59.999
  - 2日目: 00:00:00.000 - 00:10

### 3. 複数日跨ぎタイマー記録
- 開始: 金曜日 23:00
- 終了: 土曜日 02:00
- 期待結果: 2つのエントリー
  - 金曜日: 23:00 - 23:59:59.999
  - 土曜日: 00:00:00.000 - 02:00

## 修正されたファイル

1. **`/src/utils/timeEntryUtils.ts`** (新規作成)
   - 日跨ぎ分割の共通ロジック
   - `createSplitEntries`関数
   - `createTimerEntries`関数

2. **`/src/App.tsx`**
   - `createTimerEntries`のインポート追加
   - `handleStopTimer`関数の修正

3. **`/src/components/timer/ManualTimeEntryForm.tsx`**
   - 共通ユーティリティのインポート追加
   - ローカル`createSplitEntries`関数の削除
   - 不要なインポート（`addDays`）の削除

## ビルドテスト

```bash
npm run build
# ✓ built in 6.46s (成功)
```

## データ互換性

### 既存データへの影響

**✅ 影響なし**: 既存の`TimeEntry`データ構造は変更なし

- `startTime`, `endTime`は引き続きISO文字列で管理
- 既存の日跨ぎ記録も正常に表示可能
- データ形式の変更なし

### ストレージ構造

```typescript
// 変更なし
export interface TimeEntry {
  id: string;
  projectId: string;
  startTime: string;  // ISO string
  endTime: string;    // ISO string
  description: string;
  createdAt: string;
  updatedAt: string;
}
```

## 改善効果

1. **統計の正確性向上**
   - 日別統計が正しく計算される
   - 月別・週別集計の精度向上

2. **コードの保守性向上**
   - タイマーと手動登録で共通ロジックを使用
   - コード重複の解消
   - 将来の修正が容易に

3. **ユーザー体験の一貫性**
   - タイマーと手動登録で同じ挙動
   - 予期しない動作の削減

## リスク評価

- **低リスク**: 既存データへの影響なし
- **後方互換性**: 完全に維持
- **パフォーマンス**: 分割処理は軽量で影響なし

## 今後の改善点

1. **自動テストの追加**
   - 日跨ぎ処理の単体テスト
   - エッジケースのテスト

2. **UI/UX向上**
   - 分割されたエントリーの視覚的グループ化
   - 日跨ぎ記録時の通知表示

3. **設定オプション**
   - 日跨ぎ分割の有効/無効切り替え
   - カスタム分割時刻の設定（深夜0時以外）

## 完了確認

- [x] 問題の根本原因特定
- [x] 解決策の実装
- [x] ビルドテスト実行
- [x] コード重複の解消
- [x] ドキュメント作成
- [x] データ互換性確認

**影響範囲**: タイマー機能、手動登録機能
**データ影響**: なし（完全後方互換）
