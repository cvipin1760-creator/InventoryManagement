import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, TextField, Button, List, ListItem, ListItemText, Alert, IconButton, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ScanBarcode, ClipboardList } from 'lucide-react';
import { api } from '../api/client';
import type { Product, AuditTask } from '../types';

export default function Audit() {
  const [tasks, setTasks] = useState<AuditTask[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [selectedTask, setSelectedTask] = useState<AuditTask | null>(null);
  const [actualQty, setActualQty] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchTasks = async () => {
    try {
      const data = await api.get<AuditTask[]>('/audit-tasks');
      setTasks(data);
    } catch (e) {
      console.error(e);
      setError('Failed to fetch audit tasks');
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await api.get<Product[]>('/products');
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchProducts();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    try {
      setError('');
      await api.post('/audit-tasks', { productId: selectedProductId });
      setSelectedProductId('');
      fetchTasks();
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to create audit task');
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTask || !actualQty) return;
    try {
      setError('');
      await api.put(`/audit-tasks/${selectedTask.id}/complete`, { 
        actualQuantity: parseInt(actualQty) 
      });
      setActualQty('');
      setSelectedTask(null);
      fetchTasks();
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Failed to complete task');
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const completedTasks = tasks.filter(t => t.status !== 'PENDING');

  return (
    <Box sx={{ p: 2, maxWidth: 650, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
        <ClipboardList color="#2563eb" />
        Inventory Audit
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {!navigator.onLine && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You are offline. Audits will be synced automatically when connection is restored.
        </Alert>
      )}

      {selectedTask ? (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>{selectedTask.product.name}</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Part No: {selectedTask.product.partNumber}</Typography>
          
          <Box sx={{ bgcolor: '#f3f4f6', p: 2, borderRadius: 1, mb: 3 }}>
            <Typography variant="body2" color="text.secondary">Expected System Quantity</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
              {selectedTask.expectedQuantity}
            </Typography>
          </Box>

          <TextField
            fullWidth
            type="number"
            label="Actual Physical Quantity"
            value={actualQty}
            onChange={(e) => setActualQty(e.target.value)}
            sx={{ mb: 3 }}
            autoFocus
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" fullWidth onClick={() => setSelectedTask(null)}>Cancel</Button>
            <Button variant="contained" fullWidth onClick={handleCompleteTask} disabled={!actualQty}>Submit</Button>
          </Box>
        </Card>
      ) : (
        <>
          {/* Create Audit Task Form */}
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Start a New Audit Task</Typography>
            <Box component="form" onSubmit={handleCreateTask} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="product-select-label">Select Product</InputLabel>
                <Select
                  labelId="product-select-label"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  label="Select Product"
                  required
                >
                  {products.map(p => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name} ({p.partNumber})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button type="submit" variant="contained" disabled={!selectedProductId}>
                Create
              </Button>
            </Box>
          </Card>

          <Card sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Pending Audits ({pendingTasks.length})</Typography>
            <List>
              {pendingTasks.map(task => (
                <ListItem 
                  key={task.id} 
                  sx={{ border: '1px solid #e5e7eb', borderRadius: 1, mb: 1, cursor: 'pointer', '&:hover': { bgcolor: '#f9fafb' } }}
                  onClick={() => setSelectedTask(task)}
                >
                  <ListItemText 
                    primary={task.product.name} 
                    secondary={`Part: ${task.product.partNumber}`} 
                  />
                  <IconButton color="primary">
                    <ScanBarcode />
                  </IconButton>
                </ListItem>
              ))}
              {pendingTasks.length === 0 && (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No pending audits.
                </Typography>
              )}
            </List>
          </Card>

          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity</Typography>
            <List>
              {completedTasks.slice(0, 5).map(task => (
                <ListItem key={task.id} sx={{ px: 0 }}>
                  <ListItemText 
                    primary={task.product.name} 
                    secondary={`Expected: ${task.expectedQuantity} | Actual: ${task.actualQuantity}`} 
                  />
                  <Chip 
                    label={task.status} 
                    color={task.status === 'COMPLETED' ? 'success' : 'error'} 
                    size="small" 
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        </>
      )}
    </Box>
  );
}
