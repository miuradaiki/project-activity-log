import { STORAGE_KEYS } from '../storageKeys';

describe('STORAGE_KEYS', () => {
  test('should export ACTIVE_PAGE key', () => {
    expect(STORAGE_KEYS.ACTIVE_PAGE).toBe('project_activity_log_active_page');
  });

  test('should export LANGUAGE key', () => {
    expect(STORAGE_KEYS.LANGUAGE).toBe('project_activity_log_language');
  });

  test('should export TEST_SETTINGS key', () => {
    expect(STORAGE_KEYS.TEST_SETTINGS).toBe(
      'project_activity_log_test_settings'
    );
  });

  test('should export TIMER_STATE key', () => {
    expect(STORAGE_KEYS.TIMER_STATE).toBe('project_activity_log_timer_state');
  });

  test('should export TIMER key', () => {
    expect(STORAGE_KEYS.TIMER).toBe('project-activity-timer-state');
  });

  test('should have exactly 5 keys', () => {
    expect(Object.keys(STORAGE_KEYS)).toHaveLength(5);
  });
});
