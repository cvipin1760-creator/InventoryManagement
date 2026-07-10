import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
} from '@mui/material';
import { Download, FileDown } from 'lucide-react';
import { api } from '../api/client';

export default function AccountingExport() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const showToast = (message: string, severity: 'success' | 'error' = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleExport = async (type: 'tally' | 'quickbooks') => {
    if (!startDate || !endDate) {
      showToast('Please select both start and end dates', 'error');
      return;
    }

    try {
      setLoading(true);
      const start = new Date(startDate).toISOString();
      const end = new Date(endDate).toISOString();
      
      if (type === 'tally') {
        await api.exportTally(start, end);
        showToast('Tally XML downloaded successfully', 'success');
      } else {
        await api.exportQuickBooks(start, end);
        showToast('QuickBooks CSV downloaded successfully', 'success');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Export failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Accounting Export
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Export your financial data to popular accounting software
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Select Date Range
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Export Format
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<FileDown />}
                  onClick={() => handleExport('tally')}
                  disabled={loading}
                  sx={{
                    py: 2,
                    justifyContent: 'flex-start',
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.50',
                    }
                  }}
                >
                  <Box sx={{ textAlign: 'left', ml: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Tally ERP 9 / Prime
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'none' }}>
                      Export as Tally compatible XML file
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Download />}
                  onClick={() => handleExport('quickbooks')}
                  disabled={loading}
                  sx={{
                    py: 2,
                    justifyContent: 'flex-start',
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.50',
                    }
                  }}
                >
                  <Box sx={{ textAlign: 'left', ml: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      QuickBooks Online
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'none' }}>
                      Export as QuickBooks compatible CSV file
                    </Typography>
                  </Box>
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Snackbar open={toast.open} autoHideDuration={6000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
