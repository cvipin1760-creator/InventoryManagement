import { useState } from 'react';
import { Outlet } from 'react-router-dom';
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
} from '@mui/material';
import {
  Notifications,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import Sidebar from './Sidebar';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleTheme } from '../store/slices/themeSlice';
import { selectCurrentUser } from '../store/slices/authSlice';

const drawerWidth = 280;

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const themeMode = useAppSelector((state: RootState) => state.theme.mode);
  const user = useAppSelector(selectCurrentUser);
  const [notificationCount] = useState(3); // Mock notification count

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
                <IconButton onClick={() => dispatch(toggleTheme(themeMode === 'light' ? 'dark' : 'light'))}>
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
                  <MenuItem onClick={handleClose}>Profile</MenuItem>
                  <MenuItem onClick={handleClose}>Settings</MenuItem>
                  <MenuItem onClick={handleClose}>Logout</MenuItem>
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
