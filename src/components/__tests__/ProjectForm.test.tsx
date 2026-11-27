import React from 'react';
import { screen } from '@testing-library/react';
import { ProjectForm } from '../ProjectForm';
import { renderWithGraphite } from '../../test-helpers/render-with-graphite';

describe('ProjectForm', () => {
  it('月間目標時間は設定の基準時間から計算して表示する', () => {
    renderWithGraphite(
      <ProjectForm
        open
        baseMonthlyHours={160}
        project={{
          id: 'p1',
          name: 'EC開発',
          description: '',
          monthlyCapacity: 0.4,
          isArchived: false,
          createdAt: '',
          updatedAt: '',
        }}
        onClose={jest.fn()}
        onSave={jest.fn()}
      />
    );

    expect(screen.getByText(/月間目標時間:\s*64(\.0)?/)).toBeInTheDocument();
  });
});
