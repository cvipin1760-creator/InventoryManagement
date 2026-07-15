import { useState, useEffect } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel, IconButton, Tooltip,
  Grid, Card, CardContent, Checkbox, FormControlLabel, Divider
} from '@mui/material'
import { Add, Edit, Delete, LockReset, Block, CheckCircle, Store, Restaurant, LocalHospital } from '@mui/icons-material'
import apiClient from '../api'

interface AdminUser {
  id: number
  username: string
  email: string
  role: string
  enabled: boolean
  business?: any
  createdAt: string
}

interface Template {
  id: number
  name: string
  description: string
  businessType: string
  billingType: string
  modulesJson: string
  permissionsJson: string
  invoiceTemplate: string
  dashboardJson: string
  themeJson: string
}

const ALL_MODULES = [
  { key: 'inventory', label: 'Inventory Management', premium: false },
  { key: 'billing', label: 'Billing & Invoicing', premium: false },
  { key: 'emi', label: 'EMI / Installments', premium: true },
  { key: 'warranty', label: 'Warranty Tracking', premium: true },
  { key: 'kitchenDisplay', label: 'Kitchen Display System (KDS)', premium: true },
  { key: 'marketing', label: 'Marketing (WhatsApp/SMS)', premium: true },
  { key: 'aiReports', label: 'AI Analytics', premium: true },
  { key: 'loyalty', label: 'Customer Loyalty', premium: true }
]

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null)
  
  const [formData, setFormData] = useState({
    businessName: '', ownerName: '', email: '', phone: '',
    gstNumber: '', address: '', password: '', subscriptionPlan: 'TRIAL'
  })

  // Configuration State
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [config, setConfig] = useState({
    businessType: 'Retail',
    billingType: 'GST Billing',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    financialYear: 'April-March',
    modules: [] as {key: string, enabled: boolean}[]
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const resAdmins = await apiClient.get('/auth/users')
      setAdmins(resAdmins.data.filter((u: any) => u.role === 'ADMIN' || u.role === 'SUPER_MANAGER'))
      
      const resTemplates = await apiClient.get('/super-admin/templates')
      setTemplates(resTemplates.data)
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleTemplateSelect = (templateName: string) => {
    setSelectedTemplate(templateName)
    const t = templates.find(x => x.name === templateName)
    if (t) {
      setConfig({
        ...config,
        businessType: t.businessType || 'Retail',
        billingType: t.billingType || 'GST Billing',
        modules: t.modulesJson ? JSON.parse(t.modulesJson) : []
      })
    }
  }

  const handleModuleToggle = (moduleKey: string) => {
    const currentModules = [...config.modules]
    const idx = currentModules.findIndex(m => m.key === moduleKey)
    if (idx >= 0) {
      currentModules[idx].enabled = !currentModules[idx].enabled
    } else {
      currentModules.push({ key: moduleKey, enabled: true })
    }
    setConfig({ ...config, modules: currentModules })
  }

  const isModuleEnabled = (key: string) => {
    return config.modules.find(m => m.key === key)?.enabled || false
  }

  const handleSubmit = async () => {
    try {
      setError('')
      if (editingAdmin) {
        // Just updating core user details (for now)
        await apiClient.put(`/auth/users/${editingAdmin.id}`, formData)
      } else {
        await apiClient.post('/super-admin/admins', {
          username: formData.ownerName,
          email: formData.email,
          password: formData.password,
          role: 'ADMIN',
          enabled: true,
          businessName: formData.businessName,
          gstNumber: formData.gstNumber,
          address: formData.address,
          contactNumber: formData.phone,
          subscriptionPlan: formData.subscriptionPlan,
          // Configuration Fields
          businessType: config.businessType,
          billingType: config.billingType,
          currency: config.currency,
          timezone: config.timezone,
          financialYear: config.financialYear,
          modulesJson: JSON.stringify(config.modules)
        })
      }
      setOpenDialog(false)
      loadData()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save admin')
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    await apiClient.put(`/auth/users/${id}/status?enabled=${!currentStatus}`)
    loadData()
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Admin Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => {
          setEditingAdmin(null)
          setOpenDialog(true)
        }}>Create Admin</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Business</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.id}</TableCell>
                  <TableCell><b>{admin.username}</b></TableCell>
                  <TableCell>{admin.role}</TableCell>
                  <TableCell>{admin.enabled ? 'Active' : 'Suspended'}</TableCell>
                  <TableCell>{admin.business?.businessName}</TableCell>
                  <TableCell>
                    {admin.role !== 'SUPER_MANAGER' && (
                      <IconButton onClick={() => handleToggleStatus(admin.id, admin.enabled)}>
                        {admin.enabled ? <Block color="error" /> : <CheckCircle color="success" />}
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingAdmin ? 'Edit Admin' : 'Business Configuration Wizard'}</DialogTitle>
        <DialogContent dividers>
          {!editingAdmin && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>1. Select Business Template</Typography>
              <Grid container spacing={2}>
                {templates.map(t => (
                  <Grid item xs={12} sm={4} key={t.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer', 
                        border: selectedTemplate === t.name ? '2px solid #1976d2' : '1px solid #ccc',
                        bgcolor: selectedTemplate === t.name ? '#e3f2fd' : 'white'
                      }}
                      onClick={() => handleTemplateSelect(t.name)}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold">{t.name}</Typography>
                        <Typography variant="body2" color="textSecondary">{t.description}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>2. Core Details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Owner Username" fullWidth value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email" fullWidth value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </Grid>
            {!editingAdmin && (
              <Grid item xs={12} sm={6}>
                <TextField label="Password" type="password" fullWidth value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </Grid>
            )}
            {!editingAdmin && (
              <Grid item xs={12} sm={6}>
                <TextField label="Business Name" fullWidth value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} />
              </Grid>
            )}
            {!editingAdmin && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Billing Type</InputLabel>
                  <Select value={config.billingType} label="Billing Type" onChange={(e) => setConfig({...config, billingType: e.target.value})}>
                    <MenuItem value="GST Billing">GST Billing</MenuItem>
                    <MenuItem value="POS Billing">POS Billing</MenuItem>
                    <MenuItem value="Service Billing">Service Billing</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>

          {!editingAdmin && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>3. Module Marketplace</Typography>
              <Grid container spacing={2}>
                {ALL_MODULES.map(mod => (
                  <Grid item xs={12} sm={6} md={4} key={mod.key}>
                    <Card variant="outlined">
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                        <FormControlLabel
                          control={<Checkbox checked={isModuleEnabled(mod.key)} onChange={() => handleModuleToggle(mod.key)} />}
                          label={
                            <Box>
                              <Typography variant="body2">{mod.label}</Typography>
                              {mod.premium && <Typography variant="caption" color="primary">Premium</Typography>}
                            </Box>
                          }
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editingAdmin ? 'Update' : 'Launch Business'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
