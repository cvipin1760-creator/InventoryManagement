import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Alert,
  Button,
  InputAdornment,
  TextField,
} from '@mui/material';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  ShoppingCart,
  Menu as MenuIcon,
  User,
  LogOut,
  Settings,
  Home,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { selectCurrentUser } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import { api } from '../api/client';
import Sidebar from './Sidebar';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const themeMode = useAppSelector((state: any) => state.theme.mode);
  const user = useAppSelector(selectCurrentUser);
  const [notificationCount, setNotificationCount] = useState(0);
  const [business, setBusiness] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (user && user.role !== 'SUPER_MANAGER') {
      api.getBusiness().then(setBusiness).catch(() => {});
    }
    if (user) {
      api.getUnreadCount().then(setNotificationCount).catch(() => {});
    }
  }, [user]);

  // Keep-alive ping to prevent backend
  useEffect(() => {
    if (!user) return;

    const keepAliveInterval = setInterval(async () => {
      try {
        await fetch('/api');
        console.log('Keep-alive ping sent to backend');
      } catch (e) {
        console.warn('Keep-alive ping failed:', e);
      }
    }, 4 * 60 * 1000); // Every 4 minutes

    return () => clearInterval(keepAliveInterval);
  }, [user]);

  const calculateDaysLeft = () => {
    if (!business || !business.subscriptionEndDate) return 0;
    const endDate = new Date(business.subscriptionEndDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = calculateDaysLeft();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    dispatch(logout());
    navigate('/login');
  };

  const getPageTitle = () => {
    const pathMap: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/products': 'Products',
      '/customers': 'Customers',
      '/bills': 'Bills',
      '/purchases': 'Purchases',
      '/suppliers': 'Suppliers',
      '/payments': 'Payments',
      '/reports': 'Reports',
      '/users': 'Users',
      '/settings': 'Settings',
      '/bill-templates': 'Bill Templates',
      '/analytics': 'Analytics',
      '/admins': 'Admins',
      '/businesses': 'Businesses',
      '/subscriptions': 'Subscriptions',
      '/permissions': 'Permissions',
      '/notifications': 'Notifications',
    };
    
    for (const [path, title] of Object.entries(pathMap)) {
      if (location.pathname.startsWith(path)) return title;
    }
    
    return 'Dashboard';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Sidebar */}
      {!isMobile && (
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      )}

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* Top App Bar */}
        <AppBar
          position="sticky"
          sx={{
            backgroundColor: 'background.paper',
            color: 'text.primary',
            boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ py: 1, px: 3 }}>
            {/* Mobile Menu Toggle */}
            {isMobile && (
              <IconButton
                edge="start"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                sx={{ mr: 2 }}
              >
                <MenuIcon size={20} />
              </IconButton>
            )}

            {/* Page Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 4 }}>
              <Home size={20} style={{ color: theme.palette.text.secondary }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {getPageTitle()}
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Search (Desktop) */}
          {!isMobile && (
            <TextField
              placeholder="Search..."
              size="small"
              sx={{ mr: 3, width: 300 }}
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
          )}

            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Quick Add */}
              {['/bills', '/products', '/customers'].some((path) => location.pathname.startsWith(path)) && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Plus size={18} />}
                  sx={{
                    mr: 1,
                    background: 'linear-gradient(135deg, #2563EB, #6366F1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1D4ED8, #4F46E5)',
                    },
                  }}
                  onClick={() => {
                    if (location.pathname.startsWith('/bills')) {
                      navigate('/bills/create');
                    } else if (location.pathname.startsWith('/products')) {
                      // Navigate to product create when we have it
                    } else if (location.pathname.startsWith('/customers')) {
                      // Navigate to customer create when we have it
                    }
                  }}
                >
                  Add
                </Button>
              )}

              {/* Notifications */}
              <IconButton
                sx={{ mr: 1 }}
                onClick={() => navigate('/notifications')}
              >
                <Badge badgeContent={notificationCount} color="error">
                  <Bell size={20} />
                </Badge>
              </IconButton>

              {/* Theme Toggle */}
              <IconButton
                sx={{ mr: 1 }}
                onClick={() => dispatch(toggleTheme())}
              >
                {themeMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </IconButton>

              {/* User Avatar & Menu */}
              <IconButton
                onClick={handleMenuOpen}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Box>

            {/* User Menu */}
            <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: 2,
                  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                },
              },
            }}
          >
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate('/settings');
                }}
              >
                <User size={18} style={{ marginRight: 8 }} />
                Profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate('/settings');
                }}
              >
                <Settings size={18} style={{ marginRight: 8 }} />
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogOut size={18} style={{ marginRight: 8 }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Trial Period Banner */}
        {business && business.subscriptionPlan === 'TRIAL' && business.isSubscriptionActive && (
          <Box sx={{ px: 3, pt: 2 }}>
            <Alert
              severity="warning"
              variant="filled"
              sx={{
                borderRadius: 2,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  variant="outlined"
                  startIcon={<ShoppingCart />}
                  onClick={() => navigate('/settings')}
                >
                  Upgrade
                </Button>
              }
            >
              {daysLeft > 0
                ? `Your trial period ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}! Upgrade to premium to keep using all features.`
                : 'Your trial period has ended! Upgrade to premium to continue using the app.'}
            </Alert>
          </Box>
        )}

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>

      {/* Mobile Sidebar Drawer */}
      {isMobile && (
        <Sidebar open={mobileMenuOpen} onToggle={() => setMobileMenuOpen(false)} />
      )}
    </Box>
  );
};

export default Layout;
