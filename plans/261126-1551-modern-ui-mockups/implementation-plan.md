# Graphite UI 刷新 実装計画

- 決定事項: [design-decisions.md](design-decisions.md)
- モック: [today-screen-style-directions.html](today-screen-style-directions.html) / [other-screens-graphite.html](other-screens-graphite.html)
- ブランチ: `feat/graphite-ui`（`fix/timer-stop-toggle` から分岐）
- 進め方: フェーズごとに TDD（ロジックはテスト先行）→ tsc / lint / jest → コミット

## フェーズ

| #   | 内容                                                                                                                            | 対応課題 | 状態 |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | -------- | ---- |
| 1   | Graphite テーマ（ダーク/ライト）と @fontsource 書体                                                                             | 5        | [x]  |
| 2   | 進捗計算の一本化（設定の基準時間を使用、超過を表現）＋ ProgressMeter                                                            | 2        | [x]  |
| 3   | レイアウト: 固定サイドバー（今日/プロジェクト/レポート/設定、今月の進捗、計測中チップ）、FAB と浮動タイマー廃止、ページヘッダー | 3        | [x]  |
| 4   | 今日画面: 計測カード（空状態から開始可）、今日の集計、タイムライン、プロジェクト行（▶/■ トグル）、今日の記録                    | 1, 3     | [x]  |
| 5   | プロジェクト画面: 表形式、件数付きフィルタ、並び替え、··· メニュー、アーカイブ折りたたみ                                        | 2, 3     | [x]  |
| 6   | レポート画面: KPI 4つ、週別（平日のみ）積み上げ、プロジェクト別。ヒートマップ削除                                               | 3, 5     | [x]  |
| 7   | 設定画面: 稼働時間・外観と言語・データ（CSV 取込を移設し結果を通知）                                                            | 4        | [x]  |
| 8   | 全体確認（ブラウザでダーク/ライト）、docs/design-guidelines.md 更新                                                             | -        | [x]  |
| 9   | 残りの旧 UI: 作業履歴・手動入力・プロジェクト編集・削除と取り消し・通知・テストモード（モック: `remaining-ui-graphite.html`）   | 1        | [x]  |

## 方針

- 既存の `theme.custom`（gradients 等）は型を残し、値をフラットな Graphite 値に置き換えて互換を保つ
- 数字は `Manrope 200 / tabular-nums / -0.04em`、本文は `Inter + Noto Sans JP`
- 赤（error）は停止と目標超過のみ。アクセントは1色（dark #8E8CFF / light #5652E0）
- タイマーのメモ欄はモックにあるが既存機能に保存先がないため対象外（YAGNI）

## 未解決

- なし

## 進捗（2026-11-27）

- フェーズ1〜9 完了（2026-11-27）。`feat/graphite-ui` にコミットし、main 向け PR を作成
- フェーズ9 で対応: alert / confirm / 色付き Snackbar をトーストに統一、削除・アーカイブの「元に戻す」、
  手動入力の日付ずれ（UTC）修正、プロジェクト色の保存、作業履歴の行リスト化、テストモードの行形式化、
  使われていない旧 UI（Timer 一式・TimeTracker・ui/modern 等）の削除
- 未対応: ショートカット一覧ダイアログ（`src/components/shortcuts/` は読み書き権限がなく未変更。
  「Esc：タイマー停止」の行が残っている）
