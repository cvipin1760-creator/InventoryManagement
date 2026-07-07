import { useEffect, useState } from 'react';
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
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { api } from '../api/client';

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
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    enabled: true,
    permissions: {} as Record<string, boolean>,
  });

  const load = () => {
    setLoading(true);
    api.getUsers()
      .then(setUsers)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpen = (user?: any) => {
    if (user) {
      setEditing(user.id);
      setForm({
        username: user.username,
        email: user.email || '',
        password: '',
        role: user.role,
        enabled: user.enabled,
        permissions: user.permissions || {},
      });
    } else {
      setEditing(null);
      setForm({
        username: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        enabled: true,
        permissions: {},
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await api.updateStaff(editing, form);
      } else {
        await api.createStaff(form);
      }
      await load();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (username === 'admin') {
      alert('Cannot delete the main admin account');
      return;
    }
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.deleteUser(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          User & Staff Management
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Add Staff
        </Button>
      </Box>

      {error && (
        <Box sx={{ color: 'error.main', mb: 2 }}>
          {error}
        </Box>
      )}

      {loading ? (
        <Typography>Loading users...</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {users.map((u) => (
            <Card key={u.id} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {u.username}
                    {u.username === 'admin' && (
                      <span style={{ marginLeft: '0.5rem', backgroundColor: 'primary.main', color: 'white', padding: '0.125rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem' }}>
                        Owner
                      </span>
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {u.email || 'No email'} · {u.role} · {u.enabled ? 'Active' : 'Disabled'}
                  </Typography>
                  {u.permissions && Object.keys(u.permissions).length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {defaultPermissions
                        .filter((p) => u.permissions[p.key])
                        .map((p) => (
                          <span
                            key={p.key}
                            style={{
                              backgroundColor: 'primary.light',
                              color: 'primary.main',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '0.5rem',
                              fontSize: '0.75rem',
                            }}
                          >
                            {p.label}
                          </span>
                        ))}
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {u.username !== 'admin' && (
                    <>
                      <IconButton onClick={() => handleOpen(u)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(u.id, u.username)} sx={{ color: 'error.main' }}>
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
          {users.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography>No users found. Add your first staff member!</Typography>
            </Box>
          )}
        </Box>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                <MenuItem value="EMPLOYEE">Employee</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 600 }}>
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
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.enabled}
                    onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                  />
                }
                label="Account Enabled"
              />
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
