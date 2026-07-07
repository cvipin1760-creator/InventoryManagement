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
import { motion } from 'framer-motion';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser } from '../store/slices/authSlice';
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

const KPICard = ({
  title, value, icon, trend, trendValue, subtitle, color = 'primary' }: {
    title: string;
    value: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
  trendValue: string;
  subtitle: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}) => (
  <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
    <Card sx={{ borderRadius: 3, height: '100%', borderTop: 4, borderColor: `${color}.main` }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 48, height: 48 }}>{icon}</Avatar>
          <Chip label={trendValue} size="small" color={trend === 'up' ? 'success' : 'error'} icon={trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{value}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>{title}</Typography>
        <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
      </CardContent>
    </Card>
  </motion.div>
);

const EmployeeDashboard = () => {
  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        <KPICard title="My Tasks Today" value="12" icon={<PackageOpen />} trend="up" trendValue="+3" subtitle="assigned tasks" color="primary" />
        <KPICard title="Completed" value="8" icon={<TrendingUpIcon />} trend="up" trendValue="100%" subtitle="on time" color="success" />
        <KPICard title="Pending" value="4" icon={<TrendingDown />} trend="down" trendValue="in progress" subtitle="tasks" color="warning" />
      </Box>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Today's Tasks</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { task: 'Restock Shelf A-3', status: 'pending' },
              { task: 'Verify Inventory Count', status: 'in-progress' },
              { task: 'Help Customer with Warranty', status: 'completed' },
              { task: 'Process 5 Bills', status: 'pending' },
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: 2, backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
                <Typography variant="body2">{item.task}</Typography>
                <Chip label={item.status} size="small" color={item.status === 'completed' ? 'success' : item.status === 'in-progress' ? 'primary' : 'default'} />
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
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <KPICard title="Total Purchases" value="12" icon={<PackageOpen />} trend="up" trendValue="+2" subtitle="orders made" color="primary" />
        <KPICard title="Active Warranties" value="3" icon={<TrendingUpIcon />} trend="up" trendValue="active" subtitle="warranties" color="success" />
        <KPICard title="Active EMI" value="1" icon={<DollarSign />} trend="down" trendValue="-₹8,500" subtitle="remaining" color="warning" />
        <KPICard title="Total Spent" value="₹45,800" icon={<TrendingDown />} trend="up" trendValue="+₹2,500" subtitle="lifetime" color="info" />
      </Box>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Recent Orders</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { order: 'Order #501', status: 'Delivered', amount: '₹3,500' },
              { order: 'Order #500', status: 'Shipped', amount: '₹2,800' },
              { order: 'Order #499', status: 'Processing', amount: '₹4,200' },
            ].map((item, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderRadius: 2, backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.order}</Typography>
                  <Chip label={item.status} size="small" color={item.status === 'Delivered' ? 'success' : item.status === 'Shipped' ? 'primary' : 'default'} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>{item.amount}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

const Dashboard = () => {
  const user = useAppSelector(selectCurrentUser);
  
  const renderRoleBasedDashboard = () => {
    switch (user?.role) {
      case 'SUPER_MANAGER':
        return <SuperAdminDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      case 'EMPLOYEE':
        return <EmployeeDashboard />;
      case 'CUSTOMER':
        return <CustomerDashboard />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, background: 'linear-gradient(135deg, #1E293B, #334155)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
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

export default Dashboard;
