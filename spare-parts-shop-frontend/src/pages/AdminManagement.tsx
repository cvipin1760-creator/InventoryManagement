import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip
} from '@mui/material'
import { Add, Edit, Delete, LockReset, Block, CheckCircle } from '@mui/icons-material'
import apiClient from '../api'

interface AdminUser {
  id: number
  username: string
  email: string
  phone?: string
  role: string
  enabled: boolean
  business?: any
  createdAt: string
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null)
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    gstNumber: '',
    address: '',
    businessType: '',
    subscriptionPlan: 'TRIAL',
    password: ''
  })

  const businessTypes = ['Spare Parts Shop', 'Electronics Shop', 'Mobile Shop', 'Hardware Shop', 'Medical Store', 'Furniture Shop', 'Other']
  const subscriptionPlans = ['TRIAL', 'MONTHLY', 'YEARLY']

  const loadAdmins = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/auth/users')
      setAdmins(response.data.filter((u: any) => u.role === 'ADMIN' || u.role === 'SUPER_MANAGER'))
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load admins')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdmins()
  }, [])

  const handleSubmit = async () => {
    try {
      setError('')
      if (editingAdmin) {
        // Update admin logic
        await apiClient.put(`/auth/users/${editingAdmin.id}`, formData)
      } else {
        // Create admin logic with business onboarding
        await apiClient.post('/super-manager/admins', {
          username: formData.ownerName,
          email: formData.email,
          password: formData.password,
          role: 'ADMIN',
          enabled: true,
          businessName: formData.businessName,
          gstNumber: formData.gstNumber,
          address: formData.address,
          contactNumber: formData.phone,
          businessType: formData.businessType,
          subscriptionPlan: formData.subscriptionPlan
        })
      }
      setOpenDialog(false)
      setEditingAdmin(null)
      setFormData({
        businessName: '',
        ownerName: '',
        email: '',
        phone: '',
        gstNumber: '',
        address: '',
        businessType: '',
        subscriptionPlan: 'TRIAL',
        password: ''
      })
      loadAdmins()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save admin')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return
    try {
      setError('')
      await apiClient.delete(`/auth/users/${id}`)
      loadAdmins()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete admin')
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      setError('')
      await apiClient.put(`/auth/users/${id}/status?enabled=${!currentStatus}`)
      loadAdmins()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update status')
    }
  }

  const handleResetPassword = async (_id: number) => {
    const newPassword = window.prompt('Enter new password for this admin')
    if (!newPassword) return
    alert('Password reset functionality would be implemented here')
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Admin Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditingAdmin(null)
            setFormData({
              businessName: '',
              ownerName: '',
              email: '',
              phone: '',
              gstNumber: '',
              address: '',
              businessType: '',
              subscriptionPlan: 'TRIAL',
              password: ''
            })
            setOpenDialog(true)
          }}
        >
          Create Admin
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.id}</TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {admin.username}
                    </Typography>
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: admin.role === 'SUPER_MANAGER' ? 'primary.main' : 'secondary.main',
                        color: 'white',
                        display: 'inline-block',
                        fontWeight: 'bold'
                      }}
                    >
                      {admin.role}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: admin.enabled ? 'success.main' : 'error.main',
                        color: 'white',
                        display: 'inline-block',
                        fontWeight: 'bold'
                      }}
                    >
                      {admin.enabled ? 'Active' : 'Suspended'}
                    </Box>
                  </TableCell>
                  <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => {
                        setEditingAdmin(admin)
                        setOpenDialog(true)
                      }}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    {admin.role !== 'SUPER_MANAGER' && (
                      <>
                        <Tooltip title={admin.enabled ? 'Suspend' : 'Activate'}>
                          <IconButton onClick={() => handleToggleStatus(admin.id, admin.enabled)}>
                            {admin.enabled ? <Block /> : <CheckCircle />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reset Password">
                          <IconButton onClick={() => handleResetPassword(admin.id)}>
                            <LockReset />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDelete(admin.id)} color="error">
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {admins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="body1">No admins found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAdmin ? 'Edit Admin' : 'Create New Admin'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!editingAdmin && (
              <>
                <TextField
                  label="Business Name"
                  fullWidth
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  required
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
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                <FormControl fullWidth>
                  <InputLabel>Business Type</InputLabel>
                  <Select
                    value={formData.businessType}
                    label="Business Type"
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  >
                    {businessTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Subscription Plan</InputLabel>
                  <Select
                    value={formData.subscriptionPlan}
                    label="Subscription Plan"
                    onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                  >
                    {subscriptionPlans.map(plan => (
                      <MenuItem key={plan} value={plan}>{plan}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
            <TextField
              label="Owner Name / Username"
              fullWidth
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              required
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <TextField
              label="Phone Number"
              fullWidth
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            {!editingAdmin && (
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAdmin ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
