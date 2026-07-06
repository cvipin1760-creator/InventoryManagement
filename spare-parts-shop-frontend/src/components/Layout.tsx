import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import type { RootState } from '../store';
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
  FormControl,
  InputLabel,
  Select,
  Alert,
  Button,
} from '@mui/material';
import {
  Notifications,
  DarkMode,
  LightMode,
  ShoppingCart,
} from '@mui/icons-material';
import Sidebar from './Sidebar';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { selectCurrentUser } from '../store/slices/authSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import { api } from '../api/client';

const drawerWidth = 280;

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const themeMode = useAppSelector((state: RootState) => state.theme.mode);
  const user = useAppSelector(selectCurrentUser);
  const [notificationCount, setNotificationCount] = useState(0);
  const [business, setBusiness] = useState<any>(null);

  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>(localStorage.getItem('activeBranchId') || '');

  useEffect(() => {
    if (user && user.role !== 'SUPER_MANAGER') {
      api.getBranches()
        .then((data) => {
          setBranches(data);
          // If no activeBranchId is set, default to first branch (or user's default branch if set)
          if (!localStorage.getItem('activeBranchId') && data.length > 0) {
            localStorage.setItem('activeBranchId', String(data[0].id));
            setSelectedBranch(String(data[0].id));
          }
        })
        .catch(err => console.error("Error fetching branches:", err));

      api.getBusiness()
        .then(setBusiness)
        .catch(err => console.error("Error fetching business:", err));
    }
    
    if (user) {
      api.getUnreadCount()
        .then(setNotificationCount)
        .catch(err => console.error("Error fetching unread count:", err));
    }
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

  const handleBranchChange = (event: any) => {
    const val = event.target.value;
    setSelectedBranch(val);
    if (val) {
      localStorage.setItem('activeBranchId', val);
    } else {
      localStorage.removeItem('activeBranchId');
    }
    window.location.reload();
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        open={mobileOpen}
        onToggle={handleDrawerToggle}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Trial Period Notification */}
        {business && business.subscriptionPlan === 'TRIAL' && business.isSubscriptionActive && (
          <Alert
            severity="warning"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<ShoppingCart />}
                onClick={() => navigate('/settings')}
              >
                Upgrade Now
              </Button>
            }
          >
            {daysLeft > 0
              ? `Your trial period ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}! Upgrade to premium to keep using all features.`
              : 'Your trial period has ended! Upgrade to premium to continue using the app.'}
          </Alert>
        )}

        {/* Desktop Top Bar */}
        {!isMobile && (
          <AppBar
            position="sticky"
            sx={{
              backgroundColor: theme.palette.background.paper,
              boxShadow: '0 1px 3px -1px rgba(0,0,0,0.05)',
              mb: 3,
            }}
          >
            <Toolbar
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
                Welcome back, {user?.username}!
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton onClick={() => dispatch(toggleTheme())}>
                  {themeMode === 'light' ? <DarkMode /> : <LightMode />}
                </IconButton>
                <IconButton>
                  <Badge badgeContent={notificationCount} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
                <IconButton
                  onClick={handleMenu}
                  sx={{ ml: 1 }}
                >
                  <Avatar sx={{ width: 40, height: 40 }}>
                    {user?.username.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>Profile</MenuItem>
                  <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>Settings</MenuItem>
                  <MenuItem onClick={() => { handleClose(); handleLogout(); }}>Logout</MenuItem>
                </Menu>
              </Box>
            </Toolbar>
          </AppBar>
        )}

        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
