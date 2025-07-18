import { AppSettings, DEFAULT_SETTINGS } from '../types/settings';

// 設定ファイルのパス
const SETTINGS_FILE_PATH = 'settings.json';

/**
 * 設定を保存
 */
export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await window.electronAPI.writeFile(
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
    try {
      const settingsData =
        await window.electronAPI.readFile(SETTINGS_FILE_PATH);
      // JSONパースを試みる
      try {
        return JSON.parse(settingsData);
      } catch (parseError) {
        console.error(
          'JSONパースエラーが発生しました。設定ファイルをリセットします。',
          parseError
        );
        // 設定ファイルが破損している場合は削除して、デフォルト設定を保存して返す
        try {
          await window.electronAPI.removeFile(SETTINGS_FILE_PATH);
        } catch (removeError) {
          console.error(
            '破損した設定ファイルの削除に失敗しました:',
            removeError
          );
        }
        await saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
    } catch (error: any) {
      // ファイルが存在しない場合はデフォルト設定を保存して返す
      if (error.message && error.message.includes('ENOENT')) {
        await saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      throw error;
    }
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
