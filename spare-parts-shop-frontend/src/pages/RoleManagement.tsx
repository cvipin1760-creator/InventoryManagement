import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Divider,
  IconButton
} from '@mui/material';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

interface CustomRole {
  id: number;
  name: string;
  color?: string;
  icon?: string;
  permissionsJson?: string;
}

const MODULES = [
  'Dashboard', 'Billing', 'Customers', 'Products', 'Inventory', 
  'Purchase', 'Suppliers', 'Reports', 'Analytics', 'Warranty', 'EMI', 'Employees', 'Settings'
];

const PERMISSIONS_MATRIX = [
  'VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT'
];

export default function RoleManagement() {
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  
  const [name, setName] = useState('');
  const [color, setColor] = useState('#2563EB');
  const [icon, setIcon] = useState('Shield');
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_URL}/roles`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleOpen = (role?: CustomRole) => {
    if (role) {
      setEditingRole(role);
      setName(role.name);
      setColor(role.color || '#2563EB');
      setIcon(role.icon || 'Shield');
      try {
        setPermissions(role.permissionsJson ? JSON.parse(role.permissionsJson) : []);
      } catch (e) {
        setPermissions([]);
      }
    } else {
      setEditingRole(null);
      setName('');
      setColor('#2563EB');
      setIcon('Shield');
      setPermissions([]);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const togglePermission = (module: string, perm: string) => {
    const key = `${module.toUpperCase()}_${perm}`;
    if (permissions.includes(key)) {
      setPermissions(permissions.filter(p => p !== key));
    } else {
      setPermissions([...permissions, key]);
    }
  };

  const handleSave = async () => {
    const payload = {
      name,
      color,
      icon,
      permissionsJson: JSON.stringify(permissions)
    };

    try {
      if (editingRole) {
        await axios.put(`${API_URL}/roles/${editingRole.id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post(`${API_URL}/roles`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      handleClose();
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Failed to save role');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await axios.delete(`${API_URL}/roles/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Failed to delete role');
    }
  };

  const handleClone = async (role: CustomRole) => {
    try {
      const payload = {
        name: `${role.name} (Copy)`,
        color: role.color,
        icon: role.icon,
        permissionsJson: role.permissionsJson
      };
      await axios.post(`${API_URL}/roles`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchRoles();
    } catch (error) {
      console.error('Error cloning role:', error);
      alert('Failed to clone role');
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Role & Permission Management</Typography>
        <Button variant="contained" startIcon={<Plus />} onClick={() => handleOpen()}>
          Create Custom Role
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell><strong>Role Name</strong></TableCell>
              <TableCell><strong>Color</strong></TableCell>
              <TableCell><strong>Permissions Count</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: role.color || '#ccc' }} />
                </TableCell>
                <TableCell>
                  {role.permissionsJson ? JSON.parse(role.permissionsJson).length : 0}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleClone(role)} title="Clone">
                    <Copy size={18} />
                  </IconButton>
                  <IconButton color="primary" onClick={() => handleOpen(role)}>
                    <Edit size={18} />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(role.id)}>
                    <Trash2 size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {roles.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">No custom roles found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingRole ? 'Edit Role' : 'Create Custom Role'}</DialogTitle>
        <DialogContent dividers>
          <Box display="flex" gap={2} mb={3}>
            <TextField
              label="Role Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Color (Hex)"
              fullWidth
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </Box>
          <Typography variant="h6" mb={2}>Permission Matrix</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell><strong>Module</strong></TableCell>
                  {PERMISSIONS_MATRIX.map(p => (
                    <TableCell key={p} align="center"><strong>{p}</strong></TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {MODULES.map(module => (
                  <TableRow key={module}>
                    <TableCell><strong>{module}</strong></TableCell>
                    {PERMISSIONS_MATRIX.map(p => {
                      const key = `${module.toUpperCase()}_${p}`;
                      const checked = permissions.includes(key);
                      return (
                        <TableCell key={p} align="center">
                          <Checkbox
                            checked={checked}
                            onChange={() => togglePermission(module, p)}
                            size="small"
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!name}>Save Role</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
