import { renderHook, act } from '@testing-library/react';
import { useModal } from '../useModal';

interface TestData {
  id: string;
  name: string;
}

describe('useModal', () => {
  describe('初期状態', () => {
    it('モーダルは閉じた状態で開始する', () => {
      const { result } = renderHook(() => useModal());

      expect(result.current.isOpen).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('open', () => {
    it('openでモーダルを開くことができる', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('データ付きでモーダルを開くことができる', () => {
      const { result } = renderHook(() => useModal<TestData>());
      const testData: TestData = { id: '1', name: 'Test' };

      act(() => {
        result.current.open(testData);
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.data).toEqual(testData);
    });

    it('undefinedデータで開くとdataはundefinedになる', () => {
      const { result } = renderHook(() => useModal<TestData>());

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('close', () => {
    it('closeでモーダルを閉じることができる', () => {
      const { result } = renderHook(() => useModal());

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('closeでデータもクリアされる', () => {
      const { result } = renderHook(() => useModal<TestData>());
      const testData: TestData = { id: '1', name: 'Test' };

      act(() => {
        result.current.open(testData);
      });

      expect(result.current.data).toEqual(testData);

      act(() => {
        result.current.close();
      });

      expect(result.current.data).toBeUndefined();
    });
  });

  describe('複数のモーダル', () => {
    it('複数のモーダルを独立して管理できる', () => {
      const { result: modal1 } = renderHook(() => useModal());
      const { result: modal2 } = renderHook(() => useModal());

      act(() => {
        modal1.current.open();
      });

      expect(modal1.current.isOpen).toBe(true);
      expect(modal2.current.isOpen).toBe(false);

      act(() => {
        modal2.current.open();
      });

      expect(modal1.current.isOpen).toBe(true);
      expect(modal2.current.isOpen).toBe(true);
    });
  });

  describe('型安全性', () => {
    it('ジェネリック型でデータの型を指定できる', () => {
      const { result } = renderHook(() => useModal<TestData>());
      const testData: TestData = { id: '1', name: 'Test' };

      act(() => {
        result.current.open(testData);
      });

      // TypeScriptの型チェックでdata.idとdata.nameにアクセスできることを確認
      expect(result.current.data?.id).toBe('1');
      expect(result.current.data?.name).toBe('Test');
    });
  });

  describe('再開/更新', () => {
    it('既にデータがある状態で新しいデータで開くと上書きされる', () => {
      const { result } = renderHook(() => useModal<TestData>());
      const data1: TestData = { id: '1', name: 'First' };
      const data2: TestData = { id: '2', name: 'Second' };

      act(() => {
        result.current.open(data1);
      });

      expect(result.current.data).toEqual(data1);

      act(() => {
        result.current.open(data2);
      });

      expect(result.current.data).toEqual(data2);
    });
  });
});
