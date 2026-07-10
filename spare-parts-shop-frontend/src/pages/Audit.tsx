import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, TextField, Button, List, ListItem, ListItemText, Alert, IconButton, Chip } from '@mui/material';
import { ScanBarcode, CheckCircle, Search, ClipboardList } from 'lucide-react';
import { api } from '../api/client';
import type { Product, AuditTask } from '../types';

export default function Audit() {
  const [tasks, setTasks] = useState<AuditTask[]>([]);
  const [search, setSearch] = useState('');
  const [scanning, setScanning] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AuditTask | null>(null);
  const [actualQty, setActualQty] = useState<string>('');

  const fetchTasks = async () => {
    try {
      const data = await api.get<AuditTask[]>('/audit-tasks');
      setTasks(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (productId: number) => {
    try {
      await fetch('http://localhost:8080/api/audit-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ productId })
      });
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTask || !actualQty) return;
    try {
      await fetch(`http://localhost:8080/api/audit-tasks/${selectedTask.id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ actualQuantity: parseInt(actualQty) })
      });
      setActualQty('');
      setSelectedTask(null);
      fetchTasks();
    } catch (e) {
      console.error(e);
      // Let offlineSync handle it implicitly or show alert
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const completedTasks = tasks.filter(t => t.status !== 'PENDING');

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
        <ClipboardList color="#2563eb" />
        Inventory Audit
      </Typography>

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
