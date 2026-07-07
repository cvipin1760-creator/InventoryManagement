import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  PackageOpen,
  DollarSign,
  Users,
  Package,
  TrendingUp as TrendingUpIcon,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { motion } from 'framer-motion';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser } from '../store/slices/authSlice';

// Sample Data for charts
const revenueData = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 4500 },
  { name: 'May', revenue: 6000 },
  { name: 'Jun', revenue: 5500 },
];

const Dashboard = () => {
  const user = useAppSelector(selectCurrentUser);
  
  const renderRoleBasedDashboard = () => {
    switch (user?.role) {
      case 'SUPER_MANAGER':
        return (
          <SuperManagerDashboard />
        );
      case 'ADMIN':
        return (
          <AdminDashboard />
        );
      case 'EMPLOYEE':
        return (
          <EmployeeDashboard />
        );
      case 'CUSTOMER':
        return (
          <CustomerDashboard />
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        Welcome back, {user?.username}!
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Here's what's happening with your business today.
      </Typography>
    </Box>

    {renderRoleBasedDashboard()}
    </Box>
  );
};

const KPICard = ({
  title, value, icon, trend, trendValue, subtitle, color = 'primary' }: {
    title: string;
    value: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
  trendValue: string;
  subtitle: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        sx={{
          borderRadius: 3,
          height: '100%',
        overflow: 'visible',
        borderTop: 4,
        borderColor: color === 'primary' ? 'primary.main' : color + '.main',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor:
                color === 'primary'
                  ? 'primary.light'
                  : color === 'success'
                  ? 'success.light'
                  : color === 'warning'
                  ? 'warning.light'
                  : color === 'error'
                  ? 'error.light'
                  : 'info.light',
              color:
                color === 'primary'
                  ? 'primary.main'
                  : color === 'success'
                  ? 'success.main'
                  : color === 'warning'
                  ? 'warning.main'
                  : color === 'error'
                  ? 'error.main'
                  : 'info.main',
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
          <Chip
            label={trendValue}
            size="small"
            color={trend === 'up' ? 'success' : 'error'}
            icon={trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          />
        </Box>

        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mb: 0.5 }}
        >
          {value}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
          {title}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
    </motion.div>
  );
};

const SuperManagerDashboard = () => {
  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <KPICard
          title="Total Businesses"
          value="284"
          icon={<PackageOpen />}
          trend="up"
          trendValue="+12%"
          subtitle="from last month"
          color="primary"
        />
        <KPICard
          title="Active Businesses"
          value="267"
          icon={<TrendingUpIcon />}
          trend="up"
          trendValue="+8%"
          subtitle="active right now"
          color="success"
        />
        <KPICard
          title="Monthly Revenue"
          value="₹1,24,580"
          icon={<DollarSign />}
          trend="up"
          trendValue="+15%"
          subtitle="vs last month"
          color="primary"
        />
        <KPICard
          title="Total Users"
          value="1,240"
          icon={<Users />}
          trend="up"
          trendValue="+22%"
          subtitle="registered users"
          color="info"
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Revenue Trend
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" stroke="text.secondary" />
              <YAxis stroke="text.secondary" />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563EB"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Recent Activity
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { text: 'New Admin Registered', time: '2 mins ago' },
                { text: 'New Business Created', time: '5 mins ago' },
                { text: 'New Payment Received', time: '10 mins ago' },
              ].map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(0,0,0,0.03)',
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: 'primary.light',
                      color: 'primary.main',
                    }}
                  >
                    {i % 2 === 0 ? <Users size={20} /> : <Package size={20} />}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.time}
                    </Typography>
                  </Box>
                  </Box>
                ))}
              </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

const AdminDashboard = () => {
  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <KPICard
          title="Today's Revenue"
          value="₹12,450"
          icon={<DollarSign />}
          trend="up"
          trendValue="+24%"
          subtitle="vs yesterday"
          color="primary"
        />
        <KPICard
          title="Total Orders"
          value="89"
          icon={<Package />}
          trend="up"
          trendValue="+18%"
          subtitle="today"
          color="success"
        />
        <KPICard
          title="Active Employees"
          value="6"
          icon={<Users />}
          trend="up"
          trendValue="+1"
          subtitle="working now"
          color="info"
        />
        <KPICard
          title="Pending Bills"
          value="12"
          icon={<TrendingDown />}
          trend="down"
          trendValue="-2"
          subtitle="from yesterday"
          color="warning"
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Sales by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" stroke="text.secondary" />
                <YAxis stroke="text.secondary" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                  }}
                />
                <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Revenue Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" stroke="text.secondary" />
                <YAxis stroke="text.secondary" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

const EmployeeDashboard = () => {
  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <KPICard
          title="My Tasks Today"
          value="12"
          icon={<PackageOpen />}
          trend="up"
          trendValue="+3"
          subtitle="assigned tasks"
          color="primary"
        />
        <KPICard
          title="Completed"
          value="8"
          icon={<TrendingUpIcon />}
          trend="up"
          trendValue="100%"
          subtitle="on time"
          color="success"
        />
        <KPICard
          title="Pending"
          value="4"
          icon={<TrendingDown />}
          trend="down"
          trendValue="in progress"
          subtitle="tasks"
          color="warning"
        />
      </Box>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Today's Tasks
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { task: 'Restock Shelf A-3', status: 'pending' },
              { task: 'Verify Inventory Count', status: 'in-progress' },
              { task: 'Help Customer with Warranty', status: 'completed' },
              { task: 'Process 5 Bills', status: 'pending' },
            ].map((item, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'rgba(0,0,0,0.03)',
                }}
              >
                <Typography variant="body2">{item.task}</Typography>
                <Chip
                  label={item.status}
                  size="small"
                  color={
                    item.status === 'completed'
                      ? 'success'
                      : item.status === 'in-progress'
                      ? 'primary'
                      : 'default'
                  }
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

const CustomerDashboard = () => {
  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <KPICard
          title="Total Purchases"
          value="12"
          icon={<PackageOpen />}
          trend="up"
          trendValue="+2"
          subtitle="orders made"
          color="primary"
        />
        <KPICard
          title="Active Warranties"
          value="3"
          icon={<TrendingUpIcon />}
          trend="up"
          trendValue="active"
          subtitle="warranties"
          color="success"
        />
        <KPICard
          title="Active EMI"
          value="1"
          icon={<DollarSign />}
          trend="down"
          trendValue="-₹8,500"
          subtitle="remaining"
          color="warning"
        />
        <KPICard
          title="Total Spent"
          value="₹45,800"
          icon={<TrendingDown />}
          trend="up"
          trendValue="+₹2,500"
          subtitle="lifetime"
          color="info"
        />
      </Box>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
            Recent Orders
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { order: 'Order #501', status: 'Delivered', amount: '₹3,500' },
              { order: 'Order #500', status: 'Shipped', amount: '₹2,800' },
              { order: 'Order #499', status: 'Processing', amount: '₹4,200' },
            ].map((item, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'rgba(0,0,0,0.03)',
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.order}
                  </Typography>
                  <Chip
                    label={item.status}
                    size="small"
                    color={
                      item.status === 'Delivered'
                        ? 'success'
                        : item.status === 'Shipped'
                        ? 'primary'
                        : 'default'
                    }
                  />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  {item.amount}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
