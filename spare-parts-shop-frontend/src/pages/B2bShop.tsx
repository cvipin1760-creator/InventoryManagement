import React, { useEffect, useState } from 'react';
import { Box, Card, Typography, Grid, Button, Badge, Drawer, List, ListItem, ListItemText, Divider, IconButton } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, Package, CreditCard } from 'lucide-react';
import type { Product } from '../types';

export default function B2bShop() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');

  const token = localStorage.getItem(`b2b_token_${businessId}`);

  useEffect(() => {
    if (!token) {
      navigate(`/b2b/${businessId}/login`);
      return;
    }
    
    fetch(`http://localhost:8080/api/b2b/${businessId}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Auth failed');
        return res.json();
      })
      .then(setProducts)
      .catch(() => {
        localStorage.removeItem(`b2b_token_${businessId}`);
        navigate(`/b2b/${businessId}/login`);
      });
  }, [businessId, token, navigate]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = async () => {
    // In a real flow, this would create an Order/Bill on the backend first,
    // then fetch the Stripe payment link.
    // For now, we mock the payment link flow.
    const mockBillId = 1; // Assuming a bill was created
    try {
      const res = await fetch(`http://localhost:8080/api/payments/bill/${mockBillId}/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setPaymentLink(data.link);
    } catch (e) {
      console.error(e);
      alert('Checkout failed');
    }
  };

  if (paymentLink) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f3f4f6' }}>
        <Card sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <CreditCard size={48} color="#2563eb" style={{ margin: '0 auto 16px' }} />
          <Typography variant="h5" sx={{ mb: 2 }}>Order Placed!</Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Your wholesale order is ready. Please complete your payment securely.
          </Typography>
          <Button variant="contained" href={paymentLink} target="_blank" size="large" fullWidth>
            Pay ₹{cartTotal.toFixed(2)}
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f9fafb', minHeight: '100vh', p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Package color="#2563eb" size={32} />
          Wholesale Catalog
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton color="primary" onClick={() => setDrawerOpen(true)}>
            <Badge badgeContent={cart.reduce((sum, i) => sum + i.quantity, 0)} color="error">
              <ShoppingCart size={28} />
            </Badge>
          </IconButton>
          <IconButton onClick={() => {
            localStorage.removeItem(`b2b_token_${businessId}`);
            navigate(`/b2b/${businessId}/login`);
          }}>
            <LogOut size={28} />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {products.map(product => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>{product.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Part No: {product.partNumber}
              </Typography>
              <Box sx={{ mt: 'auto' }}>
                <Typography variant="h5" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                  ₹{product.price.toFixed(2)}
                </Typography>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => addToCart(product)}
                  disabled={product.quantity <= 0}
                >
                  {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 350, p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="h5" sx={{ mb: 3 }}>Shopping Cart</Typography>
          <List sx={{ flexGrow: 1, overflow: 'auto' }}>
            {cart.map(item => (
              <React.Fragment key={item.product.id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary={item.product.name}
                    secondary={`Qty: ${item.quantity} x ₹${item.product.price}`}
                  />
                  <Typography fontWeight="bold">
                    ₹{(item.quantity * item.product.price).toFixed(2)}
                  </Typography>
                  <Button size="small" color="error" onClick={() => removeFromCart(item.product.id)} sx={{ ml: 1, minWidth: 'auto', p: 0.5 }}>
                    X
                  </Button>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <span>Total:</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </Typography>
            <Button 
              variant="contained" 
              fullWidth 
              size="large"
              disabled={cart.length === 0}
              onClick={handleCheckout}
            >
              Checkout
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
