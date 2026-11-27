import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressMeter } from '../ProgressMeter';

describe('ProgressMeter', () => {
  it('進捗率を progressbar として読み上げ可能にする', () => {
    render(<ProgressMeter ratio={0.57} color="#7C78F0" label="EC開発の進捗" />);

    const bar = screen.getByRole('progressbar', { name: 'EC開発の進捗' });
    expect(bar).toHaveAttribute('aria-valuenow', '57');
  });

  it('目標内では超過部分を描画しない', () => {
    render(<ProgressMeter ratio={0.9} color="#7C78F0" label="p" />);

    expect(screen.queryByTestId('progress-overflow')).not.toBeInTheDocument();
  });

  it('超過時は100%で切り捨てず、超過分を別セグメントで描画する', () => {
    render(<ProgressMeter ratio={1.25} color="#7C78F0" label="p" />);

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '125'
    );
    // 全体を125とみなすので、超過分は 25/125 = 20%
    expect(screen.getByTestId('progress-overflow')).toHaveStyle({
      width: '20%',
    });
  });
});
