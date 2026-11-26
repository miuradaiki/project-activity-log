# UI刷新 デザイン決定事項

- モック: [today-screen-style-directions.html](today-screen-style-directions.html)（既定表示が採用案）、[other-screens-graphite.html](other-screens-graphite.html)（プロジェクト・レポート・設定）

## Session 2026-11-26

- Q: 改善の進め方 → A: UI/UX課題を1から順に対応。UI変更は実装前にモックで合意を取る
- Q: ダッシュボードの活動ヒートマップ → A: 不要（平日のみ稼働で価値が低い）。削除する
- Q: 「今日」画面のレイアウト → A: 計測中タイマー＋今日の集計、1日のタイムライン、プロジェクト一覧の構成
- Q: スタイルの方向性 → A: A · Graphite（ほぼ黒の背景、細い罫線、控えめな紫アクセント、影なし）
- Q: 本文フォント → A: Inter ＋ Noto Sans JP
- Q: 数字フォント → A: Manrope ExtraLight（200）、tabular-nums、字間 -0.04em
- Q: 停止ボタン → A: アウトラインのピル型＋赤い■。赤は停止と目標超過にのみ使う
- Q: ライトモード → A: Graphite Light を採用（背景 #FBFBFC、白カード＋微影、アクセント #5652E0、同じ書体）
- Q: フォントの配布方法 → A: @fontsource でアプリに同梱（オフライン対応）
- Q: プロジェクト・レポート・設定画面 → A: Graphite トーンでモック提示中（CSV取込は設定＞データへ移動案）
