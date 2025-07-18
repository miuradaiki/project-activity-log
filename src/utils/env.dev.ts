/**
 * 開発環境用の環境変数取得
 * Viteによってビルド時に適切な値に置換される
 */

export const isTestDataEnabled = (): boolean => {
  return import.meta.env.VITE_ENABLE_TEST_DATA === 'true';
};
