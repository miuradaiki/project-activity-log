import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Timer } from '../Timer';
import { createMockProject } from '../../../__mocks__/electron';

// タイマーのプロップスのモック型
interface TimerProps {
  project: Project;
  isRunning: boolean;
  startTime: string | null;
  onStart: () => void;
  onStop: () => void;
}

describe('Timer コンポーネントの特性テスト', () => {
  const mockProject = createMockProject({ name: 'テストプロジェクト' });

  const defaultProps: TimerProps = {
    project: mockProject,
    isRunning: false,
    startTime: null,
    onStart: jest.fn(),
    onStop: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // 現在時刻を固定
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T10:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('タイマー停止時の表示', () => {
    test('プロジェクトが選択されていない場合、何も表示されない', () => {
      const { container } = render(<Timer {...defaultProps} project={null} />);

      expect(container.firstChild).toBeNull();
    });

    test('プロジェクトが選択されている場合、開始ボタンが表示される', () => {
      render(<Timer {...defaultProps} />);

      expect(screen.getByText('テストプロジェクト')).toBeInTheDocument();
      expect(screen.getByTestId('PlayArrowIcon')).toBeInTheDocument();
    });

    test('開始ボタンをクリックするとonStartが呼ばれる', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<Timer {...defaultProps} />);

      const startButton = screen
        .getByTestId('PlayArrowIcon')
        .closest('button')!;
      await user.click(startButton);

      expect(defaultProps.onStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('タイマー実行時の表示', () => {
    test('タイマー実行中は経過時間と停止ボタンが表示される', () => {
      const props = {
        ...defaultProps,
        isRunning: true,
        startTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分前に開始
      };

      render(<Timer {...props} />);

      expect(screen.getByText('テストプロジェクト')).toBeInTheDocument();
      expect(screen.getByText(/00:30:00/)).toBeInTheDocument(); // 30分の表示
      expect(screen.getByTestId('StopIcon')).toBeInTheDocument();
    });

    test('停止ボタンをクリックするとonStopが呼ばれる', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const props = {
        ...defaultProps,
        isRunning: true,
        startTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      };

      render(<Timer {...props} />);

      const stopButton = screen.getByTestId('StopIcon').closest('button')!;
      await user.click(stopButton);

      expect(defaultProps.onStop).toHaveBeenCalledTimes(1);
    });

    test('時間表示が正しくフォーマットされる', () => {
      const testCases = [
        { minutes: 0, expected: '00:00:00' },
        { minutes: 5, expected: '00:05:00' },
        { minutes: 65, expected: '01:05:00' },
        { minutes: 125, expected: '02:05:00' },
      ];

      testCases.forEach(({ minutes, expected }) => {
        const props = {
          ...defaultProps,
          isRunning: true,
          startTime: new Date(Date.now() - minutes * 60 * 1000).toISOString(),
        };

        const { rerender } = render(<Timer {...props} />);
        expect(screen.getByText(expected)).toBeInTheDocument();

        // 次のテストケースのために再レンダリング
        rerender(<div />);
      });
    });
  });

  describe('8時間制限機能', () => {
    test('8時間経過時に自動停止される', () => {
      const props = {
        ...defaultProps,
        isRunning: true,
        startTime: new Date(
          Date.now() - 8 * 60 * 60 * 1000 - 1000
        ).toISOString(), // 8時間+1秒前に開始
      };

      render(<Timer {...props} />);

      // タイマーが動作して8時間制限をチェックするまで待機
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // 自動停止が呼ばれることを確認
      expect(defaultProps.onStop).toHaveBeenCalledTimes(1);
    });

    test('8時間経過時にデスクトップ通知が表示される', () => {
      const props = {
        ...defaultProps,
        isRunning: true,
        startTime: new Date(
          Date.now() - 8 * 60 * 60 * 1000 - 1000
        ).toISOString(), // 8時間+1秒前に開始
      };

      render(<Timer {...props} />);

      // タイマーが動作して8時間制限をチェックするまで待機
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Notificationコンストラクタが呼ばれることを確認
      expect(window.Notification).toHaveBeenCalledWith(
        '作業時間が8時間を超過しました',
        {
          body: 'タイマーを自動停止しました。必要に応じて新しいセッションを開始してください。',
        }
      );
    });

    test('8時間未満では自動停止されない', () => {
      const props = {
        ...defaultProps,
        isRunning: true,
        startTime: new Date(
          Date.now() - 7 * 60 * 60 * 1000 + 60 * 1000
        ).toISOString(), // 6時間59分前に開始
      };

      render(<Timer {...props} />);

      // タイマーが動作するまで待機
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // 自動停止が呼ばれないことを確認
      expect(defaultProps.onStop).not.toHaveBeenCalled();
    });
  });

  describe('時間更新の動作', () => {
    test('タイマー実行中は1秒ごとに時間が更新される', () => {
      const props = {
        ...defaultProps,
        isRunning: true,
        startTime: new Date(Date.now() - 1000 * 60).toISOString(), // 1分前に開始
      };

      render(<Timer {...props} />);

      // 初期表示
      expect(screen.getByText('00:01:00')).toBeInTheDocument();

      // 1秒経過
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText('00:01:01')).toBeInTheDocument();
    });

    test('タイマー停止中は時間更新されない', () => {
      render(<Timer {...defaultProps} />);

      // 時間が経過しても表示は変わらない
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // 開始ボタンが表示されたまま
      expect(screen.getByTestId('PlayArrowIcon')).toBeInTheDocument();
    });
  });
});
