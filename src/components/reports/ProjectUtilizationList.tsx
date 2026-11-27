import React from 'react';
import { Box } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { Project } from '../../types';
import { ReportProjectRow } from '../../utils/analytics';
import { projectColorManager } from '../../utils/colorUtils';
import { ProgressMeter } from '../ui/graphite/ProgressMeter';

interface ProjectUtilizationListProps {
  rows: ReportProjectRow[];
  projects: Project[];
}

const round1 = (n: number) => Math.round(n * 10) / 10;

const Percent: React.FC<{ row: ReportProjectRow }> = ({ row }) => {
  const { t } = useLanguage();
  if (row.isTrackingOnly) {
    return (
      <Box component="span" sx={{ color: 'text.disabled' }}>
        —
      </Box>
    );
  }
  const percent = `${Math.round(row.ratio * 100)}%`;
  if (row.status !== 'over') {
    return (
      <Box
        component="span"
        sx={{ color: row.status === 'warning' ? 'warning.main' : undefined }}
      >
        {percent}
      </Box>
    );
  }
  return (
    <Box
      component="span"
      sx={{
        px: 1,
        py: 0.25,
        borderRadius: 1,
        bgcolor: 'error.main',
        color: 'error.contrastText',
        fontSize: 11.5,
        whiteSpace: 'nowrap',
      }}
    >
      <span>{percent}</span>
      {` ${t('reports.over.hours', {
        hours: round1(row.actualHours - row.targetHours),
      })}`}
    </Box>
  );
};

/**
 * プロジェクトごとの配分に対する実績。追跡のみは配分がないため、
 * 一覧の中で一番大きい時間を基準にした長さで描き、後ろに薄く並べる。
 */
export const ProjectUtilizationList: React.FC<ProjectUtilizationListProps> = ({
  rows,
  projects,
}) => {
  const { t } = useLanguage();

  if (rows.length === 0) {
    return (
      <Box sx={{ mt: 2.25, fontSize: 13, color: 'text.secondary' }}>
        {t('reports.no.data')}
      </Box>
    );
  }

  const scale = Math.max(
    1,
    ...rows.map((r) => Math.max(r.targetHours, r.actualHours))
  );

  return (
    <Box sx={{ mt: 1 }}>
      {rows.map((row) => {
        const project = projects.find((p) => p.id === row.projectId);
        const name = project?.name ?? row.projectId;
        const color = projectColorManager.getColorById(row.projectId);
        return (
          <Box
            key={row.projectId}
            data-testid="report-project-row"
            data-name={name}
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr) auto auto',
                md: 'minmax(0, 200px) minmax(0, 1fr) 96px 92px',
              },
              columnGap: 1.75,
              rowGap: 0.75,
              alignItems: 'center',
              py: 1.375,
              fontSize: 13,
              color: row.isTrackingOnly ? 'text.secondary' : 'text.primary',
              '& + &': { borderTop: 1, borderColor: 'divider' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minWidth: 0,
              }}
            >
              <Box
                aria-hidden
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '3px',
                  flex: 'none',
                  bgcolor: color,
                }}
              />
              <Box
                component="span"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </Box>
              <Box
                component="span"
                sx={{ color: 'text.disabled', flex: 'none' }}
              >
                {row.isTrackingOnly
                  ? t('reports.tracking')
                  : `${Math.round((project?.monthlyCapacity ?? 0) * 100)}%`}
              </Box>
            </Box>
            <ProgressMeter
              ratio={row.isTrackingOnly ? row.actualHours / scale : row.ratio}
              color={color}
              height={8}
              label={name}
              sx={{
                gridColumn: { xs: '1 / -1', md: 'auto' },
                gridRow: { xs: 2, md: 'auto' },
                opacity: row.isTrackingOnly ? 0.5 : 1,
              }}
            />
            <Box
              sx={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
            >
              {row.isTrackingOnly
                ? `${row.actualHours}h`
                : `${row.actualHours} / ${row.targetHours}h`}
            </Box>
            <Box
              sx={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
            >
              <Percent row={row} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
