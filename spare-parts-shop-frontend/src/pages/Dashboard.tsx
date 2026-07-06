import { Box, Typography, Card, CardContent, useTheme } from '@mui/material';
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
      case 'SUPER_MANAGER':
        return (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              Platform Overview
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                <KPICard
                  title="Total Businesses"
                  value="284"
                  icon={<Business />}
                  change="12%"
                  changeType="increase"
                  subtitle="from last month"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                <KPICard
                  title="Active Businesses"
                  value="267"
                  icon={<TrendingUp />}
                  change="8%"
                  changeType="increase"
                  subtitle="active right now"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                <KPICard
                  title="Monthly Revenue"
                  value="₹1,24,580"
                  icon={<AttachMoney />}
                  change="15%"
                  changeType="increase"
                  subtitle="vs last month"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                <KPICard
                  title="Total Users"
                  value="1,240"
                  icon={<People />}
                  change="22%"
                  changeType="increase"
                  subtitle="registered users"
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(66.666% - 12px)' } }}>
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
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 12px)' } }}>
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
              </Box>
            </Box>
          </Box>
        );
      case 'ADMIN':
        return (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              Admin Dashboard
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                <KPICard
                  title="Today's Revenue"
                  value="₹12,450"
                  icon={<AttachMoney />}
                  change="24%"
                  changeType="increase"
                  subtitle="vs yesterday"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                <KPICard
                  title="Total Orders"
                  value="89"
                  icon={<Receipt />}
                  change="18%"
                  changeType="increase"
                  subtitle="today"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                <KPICard
                  title="Active Employees"
                  value="6"
                  icon={<People />}
                  subtitle="currently working"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                <KPICard
                  title="Pending Bills"
                  value="12"
                  icon={<NewReleases />}
                  subtitle="awaiting payment"
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Sales by Category
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
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Quick Actions
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {['Add New Product', 'Create Bill', 'Manage Users', 'View Reports'].map((action, i) => (
                        <Box
                          key={i}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: theme.palette.mode === 'light'
                              ? '#f0f9ff'
                              : '#1e293b',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: theme.palette.mode === 'light'
                                ? '#e0f2fe'
                                : '#334155',
                            },
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {action}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        );
      case 'EMPLOYEE':
        return (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              Employee Workspace
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 12px)' } }}>
                <KPICard
                  title="My Tasks Today"
                  value="12"
                  icon={<Inventory />}
                  subtitle="assigned"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 12px)' } }}>
                <KPICard
                  title="Completed"
                  value="8"
                  icon={<TrendingUp />}
                  subtitle="today"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 12px)' } }}>
                <KPICard
                  title="Pending"
                  value="4"
                  icon={<NewReleases />}
                  subtitle="remaining"
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(60% - 12px)' } }}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Today's Tasks
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {[
                        { task: 'Restock shelf A-3', status: 'pending' },
                        { task: 'Verify inventory count', status: 'in-progress' },
                        { task: 'Help customer with warranty', status: 'completed' },
                        { task: 'Process 5 pending orders', status: 'pending' },
                      ].map((item, i) => (
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
                          <Typography variant="body2">{item.task}</Typography>
                          <Box
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 5,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor:
                                item.status === 'completed'
                                  ? theme.palette.success.main + '20'
                                  : item.status === 'in-progress'
                                  ? theme.palette.primary.main + '20'
                                  : theme.palette.warning.main + '20',
                              color:
                                item.status === 'completed'
                                  ? theme.palette.success.main
                                  : item.status === 'in-progress'
                                  ? theme.palette.primary.main
                                  : theme.palette.warning.main,
                            }}
                          >
                            {item.status}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(40% - 12px)' } }}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Quick Actions
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {['Create Bill', 'Check Inventory', 'Add Customer'].map((action, i) => (
                        <Box
                          key={i}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: theme.palette.mode === 'light'
                              ? '#f0f9ff'
                              : '#1e293b',
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: theme.palette.mode === 'light'
                                ? '#e0f2fe'
                                : '#334155',
                            },
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {action}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        );
      case 'CUSTOMER':
        return (
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
              My Dashboard
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                <KPICard
                  title="Total Purchases"
                  value="12"
                  icon={<ShoppingCart />}
                  subtitle="orders made"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                <KPICard
                  title="Active Warranties"
                  value="3"
                  icon={<NewReleases />}
                  subtitle="currently active"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                <KPICard
                  title="Active EMI"
                  value="1"
                  icon={<AttachMoney />}
                  subtitle="₹8,500 remaining"
                />
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                <KPICard
                  title="Total Spent"
                  value="₹45,800"
                  icon={<Receipt />}
                  subtitle="lifetime purchases"
                />
              </Box>
            </Box>

            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Recent Orders
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[1, 2, 3].map((i) => (
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
                          Order #{500 + i}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {['Delivered', 'Shipped', 'Processing'][i - 1]}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        ₹{3500 + i * 500}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        );
      default:
        return null;
    }
  };

  return renderRoleBasedDashboard();
};

export default Dashboard;
