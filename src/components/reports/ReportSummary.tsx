import React from 'react';
import { Box } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { ReportProjectSummary } from '../../utils/analytics';
import { GraphiteCard } from '../ui/graphite/GraphiteCard';
import { ProgressMeter } from '../ui/graphite/ProgressMeter';

/** 配分のあるプロジェクト全体の稼働。配分を超えていないかを最初に見せる */
export const ReportSummary: React.FC<{ summary: ReportProjectSummary }> = ({
  summary,
}) => {
  const { t } = useLanguage();
  const percent = Math.round(summary.ratio * 100);

  return (
    <GraphiteCard>
      <Box
        component="h2"
        sx={{ m: 0, fontSize: 12, fontWeight: 400, color: 'text.secondary' }}
      >
        {t('reports.summary.title')}
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          columnGap: 1.25,
          mt: 0.75,
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: 26,
            fontWeight: 500,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {summary.actualHours}
        </Box>
        <Box component="span" sx={{ fontSize: 13, color: 'text.secondary' }}>
          {t('reports.summary.ratio', {
            target: summary.targetHours,
            percent,
          })}
        </Box>
        <Box
          component="span"
          sx={{ ml: 'auto', fontSize: 12, color: 'text.secondary' }}
        >
          {t('reports.summary.counts', {
            over: summary.overCount,
            warning: summary.warningCount,
            tracking: summary.trackingHours,
          })}
        </Box>
      </Box>
      <ProgressMeter
        ratio={summary.ratio}
        color="text.primary"
        label={t('reports.summary.title')}
        sx={{ mt: 1.25 }}
      />
    </GraphiteCard>
  );
};
