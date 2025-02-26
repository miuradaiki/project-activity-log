# Project Activity Log

プロジェクトの稼働管理を行うためのデスクトップアプリケーションです。作業時間の記録や管理を効率的に行うことができます。

## 機能一覧

### 実装済み機能

#### プロジェクト管理
- プロジェクトの追加
- プロジェクトの編集
- プロジェクトの削除（削除確認機能付き）
- プロジェクト一覧の表示
- プロジェクトごとの稼働率設定（月間の工数配分）
- プロジェクトごとの目標時間管理
- プロジェクトのアーカイブ機能

#### 時間トラッキング
- プロジェクトごとの作業時間記録
- リアルタイムタイマー機能
  - スリープモード時の時間継続記録
  - 8時間経過時の自動停止機能
  - 自動停止時のデスクトップ通知
- 作業時間の手動入力機能
- 作業履歴の表示と管理
- 作業記録の編集機能
- 作業記録の削除（削除確認機能付き）
- CSVファイルからの作業記録インポート機能（安全なバックアップ機能付き）

#### データ分析・ダッシュボード
- 日次サマリー
  - 合計作業時間
  - 作業したプロジェクト数
  - 最も作業したプロジェクト
- 週次サマリー
  - 日別作業時間のバーチャート
  - プロジェクト別作業時間のドーナツチャート（パーセンテージ表示付き）
- 月次サマリー
  - 週別作業時間の推移グラフ
  - 年月選択によるデータ履歴表示
  - 月間合計作業時間の表示

#### プロジェクト進捗管理
- プロジェクトごとの進捗状況表示
  - 月間目標時間に対する実績表示
  - プログレスバーによる視覚的な進捗表示
  - 進捗状況に応じた警告表示（90%以上で警告、100%以上で超過警告）
- プロジェクト操作メニュー
  - プロジェクト編集
  - アーカイブ/アーカイブ解除
  - 月間目標時間の調整
- 進捗のフィルタリングとソート機能
  - 状態別フィルタリング（すべて、進行中、注意、完了）
  - 表示順の並べ替え（名前順、進捗順、残り時間順）
  - プロジェクト検索機能
- 稼働率の管理
  - スライダーによる直感的な稼働率設定
  - 全プロジェクトの合計稼働率チェック（100%を超過しないよう制御）
  - 月間予定時間の自動計算

#### アプリケーション設定
- 月間基準時間のカスタマイズ
  - スライダーやテキスト入力による基準時間設定（80～200時間）
  - デフォルト設定へのリセット機能
  - 設定の永続化
- 設定変更の即時反映
  - プロジェクト進捗ビューでの目標時間計算への反映
  - 目標時間調整ダイアログでの設定値表示

#### データ永続化
- プロジェクトデータのローカル保存
- 作業時間記録の永続化
- アプリケーション設定の永続化
- アプリケーション再起動時のデータ復元

### 実装予定の機能

#### 進捗管理の強化
- 残り時間の予測機能
  - 現在の進捗から月末までの予測
  - 1日あたりの推奨作業時間の計算
- 詳細な進捗レポート
  - 週次の推移グラフ
  - 目標達成予測日の表示
- 通知機能
  - 目標時間超過の警告
  - 日次の作業時間アラート

#### データ活用
- データのエクスポート機能
  - CSV形式でのエクスポート
  - カスタマイズ可能なレポート形式
- 詳細な分析機能
  - カスタム期間での集計
  - プロジェクト比較分析
  - トレンド分析

#### ユーザビリティ向上
- ショートカットキーの追加
- カスタマイズ可能なダッシュボード
- ダークモード対応
- モバイル対応（レスポンシブデザイン）

## 技術スタック

### フレームワーク・ライブラリ
- Electron（デスクトップアプリケーション）
- React（UIフレームワーク）
- TypeScript（型安全な開発）
- Material-UI（UIコンポーネント）
- Recharts（データ可視化）
- Vite（開発環境・ビルドツール）

