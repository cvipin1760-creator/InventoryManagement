import { Box, Typography, Card, CardContent, Grid, Button, TextField, InputAdornment, useTheme, CircularProgress } from '@mui/material';
import { Search, ShoppingBag } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useState } from 'react';

const CustomerProducts = () => {
  const theme = useTheme();
  const [search, setSearch] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['customer-products'],
    queryFn: api.getCustomerProducts
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.partNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            My Products
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse and reorder products you've purchased previously.
          </Typography>
        </Box>
        <TextField
          placeholder="Search products..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }
          }}
          sx={{ bgcolor: theme.palette.background.paper, borderRadius: 2 }}
        />
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredProducts.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', p: 5 }}>
          No products found.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>

            <Card sx={{ 
              borderRadius: 3, 
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  width: '100%', 
                  height: 140, 
                  bgcolor: theme.palette.mode === 'light' ? '#f1f5f9' : '#1e293b', 
                  borderRadius: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <ShoppingBag sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  PART: {item.partNumber}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {item.name}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                    ₹{item.price}
                  </Typography>
                  <Button variant="contained" size="small" sx={{ borderRadius: 2 }}>
                    Reorder
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      )}
    </Box>
  );
};

export default CustomerProducts;
