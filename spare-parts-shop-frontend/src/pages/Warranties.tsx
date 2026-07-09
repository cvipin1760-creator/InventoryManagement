import { Box, Typography, Card, CardContent, Grid, Chip, useTheme, Button, CircularProgress } from '@mui/material';
import { VerifiedUser, GppBad, HelpOutlined } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { format } from 'date-fns';

const Warranties = () => {
  const theme = useTheme();

  const { data: warranties = [], isLoading } = useQuery({
    queryKey: ['warranties'],
    queryFn: api.getWarranties
  });




  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Warranties
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage your product warranties.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<VerifiedUser />}>
          Register Warranty
        </Button>
      </Box>

      <Grid container spacing={3}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : warranties.length === 0 ? (
          <Box sx={{ width: '100%', textAlign: 'center', p: 5 }}>
            <Typography variant="body1" color="text.secondary">No warranties found.</Typography>
          </Box>
        ) : (
          warranties.map((war) => {
            // Assume war has: id, product name (or bill item), endDate, status
            const endDate = new Date(war.warrantyEndDate);
            const isActive = new Date() <= endDate;
            return (
              <Grid item xs={12} md={4} key={war.id}>
                <Card sx={{ 
                  borderRadius: 3, 
                  borderTop: `4px solid ${isActive ? theme.palette.success.main : theme.palette.error.main}` 
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        WAR-{war.id}
                      </Typography>
                      <Chip 
                        label={isActive ? 'Active' : 'Expired'} 
                        size="small" 
                        color={isActive ? 'success' : 'error'} 
                        variant={isActive ? 'filled' : 'outlined'} 
                      />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {war.productName || 'Product'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                      {isActive ? <VerifiedUser color="success" fontSize="small" /> : <GppBad color="error" fontSize="small" />}
                      <Typography variant="body2" color="text.secondary">
                        Valid until {format(endDate, 'dd MMM yyyy')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: theme.palette.mode === 'light' ? '#f8fafc' : '#1e293b' }}>

            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <HelpOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>Need Help?</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Having issues with a product under warranty? Contact support to file a claim.
              </Typography>
              <Button variant="outlined" size="small">File Claim</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Warranties;
