import { Box, Typography, Card, CardContent, Button, useTheme, TextField, CircularProgress } from '@mui/material';
import { SupportAgent, Email, Phone, Chat, Send } from '@mui/icons-material';
import { useState } from 'react';
import { api } from '../api/client';

const Support = () => {
  const theme = useTheme();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.submitSupportTicket({ subject, description });
      setMessage('Ticket submitted successfully!');
      setSubject('');
      setDescription('');
    } catch (err: any) {
      setMessage(err.message || 'Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Customer Support
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Support Options */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' } }}>
          <Card sx={{ borderRadius: 3, height: '100%', textAlign: 'center', p: 3 }}>
            <CardContent>
              <Box sx={{
                width: 64, height: 64, borderRadius: '50%', bgcolor: `${theme.palette.primary.main}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2
              }}>
                <Phone sx={{ fontSize: 32, color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Call Us</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Speak directly with our support agents for immediate assistance.
              </Typography>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                1-800-STOCK-PILOT
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' } }}>
          <Card sx={{ borderRadius: 3, height: '100%', textAlign: 'center', p: 3 }}>
            <CardContent>
              <Box sx={{
                width: 64, height: 64, borderRadius: '50%', bgcolor: `${theme.palette.secondary.main}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2
              }}>
                <Email sx={{ fontSize: 32, color: theme.palette.secondary.main }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Email Support</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Send us an email and we'll get back to you within 24 hours.
              </Typography>
              <Button variant="contained" color="secondary" fullWidth>
                support@stockpilot.com
              </Button>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' } }}>
          <Card sx={{ borderRadius: 3, height: '100%', textAlign: 'center', p: 3 }}>
            <CardContent>
              <Box sx={{
                width: 64, height: 64, borderRadius: '50%', bgcolor: `${theme.palette.success.main}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2
              }}>
                <Chat sx={{ fontSize: 32, color: theme.palette.success.main }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Live Chat</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Chat with our online representatives right now.
              </Typography>
              <Button variant="contained" color="success" fullWidth endIcon={<SupportAgent />}>
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Submit a Support Ticket
        </Typography>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Subject"
                variant="outlined"
                margin="normal"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <TextField
                fullWidth
                label="Describe your issue"
                variant="outlined"
                margin="normal"
                required
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                  disabled={loading}
                >
                  Submit Ticket
                </Button>
                {message && (
                  <Typography variant="body2" color={message.includes('success') ? 'success.main' : 'error.main'}>
                    {message}
                  </Typography>
                )}
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Support;
