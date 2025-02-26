import { AppSettings, DEFAULT_SETTINGS } from '../types/settings';

// 設定ファイルのパス
const SETTINGS_FILE_PATH = 'settings.json';

/**
 * 設定を保存
 */
export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await window.electronAPI.writeDataFile(
      SETTINGS_FILE_PATH,
      JSON.stringify(settings, null, 2)
    );
  } catch (error) {
    console.error('設定の保存に失敗しました:', error);
    throw error;
  }
};

/**
 * 設定を読み込み
 */
export const loadSettings = async (): Promise<AppSettings> => {
  try {
    const settingsData = await window.electronAPI.readDataFile(SETTINGS_FILE_PATH);
    if (!settingsData) {
      // 設定ファイルが存在しない場合はデフォルト設定を保存して返す
      await saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(settingsData);
  } catch (error) {
    console.error('設定の読み込みに失敗しました:', error);
    // エラーが発生した場合はデフォルト設定を返す
    return DEFAULT_SETTINGS;
  }
};

/**
 * 特定の設定項目を更新
 */
export const updateSettings = async (
  updater: (currentSettings: AppSettings) => AppSettings
): Promise<AppSettings> => {
  try {
    const currentSettings = await loadSettings();
    const updatedSettings = updater(currentSettings);
    await saveSettings(updatedSettings);
    return updatedSettings;
  } catch (error) {
    console.error('設定の更新に失敗しました:', error);
    throw error;
  }
};

/**
 * 設定をリセット
 */
export const resetSettings = async (): Promise<AppSettings> => {
  try {
    await saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('設定のリセットに失敗しました:', error);
    throw error;
  }
};
