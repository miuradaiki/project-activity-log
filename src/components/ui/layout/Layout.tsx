import React from 'react';
import {
  Box,
  useTheme,
  Fab,
  Tooltip,
  useMediaQuery,
  CssBaseline,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Add as AddIcon } from '@mui/icons-material';
import { Sidebar, DRAWER_WIDTH, CLOSED_DRAWER_WIDTH } from './Sidebar';
import { GlobalTimer } from '../global/GlobalTimer';
import { Project } from '../../../types';

export interface LayoutProps {
  children: React.ReactNode;
  title: string;
  activePage: string;
  onNavigate: (page: string) => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onAddButtonClick?: () => void;
  showAddButton?: boolean;
  addButtonTooltip?: string;
  activeProject?: Project | null;
  isTimerRunning?: boolean;
  startTime?: string | null;
  onStopTimer?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activePage,
  onNavigate,
  sidebarOpen,
  onToggleSidebar,
  onAddButtonClick,
  showAddButton = false,
  addButtonTooltip = '追加',
  activeProject = null,
  isTimerRunning = false,
  startTime = null,
  onStopTimer = () => {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentDrawerWidth = sidebarOpen ? DRAWER_WIDTH : CLOSED_DRAWER_WIDTH;

  const handleTimerClick = () => {
    if (activePage !== 'timer') {
      onNavigate('timer');
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* サイドバー */}
      <Sidebar
        open={sidebarOpen}
        onToggle={onToggleSidebar}
        activePage={activePage}
        onNavigate={onNavigate}
      />

      {/* Modern main content with smooth transitions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          flexGrow: 1,
          width: isMobile ? '100%' : `calc(100% - ${currentDrawerWidth}px)`,
          padding: 0,
        }}
      >
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 'lg',
            }}
          >
            {children}
          </Box>
        </Box>

        {/* フローティングアクションボタン */}
        {showAddButton && onAddButtonClick && (
          <Tooltip title={addButtonTooltip}>
            <Fab
              color="primary"
              aria-label="add"
              onClick={onAddButtonClick}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: isTimerRunning ? 90 : 24, // タイマーが実行中の場合、タイマーとの干渉を避けるために位置を調整
                boxShadow: theme.shadows[3],
              }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        )}

        {/* グローバルタイマー */}
        <GlobalTimer
          project={activeProject}
          isRunning={isTimerRunning}
          startTime={startTime}
          onStop={onStopTimer}
          onClick={handleTimerClick}
        />
      </motion.div>
    </Box>
  );
};
