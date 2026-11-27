import React, { useMemo, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Project, TimeEntry } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNow } from '../../hooks/useNow';
import {
  getMonthOverview,
  getMonthProjectShares,
  getWeekdayBreakdown,
} from '../../utils/analytics';
import { PageHeader } from '../ui/PageHeader';
import { GraphiteCard } from '../ui/graphite/GraphiteCard';
import { ReportKpis } from './ReportKpis';
import { WeeklyChart } from './WeeklyChart';
import { ProjectShares } from './ProjectShares';

interface ReportsViewProps {
  projects: Project[];
  timeEntries: TimeEntry[];
  baseMonthlyHours: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export const ReportsView: React.FC<ReportsViewProps> = ({
  projects,
  timeEntries,
  baseMonthlyHours,
}) => {
  const { t } = useLanguage();
  // 開いたまま日付が変わっても「今日」「残り営業日」を追従させる
  const nowMs = useNow(60_000);
  const dayKey = new Date(nowMs).toDateString();
  const today = useMemo(() => new Date(dayKey), [dayKey]);
  const [cursor, setCursor] = useState({
    y: today.getFullYear(),
    m: today.getMonth(),
  });
  const isCurrentMonth =
    cursor.y === today.getFullYear() && cursor.m === today.getMonth();
  // 過去月は月末時点で集計する
  const overview = useMemo(() => {
    const asOf = isCurrentMonth
      ? today
      : new Date(cursor.y, cursor.m + 1, 0, 23, 59);
    return getMonthOverview(projects, timeEntries, baseMonthlyHours, asOf);
  }, [projects, timeEntries, baseMonthlyHours, cursor, isCurrentMonth, today]);
  const weeks = useMemo(
    () => getWeekdayBreakdown(timeEntries, cursor.y, cursor.m, today),
    [timeEntries, cursor, today]
  );
  const shares = useMemo(
    () => getMonthProjectShares(timeEntries, cursor.y, cursor.m),
    [timeEntries, cursor.y, cursor.m]
  );

  const pastDays = weeks.flatMap((w) => w.days).filter((d) => !d.isFuture);
  const workedDays = pastDays.filter((d) => d.total > 0).length;
  const averagePerDay = pastDays.length
    ? round1(pastDays.reduce((sum, d) => sum + d.total, 0) / pastDays.length)
    : 0;
  const weekIndex = weeks.findIndex((w) => w.days.some((d) => d.isToday));
  const thisWeekHours = weekIndex >= 0 ? weeks[weekIndex].total : 0;
  const lastWeekHours = weekIndex > 0 ? weeks[weekIndex - 1].total : null;
  const lastDate = new Date(cursor.y, cursor.m + 1, 0);

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

      <ReportKpis
        overview={overview}
        isCurrentMonth={isCurrentMonth}
        lastDateLabel={`${lastDate.getMonth() + 1}/${lastDate.getDate()}`}
        averagePerDay={averagePerDay}
        workedDays={workedDays}
        thisWeekHours={thisWeekHours}
        lastWeekHours={lastWeekHours}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' },
          gap: 2,
        }}
      >
        <GraphiteCard>
          <Box
            component="h2"
            sx={{
              m: 0,
              fontSize: 12,
              fontWeight: 400,
              color: 'text.secondary',
            }}
          >
            {t('reports.weekly')}
          </Box>
          <WeeklyChart
            weeks={weeks}
            projectOrder={shares.map((s) => s.projectId)}
          />
        </GraphiteCard>
        <GraphiteCard>
          <Box
            component="h2"
            sx={{
              m: 0,
              fontSize: 12,
              fontWeight: 400,
              color: 'text.secondary',
            }}
          >
            {t('reports.by.project')}
          </Box>
          <ProjectShares shares={shares} projects={projects} />
        </GraphiteCard>
      </Box>
    </Box>
  );
};
