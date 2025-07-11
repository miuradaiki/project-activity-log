import { render, screen } from '@testing-library/react';
import { MockElectronAPI } from '../__mocks__/electron';

// 簡単なテストコンポーネント
const TestComponent = () => {
  return <div>テスト環境の動作確認</div>;
};

describe('テスト環境のセットアップ', () => {
  test('React Testing Libraryが正常に動作する', () => {
    render(<TestComponent />);
    expect(screen.getByText('テスト環境の動作確認')).toBeInTheDocument();
  });

  test('Electron APIのモックが利用可能', () => {
    expect(window.electronAPI).toBeDefined();
    expect(window.electronAPI.loadProjects).toBeDefined();
    expect(window.electronAPI.saveProjects).toBeDefined();
  });

  test('MockElectronAPIのリセット機能が動作する', async () => {
    const mockAPI = MockElectronAPI.getInstance();
    
    // テストデータを設定
    await mockAPI.saveProjects([{
      id: 'test-1',
      name: 'テストプロジェクト',
      description: 'テスト',
      monthlyCapacity: 0.5,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      isArchived: false,
    }]);

    // データが保存されていることを確認
    const projects = await mockAPI.loadProjects();
    expect(projects).toHaveLength(1);

    // リセット
    mockAPI.reset();

    // データがクリアされていることを確認
    const projectsAfterReset = await mockAPI.loadProjects();
    expect(projectsAfterReset).toHaveLength(0);
  });

  test('ブラウザAPIのモックが動作する', () => {
    expect(window.Notification).toBeDefined();
    expect(window.ResizeObserver).toBeDefined();
    expect(window.matchMedia).toBeDefined();
    expect(window.localStorage).toBeDefined();
  });
});