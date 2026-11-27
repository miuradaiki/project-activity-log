import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithGraphite } from '../../../test-helpers/render-with-graphite';
import { TestModeSettings } from '../TestModeSettings';

const renderTestMode = (isTestMode: boolean) => {
  const handlers = {
    onToggleTestMode: jest.fn(),
    onRegenerateTestData: jest.fn(),
  };
  renderWithGraphite(
    <TestModeSettings
      isTestMode={isTestMode}
      testDataStats={{ projectCount: 4, timeEntryCount: 186 }}
      {...handlers}
    />
  );
  return handlers;
};

describe('TestModeSettings', () => {
  it('他の設定と同じ行の形式で、スイッチで切り替えられる', () => {
    const { onToggleTestMode } = renderTestMode(false);

    expect(
      screen.getByRole('region', { name: 'テストモード' })
    ).toBeInTheDocument();
    const toggle = screen.getByRole('switch', { name: 'テストデータを使う' });
    expect(toggle).not.toBeChecked();
    fireEvent.click(toggle);
    expect(onToggleTestMode).toHaveBeenCalled();
  });

  it('テストモード中だけ件数と作り直しボタンを出す', () => {
    const { onRegenerateTestData } = renderTestMode(true);

    expect(screen.getByText('186')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'データを作り直す' }));
    expect(onRegenerateTestData).toHaveBeenCalled();
  });

  it('通常モードでは作り直しボタンを出さない', () => {
    renderTestMode(false);

    expect(
      screen.queryByRole('button', { name: 'データを作り直す' })
    ).not.toBeInTheDocument();
  });
});
