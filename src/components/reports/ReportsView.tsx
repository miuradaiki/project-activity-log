import React, { useMemo, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Project, TimeEntry } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNow } from '../../hooks/useNow';
import {
  getMonthProjectRows,
  getWeekdayBreakdown,
  summarizeProjectRows,
} from '../../utils/analytics';
import { PageHeader } from '../ui/PageHeader';
import { GraphiteCard } from '../ui/graphite/GraphiteCard';
import { ReportSummary } from './ReportSummary';
import { WeeklyChart } from './WeeklyChart';
import { ProjectUtilizationList } from './ProjectUtilizationList';

interface ReportsViewProps {
  projects: Project[];
  timeEntries: TimeEntry[];
  baseMonthlyHours: number;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Box
    component="h2"
    sx={{ m: 0, fontSize: 12, fontWeight: 400, color: 'text.secondary' }}
  >
    {children}
  </Box>
);

export const ReportsView: React.FC<ReportsViewProps> = ({
  projects,
  timeEntries,
  baseMonthlyHours,
}) => {
  const { t } = useLanguage();
  // 開いたまま日付が変わっても、週グラフの「今日」を追従させる
  const nowMs = useNow(60_000);
  const dayKey = new Date(nowMs).toDateString();
  const today = useMemo(() => new Date(dayKey), [dayKey]);
  const [cursor, setCursor] = useState({
    y: today.getFullYear(),
    m: today.getMonth(),
  });
  const isCurrentMonth =
    cursor.y === today.getFullYear() && cursor.m === today.getMonth();
  const rows = useMemo(
    () =>
      getMonthProjectRows(
        projects,
        timeEntries,
        baseMonthlyHours,
        cursor.y,
        cursor.m
      ),
    [projects, timeEntries, baseMonthlyHours, cursor]
  );
  const summary = useMemo(() => summarizeProjectRows(rows), [rows]);
  const weeks = useMemo(
    () => getWeekdayBreakdown(timeEntries, cursor.y, cursor.m, today),
    [timeEntries, cursor, today]
  );

  const shift = (delta: number) =>
    setCursor(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <PageHeader
        title={t('nav.dashboard')}
        subtitle={t('reports.subtitle')}
        action={
          <>
            <IconButton
              aria-label={t('aria.calendar.previous.month')}
              onClick={() => shift(-1)}
            >
              <ChevronLeft fontSize="small" />
            </IconButton>
            <Box
              sx={{
                minWidth: 96,
                textAlign: 'center',
                fontSize: 13.5,
                fontWeight: 500,
              }}
            >
              {t('reports.month.label', { y: cursor.y, m: cursor.m + 1 })}
            </Box>
            <IconButton
              aria-label={t('aria.calendar.next.month')}
              onClick={() => shift(1)}
              disabled={isCurrentMonth}
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </>
        }
      />

      <ReportSummary summary={summary} />
      <GraphiteCard>
        <SectionTitle>{t('reports.by.project')}</SectionTitle>
        <ProjectUtilizationList rows={rows} projects={projects} />
      </GraphiteCard>
      <GraphiteCard>
        <SectionTitle>{t('reports.weekly')}</SectionTitle>
        <WeeklyChart
          weeks={weeks}
          projectOrder={rows.map((r) => r.projectId)}
        />
      </GraphiteCard>
    </Box>
  );
};
