import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts, Shortcut } from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  const dispatchKeyboardEvent = (
    key: string,
    options: Partial<globalThis.KeyboardEventInit> = {}
  ) => {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...options,
    });
    window.dispatchEvent(event);
    return event;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('基本的なショートカット', () => {
    it('キーが押されたときにアクションを実行する', () => {
      const action = jest.fn();
      const shortcuts: Shortcut[] = [{ key: 'a', action }];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      dispatchKeyboardEvent('a');

      expect(action).toHaveBeenCalledTimes(1);
    });

    it('異なるキーが押されたときはアクションを実行しない', () => {
      const action = jest.fn();
      const shortcuts: Shortcut[] = [{ key: 'a', action }];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      dispatchKeyboardEvent('b');

      expect(action).not.toHaveBeenCalled();
    });

    it('複数のショートカットを登録できる', () => {
      const action1 = jest.fn();
      const action2 = jest.fn();
      const shortcuts: Shortcut[] = [
        { key: 'a', action: action1 },
        { key: 'b', action: action2 },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      dispatchKeyboardEvent('a');
      dispatchKeyboardEvent('b');

      expect(action1).toHaveBeenCalledTimes(1);
      expect(action2).toHaveBeenCalledTimes(1);
    });
  });

  describe('修飾キー', () => {
    it('Ctrl+キーの組み合わせを処理する', () => {
      const action = jest.fn();
      const shortcuts: Shortcut[] = [{ key: '1', ctrlKey: true, action }];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      // Ctrlなしでは発火しない
      dispatchKeyboardEvent('1');
      expect(action).not.toHaveBeenCalled();

      // Ctrl+1で発火
      dispatchKeyboardEvent('1', { ctrlKey: true });
      expect(action).toHaveBeenCalledTimes(1);
    });

    it('Alt+キーの組み合わせを処理する', () => {
      const action = jest.fn();
      const shortcuts: Shortcut[] = [{ key: 'l', altKey: true, action }];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      // Altなしでは発火しない
      dispatchKeyboardEvent('l');
      expect(action).not.toHaveBeenCalled();

      // Alt+lで発火
      dispatchKeyboardEvent('l', { altKey: true });
      expect(action).toHaveBeenCalledTimes(1);
    });

    it('Shift+キーの組み合わせを処理する', () => {
      const action = jest.fn();
      const shortcuts: Shortcut[] = [{ key: 'S', shiftKey: true, action }];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      dispatchKeyboardEvent('S', { shiftKey: true });
      expect(action).toHaveBeenCalledTimes(1);
    });

    it('複数の修飾キーを組み合わせられる', () => {
      const action = jest.fn();
      const shortcuts: Shortcut[] = [
        { key: 'n', ctrlKey: true, shiftKey: true, action },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      // Ctrlだけでは発火しない
      dispatchKeyboardEvent('n', { ctrlKey: true });
      expect(action).not.toHaveBeenCalled();

      // Ctrl+Shiftで発火
      dispatchKeyboardEvent('n', { ctrlKey: true, shiftKey: true });
      expect(action).toHaveBeenCalledTimes(1);
    });
  });

  describe('無効化', () => {
    it('disabled: trueのショートカットは実行されない', () => {
      const action = jest.fn();
      const shortcuts: Shortcut[] = [{ key: 'a', action, disabled: true }];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      dispatchKeyboardEvent('a');

      expect(action).not.toHaveBeenCalled();
    });

    it('オプションでenabled: falseの場合は全て無効', () => {
      const action = jest.fn();
      const shortcuts: Shortcut[] = [{ key: 'a', action }];

      renderHook(() => useKeyboardShortcuts(shortcuts, { enabled: false }));

      dispatchKeyboardEvent('a');

      expect(action).not.toHaveBeenCalled();
    });

    it('enabled: trueの場合は通常通り動作', () => {
      const action = jest.fn();
      const shortcuts: Shortcut[] = [{ key: 'a', action }];

      renderHook(() => useKeyboardShortcuts(shortcuts, { enabled: true }));

      dispatchKeyboardEvent('a');

      expect(action).toHaveBeenCalledTimes(1);
    });
  });

  describe('preventDefault', () => {
    it('デフォルトでpreventDefaultを呼ぶ', () => {
      const action = jest.fn();
      const shortcuts: Shortcut[] = [{ key: 'a', action }];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = dispatchKeyboardEvent('a');

      expect(event.defaultPrevented).toBe(true);
    });

    it('preventDefault: falseの場合はpreventDefaultを呼ばない', () => {
      const action = jest.fn();
      const shortcuts: Shortcut[] = [{ key: 'a', action }];

      renderHook(() =>
        useKeyboardShortcuts(shortcuts, { preventDefault: false })
      );

      const event = dispatchKeyboardEvent('a');

      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('クリーンアップ', () => {
    it('アンマウント時にイベントリスナーを削除する', () => {
      const action = jest.fn();
      const shortcuts: Shortcut[] = [{ key: 'a', action }];

      const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));

      unmount();

      dispatchKeyboardEvent('a');

      expect(action).not.toHaveBeenCalled();
    });
  });

  describe('ショートカットの動的更新', () => {
    it('ショートカットが更新されたときに新しい設定が反映される', () => {
      const action1 = jest.fn();
      const action2 = jest.fn();

      const { rerender } = renderHook(
        ({ shortcuts }) => useKeyboardShortcuts(shortcuts),
        {
          initialProps: { shortcuts: [{ key: 'a', action: action1 }] },
        }
      );

      dispatchKeyboardEvent('a');
      expect(action1).toHaveBeenCalledTimes(1);

      rerender({ shortcuts: [{ key: 'b', action: action2 }] });

      dispatchKeyboardEvent('a');
      expect(action1).toHaveBeenCalledTimes(1); // 変化なし

      dispatchKeyboardEvent('b');
      expect(action2).toHaveBeenCalledTimes(1);
    });
  });

  describe('特殊キー', () => {
    it('スペースキーを処理できる', () => {
      const action = jest.fn();
      const shortcuts: Shortcut[] = [{ key: ' ', action }];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      dispatchKeyboardEvent(' ');

      expect(action).toHaveBeenCalledTimes(1);
    });

    it('Escapeキーを処理できる', () => {
      const action = jest.fn();
      const shortcuts: Shortcut[] = [{ key: 'Escape', action }];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      dispatchKeyboardEvent('Escape');

      expect(action).toHaveBeenCalledTimes(1);
    });
  });
});
