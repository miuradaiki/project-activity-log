import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { WorkHoursSettings } from '../WorkHoursSettings';
import { AppearanceSettings } from '../AppearanceSettings';
import { renderWithGraphite } from '../../../test-helpers/render-with-graphite';

describe('WorkHoursSettings', () => {
  it('＋で5時間増やした値をすぐ保存する', () => {
    const onCommit = jest.fn();
    renderWithGraphite(
      <WorkHoursSettings
        baseMonthlyHours={140}
        onCommit={onCommit}
        onReset={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '増やす' }));

    expect(onCommit).toHaveBeenCalledWith(145);
  });

  it('上限（200h）を超えては保存しない', () => {
    const onCommit = jest.fn();
    renderWithGraphite(
      <WorkHoursSettings
        baseMonthlyHours={200}
        onCommit={onCommit}
        onReset={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: '増やす' })).toBeDisabled();
  });

  it('目標時間の決まり方を基準時間を使った例で示す', () => {
    renderWithGraphite(
      <WorkHoursSettings
        baseMonthlyHours={160}
        onCommit={jest.fn()}
        onReset={jest.fn()}
      />
    );

    expect(screen.getByText(/160h × 40% = 64h/)).toBeInTheDocument();
  });
});

describe('AppearanceSettings', () => {
  it('ダーク表示中にライトを選ぶとテーマを切り替え、言語は値で通知する', () => {
    const onToggleTheme = jest.fn();
    const onLanguageChange = jest.fn();
    renderWithGraphite(
      <AppearanceSettings
        isDarkMode
        onToggleTheme={onToggleTheme}
        onLanguageChange={onLanguageChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'ダーク' }));
    expect(onToggleTheme).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'ライト' }));
    expect(onToggleTheme).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    expect(onLanguageChange).toHaveBeenCalledWith('en');
  });
});
