// アプリケーション設定の型定義
export interface AppSettings {
  // 稼働時間の基準設定
  workHours: {
    baseMonthlyHours: number; // 月間基準時間（デフォルト: 140時間）
  };
  // その他の設定項目はここに追加できます
  // 例: テーマ設定、通知設定など
}

// デフォルト設定
export const DEFAULT_SETTINGS: AppSettings = {
  workHours: {
    baseMonthlyHours: 140,
  },
};
