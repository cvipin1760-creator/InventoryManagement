import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  LayoutDashboard,
  PackageOpen,
  Users,
  FileText,
  ShoppingCart,
  Truck,
  CreditCard,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Receipt,
  Activity,
  Shield,
  Zap,
  Database,
  History,
  Settings,
  FileSpreadsheet,
  TrendingUp,
  Wallet,
  MessageSquare,
  Brain,
  PieChart,
  Target,
  Megaphone,
  ClipboardList,
  IndianRupee,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser, selectConfiguration } from '../store/slices/authSlice';

const drawerWidth = 280;
const drawerWidthCollapsed = 80;

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

const Sidebar = ({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) => {
  const location = useLocation();
  const user = useAppSelector(selectCurrentUser);
  const config = useAppSelector(selectConfiguration);

  const menuItems = useMemo(() => {
    const items: MenuItem[] = [];

    const userRole = user?.role as string | undefined;
    const hasModule = (moduleKey: string) => {
      if (!config?.modulesJson) return false;
      try {
        const modules = typeof config.modulesJson === 'string' 
          ? JSON.parse(config.modulesJson) 
          : config.modulesJson;
        return modules.some((m: any) => m.key === moduleKey && m.enabled);
      } catch (e) {
        return false;
      }
    };

    if (userRole === 'SUPER_ADMIN' || userRole === 'SUPER_MANAGER') {
      items.push({ label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> });
      items.push({ label: 'Admins', path: '/admins', icon: <UserPlus size={20} /> });
      items.push({ label: 'Businesses', path: '/businesses', icon: <PackageOpen size={20} /> });
      items.push({ label: 'Users', path: '/users', icon: <Users size={20} /> });
      items.push({ label: 'Subscriptions', path: '/subscriptions', icon: <CreditCard size={20} /> });
      items.push({ label: 'Payment Settings', path: '/payment-settings', icon: <Wallet size={20} /> });
      items.push({ label: 'Marketing', path: '/marketing', icon: <MessageSquare size={20} /> });
      items.push({ label: 'Reports', path: '/reports', icon: <FileSpreadsheet size={20} /> });
      items.push({ label: 'Accounting Export', path: '/accounting-export', icon: <FileText size={20} /> });
      items.push({ label: 'Analytics', path: '/analytics', icon: <Activity size={20} /> });
      items.push({ label: 'Support', path: '/support', icon: <Shield size={20} /> });
      items.push({ label: 'Audit Logs', path: '/audit-logs', icon: <History size={20} /> });
      items.push({ label: 'Settings', path: '/settings', icon: <Settings size={20} /> });
    } else if (userRole === 'ADMIN') {
      items.push({ label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> });
      if (hasModule('billing')) {
        items.push({ label: 'Sales', path: '/bills', icon: <Receipt size={20} /> });
      }
      items.push({ label: 'Customers', path: '/customers', icon: <Users size={20} /> });
      items.push({ label: 'Products', path: '/products', icon: <PackageOpen size={20} /> });
      items.push({ label: 'Stock Transfers', path: '/stock-transfers', icon: <Truck size={20} /> });
      if (hasModule('inventory')) {
        items.push({ label: 'Inventory Audit', path: '/audit', icon: <ClipboardList size={20} /> });
      }
      if (hasModule('emi')) {
        items.push({ label: 'EMI', path: '/emis', icon: <IndianRupee size={20} /> });
      }
      if (hasModule('warranty')) {
        items.push({ label: 'Warranty', path: '/warranties', icon: <Shield size={20} /> });
      }
      items.push({ label: 'Purchases', path: '/purchases', icon: <ShoppingCart size={20} /> });
      items.push({ label: 'Purchase Orders', path: '/purchase-orders', icon: <Brain size={20} /> });
      if (hasModule('multiBranch')) {
        items.push({ label: 'Branches', path: '/branches', icon: <Database size={20} /> });
      }
      if (hasModule('aiReports')) {
        items.push({ label: 'AI Forecast', path: '/predictive-analytics', icon: <TrendingUp size={20} /> });
      }
      items.push({ label: 'Reports', path: '/reports', icon: <FileSpreadsheet size={20} /> });
      if (hasModule('marketing')) {
        items.push({ label: 'Marketing', path: '/marketing', icon: <MessageSquare size={20} /> });
      }
      if (hasModule('accounting')) {
        items.push({ label: 'Accounting Export', path: '/accounting-export', icon: <FileText size={20} /> });
      }
      items.push({ label: 'Support Tickets', path: '/support-tickets', icon: <MessageSquare size={20} /> });
      items.push({ label: 'Employees', path: '/users', icon: <Users size={20} /> });
      items.push({ label: 'Roles', path: '/roles', icon: <Shield size={20} /> });
      items.push({ label: 'Settings', path: '/settings', icon: <Settings size={20} /> });
    } else if (userRole === 'EMPLOYEE') {
      const perms = user?.permissions || [];
      items.push({ label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> });
      if (perms.includes('products')) items.push({ label: 'Products', path: '/products', icon: <PackageOpen size={20} /> });
      if (hasModule('inventory')) {
        items.push({ label: 'Inventory Audit', path: '/audit', icon: <ClipboardList size={20} /> });
      }
      if (perms.includes('customers')) items.push({ label: 'Customers', path: '/customers', icon: <Users size={20} /> });
      if (perms.includes('bills')) items.push({ label: 'Sales', path: '/bills', icon: <Receipt size={20} /> });
      if (hasModule('emi') && (perms.includes('EMI_VIEW') || perms.includes('emi'))) {
        items.push({ label: 'EMI', path: '/emis', icon: <IndianRupee size={20} /> });
      }
      if (hasModule('warranty') && (perms.includes('WARRANTY_VIEW') || perms.includes('warranty'))) {
        items.push({ label: 'Warranty', path: '/warranties', icon: <Shield size={20} /> });
      }
      if (perms.includes('purchases')) items.push({ label: 'Purchases', path: '/purchases', icon: <ShoppingCart size={20} /> });
      if (perms.includes('suppliers')) items.push({ label: 'Suppliers', path: '/suppliers', icon: <Truck size={20} /> });
      if (perms.includes('reports')) items.push({ label: 'Reports', path: '/reports', icon: <FileSpreadsheet size={20} /> });
    } else {
      items.push({ label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> });
    }

    return items;
  }, [user?.role, config]);

  const visibleMenuItems = menuItems.filter((item) => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <Box
      component="nav"
      sx={{ width: open ? drawerWidth : drawerWidthCollapsed, flexShrink: 0 }}
    >
      <Drawer
        variant="permanent"
        open
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: open ? drawerWidth : drawerWidthCollapsed,
            border: 'none',
            backgroundColor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
      >
        {/* Top Section */}
        <Box>
          {/* Logo & Toggle */}
          <Box
            sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: open ? 'space-between' : 'center',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #2563EB, #6366F1)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    StockPilot
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
            <Tooltip title={open ? 'Collapse' : 'Expand'}>
              <Box
                onClick={onToggle}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  },
                }}
              >
                {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </Box>
            </Tooltip>
          </Box>

          {/* Navigation */}
          <List sx={{ py: 2, px: open ? 1.5 : 0.75 }}>
            {visibleMenuItems.map((item) => (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <Link
                  to={item.path}
                  style={{ textDecoration: 'none', width: '100%' }}
                >
                  <ListItemButton
                    selected={isActive(item.path)}
                    sx={{
                      borderRadius: 12,
                      px: 2,
                      py: 1.5,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'rgba(37, 99, 235, 0.15)',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'primary.main',
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 44,
                        color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <AnimatePresence>
                      {open && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 2 }}
                        >
                          <ListItemText
                            primary={
                              <Typography sx={{ fontWeight: 500 }}>
                                {item.label}
                              </Typography>
                            }
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </ListItemButton>
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Bottom Section - User Profile */}
        <Box sx={{ p: open ? 2 : 1 }}>
          <Divider sx={{ mb: 2 }} />
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/settings"
              sx={{
                borderRadius: 12,
                px: 2,
                py: 1.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 44,
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </ListItemIcon>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                          {user?.username}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {user?.role}
                        </Typography>
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </ListItemButton>
          </ListItem>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Sidebar;
