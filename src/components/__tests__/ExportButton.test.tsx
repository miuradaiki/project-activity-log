import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithGraphite } from '../../test-helpers/render-with-graphite';
import { ToastProvider } from '../../contexts/ToastContext';
import { ExportButton } from '../ExportButton';

const setup = (result: {
  success: boolean;
  canceled?: boolean;
  empty?: boolean;
}) => {
  const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  window.electronAPI = {
    ...window.electronAPI,
    exportToCSV: jest.fn().mockResolvedValue(result),
  };
  renderWithGraphite(
    <ToastProvider>
      <ExportButton />
    </ToastProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'CSV書き出し' }));
  return { alertSpy };
};

describe('ExportButton', () => {
  afterEach(() => jest.restoreAllMocks());

  it('書き出しに成功するとトーストで知らせる（alert は使わない）', async () => {
    const { alertSpy } = setup({ success: true });

    expect(await screen.findByText('CSVを書き出しました')).toBeInTheDocument();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('保存ダイアログでキャンセルしたときは何も表示しない', async () => {
    setup({ success: false, canceled: true });

    await waitFor(() =>
      expect(window.electronAPI.exportToCSV).toHaveBeenCalled()
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('失敗するとエラーのトーストを出す', async () => {
    setup({ success: false });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'エクスポートに失敗しました'
    );
  });

  it('書き出す記録がないときは、失敗ではなくその旨を知らせる', async () => {
    setup({ success: false, empty: true });

    expect(await screen.findByRole('status')).toHaveTextContent(
      '書き出す作業記録がありません'
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
