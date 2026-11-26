import React, { useMemo } from 'react';
import { Box, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Sidebar } from './Sidebar';
import { Project, TimeEntry } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { getMonthOverview } from '../../../utils/analytics';
import { useElapsedTime } from '../timer/hooks/useElapsedTime';

export interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  projects: Project[];
  timeEntries: TimeEntry[];
  activeProject: Project | null;
  isTimerRunning: boolean;
  startTime: string | null;
  onStopTimer: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activePage,
  onNavigate,
  sidebarOpen,
  onToggleSidebar,
  projects,
  timeEntries,
  activeProject,
  isTimerRunning,
  startTime,
  onStopTimer,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { settings } = useSettingsContext();

  // 8時間の自動停止はここ（常にマウントされる場所）でだけ監視する
  const { elapsedMs } = useElapsedTime({
    isRunning: isTimerRunning,
    startTime,
    onStop: onStopTimer,
  });

  const monthOverview = useMemo(
    () =>
      getMonthOverview(
        projects,
        timeEntries,
        settings.workHours.baseMonthlyHours
      ),
    [projects, timeEntries, settings.workHours.baseMonthlyHours]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        monthOverview={monthOverview}
        activeProject={isTimerRunning ? activeProject : null}
        elapsedMs={elapsedMs}
        onStopTimer={onStopTimer}
        mobileOpen={sidebarOpen}
        onMobileClose={onToggleSidebar}
      />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          px: { xs: 2.5, md: 5.5 },
          py: { xs: 2, md: 4.25 },
        }}
      >
        {isMobile && (
          <IconButton
            onClick={onToggleSidebar}
            aria-label={t('aria.sidebar.open')}
            sx={{ mb: 1, ml: -1 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Box sx={{ maxWidth: 1120, mx: 'auto' }}>{children}</Box>
      </Box>
    </Box>
  );
};
