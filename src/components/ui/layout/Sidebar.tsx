import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ListAlt as ProjectsIcon,
  Timer as TimerIcon,
  InsertChart as ReportsIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// ドロワーの幅設定
export const DRAWER_WIDTH = 240;
export const CLOSED_DRAWER_WIDTH = 60;

// スタイル付きListItemButton
const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5, 1),
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.contrastText,
    },
  },
}));

export interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  open,
  onToggle,
  activePage,
  onNavigate,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ナビゲーションアイテム
  const menuItems = [
    { id: 'dashboard', text: 'ダッシュボード', icon: <DashboardIcon /> },
    { id: 'projects', text: 'プロジェクト', icon: <ProjectsIcon /> },
    { id: 'timer', text: 'タイマー', icon: <TimerIcon /> },
    { id: 'reports', text: 'レポート', icon: <ReportsIcon /> },
  ];

  // ドロワーの内容
  const drawer = (
    <>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: open ? 'space-between' : 'center',
        p: 2 
      }}>
        {open && (
          <Box sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            Project Activity Log
          </Box>
        )}
        <IconButton onClick={onToggle}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <StyledListItemButton
              selected={activePage === item.id}
              onClick={() => onNavigate(item.id)}
              sx={{ 
                justifyContent: open ? 'initial' : 'center',
                px: open ? 3 : 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: open ? 36 : 'auto',
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {open && <ListItemText primary={item.text} />}
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>

      <List sx={{ mt: 'auto' }}>
        <ListItem disablePadding>
          <StyledListItemButton
            selected={activePage === 'settings'}
            onClick={() => onNavigate('settings')}
            sx={{ 
              justifyContent: open ? 'initial' : 'center',
              px: open ? 3 : 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: open ? 36 : 'auto',
                mr: open ? 2 : 'auto',
                justifyContent: 'center',
              }}
            >
              <SettingsIcon />
            </ListItemIcon>
            {open && <ListItemText primary="設定" />}
          </StyledListItemButton>
        </ListItem>
      </List>
    </>
  );

  // モバイル版レイアウト
  if (isMobile) {
    return (
      <>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onToggle}
          sx={{
            position: 'fixed',
            top: 10,
            left: 10,
            zIndex: 1200,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            boxShadow: 3,
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          variant="temporary"
          open={open}
          onClose={onToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              width: DRAWER_WIDTH, 
              boxSizing: 'border-box',
              boxShadow: 3,
            },
            zIndex: theme.zIndex.appBar + 100,
          }}
        >
          {drawer}
        </Drawer>
      </>
    );
  }

  // デスクトップ版レイアウト
  return (
    <Box
      sx={{
        width: open ? DRAWER_WIDTH : CLOSED_DRAWER_WIDTH,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
          width: DRAWER_WIDTH,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }),
        ...(!open && {
          width: CLOSED_DRAWER_WIDTH,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }),
      }}
    >
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: 'inherit',
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 'inherit',
            position: 'static',
            boxSizing: 'border-box',
            border: 'none',
            overflowX: 'hidden',
            height: '100vh',
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};
