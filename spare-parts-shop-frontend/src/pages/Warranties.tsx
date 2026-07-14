import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, useTheme, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Snackbar } from '@mui/material';
import { VerifiedUser, GppBad, HelpOutlined } from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import { format } from 'date-fns';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser } from '../store/slices/authSlice';

const Warranties = () => {
  const theme = useTheme();
  const currentUser = useAppSelector(selectCurrentUser);

  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
  const [openClaimDialog, setOpenClaimDialog] = useState(false);
  
  // Claim form state
  const [claimSubject, setClaimSubject] = useState('');
  const [claimDescription, setClaimDescription] = useState('');
  const [claimProduct, setClaimProduct] = useState<any>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: warranties = [], isLoading, refetch } = useQuery({
    queryKey: ['warranties'],
    queryFn: api.getWarranties
  });

  const claimMutation = useMutation({
    mutationFn: (data: { subject: string; description: string }) => 
      api.submitSupportTicket(data),
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Warranty claim ticket submitted successfully!', severity: 'success' });
      setOpenClaimDialog(false);
      setClaimSubject('');
      setClaimDescription('');
      setClaimProduct(null);
    },
    onError: (err: any) => {
      setSnackbar({ open: true, message: err.message || 'Failed to submit claim ticket', severity: 'error' });
    }
  });

  const handleOpenClaim = (war: any) => {
    setClaimProduct(war);
    setClaimSubject(`Warranty Claim for ${war.product?.name || 'Product'}`);
    setClaimDescription(`Filing a warranty claim for WAR-${war.id}. Please specify the issues encountered here...`);
    setOpenClaimDialog(true);
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    claimMutation.mutate({
      subject: claimSubject,
      description: claimDescription,
    });
  };

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
        <Button variant="contained" startIcon={<VerifiedUser />} onClick={() => setOpenRegisterDialog(true)}>
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
            const endDate = new Date(war.warrantyEndDate);
            const isActive = new Date() <= endDate;
            return (
              <Grid item xs={12} md={4} key={war.id}>
                <Card sx={{ 
                  borderRadius: 3, 
                  borderTop: `4px solid ${isActive ? theme.palette.success.main : theme.palette.error.main}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
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
                        {war.product?.name || 'Product'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                        {isActive ? <VerifiedUser color="success" fontSize="small" /> : <GppBad color="error" fontSize="small" />}
                        <Typography variant="body2" color="text.secondary">
                          Valid until {format(endDate, 'dd MMM yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {isActive && (
                      <Button 
                        variant="outlined" 
                        size="small" 
                        fullWidth 
                        sx={{ mt: 3 }}
                        onClick={() => handleOpenClaim(war)}
                      >
                        File Claim
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: theme.palette.mode === 'light' ? '#f8fafc' : '#1e293b' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <HelpOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>Need Help?</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Having issues with a product under warranty? Contact support to file a claim.
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => {
                  setClaimProduct(null);
                  setClaimSubject('General Support Request');
                  setClaimDescription('Describe your support or warranty query here...');
                  setOpenClaimDialog(true);
                }}
              >
                File General Ticket
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Info Dialog for manual register */}
      <Dialog open={openRegisterDialog} onClose={() => setOpenRegisterDialog(false)}>
        <DialogTitle>Register Warranty</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Warranties are automatically registered upon completing a sales purchase or invoice.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            If you have a physical receipt or product serial number that was not registered automatically, please contact our support desk to have it manually added.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRegisterDialog(false)}>Ok</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for filing a support claim ticket */}
      <Dialog open={openClaimDialog} onClose={() => setOpenClaimDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>File Warranty Claim / Ticket</DialogTitle>
        {currentUser?.role !== 'CUSTOMER' ? (
          <DialogContent>
            <Alert severity="warning">
              Only customers logged into their portal can file support tickets/claims directly.
            </Alert>
          </DialogContent>
        ) : (
          <form onSubmit={handleClaimSubmit}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Subject"
                required
                fullWidth
                value={claimSubject}
                onChange={(e) => setClaimSubject(e.target.value)}
              />
              <TextField
                label="Description of issues"
                required
                multiline
                rows={4}
                fullWidth
                value={claimDescription}
                onChange={(e) => setClaimDescription(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenClaimDialog(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={claimMutation.isPending}>
                Submit Claim
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Warranties;
