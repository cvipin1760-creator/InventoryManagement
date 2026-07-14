
import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, useTheme, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Alert, TextField } from '@mui/material';
import { FileText, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { format } from 'date-fns';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser } from '../store/slices/authSlice';

const Emis = () => {
  const theme = useTheme();
  const user = useAppSelector(selectCurrentUser);
  const [selectedEmi, setSelectedEmi] = useState<any>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);

  const { data: emis = [], isLoading, error } = useQuery({
    queryKey: ['emis'],
    queryFn: api.getEmis,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'OVERDUE':
        return 'error';
      case 'PARTIALLY_PAID':
        return 'warning';
      case 'CANCELLED':
        return 'default';
      default:
        return 'info';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            EMI Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track and manage all EMI records and installments
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {(error as Error).message}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
          <CircularProgress />
        </Box>
      ) : emis.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Box sx={{ color: 'text.disabled', mb: 2 }}>
            <FileText size={64} />
          </Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            No EMI Records Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            EMI records are created automatically when creating sales bills with EMI payment mode
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {emis.map((emi: any) => (
            <Grid item xs={12} md={6} lg={4} key={emi.id}>
              <Card 
                sx={{ borderRadius: 3, cursor: 'pointer' }}
                onClick={() => {
                  setSelectedEmi(emi);
                  setOpenDetailDialog(true);
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      EMI #{emi.id}
                    </Typography>
                    <Chip 
                      label={emi.emisRemaining === 0 ? 'COMPLETED' : 'ACTIVE'} 
                      size="small" 
                      color={emi.emisRemaining === 0 ? 'success' : 'primary'} 
                      variant="filled" 
                    />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {emi.customer?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Invoice: #{emi.bill?.id}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Total Amount
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        ₹{emi.totalAmount?.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Monthly EMI
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        ₹{emi.emiAmount?.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Paid
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {emi.emisPaid} / {emi.totalEmis}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Remaining
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        ₹{emi.remainingAmount?.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>

                  {emi.nextEmiDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Calendar size={16} color={theme.palette.text.secondary} />
                      <Typography variant="caption" color="text.secondary">
                        Next Due: {format(new Date(emi.nextEmiDate), 'dd MMM yyyy')}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* EMI Detail Dialog */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>EMI Details</DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          {selectedEmi && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
                  <Typography variant="body1">{selectedEmi.customer?.name} ({selectedEmi.customer?.phone})</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Invoice</Typography>
                  <Typography variant="body1">#{selectedEmi.bill?.id}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Down Payment</Typography>
                  <Typography variant="body1">₹{selectedEmi.downPayment?.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Loan Amount</Typography>
                  <Typography variant="body1">₹{selectedEmi.loanAmount?.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Interest Rate</Typography>
                  <Typography variant="body1">{selectedEmi.interestRate}%</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Processing Fee</Typography>
                  <Typography variant="body1">₹{selectedEmi.processingFee?.toLocaleString()}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Installment Schedule
              </Typography>

              <EmiInstallmentList emiId={selectedEmi.id} />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

const EmiInstallmentList = ({ emiId }: { emiId: number }) => {
  const { data: installments = [], isLoading, error } = useQuery({
    queryKey: ['emiInstallments', emiId],
    queryFn: () => api.getEmiInstallments(emiId),
  });

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as Error).message}
        </Alert>
      )}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {installments.map((installment: any) => (
            <Card key={installment.id} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={`#${installment.installmentNumber}`} 
                    size="small" 
                    variant="outlined"
                  />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      ₹{installment.amount?.toLocaleString()}
                    </Typography>
                    {installment.paidAmount > 0 && (
                      <Typography variant="caption" color="success.main">
                        Paid: ₹{installment.paidAmount?.toLocaleString()}
                      </Typography>
                    )}
                    {installment.remainingAmount > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Remaining: ₹{installment.remainingAmount?.toLocaleString()}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Due: {format(new Date(installment.dueDate), 'dd MMM yyyy')}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={installment.status} 
                    size="small" 
                    color={
                      installment.status === 'PAID' ? 'success' :
                      installment.status === 'OVERDUE' ? 'error' :
                      installment.status === 'PARTIALLY_PAID' ? 'warning' :
                      'default'
                    } 
                    variant="filled" 
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Emis;
