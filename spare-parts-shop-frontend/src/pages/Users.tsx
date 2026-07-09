import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  IconButton,
  Grid,
  Avatar,
  Chip,
  Menu,
  InputAdornment,
  Snackbar,
  Alert
} from '@mui/material';
import { Add, Edit, Delete, Search, MoreVert, Block, CheckCircle } from '@mui/icons-material';
import { api } from '../api/client';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser } from '../store/slices/authSlice';

const defaultPermissions = [
  { key: 'products', label: 'Products' },
  { key: 'customers', label: 'Customers' },
  { key: 'bills', label: 'Billing' },
  { key: 'purchases', label: 'Purchases' },
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'payments', label: 'Payments' },
  { key: 'reports', label: 'Reports' },
];

export default function Users() {
  const currentUser = useAppSelector(selectCurrentUser);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals & Menus
  const [open, setOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuUser, setActiveMenuUser] = useState<any>(null);

  // Notifications
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'STAFF',
    enabled: true,
    permissions: {} as Record<string, boolean>,
  });

  const load = () => {
    setLoading(true);
    api.getUsers()
      .then(setUsers)
      .catch((e) => showToast(e instanceof Error ? e.message : String(e), 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const showToast = (message: string, severity: 'success' | 'error' = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleOpen = (user?: any) => {
    if (user) {
      setEditing(user.id);
      setForm({
        username: user.username,
        email: user.email || '',
        password: '',
        role: user.role === 'EMPLOYEE' ? 'STAFF' : user.role,
        enabled: user.enabled,
        permissions: user.permissions || {},
      });
    } else {
      setEditing(null);
      setForm({
        username: '',
        email: '',
        password: '',
        role: 'STAFF',
        enabled: true,
        permissions: {},
      });
    }
    setOpen(true);
    handleMenuClose();
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await api.updateStaff(editing, form);
        showToast('User updated successfully', 'success');
      } else {
        await api.createStaff(form);
        showToast('User created successfully', 'success');
      }
      await load();
      handleClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save user', 'error');
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, user: any) => {
    setAnchorEl(event.currentTarget);
    setActiveMenuUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenuUser(null);
  };

  const confirmDelete = (user: any) => {
    if (user.username === 'admin' || user.username === 'superadmin') {
      showToast('Cannot delete system owner account', 'error');
      handleMenuClose();
      return;
    }
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.deleteUser(userToDelete.id);
      showToast('User deleted successfully', 'success');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete user', 'error');
    } finally {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const toggleUserStatus = async (user: any) => {
    try {
      await api.updateUserStatus(user.id, !user.enabled);
      showToast(`User ${user.enabled ? 'disabled' : 'enabled'} successfully`, 'success');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
    }
    handleMenuClose();
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) || 
                          (u.email && u.email.toLowerCase().includes(search.toLowerCase()));
      const matchRole = roleFilter === 'ALL' || (roleFilter === 'STAFF' && (u.role === 'STAFF' || u.role === 'EMPLOYEE')) || u.role === roleFilter;
      const matchStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' && u.enabled) || (statusFilter === 'INACTIVE' && !u.enabled);
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Staff Management
        </Typography>
        {currentUser?.role !== 'EMPLOYEE' && (
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ borderRadius: 2, px: 3 }}>
            Add Staff
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, p: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)}>
                <MenuItem value="ALL">All Roles</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="STAFF">Staff</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* User Grid */}
      {loading ? (
        <Typography>Loading users...</Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredUsers.map((u) => (
            <Grid item xs={12} sm={6} md={4} key={u.id}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 50, height: 50 }}>
                        {u.username.substring(0, 1).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                          {u.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {u.email || 'No email provided'}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={(e) => handleMenuClick(e, u)}>
                      <MoreVert />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
                    <Chip 
                      label={u.role === 'EMPLOYEE' ? 'STAFF' : u.role} 
                      size="small" 
                      color={u.role === 'ADMIN' ? 'secondary' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip 
                      label={u.enabled ? 'Active' : 'Inactive'} 
                      size="small" 
                      color={u.enabled ? 'success' : 'error'}
                      variant={u.enabled ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {filteredUsers.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 3 }}>
                <Typography variant="h6" color="text.secondary">No users found matching your criteria.</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ elevation: 3, sx: { minWidth: 150, borderRadius: 2 } }}
      >
        <MenuItem onClick={() => handleOpen(activeMenuUser)}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>
        {activeMenuUser && (
          <MenuItem onClick={() => toggleUserStatus(activeMenuUser)}>
            {activeMenuUser.enabled ? <Block fontSize="small" sx={{ mr: 1, color: 'warning.main' }} /> : <CheckCircle fontSize="small" sx={{ mr: 1, color: 'success.main' }} />} 
            {activeMenuUser.enabled ? 'Disable' : 'Enable'}
          </MenuItem>
        )}
        <MenuItem onClick={() => confirmDelete(activeMenuUser)} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Modal */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Staff Member' : 'Add New Staff'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
            />
            {!editing && (
              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                fullWidth
                required
              />
            )}
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={form.role}
                label="Role"
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <MenuItem value="STAFF">Staff</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Permissions
            </Typography>
            <FormGroup row>
              {defaultPermissions.map((p) => (
                <FormControlLabel
                  key={p.key}
                  control={
                    <Checkbox
                      checked={!!form.permissions[p.key]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          permissions: { ...form.permissions, [p.key]: e.target.checked },
                        })
                      }
                    />
                  }
                  label={p.label}
                  sx={{ flex: '0 0 50%' }}
                />
              ))}
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ borderRadius: 2 }}>
            {editing ? 'Save Changes' : 'Create Staff'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{userToDelete?.username}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" sx={{ borderRadius: 2 }}>
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
