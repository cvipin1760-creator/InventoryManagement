import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { api } from '../api/client';

const SendNotifications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setSnackbar({ open: true, message: 'Please fill in both title and message', severity: 'error' });
      return;
    }
    if (!sendToAll && selectedUsers.length === 0) {
      setSnackbar({ open: true, message: 'Please select at least one user', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        message: message.trim(),
        sendToAll,
        userIds: sendToAll ? undefined : selectedUsers.map(u => u.id),
      };
      await api.sendNotification(payload);
      setSnackbar({ open: true, message: 'Notifications sent successfully!', severity: 'success' });
      setTitle('');
      setMessage('');
      setSelectedUsers([]);
    } catch (err) {
      console.error('Error sending notifications:', err);
      setSnackbar({ open: true, message: 'Failed to send notifications', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 0 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Send Notifications
      </Typography>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              variant="outlined"
            />

            <TextField
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              multiline
              rows={5}
              fullWidth
              required
              variant="outlined"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={sendToAll}
                  onChange={(e) => setSendToAll(e.target.checked)}
                />
              }
              label="Send to All Users"
            />

            {!sendToAll && (
              <Autocomplete
                multiple
                options={users}
                getOptionLabel={(option) => option.username}
                value={selectedUsers}
                onChange={(_, newValue) => setSelectedUsers(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Users"
                    placeholder="Search users..."
                    variant="outlined"
                    required
                  />
                )}
              />
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Sending...' : 'Send Notifications'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SendNotifications;
