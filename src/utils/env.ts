/**
 * 環境変数を取得するユーティリティ関数
 * 実際のアプリケーションでは import.meta.env を使用
 * テスト環境では false を返す
 */

export const isTestDataEnabled = (): boolean => {
  try {
    // Vite環境変数にアクセス（ビルド時に適切な値に置換される）
    return import.meta.env.VITE_ENABLE_TEST_DATA === 'true';
  } catch (error) {
    // テスト環境等でimport.metaが使えない場合はfalseを返す
    return false;
  }
};