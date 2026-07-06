import { Box, Typography, Card, CardContent, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Switch, Avatar, Divider, useTheme } from '@mui/material';
import {
  Person,
  Palette,
  Notifications,
  Backup,
  Help,
  Info,
  Logout,
  ArrowRight
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectCurrentUser } from '../store/slices/authSlice';
import { toggleTheme, selectThemeMode } from '../store/slices/themeSlice';

const Settings = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const themeMode = useAppSelector(selectThemeMode);

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Settings
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {/* Profile Card */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 300px' } }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 3,
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  backgroundColor: theme.palette.primary.main
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {user?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.role}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Settings Options */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(100% - 324px)' } }}>
          <Card sx={{ borderRadius: 3 }}>
            <List>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText primary="Profile" secondary="Edit your profile details" />
                  <ArrowRight />
                </ListItemButton>
              </ListItem>

              <Divider />

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
                <ListItemButton sx={{ color: 'error.main' }}>
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
    </Box>
  );
};

export default Settings;
