import React from 'react';
import { Box } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';
import { Project } from '../../types';
import { projectColorManager } from '../../utils/colorUtils';

interface ProjectSharesProps {
  shares: { projectId: string; hours: number; share: number }[];
  projects: Project[];
}

export const ProjectShares: React.FC<ProjectSharesProps> = ({
  shares,
  projects,
}) => {
  const { t } = useLanguage();
  if (shares.length === 0) {
    return (
      <Box sx={{ mt: 2.25, fontSize: 13, color: 'text.secondary' }}>
        {t('reports.no.data')}
      </Box>
    );
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2.25 }}>
      {shares.map(({ projectId, hours, share }) => {
        const project = projects.find((p) => p.id === projectId);
        const tracking = project ? project.monthlyCapacity <= 0 : false;
        const color = projectColorManager.getColorById(projectId);
        return (
          <Box
            key={projectId}
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              rowGap: 0.875,
              fontSize: 13,
              color: tracking ? 'text.secondary' : 'text.primary',
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
                {project?.name ?? projectId}
              </Box>
              {tracking && (
                <Box component="span" sx={{ color: 'text.disabled' }}>
                  {t('reports.tracking.suffix')}
                </Box>
              )}
            </Box>
            <Box
              sx={{
                fontVariantNumeric: 'tabular-nums',
                color: 'text.secondary',
              }}
            >
              <Box
                component="b"
                sx={{ color: 'text.primary', fontWeight: 500 }}
              >{`${hours}h`}</Box>
              {` · ${Math.round(share * 100)}%`}
            </Box>
            <Box
              sx={{
                gridColumn: '1 / -1',
                height: 6,
                borderRadius: 6,
                bgcolor: 'action.hover',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: `${share * 100}%`,
                  height: '100%',
                  bgcolor: color,
                  opacity: tracking ? 0.5 : 1,
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
