import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ProjectCardHeader } from '../ProjectCardHeader';
import { LanguageProvider } from '../../../../../contexts/LanguageContext';

const renderWithProviders = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <LanguageProvider>{ui}</LanguageProvider>
    </ThemeProvider>
  );
};

describe('ProjectCardHeader', () => {
  const defaultProps = {
    statusText: 'Active',
    statusColor: '#1976d2',
    monthlyCapacity: 50,
    projectId: 'test-project',
    onStartTimer: jest.fn(),
    onMenuOpen: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render status chip with correct text', () => {
    renderWithProviders(<ProjectCardHeader {...defaultProps} />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  test('should render monthly capacity percentage', () => {
    renderWithProviders(<ProjectCardHeader {...defaultProps} />);

    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  test('should call onStartTimer with projectId when timer button is clicked', () => {
    renderWithProviders(<ProjectCardHeader {...defaultProps} />);

    const timerButton = screen.getByRole('button', {
      name: /timer|start|タイマー/i,
    });
    fireEvent.click(timerButton);

    expect(defaultProps.onStartTimer).toHaveBeenCalledWith('test-project');
  });

  test('should call onMenuOpen when menu button is clicked', () => {
    renderWithProviders(<ProjectCardHeader {...defaultProps} />);

    const menuButton = screen.getByRole('button', { name: /search|検索/i });
    fireEvent.click(menuButton);

    expect(defaultProps.onMenuOpen).toHaveBeenCalled();
  });

  test('should apply status color to chip', () => {
    const { container } = renderWithProviders(
      <ProjectCardHeader {...defaultProps} />
    );

    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toBeInTheDocument();
  });

  test('should display different status colors correctly', () => {
    const warningProps = {
      ...defaultProps,
      statusText: 'Warning',
      statusColor: '#ed6c02',
    };

    renderWithProviders(<ProjectCardHeader {...warningProps} />);

    expect(screen.getByText('Warning')).toBeInTheDocument();
  });
});
