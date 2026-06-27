import { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
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
import { api } from '../api/client';

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
    }
  }, [user]);

  const handleBranchChange = (event: any) => {
    const val = event.target.value;
    setSelectedBranch(val);
    if (val) {
      localStorage.setItem('activeBranchId', val);
    } else {
      localStorage.removeItem('activeBranchId');
    }
    window.location.reload(); // Reload to refresh all active page data with the new header
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {user && user.role !== 'SUPER_MANAGER' && branches.length > 0 && (
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel id="branch-select-label">Active Branch</InputLabel>
                    <Select
                      labelId="branch-select-label"
                      id="branch-select"
                      value={selectedBranch}
                      label="Active Branch"
                      onChange={handleBranchChange}
                      sx={{ backgroundColor: theme.palette.background.paper }}
                    >
                      <MenuItem value="">All Branches</MenuItem>
                      {branches.map((b) => (
                        <MenuItem key={b.id} value={String(b.id)}>
                          {b.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
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
