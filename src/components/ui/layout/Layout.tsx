import React from 'react';
import { 
  Box, 
  Toolbar, 
  AppBar, 
  IconButton, 
  Typography, 
  useTheme,
  Fab,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import { 
  Brightness4, 
  Brightness7,
  Add as AddIcon
} from '@mui/icons-material';
import { Sidebar, DRAWER_WIDTH, CLOSED_DRAWER_WIDTH } from './Sidebar';

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
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  activePage,
  onNavigate,
  onToggleTheme,
  isDarkMode,
  sidebarOpen,
  onToggleSidebar,
  onAddButtonClick,
  showAddButton = false,
  addButtonTooltip = '追加',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      width: '100%'
    }}>
      {/* サイドバー */}
      <Sidebar
        open={sidebarOpen}
        onToggle={onToggleSidebar}
        activePage={activePage}
        onNavigate={onNavigate}
      />

      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh'
        }}
      >
        {/* ヘッダー */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
            <IconButton onClick={onToggleTheme} color="inherit">
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* コンテンツエリア */}
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 3 },
            overflow: 'auto'
          }}
        >
          {children}
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
                right: 24,
                boxShadow: theme.shadows[3],
              }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};
