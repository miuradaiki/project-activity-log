import { useEffect } from 'react';

export interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  disabled?: boolean;
  description?: string;
}

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = (
  shortcuts: Shortcut[],
  options: UseKeyboardShortcutsOptions = {}
): void => {
  const { enabled = true, preventDefault = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const matchedShortcut = shortcuts.find((shortcut) => {
        if (shortcut.disabled) return false;
        if (shortcut.key !== event.key) return false;

        // 修飾キーのチェック
        if (
          shortcut.ctrlKey !== undefined &&
          shortcut.ctrlKey !== event.ctrlKey
        )
          return false;
        if (shortcut.altKey !== undefined && shortcut.altKey !== event.altKey)
          return false;
        if (
          shortcut.shiftKey !== undefined &&
          shortcut.shiftKey !== event.shiftKey
        )
          return false;
        if (
          shortcut.metaKey !== undefined &&
          shortcut.metaKey !== event.metaKey
        )
          return false;

        // ctrlKeyが指定されていない場合、ctrlKeyが押されていないことを確認
        if (shortcut.ctrlKey === undefined && event.ctrlKey) return false;
        if (shortcut.altKey === undefined && event.altKey) return false;

        return true;
      });

      if (matchedShortcut) {
        if (preventDefault) {
          event.preventDefault();
        }
        matchedShortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled, preventDefault]);
};
