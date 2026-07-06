import { Box, Typography, Card, CardContent, List, ListItem, ListItemAvatar, Avatar, ListItemText } from '@mui/material';
import {
  AttachMoney,
  Receipt,
  People,
  Warning,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';

const Analytics = () => {
  const theme = useTheme();

  // Sample data
  const revenueData = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 4500 },
    { month: 'May', revenue: 6000 },
    { month: 'Jun', revenue: 8000 },
  ];

  const metrics = [
    {
      title: 'Total Revenue',
      value: '₹1,24,580',
      change: '12.5%',
      changeType: 'increase',
      icon: <AttachMoney />,
      color: theme.palette.success.main
    },
    {
      title: 'Total Sales',
      value: '1,234',
      change: '8.2%',
      changeType: 'increase',
      icon: <Receipt />,
      color: theme.palette.primary.main
    },
    {
      title: 'Total Customers',
      value: '345',
      change: '5.1%',
      changeType: 'increase',
      icon: <People />,
      color: theme.palette.info.main
    },
    {
      title: 'Low Stock Items',
      value: '18',
      change: '3.4%',
      changeType: 'decrease',
      icon: <Warning />,
      color: theme.palette.warning.main
    },
  ];

  const topProducts = [
    { name: 'Engine Oil 5W-30', sales: '₹45,800', category: 'Lubricants' },
    { name: 'Brake Pads Front', sales: '₹32,400', category: 'Brakes' },
    { name: 'Air Filter', sales: '₹28,200', category: 'Filters' },
    { name: 'Oil Filter', sales: '₹25,600', category: 'Filters' },
    { name: 'Spark Plug', sales: '₹18,900', category: 'Electrical' },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Analytics
      </Typography>

      {/* Key Metrics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {metrics.map((metric, index) => (
          <Box key={index} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: `${metric.color}20`,
                      color: metric.color
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      backgroundColor: `${metric.changeType === 'increase' ? theme.palette.success.main : theme.palette.error.main}20`,
                      color: metric.changeType === 'increase' ? theme.palette.success.main : theme.palette.error.main
                    }}
                  >
                    {metric.changeType === 'increase' ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {metric.change}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {metric.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {metric.value}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Charts Section */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(66.666% - 12px)' } }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Sales Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: 'none',
                      boxShadow: theme.palette.mode === 'light'
                        ? '0 4px 20px -5px rgba(0,0,0,0.15)'
                        : '0 4px 20px -5px rgba(0,0,0,0.3)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 12px)' } }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Top Products
              </Typography>
              <List>
                {topProducts.map((product, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 2 }}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          backgroundColor: `${theme.palette.primary.main}20`,
                          color: theme.palette.primary.main
                        }}
                      >
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {product.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            {product.category}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {product.sales}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Analytics;
