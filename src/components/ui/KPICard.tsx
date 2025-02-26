import React from 'react';
import { Box, Card, CardContent, Typography, SvgIconProps, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactElement<SvgIconProps>;
  trend?: {
    value: number;
    label: string;
  };
  color?: string;
}

/**
 * KPIカードコンポーネント - ダッシュボードの統計情報を表示するためのカード
 */
export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  trend,
  color,
}) => {
  const theme = useTheme();
  const iconColor = color || theme.palette.primary.main;

  // トレンドアイコンと色を決定
  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend.value > 0) {
      return <TrendingUp fontSize="small" sx={{ color: theme.palette.success.main }} />;
    } else if (trend.value < 0) {
      return <TrendingDown fontSize="small" sx={{ color: theme.palette.error.main }} />;
    } else {
      return <TrendingFlat fontSize="small" sx={{ color: theme.palette.text.secondary }} />;
    }
  };

  const trendIcon = getTrendIcon();
  const trendColor = trend?.value > 0 
    ? theme.palette.success.main 
    : trend?.value < 0 
      ? theme.palette.error.main 
      : theme.palette.text.secondary;

  return (
    <Card 
      sx={{
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          backgroundColor: iconColor,
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
          }}
        >
          <Box 
            sx={{ 
              mr: 1.5, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: `${iconColor}22`,
              borderRadius: '50%',
              width: 40,
              height: 40,
            }}
          >
            {React.cloneElement(icon, { style: { color: iconColor } })}
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            {title}
          </Typography>
        </Box>
        
        <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'medium' }}>
          {value}
        </Typography>
        
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
            {trendIcon}
            <Typography 
              variant="body2" 
              sx={{ ml: 0.5, color: trendColor, fontWeight: 'medium' }}
            >
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              {trend.label}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};