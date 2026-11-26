import React from 'react';
import { Box } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { TimelineSegment } from '../../utils/analytics';
import { projectColorManager } from '../../utils/colorUtils';
import { GraphiteCard } from '../ui/graphite/GraphiteCard';

interface DayTimelineProps {
  segments: TimelineSegment[];
  /** 現在時刻の位置（%）。帯の外なら null */
  nowPosition: number | null;
  startHour?: number;
  endHour?: number;
}

export const DayTimeline: React.FC<DayTimelineProps> = ({
  segments,
  nowPosition,
  startHour = 6,
  endHour = 21,
}) => {
  const { t } = useLanguage();
  const ticks: number[] = [];
  for (let h = startHour; h <= endHour; h += 3) ticks.push(h);

  return (
    <GraphiteCard>
      <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
        {t('today.timeline')}
      </Box>
      <Box
        sx={{
          position: 'relative',
          height: 30,
          borderRadius: 2,
          bgcolor: 'action.hover',
          mt: 1.75,
          mb: 1,
        }}
      >
        {segments.map((s) => (
          <Box
            key={s.id}
            sx={{
              position: 'absolute',
              top: 4,
              bottom: 4,
              left: `${s.left}%`,
              width: `${s.width}%`,
              minWidth: 3,
              borderRadius: 1.25,
              bgcolor: projectColorManager.getColorById(s.projectId),
            }}
          />
        ))}
        {nowPosition !== null && (
          <Box
            data-testid="timeline-now"
            sx={{
              position: 'absolute',
              top: -5,
              bottom: -5,
              width: 2,
              borderRadius: 1,
              left: `${nowPosition}%`,
              bgcolor: 'error.main',
            }}
          />
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'text.disabled',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {ticks.map((h) => (
          <span key={h}>{`${h}:00`}</span>
        ))}
      </Box>
    </GraphiteCard>
  );
};
