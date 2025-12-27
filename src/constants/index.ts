export * from './dateConstants';

export const APP_CONSTANTS = {
  TIMER: {
    MIN_DURATION_MS: 60000, // 1分
    AUTO_STOP_MS: 8 * 60 * 60 * 1000, // 8時間（ミリ秒）
    AUTO_STOP_HOURS: 8,
    SLEEP_THRESHOLD_MS: 10000, // 10秒
  },
  STORAGE: {
    KEYS: {
      PROJECTS: 'projects',
      TIME_ENTRIES: 'timeEntries',
      SETTINGS: 'settings',
      ACTIVE_PAGE: 'activePage',
      TIMER_STATE: 'timerState',
    },
  },
  PROJECT: {
    DEFAULT_MONTHLY_HOURS: 140,
    MIN_MONTHLY_HOURS: 80,
    MAX_MONTHLY_HOURS: 200,
  },
} as const;
