import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  useTheme,
  Button
} from '@mui/material';
import {
  TrendingDown,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

const PredictiveAnalytics = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getPredictiveAnalytics();
        setData(response);
      } catch (err) {
        console.error('Failed to fetch predictive analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) return null;

  const { deadStock, fastMovingProducts, churnedCustomers } = data;

  const handleSendWhatsApp = async (customerId: number, customerName: string) => {
    try {
      await api.sendWhatsAppMessage({
        customerId,
        message: `Hi ${customerName}, we miss you! Here is a special 10% discount on your next purchase at StockPilot. Use code: COMEBACK10`
      });
      alert(`WhatsApp promo sent to ${customerName}`);
    } catch (err) {
      console.error('Failed to send WhatsApp message', err);
      alert('Failed to send message');
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        Predictive Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        AI-powered insights to optimize your inventory and customer retention.
      </Typography>

      <Grid container spacing={3}>
        {/* Dead Stock */}
        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'error.main', color: 'white', mr: 2 }}>
                    <TrendingDown size={24} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: '600' }}>Dead Stock</Typography>
                    <Typography variant="body2" color="text.secondary">No sales in last 60 days</Typography>
                  </Box>
                </Box>
                
                {deadStock.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    Great! No dead stock found.
                  </Typography>
                ) : (
                  <List>
                    {deadStock.slice(0, 5).map((product: any) => (
                      <ListItem key={product.id} divider>
                        <ListItemIcon>
                          <AlertTriangle size={20} color={theme.palette.warning.main} />
                        </ListItemIcon>
                        <ListItemText
                          primary={product.name}
                          secondary={`Part: ${product.partNumber} | Qty: ${product.quantity}`}
                        />
                        <Chip
                          size="small"
                          label={`₹${product.price}`}
                          color="error"
                          variant="outlined"
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
                {deadStock.length > 5 && (
                  <Button
                    fullWidth
                    endIcon={<ArrowRight size={16} />}
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/products')}
                  >
                    View All {deadStock.length} Items
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Fast Moving */}
        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'success.main', color: 'white', mr: 2 }}>
                    <TrendingUp size={24} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: '600' }}>Fast Moving</Typography>
                    <Typography variant="body2" color="text.secondary">Top sellers in last 30 days</Typography>
                  </Box>
                </Box>
                
                {fastMovingProducts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    No recent sales data.
                  </Typography>
                ) : (
                  <List>
                    {fastMovingProducts.slice(0, 5).map((item: any) => (
                      <ListItem key={item.product.id} divider>
                        <ListItemText
                          primary={item.product.name}
                          secondary={`Part: ${item.product.partNumber} | Stock: ${item.product.quantity}`}
                        />
                        <Chip
                          size="small"
                          label={`${item.totalSold} sold`}
                          color="success"
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
                {fastMovingProducts.length > 5 && (
                  <Button
                    fullWidth
                    endIcon={<ArrowRight size={16} />}
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/products')}
                  >
                    View All
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Churned Customers */}
        <Grid size={{ xs: 12 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.main', color: 'white', mr: 2 }}>
                    <Users size={24} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: '600' }}>Churned Customers</Typography>
                    <Typography variant="body2" color="text.secondary">No purchases in last 90 days</Typography>
                  </Box>
                </Box>
                
                {churnedCustomers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    Excellent! Customer retention is high.
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {churnedCustomers.map((customer: any) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={customer.id}>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: '600' }}>{customer.name}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{customer.phone}</Typography>
                          <Button size="small" variant="outlined" color="primary" onClick={() => handleSendWhatsApp(customer.id, customer.name)}>
                            Send Follow-up
                          </Button>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

      </Grid>
    </Box>
  );
};

export default PredictiveAnalytics;
