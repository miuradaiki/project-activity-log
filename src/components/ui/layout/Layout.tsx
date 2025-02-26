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
  useMediaQuery,
  CssBaseline,
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
  const currentDrawerWidth = sidebarOpen ? DRAWER_WIDTH : CLOSED_DRAWER_WIDTH;

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

      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { xs: 0, md: 0 }  // サイドバーの幅に応じたマージンは必要ない（Drawerが固定のため）
        }}
      >
        {/* ヘッダー */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: { md: `calc(100% - ${currentDrawerWidth}px)` },
            ml: { md: `${currentDrawerWidth}px` },
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: '1px solid',
            borderColor: 'divider',
            zIndex: (theme) => theme.zIndex.drawer - 1,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
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

        {/* ツールバーの高さ分のスペース確保 */}
        <Toolbar />

        {/* コンテンツエリア */}
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
