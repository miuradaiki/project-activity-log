import React, { useMemo, useState } from 'react';
import { Box, Button, Menu, MenuItem } from '@mui/material';
import {
  PlayArrowRounded as PlayIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Project, TimeEntry } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import {
  getMonthOverview,
  getRecentProjects,
  getTodayProjectHours,
  getTodaySegments,
} from '../../utils/analytics';
import { projectColorManager } from '../../utils/colorUtils';
import { PageHeader } from '../ui/PageHeader';
import { NowCard } from './NowCard';
import { TodayStats } from './TodayStats';
import { DayTimeline } from './DayTimeline';
import { TodayProjectList } from './TodayProjectList';

const TIMELINE_START = 6;
const TIMELINE_END = 21;

interface TodayViewProps {
  projects: Project[];
  timeEntries: TimeEntry[];
  activeProject: Project | null;
  isRunning: boolean;
  startTime: string | null;
  onToggleProject: (project: Project) => void;
  onStop: () => void;
  onManualEntry: () => void;
  /** 一覧の下に置く今日の記録など */
  children?: React.ReactNode;
}

export const TodayView: React.FC<TodayViewProps> = ({
  projects,
  timeEntries,
  activeProject,
  isRunning,
  startTime,
  onToggleProject,
  onStop,
  onManualEntry,
  children,
}) => {
  const { t, language } = useLanguage();
  const { settings } = useSettingsContext();
  const baseHours = settings.workHours.baseMonthlyHours;
  const [pickerAnchor, setPickerAnchor] = useState<HTMLElement | null>(null);
  const now = new Date();
  const dayKey = now.toDateString();

  const activeProjects = useMemo(
    () => projects.filter((p) => !p.isArchived),
    [projects]
  );
  const overview = useMemo(
    () => getMonthOverview(projects, timeEntries, baseHours),
    [projects, timeEntries, baseHours]
  );
  const todayHours = useMemo(
    () => getTodayProjectHours(timeEntries, new Date()),
    // 日付が変わったら再計算する
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeEntries, dayKey]
  );
  const segments = useMemo(() => {
    const done = getTodaySegments(
      timeEntries,
      new Date(),
      TIMELINE_START,
      TIMELINE_END
    );
    if (!isRunning || !activeProject || !startTime) return done;
    const running: TimeEntry = {
      id: 'running',
      projectId: activeProject.id,
      startTime,
      endTime: new Date().toISOString(),
      description: '',
      createdAt: startTime,
      updatedAt: startTime,
    };
    return [
      ...done,
      ...getTodaySegments([running], new Date(), TIMELINE_START, TIMELINE_END),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeEntries, isRunning, activeProject, startTime, dayKey]);

  const minutes = now.getHours() * 60 + now.getMinutes();
  const span = (TIMELINE_END - TIMELINE_START) * 60;
  const nowRatio = (minutes - TIMELINE_START * 60) / span;
  const nowPosition = nowRatio >= 0 && nowRatio <= 1 ? nowRatio * 100 : null;

  const dateLabel = new Intl.DateTimeFormat(
    language === 'ja' ? 'ja-JP' : 'en-US',
    {
      dateStyle: 'full',
    }
  ).format(now);

  const pick = (project: Project) => {
    setPickerAnchor(null);
    onToggleProject(project);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.75 }}>
      <PageHeader
        title={t('nav.timer')}
        subtitle={dateLabel}
        action={
          <>
            <Button
              variant="outlined"
              startIcon={<PlayIcon />}
              onClick={(e) => setPickerAnchor(e.currentTarget)}
              disabled={activeProjects.length === 0}
              aria-haspopup="menu"
            >
              {t('today.pick.project')}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onManualEntry}
            >
              {t('today.manual')}
            </Button>
            <Menu
              anchorEl={pickerAnchor}
              open={!!pickerAnchor}
              onClose={() => setPickerAnchor(null)}
            >
              {activeProjects.map((project) => (
                <MenuItem
                  key={project.id}
                  onClick={() => pick(project)}
                  sx={{ gap: 1 }}
                >
                  <Box
                    aria-hidden
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '3px',
                      bgcolor: projectColorManager.getColorById(project.id),
                    }}
                  />
                  {project.name}
                </MenuItem>
              ))}
            </Menu>
          </>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.35fr 1fr' },
          gap: 2,
        }}
      >
        <NowCard
          activeProject={activeProject}
          isRunning={isRunning}
          startTime={startTime}
          recentProjects={getRecentProjects(projects, timeEntries, 3)}
          onStart={onToggleProject}
          onStop={onStop}
        />
        <TodayStats todayHours={todayHours} monthOverview={overview} />
      </Box>

      <DayTimeline
        segments={segments}
        nowPosition={nowPosition}
        startHour={TIMELINE_START}
        endHour={TIMELINE_END}
      />

      <TodayProjectList
        projects={projects}
        timeEntries={timeEntries}
        baseMonthlyHours={baseHours}
        activeProjectId={activeProject?.id ?? null}
        isRunning={isRunning}
        onToggle={onToggleProject}
      />

      {children}
    </Box>
  );
};
