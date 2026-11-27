import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { ProjectForm } from '../ProjectForm';
import { renderWithGraphite } from '../../test-helpers/render-with-graphite';
import { Project } from '../../types';
import { PROJECT_COLORS } from '../../utils/colorUtils';

const project = (overrides: Partial<Project> = {}): Project => ({
  id: 'p1',
  name: 'EC開発',
  description: '',
  monthlyCapacity: 0.4,
  isArchived: false,
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

const renderForm = (
  props: Partial<React.ComponentProps<typeof ProjectForm>>
) => {
  const onSave = jest.fn();
  renderWithGraphite(
    <ProjectForm
      open
      baseMonthlyHours={160}
      onClose={jest.fn()}
      onSave={onSave}
      {...props}
    />
  );
  return { onSave };
};

describe('ProjectForm', () => {
  it('配分は％ではなく、設定の基準時間から計算した月の目標時間で示す', () => {
    renderForm({ project: project() });

    expect(screen.getByTestId('allocation-hours')).toHaveTextContent(
      '64h / 月'
    );
    expect(screen.getByText('基準 160h の 40%')).toBeInTheDocument();
  });

  it('全プロジェクトの配分が100%を超えると、超過時間を添えて注意する', () => {
    const others = [project({ id: 'p2', monthlyCapacity: 0.7 })];
    renderForm({ project: project(), projects: [project(), ...others] });

    expect(
      screen.getByText(
        '全プロジェクトの配分が合計 110% になります（基準を 16h 超えます）'
      )
    ).toBeInTheDocument();
  });

  it('名前が空のまま保存すると、フォーム内にエラーを出して保存しない', () => {
    const { onSave } = renderForm({});

    fireEvent.click(screen.getByRole('button', { name: '保存' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'プロジェクト名を入力してください'
    );
    expect(onSave).not.toHaveBeenCalled();
  });

  it('選んだ色をプロジェクトに保存する', () => {
    const { onSave } = renderForm({ project: project() });

    fireEvent.click(screen.getByRole('radio', { name: '色 3' }));
    fireEvent.click(screen.getByRole('button', { name: '保存' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'EC開発', color: PROJECT_COLORS[2] })
    );
  });

  it('新規作成では、他のプロジェクトが使っていない色を最初から選んでおく', () => {
    const { onSave } = renderForm({
      projects: [project({ color: PROJECT_COLORS[0] })],
    });

    fireEvent.change(screen.getByLabelText('名前'), {
      target: { value: '採用サイト' },
    });
    fireEvent.click(screen.getByRole('button', { name: '保存' }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ color: PROJECT_COLORS[1] })
    );
  });
});
