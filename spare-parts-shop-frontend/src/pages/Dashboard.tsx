import { Box, Grid, Typography, Card, CardContent, useTheme } from '@mui/material';
import {
  AttachMoney,
  ShoppingCart,
  Inventory,
  People,
  Receipt,
  TrendingUp,
  NewReleases,
  Business,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '../components/KPICard';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser } from '../store/slices/authSlice';

// Sample data for chart
const revenueData = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 3000 },
  { month: 'Mar', revenue: 5000 },
  { month: 'Apr', revenue: 4500 },
  { month: 'May', revenue: 6000 },
  { month: 'Jun', revenue: 8000 },
];

const Dashboard = () => {
  const theme = useTheme();
  const user = useAppSelector(selectCurrentUser);

  // Render different dashboard based on role
  const renderRoleBasedDashboard = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              Platform Overview
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Total Businesses"
                  value="284"
                  icon={<Business />}
                  change="12%"
                  changeType="increase"
                  subtitle="from last month"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Active Businesses"
                  value="267"
                  icon={<TrendingUp />}
                  change="8%"
                  changeType="increase"
                  subtitle="active right now"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Monthly Revenue"
                  value="₹1,24,580"
                  icon={<AttachMoney />}
                  change="15%"
                  changeType="increase"
                  subtitle="vs last month"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Total Users"
                  value="1,240"
                  icon={<People />}
                  change="22%"
                  changeType="increase"
                  subtitle="registered users"
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Revenue Trend
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
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Recent Activity
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[1, 2, 3, 4].map((i) => (
                        <Box
                          key={i}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: theme.palette.mode === 'light'
                              ? '#f8fafc'
                              : '#334155',
                          }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: theme.palette.primary.main + '20',
                              color: theme.palette.primary.main,
                            }}
                          >
                            {i % 2 === 0 ? <People /> : <ShoppingCart />}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {i % 2 === 0 ? 'New Admin Registered' : 'New Purchase Order'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {i * 2} minutes ago
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      case 'CUSTOMER':
        return (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              My Dashboard
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Total Purchases"
                  value="12"
                  icon={<ShoppingCart />}
                  subtitle="orders made"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Active Warranties"
                  value="3"
                  icon={<NewReleases />}
                  subtitle="currently active"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Active EMI"
                  value="1"
                  icon={<AttachMoney />}
                  subtitle="₹8,500 remaining"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Total Spent"
                  value="₹45,800"
                  icon={<Receipt />}
                  subtitle="lifetime purchases"
                />
              </Grid>
            </Grid>
          </Box>
        );
      default: // ADMIN, EMPLOYEE
        return (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              Business Overview
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Today's Sales"
                  value="₹5,840"
                  icon={<AttachMoney />}
                  change="12%"
                  changeType="increase"
                  subtitle="from yesterday"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Total Products"
                  value="248"
                  icon={<Inventory />}
                  subtitle="in stock"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Low Stock"
                  value="18"
                  icon={<NewReleases />}
                  subtitle="need restock"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Customers"
                  value="128"
                  icon={<People />}
                  change="8%"
                  changeType="increase"
                  subtitle="new this month"
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Monthly Sales Trend
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
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Recent Bills
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[1, 2, 3, 4].map((i) => (
                        <Box
                          key={i}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: theme.palette.mode === 'light'
                              ? '#f8fafc'
                              : '#334155',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Bill #{100 + i}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Customer {i}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            ₹{1200 + i * 250}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
    }
  };

  return renderRoleBasedDashboard();
};

export default Dashboard;
