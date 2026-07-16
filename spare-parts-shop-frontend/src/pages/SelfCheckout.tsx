import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid, List, ListItem, ListItemText, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Trash2, ShoppingCart, CreditCard, Wallet } from 'lucide-react';
import { api } from '../api/client';
import BarcodeScanner from '../components/BarcodeScanner';
import toast from 'react-hot-toast';

export default function SelfCheckout() {
  const [cart, setCart] = useState<any[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  
  const handleScan = async (code: string) => {
    try {
      const res: any = await api.searchProducts(code);
      const product = Array.isArray(res) ? res[0] : (res?.content?.[0] || null);
      if (product) {
        addToCart(product);
        toast.success(`Added ${product.name}`);
      } else {
        toast.error('Product not found');
      }
    } catch (e) {
      toast.error('Search failed');
    }
  };

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1, price: product.sellingPrice || 0 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const handleCheckout = async (paymentMode: string) => {
     try {
       await api.createBill({
         // @ts-ignore
         customerId: null as any,
         paymentMode,
         items: cart.map(c => ({
          productId: c.product.id,
          quantity: c.qty,
          serialNumber: '',
          price: c.price,
          discount: 0,
          gstPercent: c.product.gstPercent || 0
        })),
        discount: 0,
        gstType: 'INCLUDED',
        paidAmount: cart.reduce((sum, item) => sum + (item.price * item.qty), 0),
        warranties: []
      });
      toast.success('Payment Successful! Please collect your receipt.');
      setCart([]);
      setShowPayment(false);
    } catch (e) {
      toast.error('Checkout failed');
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 4 }}>
      <Typography variant="h3" align="center" gutterBottom color="primary" fontWeight="bold">
        Self Checkout Kiosk
      </Typography>
      
      <Grid container spacing={4} mt={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 4, height: '70vh', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h5">Scan Items</Typography>
            
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                placeholder="Enter Barcode manually..."
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && barcodeInput) {
                    handleScan(barcodeInput);
                    setBarcodeInput('');
                  }
                }}
              />
              <Button variant="contained" onClick={() => setShowScanner(!showScanner)}>
                {showScanner ? 'Close Scanner' : 'Use Camera'}
              </Button>
            </Box>

            {showScanner && (
              <Box sx={{ height: 300, border: '2px dashed gray' }}>
                <BarcodeScanner 
                  // @ts-ignore
                  onDetected={(code: string) => {
                  handleScan(code);
                  setShowScanner(false);
                }} />
              </Box>
            )}
            
            <Box flex={1} />
            <Typography variant="body2" color="textSecondary" align="center">
              Please scan the barcode on the product packaging
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 4, height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" display="flex" alignItems="center" gap={1}>
                <ShoppingCart /> Your Cart
              </Typography>
              <Typography variant="h6">{cart.length} items</Typography>
            </Box>
            
            <List sx={{ flex: 1, overflow: 'auto' }}>
              {cart.map(item => (
                <ListItem 
                  key={item.product.id}
                  secondaryAction={
                    <IconButton edge="end" color="error" onClick={() => removeFromCart(item.product.id)}>
                      <Trash2 />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={item.product.name}
                    secondary={`Qty: ${item.qty} × ₹${item.price}`}
                  />
                  <Typography variant="subtitle1" fontWeight="bold">
                    ₹{item.price * item.qty}
                  </Typography>
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2, mt: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={3}>
                <Typography variant="h4">Total to Pay:</Typography>
                <Typography variant="h4" color="primary" fontWeight="bold">₹{total.toFixed(2)}</Typography>
              </Box>
              <Button 
                variant="contained" 
                color="success" 
                fullWidth 
                size="large" 
                sx={{ py: 2, fontSize: '1.2rem' }}
                disabled={cart.length === 0}
                onClick={() => setShowPayment(true)}
              >
                Proceed to Pay
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={showPayment} onClose={() => setShowPayment(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Payment Method</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <Button variant="outlined" size="large" startIcon={<CreditCard />} onClick={() => handleCheckout('CARD')}>
              Credit / Debit Card
            </Button>
            <Button variant="outlined" size="large" startIcon={<Wallet />} onClick={() => handleCheckout('UPI')}>
              UPI / QR Code
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPayment(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
