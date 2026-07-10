import React, { useState } from 'react';
import { Box, Card, Typography, TextField, Button, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function B2bLogin() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8080/api/b2b/${businessId}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      
      const data = await res.json();
      localStorage.setItem(`b2b_token_${businessId}`, data.token);
      navigate(`/b2b/${businessId}/shop`);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f3f4f6' }}>
      <Card sx={{ p: 4, width: '100%', maxWidth: 400, boxShadow: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Shield size={48} color="#2563eb" />
          <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>B2B Wholesale Portal</Typography>
          <Typography color="text.secondary">Login to access your bulk pricing</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Phone Number"
            margin="normal"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </form>
      </Card>
    </Box>
  );
}
