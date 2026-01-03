import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ProjectCardProgress } from '../ProjectCardProgress';
import { LanguageProvider } from '../../../../../contexts/LanguageContext';

const renderWithProviders = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <LanguageProvider>{ui}</LanguageProvider>
    </ThemeProvider>
  );
};

describe('ProjectCardProgress', () => {
  describe('when isTrackingOnly is true', () => {
    const trackingOnlyProps = {
      isTrackingOnly: true,
      currentHours: 10.5,
      targetHours: 0,
      progressPercentage: 0,
      progressColor: '#1976d2',
      remainingHours: 0,
    };

    test('should display cumulative hours', () => {
      renderWithProviders(<ProjectCardProgress {...trackingOnlyProps} />);

      expect(screen.getByText(/10\.5/)).toBeInTheDocument();
    });

    test('should display tracking label', () => {
      renderWithProviders(<ProjectCardProgress {...trackingOnlyProps} />);

      expect(screen.getByText(/累計|cumulative/i)).toBeInTheDocument();
    });

    test('should not display progress bar', () => {
      const { container } = renderWithProviders(
        <ProjectCardProgress {...trackingOnlyProps} />
      );

      expect(
        container.querySelector('.MuiLinearProgress-root')
      ).not.toBeInTheDocument();
    });
  });

  describe('when isTrackingOnly is false', () => {
    const progressProps = {
      isTrackingOnly: false,
      currentHours: 30,
      targetHours: 80,
      progressPercentage: 38,
      progressColor: '#1976d2',
      remainingHours: 50,
    };

    test('should display progress percentage', () => {
      renderWithProviders(<ProjectCardProgress {...progressProps} />);

      expect(screen.getByText('38%')).toBeInTheDocument();
    });

    test('should display current and target hours', () => {
      renderWithProviders(<ProjectCardProgress {...progressProps} />);

      expect(screen.getByText(/30\.0.*80\.0/)).toBeInTheDocument();
    });

    test('should display remaining hours', () => {
      renderWithProviders(<ProjectCardProgress {...progressProps} />);

      expect(screen.getByText(/50\.0/)).toBeInTheDocument();
    });

    test('should render progress bar', () => {
      const { container } = renderWithProviders(
        <ProjectCardProgress {...progressProps} />
      );

      expect(
        container.querySelector('.MuiLinearProgress-root')
      ).toBeInTheDocument();
    });

    test('should display 100% when completed', () => {
      const completedProps = {
        ...progressProps,
        currentHours: 80,
        progressPercentage: 100,
        remainingHours: 0,
      };

      renderWithProviders(<ProjectCardProgress {...completedProps} />);

      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });
});
