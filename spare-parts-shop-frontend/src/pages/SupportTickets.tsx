
import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, useTheme, CircularProgress, Dialog, DialogTitle, DialogContent, Divider, Alert, Button, Select, MenuItem, FormControl, InputLabel, TextField, DialogActions } from '@mui/material';
import { FileText, Calendar, CheckCircle, Clock, XCircle, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { format } from 'date-fns';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser } from '../store/slices/authSlice';
import { SupportTicket as SupportTicketType } from '../types';

const SupportTickets = () => {
  const theme = useTheme();
  const user = useAppSelector(selectCurrentUser);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketType | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const { data: tickets = [], isLoading, error } = useQuery({
    queryKey: ['supportTickets'],
    queryFn: async () => {
      return await api.getSupportTickets();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'success';
      case 'IN_PROGRESS':
        return 'info';
      case 'CLOSED':
        return 'default';
      default:
        return 'warning';
    }
  };

  const getTicketTypeColor = (type: string) => {
    switch (type) {
      case 'WARRANTY':
        return 'primary';
      case 'RETURN':
        return 'error';
      case 'EXCHANGE':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Support Tickets
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage customer support tickets and warranty claims
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus />} onClick={() => setOpenCreateDialog(true)}>
          New Ticket
        </Button>
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
      ) : tickets.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <Box sx={{ color: 'text.disabled', mb: 2 }}>
            <FileText size={64} />
          </Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            No Tickets Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            No support tickets have been created yet
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {tickets.map((ticket: SupportTicketType) => (
            <Grid item xs={12} md={6} lg={4} key={ticket.id}>
              <Card 
                sx={{ borderRadius: 3, cursor: 'pointer' }}
                onClick={() => {
                  setSelectedTicket(ticket);
                  setOpenDetailDialog(true);
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Chip 
                      label={ticket.ticketType} 
                      size="small" 
                      color={getTicketTypeColor(ticket.ticketType)} 
                      variant="filled" 
                    />
                    <Chip 
                      label={ticket.status} 
                      size="small" 
                      color={getStatusColor(ticket.status)} 
                      variant="outlined" 
                    />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: '1rem' }}>
                    {ticket.subject}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {ticket.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {ticket.customer?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(ticket.createdAt), 'dd MMM yyyy')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Ticket Detail Dialog */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Ticket Details</DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          {selectedTicket && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
                  <Typography variant="body1">{selectedTicket.customer?.name} ({selectedTicket.customer?.phone})</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                  <Typography variant="body1">{format(new Date(selectedTicket.createdAt), 'dd MMM yyyy HH:mm')}</Typography>
                </Grid>
                {selectedTicket.warranty && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Warranty</Typography>
                    <Typography variant="body1">#{selectedTicket.warranty?.id} - {selectedTicket.warranty?.product?.name}</Typography>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {selectedTicket.subject}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedTicket.description}
              </Typography>

              {selectedTicket.resolution && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'success.main' }}>
                    Resolution
                  </Typography>
                  <Typography variant="body1">{selectedTicket.resolution}</Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create Ticket Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Ticket</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Creating tickets will be available in future updates
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupportTickets;
