import React from 'react';
import { Box } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { MonthOverview } from '../../utils/analytics';
import { GraphiteCard } from '../ui/graphite/GraphiteCard';
import { StatValue } from '../ui/graphite/StatValue';

interface ReportKpisProps {
  overview: MonthOverview;
  isCurrentMonth: boolean;
  lastDateLabel: string;
  averagePerDay: number;
  workedDays: number;
  thisWeekHours: number;
  lastWeekHours: number | null;
}

const Note: React.FC<{ children: React.ReactNode; danger?: boolean }> = ({
  children,
  danger,
}) => (
  <Box
    sx={{
      fontSize: 12,
      mt: 0.75,
      color: danger ? 'error.main' : 'text.disabled',
    }}
  >
    {children}
  </Box>
);

export const ReportKpis: React.FC<ReportKpisProps> = ({
  overview,
  isCurrentMonth,
  lastDateLabel,
  averagePerDay,
  workedDays,
  thisWeekHours,
  lastWeekHours,
}) => {
  const { t } = useLanguage();
  const percent = Math.round(overview.ratio * 100);
  const behind = overview.requiredDailyHours > averagePerDay;

  return (
    <GraphiteCard
      padding={0}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', md: '1.4fr 1fr 1fr 1fr' },
        '& > *': { p: '20px 22px' },
        '& > * + *': { borderLeft: { md: 1 }, borderColor: { md: 'divider' } },
      }}
    >
      <StatValue
        label={t('reports.worked')}
        value={overview.actualHours}
        unit={`/ ${overview.targetHours}h`}
      >
        <Box
          sx={{
            height: 4,
            mt: 1.5,
            borderRadius: 4,
            bgcolor: 'action.hover',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${Math.min(100, percent)}%`,
              height: '100%',
              bgcolor: 'text.primary',
            }}
          />
        </Box>
        <Note>{t('reports.of.target', { percent })}</Note>
      </StatValue>
      {isCurrentMonth ? (
        <>
          <StatValue
            label={t('reports.remaining.days')}
            value={overview.remainingWorkingDays}
            unit={t('reports.days')}
          >
            <Note>{t('reports.until', { date: lastDateLabel })}</Note>
          </StatValue>
          <StatValue
            label={t('reports.pace')}
            value={overview.requiredDailyHours}
            unit={t('today.per.day')}
          >
            <Note danger={behind}>
              {t(behind ? 'reports.pace.behind' : 'reports.pace.ok', {
                avg: averagePerDay,
              })}
            </Note>
          </StatValue>
          <StatValue
            label={t('reports.this.week')}
            value={thisWeekHours}
            unit="h"
          >
            {lastWeekHours !== null && (
              <Note>{t('reports.last.week', { hours: lastWeekHours })}</Note>
            )}
          </StatValue>
        </>
      ) : (
        <>
          <StatValue
            label={t('reports.daily.avg')}
            value={averagePerDay}
            unit={t('today.per.day')}
          >
            <Note>{t('reports.weekdays', { count: workedDays })}</Note>
          </StatValue>
          <Box />
          <Box />
        </>
      )}
    </GraphiteCard>
  );
};
