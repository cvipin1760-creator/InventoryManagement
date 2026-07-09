import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, LinearProgress, useTheme, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { CheckCircle } from 'lucide-react';
import api from '../api';

interface Subscription {
  planName: string;
  status: string;
  monthlyPrice: number;
  maxBranches: number;
  maxUsers: number;
  maxInvoicesPerMonth: number;
  endDate: string;
}

const SubscriptionBilling = () => {
  const theme = useTheme();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [upgradePlanName, setUpgradePlanName] = useState('');

  // Hardcode usages for now as we haven't created a usage stats endpoint.
  // In a real app, these would come from an API.
  const usage = {
    branches: 1,
    users: 2,
    invoices: 45
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/current');
      setSubscription(response.data);
    } catch (error) {
      console.error('Failed to fetch subscription', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planName: string) => {
    try {
      const response = await api.post(`/subscriptions/upgrade?planName=${planName}`);
      setSubscription(response.data);
      alert(`Successfully upgraded to ${planName} Plan!`);
    } catch (error) {
      console.error('Failed to upgrade plan', error);
      setUpgradePlanName(planName);
      setErrorModalOpen(true);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  const plans = [
    { name: 'Basic', price: '₹999/month', limits: '500 Invoices, 3 Users, 1 Branch' },
    { name: 'Premium', price: '₹2999/month', limits: '2000 Invoices, 10 Users, 3 Branches' },
    { name: 'Enterprise', price: '₹5999/month', limits: 'Unlimited Everything' }
  ];

  const renderProgressBar = (label: string, current: number, max: number) => {
    if (max < 0) return <Typography variant="body2">{label}: {current} / Unlimited</Typography>;
    const percentage = Math.min(100, (current / max) * 100);
    const color = percentage > 90 ? 'error' : percentage > 75 ? 'warning' : 'primary';
    
    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">{label}</Typography>
          <Typography variant="body2">{current} / {max}</Typography>
        </Box>
        <LinearProgress variant="determinate" value={percentage} color={color as any} sx={{ height: 8, borderRadius: 4 }} />
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Billing & Subscription
      </Typography>

      {subscription && (
        <Card sx={{ mb: 4, borderRadius: 3, p: 2, border: subscription.status === 'EXPIRED' ? '2px solid red' : 'none' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Current Plan: <strong>{subscription.planName}</strong>
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, color: subscription.status === 'EXPIRED' ? 'error.main' : 'success.main' }}>
              Status: {subscription.status}
            </Typography>
            {subscription.status === 'EXPIRED' && (
              <Typography variant="body2" color="error" sx={{ mb: 3 }}>
                Your account is currently in Read-Only mode. Please upgrade your plan to restore functionality.
              </Typography>
            )}

            <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>Usage Limits (This Month)</Typography>
            {renderProgressBar('Invoices Created', usage.invoices, subscription.maxInvoicesPerMonth)}
            {renderProgressBar('Active Users', usage.users, subscription.maxUsers)}
            {renderProgressBar('Active Branches', usage.branches, subscription.maxBranches)}
          </CardContent>
        </Card>
      )}

      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>Upgrade Plan</Typography>
      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.name}>
            <Card sx={{ height: '100%', borderRadius: 3, border: subscription?.planName === plan.name ? `2px solid ${theme.palette.primary.main}` : 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{plan.name}</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>{plan.price}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CheckCircle size={18} color={theme.palette.success.main} style={{ marginRight: 8 }} />
                  <Typography variant="body2">{plan.limits}</Typography>
                </Box>
                <Button 
                  variant={subscription?.planName === plan.name ? 'outlined' : 'contained'} 
                  fullWidth 
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={subscription?.planName === plan.name}
                >
                  {subscription?.planName === plan.name ? 'Current Plan' : 'Upgrade to ' + plan.name}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Professional Error Modal */}
      <Dialog open={errorModalOpen} onClose={() => setErrorModalOpen(false)} PaperProps={{ sx: { borderRadius: 3, maxWidth: 400 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          Unable to upgrade plan
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            We couldn't process your request to upgrade to the <strong>{upgradePlanName}</strong> plan.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Reason:</strong> Payment service is currently unavailable.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Please try again later or contact our support team for assistance.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setErrorModalOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" color="primary" onClick={() => setErrorModalOpen(false)} sx={{ borderRadius: 2 }}>
            Contact Support
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionBilling;
