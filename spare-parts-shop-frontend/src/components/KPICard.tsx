import { Card, CardContent, Box, Typography, useTheme, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease';
  subtitle?: string;
  sx?: SxProps<Theme>;
}

const KPICard = ({ title, value, icon, change, changeType, subtitle, sx }: KPICardProps) => {
  const theme = useTheme();

  const getChangeColor = () => {
    if (!change) return 'text.secondary';
    return changeType === 'increase' ? 'success.main' : 'error.main';
  };

  const getChangePrefix = () => {
    if (!change) return '';
    return changeType === 'increase' ? '+' : '-';
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)',
        ...sx,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mt: 1 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: theme.palette.primary.main + '15',
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>

        {change && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color={getChangeColor()} sx={{ fontWeight: 600 }}>
              {getChangePrefix()}{change}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;
