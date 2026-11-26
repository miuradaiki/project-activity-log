import React from 'react';
import { Box } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { MonthOverview } from '../../utils/analytics';
import { formatClock } from '../../utils/formatters';
import { projectColorManager } from '../../utils/colorUtils';
import { GraphiteCard } from '../ui/graphite/GraphiteCard';
import { StatValue } from '../ui/graphite/StatValue';

interface TodayStatsProps {
  todayHours: { projectId: string; hours: number }[];
  monthOverview: MonthOverview;
}

/** 今日のバーは 8h を満幅とする（1日の標準稼働） */
const DAY_SCALE_HOURS = 8;

export const TodayStats: React.FC<TodayStatsProps> = ({
  todayHours,
  monthOverview,
}) => {
  const { t } = useLanguage();
  const total = todayHours.reduce((sum, h) => sum + h.hours, 0);

  return (
    <GraphiteCard
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 2.25,
      }}
    >
      <StatValue
        label={t('today.hours.today')}
        value={formatClock(total * 3600_000, false)}
        unit="h"
      >
        <Box
          aria-hidden
          sx={{
            display: 'flex',
            height: 4,
            mt: 1.25,
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: 'action.hover',
          }}
        >
          {todayHours.map((h) => (
            <Box
              key={h.projectId}
              sx={{
                width: `${Math.min(100, (h.hours / DAY_SCALE_HOURS) * 100)}%`,
                bgcolor: projectColorManager.getColorById(h.projectId),
              }}
            />
          ))}
        </Box>
      </StatValue>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <StatValue
          label={t('today.month')}
          value={Math.round(monthOverview.ratio * 100)}
          unit="%"
          size={26}
        />
        <StatValue
          label={t('today.pace')}
          value={monthOverview.requiredDailyHours}
          unit={t('today.per.day')}
          size={26}
        />
      </Box>
    </GraphiteCard>
  );
};
