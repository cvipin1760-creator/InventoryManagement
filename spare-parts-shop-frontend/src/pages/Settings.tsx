import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
  Avatar,
  Divider,
  useTheme,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Person,
  Palette,
  Notifications,
  Backup,
  Help,
  Info,
  Logout,
  ArrowRight,
  CreditCard,
  Save,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectCurrentUser, logout, setCredentials } from '../store/slices/authSlice';
import { toggleTheme, selectThemeMode } from '../store/slices/themeSlice';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const Settings = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const themeMode = useAppSelector(selectThemeMode);

  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: (user as any)?.contactNumber || '',
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        email: user.email || '',
        phone: (user as any).contactNumber || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'SUPER_MANAGER') {
      api.getBusiness()
        .then(setBusiness)
        .catch(err => console.error("Error fetching business:", err));
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setLoading(true);
    try {
      await api.updateStaff(user.id, {
        username: user.username,
        email: profileForm.email,
        contactNumber: profileForm.phone,
        role: user.role,
      });

      const updatedUser = {
        ...user,
        email: profileForm.email,
        contactNumber: profileForm.phone,
      };

      dispatch(setCredentials({
        user: updatedUser,
        token: localStorage.getItem('token') || undefined,
      }));

      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success',
      });
    } catch (err: any) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update profile',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async (subscriptionPlan: string) => {
    if (!business?.id) return;
    setLoading(true);
    try {
      await api.updateSubscription(business.id, subscriptionPlan);
      setSnackbar({
        open: true,
        message: `Subscription updated to ${subscriptionPlan} successfully!`,
        severity: 'success',
      });
      api.getBusiness().then(setBusiness);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update subscription',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysLeft = () => {
    if (!business || !business.subscriptionEndDate) return 0;
    const endDate = new Date(business.subscriptionEndDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Settings
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {/* Profile Card */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 300px' } }}>
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 3,
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  backgroundColor: theme.palette.primary.main,
                }}
              >
                {user?.username.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {user?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {user?.role}
              </Typography>
              {business && (
                <Box sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'light' ? '#f0f9ff' : '#1e293b'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Subscription
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {business.subscriptionPlan}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {business.subscriptionPlan === 'TRIAL'
                      ? `${calculateDaysLeft()} days left`
                      : `Expires on ${new Date(business.subscriptionEndDate).toLocaleDateString()}`}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Subscription Card (if not super manager) */}
          {user?.role !== 'SUPER_ADMIN' && user?.role !== 'SUPER_MANAGER' && business && (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  <CreditCard sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Subscription
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Plan</InputLabel>
                  <Select
                    value={business.subscriptionPlan}
                    label="Plan"
                    onChange={(e) => handleUpdateSubscription(e.target.value)}
                    disabled={loading}
                  >
                    <MenuItem value="TRIAL">Trial</MenuItem>
                    <MenuItem value="MONTHLY">Monthly</MenuItem>
                    <MenuItem value="YEARLY">Yearly</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="body2" color="text.secondary">
                  {business.isSubscriptionActive ? 'Active' : 'Inactive'}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Settings Options */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(100% - 324px)' } }}>
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                Profile
              </Typography>
              <Box component="form" onSubmit={handleSaveProfile} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Username"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                  fullWidth
                  disabled
                />
                <TextField
                  label="Email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Phone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={<Save />}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Save Changes
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 3 }}>
            <List>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton>
                  <ListItemIcon>
                    <Palette />
                  </ListItemIcon>
                  <ListItemText primary="Theme" secondary="Switch between light and dark mode" />
                  <Switch
                    checked={themeMode === 'dark'}
                    onChange={() => dispatch(toggleTheme())}
                  />
                </ListItemButton>
              </ListItem>

              <Divider />

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton>
                  <ListItemIcon>
                    <Notifications />
                  </ListItemIcon>
                  <ListItemText primary="Notifications" secondary="Manage your notifications" />
                  <ArrowRight />
                </ListItemButton>
              </ListItem>

              <Divider />

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton>
                  <ListItemIcon>
                    <Backup />
                  </ListItemIcon>
                  <ListItemText primary="Backup & Restore" secondary="Backup your data" />
                  <ArrowRight />
                </ListItemButton>
              </ListItem>

              <Divider />

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton>
                  <ListItemIcon>
                    <Help />
                  </ListItemIcon>
                  <ListItemText primary="Help & Support" secondary="Get help with the app" />
                  <ArrowRight />
                </ListItemButton>
              </ListItem>

              <Divider />

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton>
                  <ListItemIcon>
                    <Info />
                  </ListItemIcon>
                  <ListItemText primary="About" secondary="App version and info" />
                  <ArrowRight />
                </ListItemButton>
              </ListItem>

              <Divider />

              <ListItem disablePadding sx={{ mt: 2 }}>
                <ListItemButton sx={{ color: 'error.main' }} onClick={handleLogout}>
                  <ListItemIcon sx={{ color: 'error.main' }}>
                    <Logout />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </List>
          </Card>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
