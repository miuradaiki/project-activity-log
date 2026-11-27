import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithGraphite } from '../../test-helpers/render-with-graphite';
import { ToastProvider, useToast, ToastOptions } from '../ToastContext';

const Trigger: React.FC<{ options: ToastOptions; label?: string }> = ({
  options,
  label = 'show',
}) => {
  const { showToast } = useToast();
  return <button onClick={() => showToast(options)}>{label}</button>;
};

describe('ToastContext', () => {
  it('メッセージを表示する', () => {
    renderWithGraphite(
      <ToastProvider>
        <Trigger options={{ message: '1分未満のため記録しませんでした' }} />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('show'));

    expect(
      screen.getByText('1分未満のため記録しませんでした')
    ).toBeInTheDocument();
  });

  it('操作ボタンを押すと処理を実行して閉じる', () => {
    const onUndo = jest.fn();
    renderWithGraphite(
      <ToastProvider>
        <Trigger
          options={{
            message: '作業記録を削除しました',
            action: { label: '元に戻す', onClick: onUndo },
          }}
        />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('show'));
    fireEvent.click(screen.getByRole('button', { name: '元に戻す' }));

    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByText('作業記録を削除しました')
    ).not.toBeInTheDocument();
  });

  it('続けて出した通知は重ねて表示し、前の「元に戻す」を消さない', () => {
    const undoA = jest.fn();
    renderWithGraphite(
      <ToastProvider>
        <Trigger
          options={{
            message: 'A を削除',
            action: { label: '元に戻す', onClick: undoA },
          }}
          label="a"
        />
        <Trigger options={{ message: 'B を削除' }} label="b" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('a'));
    fireEvent.click(screen.getByText('b'));

    expect(screen.getByText('A を削除')).toBeInTheDocument();
    expect(screen.getByText('B を削除')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '元に戻す' }));
    expect(undoA).toHaveBeenCalled();
  });

  it('重ねられるのは3件までで、超えたら古いものから消す', () => {
    renderWithGraphite(
      <ToastProvider>
        {['1', '2', '3', '4'].map((n) => (
          <Trigger key={n} options={{ message: `通知${n}` }} label={`t${n}`} />
        ))}
      </ToastProvider>
    );

    ['1', '2', '3', '4'].forEach((n) =>
      fireEvent.click(screen.getByText(`t${n}`))
    );

    expect(screen.queryByText('通知1')).not.toBeInTheDocument();
    expect(screen.getByText('通知4')).toBeInTheDocument();
  });

  it('一定時間で自動的に閉じる', () => {
    jest.useFakeTimers();
    renderWithGraphite(
      <ToastProvider>
        <Trigger options={{ message: '書き出しました', duration: 3000 }} />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('show'));
    act(() => {
      jest.advanceTimersByTime(3500);
    });

    expect(screen.queryByText('書き出しました')).not.toBeInTheDocument();
    jest.useRealTimers();
  });
});
