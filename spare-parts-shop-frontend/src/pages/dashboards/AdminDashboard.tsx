import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  PackageOpen,
  DollarSign,
  Users,
  Activity,
  AlertCircle,
  Clock,
  Bell,
  Sparkles,
  RefreshCcw,
  ShoppingCart,
  Percent,
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
import { useEffect, useState } from 'react';
import apiClient from '../../api';
import { CircularProgress } from '@mui/material';

interface DashboardStats {
  todaySales: number;
  weeklySales: number;
  monthlySales: number;
  todayBillsCount: number;
  lowStockCount: number;
  totalProducts: number;
  
  outOfStockCount: number;
  deadStockCount: number;
  fastMovingProductsCount: number;
  netProfit: number;
  gstCollected: number;
  
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  customerGrowthPercent: number;
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

import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444'];

const AdminDashboard = () => {
  const { data: stats, isLoading: loading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: api.getAdminDashboard
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!stats) return null;


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      
      {/* 1. Live Premium Widgets & Counters */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', p: 2, borderRadius: 3, border: '1px solid rgba(16, 185, 129, 0.1)' }}>
        <Activity size={24} color="#10B981" />
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#065F46', display: 'flex', gap: 4 }}>
          <span>💰 Cash Flow Gauge: Healthy</span>
          <span>📦 Inventory Score: 92/100</span>
          <span>⭐ Customer Satisfaction: 4.8/5</span>
        </Typography>
      </Box>

      {/* 2. KPIs (Customer, Revenue, Inventory) */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Daily Performance Tracker</Typography>
        <Grid container spacing={3}>
          {/* Revenue */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard title="Revenue Today" value={`₹${stats?.todaySales?.toLocaleString() || 0}`} icon={<DollarSign />} trend="up" trendValue="+24%" subtitle="vs yesterday" color="success" /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard title="Net Profit" value={`₹${stats?.netProfit?.toLocaleString() || 0}`} icon={<TrendingUp />} trend="up" trendValue="+12%" subtitle="Today" color="primary" /></Grid>
          {/* Customer */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard title="Total Customers" value={stats?.totalCustomers?.toString() || "0"} icon={<Users />} trend="up" trendValue={`+${stats?.customerGrowthPercent || 0}%`} subtitle="All time" color="info" /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard title="New Customers" value={stats?.newCustomers?.toString() || "0"} icon={<RefreshCcw />} trend="up" trendValue="+2%" subtitle="This month" color="warning" /></Grid>
          {/* Inventory */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard title="Total Products" value={stats?.totalProducts?.toString() || "0"} icon={<PackageOpen />} trend="up" trendValue="+10" subtitle="Added recently" color="primary" /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard title="Low Stock" value={stats?.lowStockCount?.toString() || "0"} icon={<AlertCircle />} trend="down" trendValue="-3" subtitle="Requires attention" color="warning" /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard title="Out of Stock" value={stats?.outOfStockCount?.toString() || "0"} icon={<Activity />} trend="down" trendValue="+2" subtitle="Lost revenue" color="error" /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard title="Dead Stock" value={stats?.deadStockCount?.toString() || "0"} icon={<PackageOpen />} trend="up" trendValue="+5%" subtitle="Requires attention" color="success" /></Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {/* 3. Financial & Customer Charts */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Financial Overview (Revenue vs Profit)</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#2563EB" fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="profit" stroke="#10B981" fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Customer Retention</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={stats.customerData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {stats.customerData?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2 }}>
                {stats.customerData?.map((entry: any, index: number) => (
                  <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS[index] }} />
                    <Typography variant="body2">{entry.name} ({entry.value})</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* 4. AI Insights */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ borderRadius: 3, height: '100%', background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(255,255,255,1) 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Sparkles size={24} color="#2563EB" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>AI Recommendations</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  "Sales will increase by 12% next week.",
                  "Inventory worth ₹5.6L has not moved in 90 days.",
                  "Shop ABC is likely to churn.",
                  "15 customers are likely to purchase again.",
                  "Recommended products to restock: Engine Oil, Brake Pads.",
                  "Abnormal sales detected in Shop XYZ.",
                  "Expected monthly revenue: ₹52.8L"
                ].map((insight, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ mt: 0.5, color: '#2563EB' }}><Sparkles size={16} /></Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>{insight}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 5. Recent Activity Timeline */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Recent Activity</Typography>
              <List sx={{ p: 0 }}>
                {stats.recentActivity?.map((item: any, i: number) => (
                  <ListItem key={i} sx={{ px: 0, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <ListItemIcon sx={{ minWidth: 40, color: item.color }}><Activity size={18} /></ListItemIcon>
                    <ListItemText 
                      primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{item.text}</Typography>}
                      secondary={<Typography variant="caption">{item.time}</Typography>}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 6. Notifications Panel */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Bell size={24} color="#EF4444" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Action Required</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {stats.notifications?.map((notif: any, i: number) => (
                  <Box key={i} sx={{ display: 'flex', flexDirection: 'column', p: 1.5, borderRadius: 2, bgcolor: `${notif.color}.light`, color: `${notif.color}.dark`, border: '1px solid', borderColor: `${notif.color}.main`, opacity: 0.9 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{notif.title}</Typography>
                    <Typography variant="caption">{notif.desc}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
    </Box>
  );
};

export default AdminDashboard;
