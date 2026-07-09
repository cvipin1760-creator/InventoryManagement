import { Box, Typography, Card, CardContent, Grid, LinearProgress, useTheme, CircularProgress } from '@mui/material';
import { AccountBalanceWallet, Schedule, CheckCircle } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { format } from 'date-fns';

const CustomerEmi = () => {
  const theme = useTheme();

  const { data: emis = [], isLoading } = useQuery({
    queryKey: ['emis'],
    queryFn: api.getEmis
  });


  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        My EMI Options
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your active EMIs and financing options.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : emis.length === 0 ? (
            <Card sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">No active EMIs found.</Typography>
              </CardContent>
            </Card>
          ) : (
            emis.map((emi: any) => {
              const progress = emi.totalEmis > 0 ? (emi.emisPaid / emi.totalEmis) * 100 : 0;
              return (
                <Card sx={{ borderRadius: 3, mb: 3 }} key={emi.id}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Active EMI: {emi.planName || 'Purchase Finance'}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                        ₹{emi.emiAmount} / month
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Progress ({emi.emisPaid}/{emi.totalEmis} Months)</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{Math.round(progress)}% Paid</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5, mb: 4 }} />

                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule color="warning" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Next Due Date</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {emi.nextEmiDate ? format(new Date(emi.nextEmiDate), 'dd MMM, yyyy') : 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccountBalanceWallet color="info" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Remaining Balance</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{emi.emiAmount * emi.emisRemaining}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle color="success" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">Total Paid</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{emi.emiAmount * emi.emisPaid}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })
          )}

          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Looking for new financing?</Typography>
              <Typography variant="body2" color="text.secondary">
                We are partnering with top financial institutions to bring you instant EMI approvals on all products soon. Stay tuned!
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, height: '100%', bgcolor: theme.palette.primary.main, color: 'primary.contrastText' }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <AccountBalanceWallet sx={{ fontSize: 64, mb: 2, opacity: 0.8 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Pre-Approved Limit
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 4 }}>
                ₹50,000
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Use your pre-approved limit to convert any purchase above ₹5,000 into easy EMIs at checkout.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerEmi;
