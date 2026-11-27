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
  // 何時台の作業かを読み取れるよう、帯の中に毎時の区切りを引く（ラベルと同じ3時間ごとは少し濃く）
  const hourLines: number[] = [];
  for (let h = startHour + 1; h < endHour; h++) hourLines.push(h);
  const positionOf = (h: number) =>
    ((h - startHour) / (endHour - startHour)) * 100;

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
        {hourLines.map((h) => {
          const major = (h - startHour) % 3 === 0;
          return (
            <Box
              key={h}
              aria-hidden
              data-testid="timeline-hour-line"
              data-hour={h}
              data-major={major}
              sx={(theme) => ({
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: '1px',
                left: `${positionOf(h)}%`,
                bgcolor: major
                  ? theme.custom.tokens.border2
                  : theme.palette.divider,
              })}
            />
          );
        })}
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
