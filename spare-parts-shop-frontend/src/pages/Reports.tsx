import { Box, Typography, Card, CardContent, useTheme } from '@mui/material';
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
import { api } from '../api/client';

const Reports = () => {
  const theme = useTheme();

  const handleExportQuickBooks = () => {
    // Basic date range for last 30 days
    const endDate = new Date().toISOString();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/export/quickbooks?startDate=${startDate.toISOString()}&endDate=${endDate}`;
    
    // In a real app with JWT, you might need to fetch the blob manually instead of window.open
    // For demo purposes, we will fetch and download using the api client if possible, or just window.open if it works with cookies.
    // Let's use fetch with the token
    const token = localStorage.getItem('token');
    fetch(url, { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'quickbooks_export.csv';
        a.click();
      });
  };

  const handleExportTally = () => {
    const endDate = new Date().toISOString();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/export/tally?startDate=${startDate.toISOString()}&endDate=${endDate}`;
    
    const token = localStorage.getItem('token');
    fetch(url, { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'tally_export.xml';
        a.click();
      });
  };

  const reportCategories = [
    {
      title: 'Sales Reports',
      description: 'Daily, weekly, monthly sales',
      icon: <Receipt />,
      color: theme.palette.primary.main
    },
    {
      title: 'Purchase Reports',
      description: 'Purchase history & analysis',
      icon: <ShoppingCart />,
      color: theme.palette.success.main
    },
    {
      title: 'Inventory Reports',
      description: 'Stock levels & movements',
      icon: <Inventory />,
      color: theme.palette.warning.main
    },
    {
      title: 'Customer Reports',
      description: 'Customer activity & stats',
      icon: <People />,
      color: theme.palette.info.main
    },
    {
      title: 'Payment Reports',
      description: 'Payments received & pending',
      icon: <Money />,
      color: theme.palette.secondary.main
    },
    {
      title: 'Tax Reports',
      description: 'GST & tax summaries',
      icon: <PieChart />,
      color: theme.palette.error.main
    }
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Reports
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {reportCategories.map((report, index) => (
          <Box key={index} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 16px)' } }}>
            <Card
              sx={{
                borderRadius: 3,
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
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'light' ? '#f8fafc' : '#334155'
                }}
              >
                <FileDownload sx={{ color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Export All Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Download CSV/Excel files
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Accounting Exports */}
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
                    Download CSV for QuickBooks (Last 30 Days)
                  </Typography>
                </Box>
              </Box>
            </Box>
            
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
                    Tally ERP 9 Export
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Download XML for Tally (Last 30 Days)
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'light' ? '#f8fafc' : '#334155'
                }}
              >
                <DateRange sx={{ color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Custom Date Range
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generate reports for specific dates
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
