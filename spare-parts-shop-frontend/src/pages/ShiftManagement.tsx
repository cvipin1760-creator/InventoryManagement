import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Paper, CircularProgress, Alert } from '@mui/material';
import { shiftApi, Shift } from '../api/shiftApi';
import toast from 'react-hot-toast';

export default function ShiftManagement() {
  const [shift, setShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [openingCash, setOpeningCash] = useState<string>('');
  const [closingCash, setClosingCash] = useState<string>('');

  useEffect(() => {
    fetchCurrentShift();
  }, []);

  const fetchCurrentShift = async () => {
    try {
      setLoading(true);
      const current = await shiftApi.getCurrentShift();
      setShift(current);
    } catch (error: any) {
      if (error.response?.status !== 404 && error.message !== 'Unexpected end of JSON input') {
        toast.error('Failed to fetch shift status');
      }
      setShift(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenShift = async () => {
    if (!openingCash) {
      toast.error('Please enter opening cash');
      return;
    }
    try {
      const newShift = await shiftApi.openShift(Number(openingCash));
      setShift(newShift);
      toast.success('Shift opened successfully!');
      setOpeningCash('');
    } catch (error) {
      toast.error('Failed to open shift');
    }
  };

  const handleCloseShift = async () => {
    if (!closingCash) {
      toast.error('Please enter closing cash');
      return;
    }
    try {
      await shiftApi.closeShift(Number(closingCash));
      setShift(null);
      toast.success('Shift closed successfully!');
      setClosingCash('');
    } catch (error) {
      toast.error('Failed to close shift');
    }
  };

  if (loading) return <Box p={3}><CircularProgress /></Box>;

  return (
    <Box p={3} maxWidth={600} mx="auto">
      <Typography variant="h4" gutterBottom>Shift Management</Typography>
      
      {shift ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            Register is currently OPEN
          </Alert>
          <Typography variant="body1" gutterBottom>
            <strong>Started at:</strong> {new Date(shift.startTime).toLocaleString()}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Opening Cash:</strong> ₹{shift.openingCash}
          </Typography>
          
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>Close Register</Typography>
            <TextField
              fullWidth
              label="Actual Closing Cash in Drawer (₹)"
              type="number"
              value={closingCash}
              onChange={(e) => setClosingCash(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" color="error" fullWidth onClick={handleCloseShift}>
              Close Shift
            </Button>
          </Box>
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Register is currently CLOSED
          </Alert>
          <Typography variant="body1" gutterBottom>
            You must open a shift before you can access the POS and start billing.
          </Typography>
          
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>Open Register</Typography>
            <TextField
              fullWidth
              label="Opening Cash (₹)"
              type="number"
              value={openingCash}
              onChange={(e) => setOpeningCash(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" color="primary" fullWidth onClick={handleOpenShift}>
              Open Shift
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
