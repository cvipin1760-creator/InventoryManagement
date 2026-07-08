import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add, Refresh, Check, Close } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api';
import { format } from 'date-fns';

interface Branch {
  id: number;
  name: string;
}

interface Product {
  id: number;
  productName: string;
  quantity: number;
}

interface StockTransfer {
  id: number;
  sourceBranch: Branch;
  destinationBranch: Branch;
  product: Product;
  quantity: number;
  status: string;
  transferDate: string;
  notes: string;
}

const StockTransfers: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    sourceBranchId: '',
    destinationBranchId: '',
    productId: '',
    quantity: '',
    notes: '',
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'info' });

  const queryClient = useQueryClient();

  const { data: transfers = [], isLoading, refetch } = useQuery({
    queryKey: ['stock-transfers'],
    queryFn: async (): Promise<StockTransfer[]> => {
      const res = await apiClient.get('/stock-transfers');
      return res.data;
    },
  });

  const { data: branches = [] } = useQuery({
    queryKey: ['branches'],
    queryFn: async (): Promise<Branch[]> => {
      const res = await apiClient.get('/branches');
      return res.data;
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const res = await apiClient.get('/products');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiClient.post('/stock-transfers', {
        ...data,
        quantity: parseInt(data.quantity),
      });
      return res.data;
    },
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Transfer created successfully', severity: 'success' });
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setOpenDialog(false);
      setFormData({ sourceBranchId: '', destinationBranchId: '', productId: '', quantity: '', notes: '' });
    },
    onError: (err: any) => {
      setSnackbar({ open: true, message: err.response?.data?.message || err.message, severity: 'error' });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiClient.put(`/stock-transfers/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Status updated', severity: 'success' });
      queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      setSnackbar({ open: true, message: err.response?.data?.message || err.message, severity: 'error' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Stock Transfers
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={() => refetch()}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
            New Transfer
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} align="center">Loading...</TableCell></TableRow>
            ) : transfers.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center">No transfers found</TableCell></TableRow>
            ) : (
              transfers.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>#{t.id}</TableCell>
                  <TableCell>{format(new Date(t.transferDate), 'dd MMM yyyy, HH:mm')}</TableCell>
                  <TableCell>{t.product.productName}</TableCell>
                  <TableCell>{t.sourceBranch.name}</TableCell>
                  <TableCell>{t.destinationBranch.name}</TableCell>
                  <TableCell>{t.quantity}</TableCell>
                  <TableCell>
                    <Chip label={t.status} color={getStatusColor(t.status) as any} size="small" />
                  </TableCell>
                  <TableCell>
                    {t.status === 'PENDING' && (
                      <>
                        <Tooltip title="Approve/Complete">
                          <IconButton size="small" color="success" onClick={() => statusMutation.mutate({ id: t.id, status: 'COMPLETED' })}>
                            <Check />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton size="small" color="error" onClick={() => statusMutation.mutate({ id: t.id, status: 'CANCELLED' })}>
                            <Close />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Stock Transfer</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                select
                label="Product"
                required
                fullWidth
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              >
                {products.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.productName} (Available: {p.quantity})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Source Branch"
                required
                fullWidth
                value={formData.sourceBranchId}
                onChange={(e) => setFormData({ ...formData, sourceBranchId: e.target.value })}
              >
                {branches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Destination Branch"
                required
                fullWidth
                value={formData.destinationBranchId}
                onChange={(e) => setFormData({ ...formData, destinationBranchId: e.target.value })}
              >
                {branches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Quantity"
                type="number"
                required
                fullWidth
                slotProps={{ htmlInput: { min: 1 } }}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
              <TextField
                label="Notes"
                multiline
                rows={3}
                fullWidth
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}>
              Create Transfer
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StockTransfers;
