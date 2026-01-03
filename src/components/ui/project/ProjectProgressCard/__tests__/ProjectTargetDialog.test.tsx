import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ProjectTargetDialog } from '../ProjectTargetDialog';
import { Project } from '../../../../../types';
import { LanguageProvider } from '../../../../../contexts/LanguageContext';

const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'test-project',
  name: 'Test Project',
  description: 'Test Description',
  monthlyCapacity: 0.5,
  isArchived: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const renderWithProviders = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <LanguageProvider>{ui}</LanguageProvider>
    </ThemeProvider>
  );
};

describe('ProjectTargetDialog', () => {
  const defaultProps = {
    open: true,
    project: createMockProject(),
    baseMonthlyHours: 160,
    onClose: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render dialog when open is true', () => {
    renderWithProviders(<ProjectTargetDialog {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('should not render dialog when open is false', () => {
    renderWithProviders(<ProjectTargetDialog {...defaultProps} open={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('should display project name', () => {
    renderWithProviders(<ProjectTargetDialog {...defaultProps} />);

    expect(screen.getByText(/Test Project/)).toBeInTheDocument();
  });

  test('should call onClose when cancel button is clicked', () => {
    renderWithProviders(<ProjectTargetDialog {...defaultProps} />);

    const cancelButton = screen.getByRole('button', {
      name: /cancel|キャンセル/i,
    });
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('should call onSave with new capacity when save button is clicked', () => {
    renderWithProviders(<ProjectTargetDialog {...defaultProps} />);

    const saveButton = screen.getByRole('button', { name: /save|保存/i });
    fireEvent.click(saveButton);

    expect(defaultProps.onSave).toHaveBeenCalled();
  });

  test('should have slider for adjusting capacity', () => {
    renderWithProviders(<ProjectTargetDialog {...defaultProps} />);

    expect(screen.getByRole('slider')).toBeInTheDocument();
  });
});
