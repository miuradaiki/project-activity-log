import React from 'react';
import {
  Box,
  ButtonBase,
  Drawer,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  AccessTime as TodayIcon,
  FolderOutlined as ProjectsIcon,
  BarChartOutlined as ReportsIcon,
  SettingsOutlined as SettingsIcon,
} from '@mui/icons-material';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Project } from '../../../types';
import { MonthOverview } from '../../../utils/analytics';
import { formatClock } from '../../../utils/formatters';
import { projectColorManager } from '../../../utils/colorUtils';
import { numberTypography } from '../../../styles/modernTheme';

export const DRAWER_WIDTH = 216;

export interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  monthOverview: MonthOverview;
  activeProject: Project | null;
  elapsedMs: number;
  onStopTimer: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const MAIN_NAV = [
  { page: 'timer', labelKey: 'nav.timer', Icon: TodayIcon },
  { page: 'projects', labelKey: 'nav.projects', Icon: ProjectsIcon },
  { page: 'dashboard', labelKey: 'nav.dashboard', Icon: ReportsIcon },
];

const NavItem: React.FC<{
  label: string;
  Icon: typeof TodayIcon;
  active: boolean;
  onClick: () => void;
}> = ({ label, Icon, active, onClick }) => (
  <ButtonBase
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    sx={{
      width: '100%',
      justifyContent: 'flex-start',
      gap: 1.25,
      px: 1.25,
      py: 1,
      borderRadius: 2,
      fontSize: 13.5,
      color: active ? 'text.primary' : 'text.secondary',
      fontWeight: active ? 500 : 400,
      bgcolor: active ? 'action.selected' : 'transparent',
      '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
      '&.Mui-focusVisible': { outline: 2, outlineColor: 'primary.main' },
    }}
  >
    <Icon sx={{ fontSize: 17 }} aria-hidden />
    {label}
  </ButtonBase>
);

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  monthOverview,
  activeProject,
  elapsedMs,
  onStopTimer,
  mobileOpen,
  onMobileClose,
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const go = (page: string) => {
    onNavigate(page);
    if (isMobile) onMobileClose();
  };

  const percent = Math.round(monthOverview.ratio * 100);

  const content = (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        px: 1.75,
        py: 2.75,
        bgcolor:
          theme.palette.mode === 'dark' ? 'background.default' : '#F5F5F7',
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 1.25,
          pb: 2.75,
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 22,
            height: 22,
            borderRadius: '7px',
            bgcolor: 'text.primary',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 6,
              borderRadius: '50%',
              border: 2,
              borderColor: 'background.default',
              borderRightColor: 'transparent',
            },
          }}
        />
        <Typography noWrap sx={{ fontWeight: 600, fontSize: 13.5 }}>
          {t('app.name')}
        </Typography>
      </Box>

      <Box
        component="nav"
        sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, flex: 1 }}
      >
        {MAIN_NAV.map(({ page, labelKey, Icon }) => (
          <NavItem
            key={page}
            label={t(labelKey)}
            Icon={Icon}
            active={activePage === page}
            onClick={() => go(page)}
          />
        ))}

        <Box
          sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2.5,
              border: 1,
              borderColor: 'divider',
              fontSize: 12,
              color: 'text.secondary',
            }}
          >
            {t('sidebar.month.progress')}
            <Box
              component="b"
              sx={{
                display: 'block',
                color: 'text.primary',
                fontWeight: 500,
                fontSize: 13,
                mt: 0.25,
              }}
            >
              {`${monthOverview.actualHours} / ${monthOverview.targetHours}h · ${percent}%`}
            </Box>
          </Box>

          {activeProject && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                pl: 1.5,
                pr: 0.75,
                py: 0.75,
                borderRadius: 2.5,
                border: 1,
                borderColor: 'divider',
                fontSize: 12,
              }}
            >
              <ButtonBase
                onClick={() => go('timer')}
                aria-label={`${t('sidebar.running')}: ${activeProject.name}`}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  justifyContent: 'flex-start',
                  gap: 1,
                  borderRadius: 1,
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '3px',
                    flex: 'none',
                    bgcolor: projectColorManager.getColorById(activeProject.id),
                  }}
                />
                <Box
                  component="span"
                  sx={{
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {activeProject.name}
                </Box>
                <Box
                  component="span"
                  sx={{ ...numberTypography(theme), ml: 'auto', fontSize: 15 }}
                >
                  {formatClock(elapsedMs, false)}
                </Box>
              </ButtonBase>
              <IconButton
                size="small"
                onClick={onStopTimer}
                aria-label={t('aria.timer.stop')}
                sx={{ width: 26, height: 26 }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '2px',
                    bgcolor: 'error.main',
                  }}
                />
              </IconButton>
            </Box>
          )}

          <NavItem
            label={t('nav.settings')}
            Icon={SettingsIcon}
            active={activePage === 'settings'}
            onClick={() => go('settings')}
          />
        </Box>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer variant="temporary" open={mobileOpen} onClose={onMobileClose}>
        {content}
      </Drawer>
    );
  }

  return (
    <Box
      component="aside"
      sx={{
        width: DRAWER_WIDTH,
        flex: 'none',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      {content}
    </Box>
  );
};
