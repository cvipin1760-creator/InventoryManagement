import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, TextField, List, ListItem, ListItemText, Chip } from '@mui/material';
import { queueApi, Counter, QueueEntry } from '../api/queueApi';
import { QueueWebSocketService } from '../api/queueWebSocketService';
import toast from 'react-hot-toast';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser } from '../store/slices/authSlice';

export default function QueueDashboard() {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [queues, setQueues] = useState<Record<number, QueueEntry[]>>({});
  const [newCounterName, setNewCounterName] = useState('');
  
  const user = useAppSelector(selectCurrentUser);

  const loadData = async () => {
    try {
      const res = await queueApi.getCounters();
      setCounters(res);
      
      const newQueues: Record<number, QueueEntry[]> = {};
      for (const counter of res) {
        const qRes = await queueApi.getQueue(counter.id);
        newQueues[counter.id] = qRes;
      }
      setQueues(newQueues);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load queue data');
    }
  };

  useEffect(() => {
    loadData();

    if (user?.businessId) {
      const ws = new QueueWebSocketService(user.businessId, (data) => {
        // Optimistic refresh on any WS event
        loadData();
      });
      ws.connect();
      return () => ws.disconnect();
    }
  }, [user]);

  const handleOpenCounter = async () => {
    if (!newCounterName) return;
    try {
      await queueApi.openCounter(newCounterName);
      setNewCounterName('');
      toast.success('Counter opened');
      loadData();
    } catch (e) {
      toast.error('Failed to open counter');
    }
  };

  const handleCloseCounter = async (id: number) => {
    try {
      await queueApi.closeCounter(id);
      toast.success('Counter closed');
      loadData();
    } catch (e) {
      toast.error('Failed to close counter');
    }
  };

  const handleServe = async (counterId: number, entryId: number) => {
    try {
      await queueApi.serveCustomer(counterId, entryId);
      toast.success('Now serving customer');
      loadData();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Live Queue Dashboard</Typography>
        <Box display="flex" gap={2}>
          <TextField 
            size="small" 
            label="Counter Name" 
            value={newCounterName}
            onChange={(e) => setNewCounterName(e.target.value)}
          />
          <Button variant="contained" onClick={handleOpenCounter}>Open New Counter</Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {counters.map(counter => (
          <Grid item xs={12} md={4} key={counter.id}>
            <Paper sx={{ p: 2, height: '100%', minHeight: 400 }}>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h6">{counter.name}</Typography>
                <Chip label={counter.status} color={counter.status === 'OPEN' ? 'success' : 'default'} size="small" />
              </Box>

              {counter.status === 'OPEN' && (
                <Button 
                  size="small" 
                  color="error" 
                  onClick={() => handleCloseCounter(counter.id)}
                  sx={{ mb: 2 }}
                >
                  Close Counter
                </Button>
              )}

              <Typography variant="subtitle2" color="primary" gutterBottom>
                Currently Serving: {counter.currentEntry ? `#${counter.currentEntry.tokenNumber} - ${counter.currentEntry.customerName}` : 'None'}
              </Typography>
              
              <Typography variant="subtitle2" mt={2}>Waiting Queue ({queues[counter.id]?.length || 0})</Typography>
              <List>
                {queues[counter.id]?.map(entry => (
                  <ListItem 
                    key={entry.id}
                    secondaryAction={
                      <Button size="small" variant="outlined" onClick={() => handleServe(counter.id, entry.id)}>
                        Serve
                      </Button>
                    }
                  >
                    <ListItemText 
                      primary={`#${entry.tokenNumber} - ${entry.customerName}`}
                      secondary={`Joined: ${new Date(entry.joinTime).toLocaleTimeString()}`}
                    />
                  </ListItem>
                ))}
                {(!queues[counter.id] || queues[counter.id].length === 0) && (
                  <Typography variant="body2" color="textSecondary">No customers waiting.</Typography>
                )}
              </List>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
