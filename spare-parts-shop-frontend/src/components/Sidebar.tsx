import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  Badge,
} from '@mui/material';
import {
  Dashboard,
  Inventory,
  People,
  ReceiptLong,
  ShoppingCart,
  LocalShipping,
  Payments,
  Settings,
  Logout,
  AdminPanelSettings,
  Business,
  BarChart,
  Shield,
  Support,
  Menu,
  Close,
  Notifications,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout, selectCurrentUser } from '../store/slices/authSlice';

const drawerWidth = 280;

const Sidebar = ({ open, onToggle, onClose }: { open: boolean; onToggle: () => void; onClose: () => void }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);

  const [notificationCount] = useState(3); // Mock notification count

  // Define menu items based on user role
  const getMenuItems = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return [
          { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
          { label: 'Admin Management', icon: <AdminPanelSettings />, path: '/admins' },
          { label: 'Business Management', icon: <Business />, path: '/businesses' },
          { label: 'Subscriptions', icon: <Payments />, path: '/subscriptions' },
          { label: 'Feature Permissions', icon: <Shield />, path: '/permissions' },
          { label: 'Analytics', icon: <BarChart />, path: '/analytics' },
          { label: 'Reports', icon: <ReceiptLong />, path: '/reports' },
        ];
      case 'CUSTOMER':
        return [
          { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
          { label: 'My Products', icon: <Inventory />, path: '/my-products' },
          { label: 'My Bills', icon: <ReceiptLong />, path: '/my-bills' },
          { label: 'Warranties', icon: <Shield />, path: '/warranties' },
          { label: 'My EMI', icon: <Payments />, path: '/my-emi' },
          { label: 'Support', icon: <Support />, path: '/support' },
        ];
      default: // ADMIN, EMPLOYEE
        return [
          { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
          { label: 'Products', icon: <Inventory />, path: '/products' },
          { label: 'Customers', icon: <People />, path: '/customers' },
          { label: 'Billing', icon: <ReceiptLong />, path: '/bills' },
          { label: 'Purchases', icon: <ShoppingCart />, path: '/purchases' },
          { label: 'Suppliers', icon: <LocalShipping />, path: '/suppliers' },
          { label: 'Payments', icon: <Payments />, path: '/payments' },
          { label: 'Reports', icon: <BarChart />, path: '/reports' },
        ];
    }
  };

  const menuItems = getMenuItems();

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar
          src="/stockpilot_logo.png"
          sx={{
            width: 48,
            height: 48,
            backgroundColor: theme.palette.primary.main,
          }}
        />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Stock Pilot
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Enterprise Edition
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* User Profile */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: theme.palette.mode === 'light' ? '#f0f9ff' : '#1e293b',
          }}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              backgroundColor: theme.palette.primary.main,
              fontWeight: 700,
            }}
          >
            {user?.username.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.role.replace('_', ' ')}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Menu */}
      <List sx={{ flexGrow: 1, p: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                sx={{
                  borderRadius: 1.5,
                  backgroundColor: isActive ? theme.palette.primary.main : 'transparent',
                  color: isActive ? 'white' : 'inherit',
                  '&:hover': {
                    backgroundColor: isActive
                      ? theme.palette.primary.main
                      : theme.palette.mode === 'light'
                      ? '#f0f9ff'
                      : '#334155',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'white' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: isActive ? 600 : 500,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Bottom Menu */}
      <List sx={{ p: 2 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            component={Link}
            to="/settings"
            onClick={isMobile ? onClose : undefined}
            sx={{ borderRadius: 1.5 }}
          >
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              borderRadius: 1.5,
              color: theme.palette.error.main,
            }}
            onClick={() => dispatch(logout())}
          >
            <ListItemIcon sx={{ color: theme.palette.error.main }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile Header */}
      {isMobile && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            position: 'sticky',
            top: 0,
            zIndex: theme.zIndex.appBar + 1,
            backgroundColor: theme.palette.background.paper,
            boxShadow: 1,
          }}
        >
          <IconButton onClick={onToggle} edge="start">
            {open ? <Close /> : <Menu />}
          </IconButton>
          <Box component="img" src="/stockpilot_logo.png" alt="Logo" sx={{ height: 40 }} />
          <IconButton>
            <Badge badgeContent={notificationCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Box>
      )}

      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={isMobile ? open : true}
        onClose={isMobile ? onClose : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Sidebar;
