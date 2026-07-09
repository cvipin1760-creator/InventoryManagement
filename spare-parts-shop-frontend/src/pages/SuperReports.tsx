import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Badge,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  CreditCard,
  Calendar,
  Download,
  FileText,
  Printer,
  Share2,
  Search,
  Filter,
  Zap,
  Shield,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const KpiCard = ({ title, value, change, trend, icon: Icon }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
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
                background: 'linear-gradient(135deg, #2563EB, #6366F1)',
                color: 'white',
              }}
            >
              <Icon size={24} />
            </Box>
            <Chip
              icon={trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              label={`${change}%`}
              size="small"
              sx={{
                backgroundColor: trend === 'up' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: trend === 'up' ? '#10B981' : '#EF4444',
                fontWeight: 600,
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {value}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const SuperReports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { default: apiClient } = await import('../api');
        const response = await apiClient.get('/saas/dashboard');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch SaaS reports data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const salesData = [
    { month: 'Jan', sales: 4000, revenue: 2400 },
    { month: 'Feb', sales: 3000, revenue: 1398 },
    { month: 'Mar', sales: 2000, revenue: 9800 },
    { month: 'Apr', sales: 2780, revenue: 3908 },
    { month: 'May', sales: 1890, revenue: 4800 },
    { month: 'Jun', sales: 2390, revenue: 3800 },
  ];

  const shopPerformanceData = [
    { rank: 1, name: 'Auto Parts Hub', owner: 'John Doe', subscription: 'Premium', sales: '₹42,500', revenue: '₹28,300', profit: '₹12,500', customers: 245, products: 1200, orders: 89, growth: 18, status: 'Active', lastActive: '5 mins ago', health: 98 },
    { rank: 2, name: 'Bike Care Plus', owner: 'Jane Smith', subscription: 'Basic', sales: '₹38,200', revenue: '₹25,400', profit: '₹10,200', customers: 198, products: 850, orders: 72, growth: 12, status: 'Active', lastActive: '12 mins ago', health: 92 },
    { rank: 3, name: 'Premium Spares', owner: 'Mike Johnson', subscription: 'Enterprise', sales: '₹35,000', revenue: '₹22,000', profit: '₹9,800', customers: 176, products: 2100, orders: 65, growth: 8, status: 'Active', lastActive: '30 mins ago', health: 88 },
  ];

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Chip label="Gold" sx={{ backgroundColor: '#FFD700', color: 'white', fontWeight: 700 }} />;
    if (rank === 2) return <Chip label="Silver" sx={{ backgroundColor: '#C0C0C0', color: 'white', fontWeight: 700 }} />;
    if (rank === 3) return <Chip label="Bronze" sx={{ backgroundColor: '#CD7F32', color: 'white', fontWeight: 700 }} />;
    return <Chip label={`#${rank}`} size="small" />;
  };

  const tabs = [
    'Overview', 'Sales', 'Customers', 'Products', 'Shops', 'Subscriptions', 'Financial', 'Inventory', 'System'
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
              Reports & Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor the performance of every business, admin, customer, sales and inventory from one place.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button startIcon={<Download size={20} />} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
              Export PDF
            </Button>
            <Button startIcon={<FileText size={20} />} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
              Export Excel
            </Button>
            <Button startIcon={<Printer size={20} />} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>
              Print
            </Button>
            <Button startIcon={<Share2 size={20} />} variant="contained" sx={{ borderRadius: 2, textTransform: 'none' }}>
              Share
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          {/* Date Range */}
          <FormControl sx={{ minWidth: 200 }}>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="Today">Today</MenuItem>
              <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
              <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
              <MenuItem value="Last 90 Days">Last 90 Days</MenuItem>
              <MenuItem value="This Year">This Year</MenuItem>
              <MenuItem value="Custom Range">Custom Range</MenuItem>
            </Select>
          </FormControl>

          {/* Business Type */}
          <FormControl sx={{ minWidth: 150 }}>
            <Select
              displayEmpty
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">Business Type</MenuItem>
              <MenuItem value="retail">Retail</MenuItem>
              <MenuItem value="wholesale">Wholesale</MenuItem>
            </Select>
          </FormControl>

          {/* City */}
          <FormControl sx={{ minWidth: 150 }}>
            <Select displayEmpty sx={{ borderRadius: 2 }}>
              <MenuItem value="">City</MenuItem>
              <MenuItem value="delhi">Delhi</MenuItem>
              <MenuItem value="mumbai">Mumbai</MenuItem>
            </Select>
          </FormControl>

          {/* Subscription Plan */}
          <FormControl sx={{ minWidth: 150 }}>
            <Select displayEmpty sx={{ borderRadius: 2 }}>
              <MenuItem value="">Subscription Plan</MenuItem>
              <MenuItem value="free">Free</MenuItem>
              <MenuItem value="basic">Basic</MenuItem>
              <MenuItem value="premium">Premium</MenuItem>
              <MenuItem value="enterprise">Enterprise</MenuItem>
            </Select>
          </FormControl>

          {/* Active/Inactive */}
          <FormControl sx={{ minWidth: 150 }}>
            <Select displayEmpty sx={{ borderRadius: 2 }}>
              <MenuItem value="">All Shops</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <TextField
            placeholder="Search..."
            sx={{ minWidth: 250, borderRadius: 2 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiCard title="Total Shops" value={data?.metrics?.totalBusinesses?.toLocaleString() || "0"} change={12.5} trend="up" icon={Package} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiCard title="Active Shops" value={data?.metrics?.activeBusinesses?.toLocaleString() || "0"} change={8.3} trend="up" icon={Shield} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiCard title="Inactive/Expired Shops" value={data?.metrics?.expiredBusinesses?.toLocaleString() || "0"} change={-4.2} trend="down" icon={AlertCircle} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiCard title="New Shops This Month" value={data?.metrics?.newBusinesses?.toLocaleString() || "0"} change={22} trend="up" icon={TrendingUp} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiCard title="Total Users" value={data?.metrics?.activeUsersToday?.toLocaleString() || "0"} change={15.3} trend="up" icon={Users} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiCard title="Live Global Sales" value={`₹${data?.metrics?.liveGlobalSales?.toLocaleString() || "0"}`} change={18.2} trend="up" icon={CreditCard} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiCard title="MRR" value={`₹${data?.metrics?.monthlyMrr?.toLocaleString() || "0"}`} change={12.5} trend="up" icon={Calendar} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <KpiCard title="ARR" value={`₹${data?.metrics?.annualArr?.toLocaleString() || "0"}`} change={15.5} trend="up" icon={Calendar} />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab} sx={{ textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content - Overview */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Revenue Trend */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Revenue Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Sales by Category */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Sales by Category
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Engine Parts', value: 400 },
                        { name: 'Oil & Lubricants', value: 300 },
                        { name: 'Brakes', value: 300 },
                        { name: 'Filters', value: 200 },
                        { name: 'Electrical', value: 278 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Engine Parts', value: 400 },
                        { name: 'Oil & Lubricants', value: 300 },
                        { name: 'Brakes', value: 300 },
                        { name: 'Filters', value: 200 },
                        { name: 'Electrical', value: 278 },
                      ].map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Shop Performance Table */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Shop Performance
                </Typography>
                <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Shop Name</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Owner</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Subscription</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Sales</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Revenue</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Profit</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Customers</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Growth %</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Health</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data?.adminPerformances?.map((shop: any, idx: number) => (
                        <TableRow key={shop.businessName} hover>
                          <TableCell>{getRankBadge(idx + 1)}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{shop.businessName}</TableCell>
                          <TableCell>{shop.adminName}</TableCell>
                          <TableCell>
                            <Chip
                              label={shop.subscriptionPlan}
                              size="small"
                              sx={{
                                backgroundColor: shop.subscriptionPlan === 'Premium' || shop.subscriptionPlan === 'Enterprise' ? 'rgba(37,99,235,0.1)' : 'rgba(16,185,129,0.1)',
                                color: shop.subscriptionPlan === 'Premium' || shop.subscriptionPlan === 'Enterprise' ? '#2563EB' : '#10B981',
                              }}
                            />
                          </TableCell>
                          <TableCell>{shop.customers + 10} </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>₹{shop.revenue?.toLocaleString()}</TableCell>
                          <TableCell sx={{ color: '#10B981', fontWeight: 600 }}>₹{(shop.revenue * 0.25).toLocaleString()}</TableCell>
                          <TableCell>{shop.customers}</TableCell>
                          <TableCell sx={{ color: shop.healthScore > 80 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
                            {shop.healthScore > 80 ? `+${(shop.healthScore - 80)}%` : `${shop.healthScore - 80}%`}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 80, height: 8, bgcolor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
                                <Box
                                  sx={{
                                    width: `${shop.healthScore}%`,
                                    height: '100%',
                                    bgcolor: shop.healthScore >= 90 ? '#10B981' : shop.healthScore >= 70 ? '#F59E0B' : '#EF4444',
                                  }}
                                />
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{shop.healthScore}%</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* AI Insights */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Zap size={24} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
                    AI Insights
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      📈 Sales increased by 18% this month compared to last month
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      💰 Premium subscribers generate 72% of total revenue
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      📦 Inventory worth ₹4.2L has not moved in 90 days
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Alerts */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Alerts
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(239,68,68,0.05)', borderRadius: 2 }}>
                    <Badge color="error" badgeContent="12">
                      <AlertCircle size={24} color="#EF4444" />
                    </Badge>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Low Stock Products</Typography>
                      <Typography variant="body2" color="text.secondary">12 shops need stock replenishment</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(245,158,11,0.05)', borderRadius: 2 }}>
                    <Badge color="warning" badgeContent="8">
                      <Calendar size={24} color="#F59E0B" />
                    </Badge>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Expiring Warranties</Typography>
                      <Typography variant="body2" color="text.secondary">8 warranties expiring this week</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(16,185,129,0.05)', borderRadius: 2 }}>
                    <Badge color="success" badgeContent="5">
                      <TrendingUp size={24} color="#10B981" />
                    </Badge>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Subscription Renewals</Typography>
                      <Typography variant="body2" color="text.secondary">5 renewals due tomorrow</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default SuperReports;
