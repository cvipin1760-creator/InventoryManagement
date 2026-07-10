import { Box, Typography, Card, CardContent, Button, TextField, Switch, FormControlLabel } from '@mui/material';
import { CreditCard, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PaymentSettings = () => {
  const [razorpayKey, setRazorpayKey] = useState('');
  const [razorpaySecret, setRazorpaySecret] = useState('');
  const [stripeKey, setStripeKey] = useState('');
  const [stripeSecret, setStripeSecret] = useState('');
  const [enableRazorpay, setEnableRazorpay] = useState(true);
  const [enableStripe, setEnableStripe] = useState(false);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <CreditCard size={32} color="#2563EB" />
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Payment Gateways</Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure the payment methods available for subscriptions and local business invoices.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Razorpay (India)</Typography>
              <FormControlLabel
                control={<Switch checked={enableRazorpay} onChange={(e) => setEnableRazorpay(e.target.checked)} />}
                label={enableRazorpay ? 'Enabled' : 'Disabled'}
              />
            </Box>
            
            <TextField fullWidth label="Key ID" variant="outlined" sx={{ mb: 2 }} value={razorpayKey} onChange={e => setRazorpayKey(e.target.value)} disabled={!enableRazorpay} />
            <TextField fullWidth label="Key Secret" type="password" variant="outlined" sx={{ mb: 3 }} value={razorpaySecret} onChange={e => setRazorpaySecret(e.target.value)} disabled={!enableRazorpay} />
            
            <Button variant="contained" startIcon={<Save />} fullWidth disabled={!enableRazorpay}>
              Save Razorpay Config
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Stripe (Global)</Typography>
              <FormControlLabel
                control={<Switch checked={enableStripe} onChange={(e) => setEnableStripe(e.target.checked)} />}
                label={enableStripe ? 'Enabled' : 'Disabled'}
              />
            </Box>
            
            <TextField fullWidth label="Publishable Key" variant="outlined" sx={{ mb: 2 }} value={stripeKey} onChange={e => setStripeKey(e.target.value)} disabled={!enableStripe} />
            <TextField fullWidth label="Secret Key" type="password" variant="outlined" sx={{ mb: 3 }} value={stripeSecret} onChange={e => setStripeSecret(e.target.value)} disabled={!enableStripe} />
            
            <Button variant="contained" startIcon={<Save />} fullWidth disabled={!enableStripe}>
              Save Stripe Config
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PaymentSettings;
