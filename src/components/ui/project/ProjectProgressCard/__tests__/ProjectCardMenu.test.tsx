import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ProjectCardMenu } from '../ProjectCardMenu';
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

describe('ProjectCardMenu', () => {
  const mockAnchorEl = document.createElement('button');

  const defaultProps = {
    anchorEl: mockAnchorEl,
    project: createMockProject(),
    onClose: jest.fn(),
    onEdit: jest.fn(),
    onArchive: jest.fn(),
    onOpenTargetDialog: jest.fn(),
    onViewDetails: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render menu when anchorEl is provided', () => {
    renderWithProviders(<ProjectCardMenu {...defaultProps} />);

    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  test('should not render menu when anchorEl is null', () => {
    renderWithProviders(<ProjectCardMenu {...defaultProps} anchorEl={null} />);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  test('should call onEdit when edit menu item is clicked', () => {
    renderWithProviders(<ProjectCardMenu {...defaultProps} />);

    const editItem = screen.getByRole('menuitem', { name: /edit|編集/i });
    fireEvent.click(editItem);

    expect(defaultProps.onEdit).toHaveBeenCalled();
  });

  test('should call onArchive when archive menu item is clicked', () => {
    renderWithProviders(<ProjectCardMenu {...defaultProps} />);

    const archiveItem = screen.getByRole('menuitem', {
      name: /archive|アーカイブ/i,
    });
    fireEvent.click(archiveItem);

    expect(defaultProps.onArchive).toHaveBeenCalled();
  });

  test('should show unarchive option for archived projects', () => {
    const archivedProject = createMockProject({ isArchived: true });
    renderWithProviders(
      <ProjectCardMenu {...defaultProps} project={archivedProject} />
    );

    expect(
      screen.getByRole('menuitem', { name: /unarchive|アーカイブ解除/i })
    ).toBeInTheDocument();
  });

  test('should call onOpenTargetDialog when target menu item is clicked', () => {
    renderWithProviders(<ProjectCardMenu {...defaultProps} />);

    const targetItem = screen.getByRole('menuitem', { name: /target|目標/i });
    fireEvent.click(targetItem);

    expect(defaultProps.onOpenTargetDialog).toHaveBeenCalled();
  });
});
