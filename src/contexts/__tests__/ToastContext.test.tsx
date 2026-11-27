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

  it('新しい通知は前の通知を置き換える', () => {
    renderWithGraphite(
      <ToastProvider>
        <Trigger options={{ message: '一つ目' }} label="a" />
        <Trigger options={{ message: '二つ目' }} label="b" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('a'));
    fireEvent.click(screen.getByText('b'));

    expect(screen.queryByText('一つ目')).not.toBeInTheDocument();
    expect(screen.getByText('二つ目')).toBeInTheDocument();
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
