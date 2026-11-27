import React from 'react';
import { Box } from '@mui/material';
import { ReportWeek } from '../../utils/analytics';
import { projectColorManager } from '../../utils/colorUtils';

const CHART_HEIGHT = 190;
const MAX_HOURS = 12;
/** 月〜金（Date#getDay の値） */
const WEEKDAY_SLOTS = [1, 2, 3, 4, 5];

export const WeeklyChart: React.FC<{
  weeks: ReportWeek[];
  projectOrder: string[];
}> = ({ weeks, projectOrder }) => {
  const px = (h: number) => (Math.min(h, MAX_HOURS) / MAX_HOURS) * CHART_HEIGHT;

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          height: CHART_HEIGHT,
          mt: 2.25,
          px: 0.5,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 2.25,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        {[4, 8].map((h) => (
          <Box
            key={h}
            aria-hidden
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: px(h),
              borderTop: 1,
              borderStyle: 'dashed',
              borderColor: 'divider',
              fontSize: 10.5,
              color: 'text.disabled',
            }}
          >
            <Box
              component="span"
              sx={{ position: 'absolute', right: 0, top: -14 }}
            >{`${h}h`}</Box>
          </Box>
        ))}
        {weeks.map((week) => (
          <Box
            key={week.label}
            sx={{
              flex: 1,
              display: 'flex',
              gap: '5px',
              alignItems: 'flex-end',
              height: '100%',
            }}
          >
            {/* 月初・月末で平日が少ない週も5日分の枠を取り、棒の幅をそろえる */}
            {WEEKDAY_SLOTS.map((slot) => {
              const day = week.days.find((d) => d.date.getDay() === slot);
              if (!day) {
                return (
                  <Box
                    key={slot}
                    data-testid="report-day-slot"
                    sx={{ flex: 1 }}
                  />
                );
              }
              return (
                <Box
                  key={slot}
                  data-testid="report-day-slot"
                  role="img"
                  aria-label={`${day.date.getMonth() + 1}/${day.date.getDate()} ${day.total}h`}
                  sx={(theme) => ({
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    gap: '2px',
                    ...(day.isToday && {
                      outline: `1px solid ${theme.custom.tokens.border2}`,
                      outlineOffset: 3,
                      borderRadius: 1,
                    }),
                    ...(day.isFuture && {
                      height: '100%',
                      border: `1px dashed ${theme.custom.tokens.border2}`,
                      borderRadius: 1,
                    }),
                  })}
                >
                  {!day.isFuture &&
                    projectOrder
                      .filter((pid) => day.byProject[pid])
                      .map((pid) => (
                        <Box
                          key={pid}
                          sx={{
                            height: px(day.byProject[pid]),
                            borderRadius: '3px',
                            bgcolor: projectColorManager.getColorById(pid),
                          }}
                        />
                      ))}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 2.25,
          pt: 1,
          px: 0.5,
          fontSize: 11.5,
          color: 'text.disabled',
        }}
      >
        {weeks.map((week) => (
          <Box
            key={week.label}
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'space-between',
              whiteSpace: 'nowrap',
            }}
          >
            <span>{week.label}</span>
            <Box
              component="b"
              sx={{ fontWeight: 500, color: 'text.secondary' }}
            >{`${week.total}h`}</Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
