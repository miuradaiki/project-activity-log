import React from 'react';
import { Box } from '@mui/material';
import { useLanguage } from '../../../contexts/LanguageContext';

export const OverTag: React.FC<{ hours: number }> = ({ hours }) => {
  const { t } = useLanguage();
  return (
    <Box
      component="span"
      sx={(theme) => ({
        fontSize: 11,
        fontWeight: 500,
        px: 0.875,
        py: 0.25,
        borderRadius: 1.5,
        whiteSpace: 'nowrap',
        color: 'error.main',
        bgcolor: `${theme.palette.error.main}1F`,
      })}
    >
      {t('today.over', { hours })}
    </Box>
  );
};
