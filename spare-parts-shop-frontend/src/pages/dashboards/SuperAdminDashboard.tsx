import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  PackageOpen,
  DollarSign,
  Users,
  Activity,
  Server,
  Database,
  Globe,
  HardDrive,
  ShieldCheck,
  Mail,
  MessageSquare,
  CreditCard,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import ShopLocationsMap from '../../components/ShopLocationsMap';
import { useEffect, useState } from 'react';
import apiClient from '../../api';

interface SaaSData {
  metrics: {
    liveGlobalSales: number;
    businessGrowth: number;
    activeUsersToday: number;
    totalBusinesses: number;
    activeBusinesses: number;
    newBusinesses: number;
    trialBusinesses: number;
    premiumBusinesses: number;
    expiredBusinesses: number;
    monthlyMrr: number;
    annualArr: number;
  };
  platformHealth: {
    serverStatus: string;
    databaseStatus: string;
    apiResponseTimeMs: number;
    storageUsagePercent: number;
    backupStatus: string;
    emailServiceStatus: string;
    whatsappServiceStatus: string;
    paymentGatewayStatus: string;
  };
  adminPerformances: {
    adminName: string;
    businessName: string;
    revenue: number;
    customers: number;
    subscriptionPlan: string;
    healthScore: number;
    status: string;
  }[];
}

// Reusable KPI Card
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
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          <Chip
            label={trendValue}
            size="small"
            color={trend === 'up' ? 'success' : 'error'}
            icon={trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{value}</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>{title}</Typography>
        <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
      </CardContent>
    </Card>
  </motion.div>
);

