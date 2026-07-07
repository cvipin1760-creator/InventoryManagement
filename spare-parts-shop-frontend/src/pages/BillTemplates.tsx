import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { api } from '../api/client';

const BillTemplates = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    header: '',
    footer: '',
    isDefault: false,
  });

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await api.getBillTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleOpen = (template?: any) => {
    if (template) {
      setEditing(template.id);
      setForm({
        name: template.name,
        header: template.header || '',
        footer: template.footer || '',
        isDefault: template.isDefault || false,
      });
    } else {
      setEditing(null);
      setForm({
        name: '',
        header: '',
        footer: '',
        isDefault: false,
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
        await api.updateBillTemplate(editing, form);
      } else {
        await api.createBillTemplate(form);
      }
      await loadTemplates();
      handleClose();
    } catch (err) {
      console.error('Failed to save template:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await api.deleteBillTemplate(id);
      await loadTemplates();
    } catch (err) {
      console.error('Failed to delete template:', err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Bill Templates
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Create Template
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading templates...</Typography>
      ) : templates.length === 0 ? (
        <Typography>No templates found. Create your first one!</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {templates.map((template) => (
            <Card key={template.id} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {template.name}
                    {template.isDefault && (
                      <span style={{ marginLeft: '0.5rem', backgroundColor: 'primary.main', color: 'white', padding: '0.125rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem' }}>
                        Default
                      </span>
                    )}
                  </Typography>
                  {template.header && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Header: {template.header.substring(0, 50)}
                      {template.header.length > 50 ? '...' : ''}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton onClick={() => handleOpen(template)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(template.id)} sx={{ color: 'error.main' }}>
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit Template' : 'Create Template'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Template Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Header Text"
              value={form.header}
              onChange={(e) => setForm({ ...form, header: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label="Footer Text"
              value={form.footer}
              onChange={(e) => setForm({ ...form, footer: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="default"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                style={{ marginRight: '0.5rem' }}
              />
              <label htmlFor="default">Set as default template</label>
            </Box>
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
};

export default BillTemplates;
