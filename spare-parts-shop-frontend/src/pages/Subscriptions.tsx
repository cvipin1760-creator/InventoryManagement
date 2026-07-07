import { Box, Typography, Card, CardContent, Chip, Button, List, ListItem, ListItemText, Avatar, useTheme } from '@mui/material';
import { CreditCard, CheckCircle, XCircle, RefreshCw, Plus } from 'lucide-react';

const Subscriptions = () => {
  const theme = useTheme();

  const subscriptionPlans = [
    {
      name: 'Basic',
      price: '₹499/month',
      features: [
        'Up to 500 products',
        '5 employees',
        'Basic reports',
        'Email support',
        '1 branch'
      ],
      popular: false,
      currency: 'INR'
    },
    {
      name: 'Pro',
      price: '₹999/month',
      features: [
        'Unlimited products',
        '20 employees',
        'Advanced analytics',
        'Priority support',
        '5 branches',
        'WhatsApp integration'
      ],
      popular: true,
      currency: 'INR'
    },
    {
      name: 'Enterprise',
      price: '₹1999/month',
      features: [
        'Unlimited everything',
        'Unlimited employees',
        'Custom reports',
        '24/7 phone support',
        'Unlimited branches',
        'WhatsApp + SMS integration',
        'Custom branding'
      ],
      popular: false,
      currency: 'INR'
    }
  ];

  const activeSubscriptions = [
    {
      business: 'Auto Parts Hub',
      plan: 'Pro',
      status: 'active',
      nextBilling: '2024-08-15',
      amount: '₹999'
    },
    {
      business: 'Bike Care Plus',
      plan: 'Basic',
      status: 'active',
      nextBilling: '2024-08-20',
      amount: '₹499'
    },
    {
      business: 'Premium Spares',
      plan: 'Enterprise',
      status: 'trialing',
      nextBilling: '2024-08-10',
      amount: '₹1999'
    },
    {
      business: 'Quick Fix Motors',
      plan: 'Pro',
      status: 'cancelled',
      nextBilling: '2024-07-25',
      amount: '₹999'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.palette.success.main;
      case 'trialing': return theme.palette.info.main;
      case 'cancelled': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle size={20} />;
      case 'trialing': return <RefreshCw size={20} />;
      case 'cancelled': return <XCircle size={20} />;
      default: return <CheckCircle size={20} />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
        Subscriptions
      </Typography>

      {/* Pricing Plans */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Available Plans
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {subscriptionPlans.map((plan, index) => (
            <Box key={index} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' } }}>
              <Card
                sx={{
                  borderRadius: 3,
                  height: '100%',
                  position: 'relative',
                  border: plan.popular ? `2px solid ${theme.palette.primary.main}` : 'none'
                }}
              >
                {plan.popular && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: theme.palette.primary.main,
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}
                  >
                    Most Popular
                  </Box>
                )}
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {plan.name}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 3 }}>
                    {plan.price}
                  </Typography>
                  <List sx={{ mb: 3 }}>
                    {plan.features.map((feature, idx) => (
                      <ListItem key={idx} disablePadding sx={{ mb: 1.5 }}>
                        <Box sx={{ mr: 1.5, color: theme.palette.success.main, flexShrink: 0 }}>
                          <CheckCircle size={18} />
                        </Box>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ borderRadius: 2, py: 1.5, textTransform: 'none' }}
                  >
                    Choose Plan
                  </Button>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Active Subscriptions */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Active Subscriptions
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Add Subscription
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {activeSubscriptions.map((sub, index) => (
            <Box key={index} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          backgroundColor: `${theme.palette.primary.main}20`,
                          color: theme.palette.primary.main,
                          width: 48,
                          height: 48
                        }}
                      >
                        <CreditCard size={24} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {sub.business}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {sub.plan} Plan
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      icon={getStatusIcon(sub.status)}
                      label={sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                      sx={{
                        backgroundColor: `${getStatusColor(sub.status)}20`,
                        color: getStatusColor(sub.status),
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Next Billing
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {sub.nextBilling}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Amount
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {sub.amount}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Subscriptions;