const SuperAdminDashboard = () => {
  const [data, setData] = useState<SaaSData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/saas/dashboard');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch SaaS dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LinearProgress />;
  }

  const metrics = data?.metrics;
  const health = data?.platformHealth;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {/* 1. Live Premium Widgets & Counters */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', p: 2, borderRadius: 3, border: '1px solid rgba(37, 99, 235, 0.1)' }}>
        <Zap size={24} color="#2563EB" />
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E40AF', display: 'flex', gap: 4 }}>
          <span>🔥 Live Global Sales: ₹{metrics?.liveGlobalSales.toLocaleString()}</span>
          <span>🚀 Business Growth: +{metrics?.businessGrowth}% YoY</span>
          <span>🌟 Active Users Today: {metrics?.activeUsersToday.toLocaleString()}</span>
        </Typography>
      </Box>

      {/* 2. Business KPI Cards */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Business Metrics</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}><KPICard title="Total Businesses" value={metrics?.totalBusinesses.toString() || "0"} icon={<PackageOpen />} trend="up" trendValue="+12%" subtitle="All time registered" color="primary" /></Grid>
          <Grid item xs={12} sm={6} md={3}><KPICard title="Active Businesses" value={metrics?.activeBusinesses.toString() || "0"} icon={<Activity />} trend="up" trendValue="+5%" subtitle="Logged in this week" color="success" /></Grid>
          <Grid item xs={12} sm={6} md={3}><KPICard title="New Businesses" value={metrics?.newBusinesses.toString() || "0"} icon={<TrendingUp />} trend="up" trendValue="+18%" subtitle="This month" color="info" /></Grid>
          <Grid item xs={12} sm={6} md={3}><KPICard title="Trial Businesses" value={metrics?.trialBusinesses.toString() || "0"} icon={<DollarSign />} trend="down" trendValue="-2%" subtitle="Ending soon" color="warning" /></Grid>
          <Grid item xs={12} sm={6} md={3}><KPICard title="Premium Businesses" value={metrics?.premiumBusinesses.toString() || "0"} icon={<ShieldCheck />} trend="up" trendValue="+8%" subtitle="Paid subscriptions" color="success" /></Grid>
          <Grid item xs={12} sm={6} md={3}><KPICard title="Expired Businesses" value={metrics?.expiredBusinesses.toString() || "0"} icon={<TrendingDown />} trend="up" trendValue="+1%" subtitle="Needs follow-up" color="error" /></Grid>
          <Grid item xs={12} sm={6} md={3}><KPICard title="Monthly MRR" value={`₹${metrics?.monthlyMrr.toLocaleString()}`} icon={<DollarSign />} trend="up" trendValue="+15%" subtitle="Current month" color="primary" /></Grid>
          <Grid item xs={12} sm={6} md={3}><KPICard title="Annual ARR" value={`₹${metrics?.annualArr.toLocaleString()}`} icon={<TrendingUp />} trend="up" trendValue="+22%" subtitle="Projected" color="success" /></Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {/* 3. Platform Health */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Platform Health ────────────────────────────</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {[
                  { name: 'Server Status', icon: <Server size={20}/>, status: health?.serverStatus || 'Operational', color: '#10B981', uptime: '99.99%' },
                  { name: 'Database', icon: <Database size={20}/>, status: health?.databaseStatus || 'Healthy', color: '#10B981', uptime: 'Live' },
                  { name: 'API Response Time', icon: <Globe size={20}/>, status: 'Fast', color: '#10B981', uptime: `${health?.apiResponseTimeMs}ms avg` },
                  { name: 'Storage Usage', icon: <HardDrive size={20}/>, status: (health?.storageUsagePercent || 0) > 80 ? 'Warning' : 'Healthy', color: (health?.storageUsagePercent || 0) > 80 ? '#F59E0B' : '#10B981', uptime: `${health?.storageUsagePercent.toFixed(1)}% Full` },
                  { name: 'Backup Completed', icon: <ShieldCheck size={20}/>, status: 'Success', color: '#10B981', uptime: health?.backupStatus },
                  { name: 'Email Service', icon: <Mail size={20}/>, status: health?.emailServiceStatus || 'Operational', color: '#10B981', uptime: '100%' },
                  { name: 'WhatsApp Service', icon: <MessageSquare size={20}/>, status: health?.whatsappServiceStatus || 'Operational', color: '#10B981', uptime: '100%' },
                  { name: 'Payment Gateway', icon: <CreditCard size={20}/>, status: health?.paymentGatewayStatus || 'Operational', color: '#10B981', uptime: '100%' },
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: `${item.color}20`, color: item.color, width: 36, height: 36 }}>{item.icon}</Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.uptime}</Typography>
                      </Box>
                    </Box>
                    <Chip label={item.status} size="small" sx={{ bgcolor: `${item.color}20`, color: item.color, fontWeight: 600 }} icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color, ml: 1 }} />} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 4. Live Map */}
        <Grid item xs={12} lg={8}>
          <ShopLocationsMap />
        </Grid>
      </Grid>

      {/* 5. Leaderboards */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Leaderboards</Typography>
        <Grid container spacing={3}>
          {[
            { title: "🏆 Top Revenue Shops", data: [{ name: "AutoParts Pro", val: "₹12.5L" }, { name: "Engine Hub", val: "₹10.2L" }, { name: "Wheels & Co", val: "₹9.8L" }] },
            { title: "📈 Top Growing Shops", data: [{ name: "Gear Masters", val: "+45%" }, { name: "Speed Auto", val: "+38%" }, { name: "City Spares", val: "+32%" }] },
            { title: "💰 Top Profit Shops", data: [{ name: "AutoParts Pro", val: "₹4.2L" }, { name: "Bike World", val: "₹3.8L" }, { name: "Engine Hub", val: "₹3.5L" }] },
            { title: "⭐ Top Customers", data: [{ name: "Rahul Sharma", val: "₹1.2L" }, { name: "Ajay Singh", val: "₹95K" }, { name: "Vikram Tech", val: "₹88K" }] },
          ].map((board, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ borderRadius: 3, height: '100%', background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: '#1E293B' }}>{board.title}</Typography>
                  {board.data.map((item, j) => (
                    <Box key={j} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, p: 1.5, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: j === 0 ? '#F59E0B' : j === 1 ? '#94A3B8' : '#D97706' }}>{j+1}</Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{item.val}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 6. Admin Performance Table */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Admin Performance Overview</Typography>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Admin</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Business</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Revenue</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Customers</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Subscription</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Health</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.adminPerformances?.map((row, i) => (
                  <TableRow key={i} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>{row.adminName[0]}</Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.adminName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{row.businessName}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>₹{row.revenue.toLocaleString()}</TableCell>
                    <TableCell>{row.customers}</TableCell>
                    <TableCell><Chip label={row.subscriptionPlan} size="small" color={row.subscriptionPlan === 'Premium' || row.subscriptionPlan === 'Enterprise' ? 'primary' : 'default'} /></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress variant="determinate" value={row.healthScore} color={row.healthScore > 80 ? 'success' : 'warning'} sx={{ height: 6, borderRadius: 3 }} />
                        </Box>
                        <Typography variant="caption">{row.healthScore}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Chip label={row.status} size="small" color={row.status === 'Active' ? 'success' : 'warning'} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

    </Box>
  );
};

export default SuperAdminDashboard;
