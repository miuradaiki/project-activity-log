import '@testing-library/jest-dom';
import { MockElectronAPI } from './__mocks__/electron';

// import.meta.envのモック（テスト環境では無効にする）
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_ENABLE_TEST_DATA: 'false',
      },
    },
  },
  writable: true,
});

// Jestの global で import.meta をモック
(global as any).import = {
  meta: {
    env: {
      VITE_ENABLE_TEST_DATA: 'false',
    },
  },
};

// Electron APIのモックインスタンス
const mockElectronAPI = MockElectronAPI.getInstance();

// グローバルなElectron APIのモック
Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
});

// Notification APIのモック（Timer.tsxで使用）
Object.defineProperty(window, 'Notification', {
  value: jest.fn().mockImplementation(() => ({
    close: jest.fn(),
  })),
  writable: true,
});

// IntersectionObserver APIのモック（MUIで使用される可能性）
Object.defineProperty(window, 'IntersectionObserver', {
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
  writable: true,
});

// ResizeObserver APIのモック（Rechartsで使用される）
Object.defineProperty(window, 'ResizeObserver', {
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
  writable: true,
});

// matchMedia APIのモック（MUIで使用される）
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
  writable: true,
});

// LocalStorage のモック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// uuid のモック
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

// env.ts のモック（テスト環境ではテストモードを無効にする）
jest.mock('./utils/env', () => ({
  isTestDataEnabled: jest.fn(() => false),
}));

// 各テスト前にモックをリセット
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
  mockElectronAPI.reset();
});
