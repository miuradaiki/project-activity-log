import React from 'react';
import { screen, within } from '@testing-library/react';
import { KeyboardShortcutsDialog } from '../KeyboardShortcuts';
import { renderWithGraphite } from '../../../test-helpers/render-with-graphite';

const rowFor = (keys: string) =>
  screen.getByText(keys).closest('[data-testid="shortcut-row"]') as HTMLElement;

describe('KeyboardShortcutsDialog', () => {
  it('Ctrl+1〜3 をサイドバーと同じ「今日 / プロジェクト / レポート」の順で表示する', () => {
    renderWithGraphite(<KeyboardShortcutsDialog open onClose={jest.fn()} />);

    expect(within(rowFor('Ctrl+1')).getByText('今日')).toBeInTheDocument();
    expect(
      within(rowFor('Ctrl+2')).getByText('プロジェクト')
    ).toBeInTheDocument();
    expect(within(rowFor('Ctrl+3')).getByText('レポート')).toBeInTheDocument();
  });

  it('効かない「Esc：タイマー停止」は表示しない', () => {
    renderWithGraphite(<KeyboardShortcutsDialog open onClose={jest.fn()} />);

    expect(screen.queryByText('Esc')).not.toBeInTheDocument();
  });

  it('Mac では Ctrl を ⌘ ではなく ⌃ で表示する（⌘ では動かないため）', () => {
    const platform = jest
      .spyOn(window.navigator, 'platform', 'get')
      .mockReturnValue('MacIntel');
    renderWithGraphite(<KeyboardShortcutsDialog open onClose={jest.fn()} />);

    expect(screen.getByText('⌃1')).toBeInTheDocument();
    expect(screen.queryByText(/⌘/)).not.toBeInTheDocument();
    platform.mockRestore();
  });
});
