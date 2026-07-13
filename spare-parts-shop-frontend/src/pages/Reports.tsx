import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, useTheme, Button, TextField, Grid } from '@mui/material';
import {
  Receipt,
  ShoppingCart,
  Inventory,
  People,
  Money,
  PieChart,
  FileDownload,
  DateRange
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const Reports = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Date states initialized to last 30 days
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 30);
  
  const [startDate, setStartDate] = useState(defaultStart.toISOString().substring(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10));

  const handleExportQuickBooks = async () => {
    try {
      // Format to ISO with time portion expected by spring boot LocalDateTime
      const startIso = `${startDate}T00:00:00`;
      const endIso = `${endDate}T23:59:59`;
      await api.exportQuickBooks(startIso, endIso);
    } catch (e) {
      console.error(e);
      alert('Failed to export QuickBooks CSV');
    }
  };

  const handleExportTally = async () => {
    try {
      const startIso = `${startDate}T00:00:00`;
      const endIso = `${endDate}T23:59:59`;
      await api.exportTally(startIso, endIso);
    } catch (e) {
      console.error(e);
      alert('Failed to export Tally XML');
    }
  };

  const reportCategories = [
    {
      title: 'Sales Reports',
      description: 'Daily, weekly, monthly sales',
      icon: <Receipt />,
      color: theme.palette.primary.main,
      route: '/bills'
    },
    {
      title: 'Purchase Reports',
      description: 'Purchase history & analysis',
      icon: <ShoppingCart />,
      color: theme.palette.success.main,
      route: '/purchases'
    },
    {
      title: 'Inventory Reports',
      description: 'Stock levels & movements',
      icon: <Inventory />,
      color: theme.palette.warning.main,
      route: '/products'
    },
    {
      title: 'Customer Reports',
      description: 'Customer activity & stats',
      icon: <People />,
      color: theme.palette.info.main,
      route: '/customers'
    },
    {
      title: 'Payment Reports',
      description: 'Payments received & pending',
      icon: <Money />,
      color: theme.palette.secondary.main,
      route: '/payments'
    },
    {
      title: 'Tax Reports',
      description: 'GST & tax summaries',
      icon: <PieChart />,
      color: theme.palette.error.main,
      route: '/bills'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Reports & Exports
      </Typography>

      {/* Date Range Configurator Card */}
      <Card sx={{ borderRadius: 3, mb: 4, p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DateRange color="primary" /> Report Parameters
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button variant="outlined" fullWidth onClick={() => {
              const d = new Date();
              d.setDate(d.getDate() - 30);
              setStartDate(d.toISOString().substring(0, 10));
              setEndDate(new Date().toISOString().substring(0, 10));
            }}>
              Reset (30d)
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Report Categories
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {reportCategories.map((report, index) => (
          <Box key={index} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 16px)' } }}>
            <Card
              onClick={() => navigate(report.route)}
              sx={{
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.palette.mode === 'light'
                    ? '0 8px 30px rgba(0,0,0,0.12)'
                    : '0 8px 30px rgba(0,0,0,0.3)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${report.color}20`,
                    color: report.color,
                    mb: 2
                  }}
                >
                  {report.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {report.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {report.description}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Quick Actions */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Accounting Exports
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {/* QuickBooks Export */}
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <Box
                onClick={handleExportQuickBooks}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'light' ? '#f8fafc' : '#334155',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: theme.palette.action.hover }
                }}
              >
                <Receipt sx={{ color: theme.palette.success.main }} />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    QuickBooks Export
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Download CSV file for selected range
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Tally Export */}
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <Box
                onClick={handleExportTally}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'light' ? '#f8fafc' : '#334155',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: theme.palette.action.hover }
                }}
              >
                <Inventory sx={{ color: theme.palette.warning.main }} />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Tally ERP 9 / Prime Export
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Download XML file for selected range
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;
