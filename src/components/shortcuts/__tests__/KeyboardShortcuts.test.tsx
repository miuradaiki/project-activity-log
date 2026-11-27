import React from 'react';
import { screen, within } from '@testing-library/react';
import { KeyboardShortcutsDialog } from '../KeyboardShortcuts';
import { renderWithGraphite } from '../../../test-helpers/render-with-graphite';

const rowOf = (keyLabel: string) =>
  screen.getByText(keyLabel, { selector: 'kbd' }).closest('li') as HTMLElement;

describe('KeyboardShortcutsDialog', () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, 'language', {
      value: 'ja-JP',
      configurable: true,
    });
    Object.defineProperty(window.navigator, 'platform', {
      value: 'Win32',
      configurable: true,
    });
  });

  it('Ctrl+1〜3 はサイドバーと同じ「今日 / プロジェクト / レポート」の順', () => {
    renderWithGraphite(<KeyboardShortcutsDialog open onClose={jest.fn()} />);

    expect(within(rowOf('Ctrl+1')).getByText('今日')).toBeInTheDocument();
    expect(within(rowOf('Ctrl+2')).getByText('プロジェクト')).toBeInTheDocument();
    expect(within(rowOf('Ctrl+3')).getByText('レポート')).toBeInTheDocument();
  });

  it('廃止した「Esc：タイマー停止」は表示しない', () => {
    renderWithGraphite(<KeyboardShortcutsDialog open onClose={jest.fn()} />);

    expect(screen.queryByText('Esc', { selector: 'kbd' })).toBeNull();
  });
});
