import React, { useState } from 'react';
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
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import { Edit, Delete, Add, Refresh } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface Business {
  id: number;
  businessName: string;
  gstNumber?: string;
  address?: string;
  contactNumber?: string;
  email?: string;
  businessType?: string;
  createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const BusinessManagement: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [formData, setFormData] = useState({
    businessName: '',
    gstNumber: '',
    address: '',
    contactNumber: '',
    email: '',
    businessType: '',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const queryClient = useQueryClient();

  // Fetch businesses
  const { data: businesses = [], isLoading, refetch } = useQuery<Business[]>({
    queryKey: ['businesses'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/super-manager/businesses`);
      if (!res.ok) throw new Error('Failed to fetch businesses');
      return res.json() as Business[];
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`${API_BASE}/super-manager/businesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create business');
      return res.json();
    },
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Business created successfully', severity: 'success' });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      handleCloseDialog();
    },
    onError: (err) => {
      setSnackbar({ open: true, message: (err as Error).message, severity: 'error' });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const res = await fetch(`${API_BASE}/super-manager/businesses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update business');
      return res.json();
    },
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Business updated successfully', severity: 'success' });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      handleCloseDialog();
    },
    onError: (err) => {
      setSnackbar({ open: true, message: (err as Error).message, severity: 'error' });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_BASE}/super-manager/businesses/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete business');
      return res.json();
    },
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Business deleted successfully', severity: 'success' });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
    onError: (err) => {
      setSnackbar({ open: true, message: (err as Error).message, severity: 'error' });
    },
  });

  const handleOpenDialog = (business?: Business) => {
    if (business) {
      setEditingBusiness(business);
      setFormData({
        businessName: business.businessName,
        gstNumber: business.gstNumber || '',
        address: business.address || '',
        contactNumber: business.contactNumber || '',
        email: business.email || '',
        businessType: business.businessType || '',
      });
    } else {
      setEditingBusiness(null);
      setFormData({
        businessName: '',
        gstNumber: '',
        address: '',
        contactNumber: '',
        email: '',
        businessType: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBusiness(null);
    setFormData({
      businessName: '',
      gstNumber: '',
      address: '',
      contactNumber: '',
      email: '',
      businessType: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBusiness) {
      updateMutation.mutate({ id: editingBusiness.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Business Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={() => refetch()}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
            Add Business
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Business Name</TableCell>
              <TableCell>GST Number</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Business Type</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : businesses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No businesses found
                </TableCell>
              </TableRow>
            ) : (
              businesses.map((business) => (
                <TableRow key={business.id}>
                  <TableCell>{business.id}</TableCell>
                  <TableCell>{business.businessName}</TableCell>
                  <TableCell>{business.gstNumber || '-'}</TableCell>
                  <TableCell>{business.contactNumber || '-'}</TableCell>
                  <TableCell>{business.email || '-'}</TableCell>
                  <TableCell>{business.businessType || '-'}</TableCell>
                  <TableCell>
                    {new Date(business.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpenDialog(business)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => deleteMutation.mutate(business.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for Create/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBusiness ? 'Edit Business' : 'Add Business'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Business Name"
                required
                fullWidth
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              />
              <TextField
                label="GST Number"
                fullWidth
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              />
              <TextField
                label="Address"
                fullWidth
                multiline
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <TextField
                label="Contact Number"
                fullWidth
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              />
              <TextField
                label="Email"
                fullWidth
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <TextField
                label="Business Type"
                fullWidth
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingBusiness ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BusinessManagement;
