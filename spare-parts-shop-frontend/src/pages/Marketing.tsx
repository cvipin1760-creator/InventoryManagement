import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  Tabs,
  Tab,
} from '@mui/material';
import { MessageSquare, Send, Smartphone } from 'lucide-react';
import { api } from '../api/client';

export default function Marketing() {
  const [tab, setTab] = useState(0);
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const showToast = (msg: string, severity: 'success' | 'error' = 'success') => {
    setToast({ open: true, message: msg, severity });
  };

  const handleSend = async () => {
    if (!message.trim()) {
      showToast('Please enter a message', 'error');
      return;
    }

    try {
      setLoading(true);
      if (tab === 0) {
        await api.sendBulkWhatsApp({ message, audience });
        showToast('Bulk WhatsApp messages queued successfully', 'success');
      } else {
        await api.sendBulkSMS({ message, audience });
        showToast('Bulk SMS queued successfully', 'success');
      }
      setMessage('');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to send messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Marketing & Promotions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Engage with your customers through targeted SMS and WhatsApp campaigns.
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<Smartphone size={18} />} iconPosition="start" label="WhatsApp" />
          <Tab icon={<MessageSquare size={18} />} iconPosition="start" label="SMS" />
        </Tabs>

        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Compose Campaign
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Target Audience</InputLabel>
                <Select
                  value={audience}
                  label="Target Audience"
                  onChange={(e) => setAudience(e.target.value)}
                >
                  <MenuItem value="all">All Customers</MenuItem>
                  <MenuItem value="active">Active Customers (Last 30 days)</MenuItem>
                  <MenuItem value="inactive">Inactive Customers (No purchase in 90 days)</MenuItem>
                  <MenuItem value="vip">VIP Customers (High Loyalty Points)</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={6}
                label="Message Content"
                placeholder={`Hi {Name}, get 20% off on your next purchase...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                sx={{ mb: 3 }}
                helperText="Use {Name} to personalize the message"
              />

              <Button
                variant="contained"
                size="large"
                startIcon={<Send size={18} />}
                onClick={handleSend}
                disabled={loading}
                sx={{ px: 4, py: 1.5 }}
              >
                {loading ? 'Sending...' : `Send ${tab === 0 ? 'WhatsApp' : 'SMS'} Campaign`}
              </Button>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Preview
                  </Typography>
                  <Box sx={{ 
                    bgcolor: tab === 0 ? '#e7f5eb' : '#f3f4f6', 
                    p: 2, 
                    borderRadius: 2,
                    minHeight: 150,
                    position: 'relative'
                  }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary' }}>
                      {message || 'Your message preview will appear here...'}
                    </Typography>
                    <Typography variant="caption" sx={{ position: 'absolute', bottom: 8, right: 12, color: 'text.secondary' }}>
                      10:42 AM
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Snackbar open={toast.open} autoHideDuration={6000} onClose={() => setToast({ ...toast, open: false })}>
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
