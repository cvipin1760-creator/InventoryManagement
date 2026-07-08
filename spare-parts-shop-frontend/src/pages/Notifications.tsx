import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { MarkEmailRead, Person, NotificationsActive } from '@mui/icons-material';
import { api } from '../api/client';
import { requestNotificationPermission } from '../utils/firebase';

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await api.markAsRead(id);
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ p: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Notifications
        </Typography>
        <Tooltip title="Enable Push Notifications on this device">
          <IconButton 
            color={fcmToken ? 'success' : 'primary'} 
            onClick={async () => {
              const token = await requestNotificationPermission();
              if (token) setFcmToken(token);
            }}
          >
            <NotificationsActive />
          </IconButton>
        </Tooltip>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 0 }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No notifications yet
                </Typography>
              </Box>
            ) : (
              <List sx={{ py: 0 }}>
                {notifications.map((notification, index) => (
                  <Box key={notification.id}>
                    <ListItem disablePadding sx={{ p: 2 }}>
                      <ListItemButton
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: !notification.isRead ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {notification.title}
                              </Typography>
                              {!notification.isRead && (
                                <Chip
                                  label="New"
                                  size="small"
                                  color="primary"
                                  variant="filled"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {notification.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(notification.createdAt)}
                              </Typography>
                            </Box>
                          }
                        />
                        {!notification.isRead && (
                          <Tooltip title="Mark as read">
                            <IconButton
                              onClick={(e) => handleMarkAsRead(e, notification.id)}
                              size="small"
                            >
                              <MarkEmailRead />
                            </IconButton>
                          </Tooltip>
                        )}
                      </ListItemButton>
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Notifications;