### 開発ツール
- Node.js (v16以上)
- npm (v7以上)

## アプリケーション構成

### アーキテクチャ
- メインプロセス（Node.js環境）
  - ファイルシステム操作
  - アプリケーションのライフサイクル管理
  - IPCブリッジの提供
- レンダラープロセス（ブラウザ環境）
  - UIの描画
  - ユーザーインタラクションの処理
  - データの表示と管理

### プロジェクト構造
```
project-activity-log/
├── src/
│   ├── components/     # Reactコンポーネント
│   │   ├── ProjectList.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── DeleteConfirmDialog.tsx
│   │   ├── settings/   # 設定関連コンポーネント
│   │   ├── timer/      # タイマー関連コンポーネント
│   │   ├── dashboard/  # ダッシュボード関連コンポーネント
│   │   └── ui/         # 共通UIコンポーネント
│   ├── contexts/       # Reactコンテキスト
│   │   └── SettingsContext.tsx # 設定コンテキスト
│   ├── hooks/          # カスタムフック
│   │   ├── useStorage.ts   # データ永続化フック
│   │   └── useSettings.ts  # 設定管理フック
│   ├── types/          # 型定義
│   │   ├── electron.d.ts   # Electron API型定義
│   │   └── settings.ts     # 設定の型定義
│   ├── utils/
│   │   ├── storage.ts      # ストレージ操作ユーティリティ
│   │   ├── analytics.ts    # データ分析ユーティリティ
│   │   └── settingsUtils.ts # 設定管理ユーティリティ
│   ├── App.tsx         # メインコンポーネント
│   └── main.tsx        # エントリーポイント
├── main.js             # Electronメインプロセス
├── preload.js          # プリロードスクリプト
├── storageUtils.js     # ストレージユーティリティ
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## セットアップ方法

### 前提条件
- Node.js (v16以上)
- npm (v7以上)

### インストール手順

1. リポジトリのクローン
```bash
git clone [repository-url]
cd project-activity-log
```

2. 依存パッケージのインストール
```bash
npm install
```

### 開発環境の起動

開発環境は以下のいずれかの方法で起動できます：

#### 方法1: 統合コマンド（推奨）
```bash
npm run electron:dev
```

#### 方法2: 個別起動
1. Vite開発サーバーの起動（ターミナル1）
```bash
npm run dev
```

2. Electronアプリケーションの起動（ターミナル2）
```bash
npm run start
```

### ビルド
```bash
npm run electron:build
```

## 機能の使用方法

### プロジェクト管理
1. プロジェクトの作成
   - 「プロジェクトを追加」ボタンをクリック
   - プロジェクト名と説明を入力
   - スライダーで稼働率を設定（0-100%）
   - 保存をクリック

2. プロジェクトの編集
   - プロジェクトリストの編集アイコンをクリック
   - 情報を更新して保存

3. プロジェクトの削除
   - プロジェクトリストの削除アイコンをクリック
   - 確認ダイアログで「削除」をクリック

### プロジェクト進捗管理
1. 進捗表示の切替とフィルタリング
   - プロジェクト一覧のタブでフィルタリング（すべて/進行中/注意/完了）
   - ドロップダウンでソート方法を選択（名前/進捗率/残り時間）
   - 検索ボックスでプロジェクト名や説明を検索

2. プロジェクトのアクション
   - 各プロジェクトカードの「その他」ボタンをクリック
   - 編集、アーカイブ、月間目標時間調整などの操作を選択

3. 月間目標時間の調整
   - プロジェクトカードの「その他」からメニューを開き「月間目標時間の調整」を選択
   - スライダーで稼働率を調整（自動的に月間目標時間も計算）
   - 「更新」ボタンで保存

### 時間トラッキング
1. 作業時間の記録（タイマー機能）
   - プロジェクトリストから対象プロジェクトの開始ボタンをクリック
   - タイマーが開始され、経過時間が表示
   - 停止ボタンで作業を終了

2. 作業時間の手動入力
   - 「作業時間を手動入力」ボタンをクリック
   - プロジェクト、日付、開始・終了時間を入力
   - 説明を入力（オプション）
   - 保存をクリック

3. 作業履歴の管理
   - 作業履歴タブでタイムライン表示とリスト表示を切替
   - 作業記録の編集や削除が可能
   - フィルタリングやプロジェクト検索で絞り込み

4. CSVデータのインポート
   - 「CSVインポート」ボタンをクリック
   - 自動的にバックアップを作成
   - 新規プロジェクトの自動作成
   - 作業時間記録の追加
   - インポート失敗時は自動的にバックアップから復元

   CSVファイルの形式:
   ```csv
   date,start_time,end_time,duration_minutes,project_name,project_description,notes
   2025/2/3,10:35:42,11:28:19,53,プロジェクト名,説明,メモ
   ```

### アプリケーション設定
1. 月間基準時間の設定
   - 設定画面に移動
   - スライダーまたはテキストフィールドで月間基準時間を調整（80～200時間）
   - 「保存」ボタンで設定を適用
   - 「デフォルトに戻す」ボタンで140時間に戻す

### ダッシュボード
1. 日次サマリー
   - 本日の合計作業時間
   - 作業したプロジェクト数
   - 最も作業時間の長いプロジェクト

2. 週次サマリー
   - 日別の作業時間推移グラフ
   - プロジェクト別の作業時間分布

3. 月次サマリー
   - 週別の作業時間推移
   - 月間の合計作業時間
   - プロジェクト別の作業時間詳細

## データの保存とバックアップ
- データの保存場所
  - アプリケーションのユーザーデータディレクトリ
  - プロジェクトデータ: `[userData]/data/projects.json`
  - 作業時間記録: `[userData]/data/timeEntries.json`
  - アプリケーション設定: `[userData]/settings.json`
  - バックアップ: `[userData]/backups/[timestamp]/`
- 自動保存機能
  - データの変更時に自動的に保存
  - アプリケーション再起動時に自動的に復元
- バックアップ機能
  - データ変更前の自動バックアップ
  - CSVインポート時の自動バックアップ
  - バックアップからの復元機能

## 実装予定の機能とアプリケーション改善課題

### 機能拡張
- 作業時間の目標設定と進捗管理
  - プロジェクトごとの目標時間設定
  - 進捗状況の可視化
  - 目標達成アラート
- データエクスポート機能
  - CSV/Excel形式でのエクスポート
  - カスタマイズ可能なレポート形式
- 詳細なレポーティング機能
  - カスタム期間での集計
  - プロジェクトの比較分析
  - トレンド分析

### UX/UI改善
- ダークモードの実装
- タイマー実行中のアプリケーション終了警告
- 通知機能の強化
  - 作業時間のリマインダー
  - 休憩時間の提案
- レスポンシブデザインの最適化

### パフォーマンス最適化
- 大量データ処理の効率化
  - ページネーションの実装
  - 仮想スクロールの導入
  - データのキャッシュ戦略
- メモ化による再描画の最適化
- バックグラウンド処理の改善

### データ管理
- データの整合性チェック機能
- プロジェクトのアーカイブ機能

## 開発ガイドライン

### コードスタイル
- TypeScriptの型定義を適切に行う
- コンポーネントは機能単位で分割
- Material-UIのコンポーネントを活用
- カスタムフックを活用した状態管理

### Electron固有の考慮事項
- メインプロセスとレンダラープロセスの適切な分離
- IPCを介した安全なプロセス間通信
- プリロードスクリプトを使用したAPIの公開
- コンテキスト分離（contextIsolation）の有効化

### コミットガイドライン
- コミットメッセージは具体的に記述
- 機能単位でコミットを分割
- 変更内容が分かりやすいコミットメッセージを心がける

## ライセンス

MIT License
