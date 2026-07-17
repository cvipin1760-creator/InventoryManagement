import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, CardActions, Button, Grid, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert,
  CircularProgress, Skeleton
} from '@mui/material';
import { api } from '../api/client';

interface ModuleDefinition {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  monthlyPrice: number;
  isCore: boolean;
}

interface InstalledModule {
  module: { code: string };
  status: string;
}

const AppStore: React.FC = () => {
  const [modules, setModules] = useState<ModuleDefinition[]>([]);
  const [installed, setInstalled] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<ModuleDefinition | null>(null);
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [mods, inst] = await Promise.all([
        api.get<ModuleDefinition[]>('/modules/available'),
        api.get<InstalledModule[]>('/modules/installed'),
      ]);
      setModules(Array.isArray(mods) ? mods : []);
      setInstalled(Array.isArray(inst) ? inst.map((m) => m.module?.code || '') : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async () => {
    if (!selectedModule) return;
    setSubmitting(true);
    try {
      await api.post<void>('/feature-requests', {
        featureCode: selectedModule.code,
        reason,
        priority: 'MEDIUM',
      });
      setSuccess(`Request for "${selectedModule.name}" submitted! Super Admin will review it.`);
      setSelectedModule(null);
      setReason('');
      fetchAll();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const categoryColors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
    CORE: 'success',
    SALES: 'primary',
    OPERATIONS: 'info',
    ANALYTICS: 'warning',
    INTEGRATIONS: 'secondary',
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={800} mb={0.5}
          sx={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Module Marketplace
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Install and manage Enterprise Modules for your business. Unlock powerful features with one click.
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
              </Grid>
            ))
          : modules.map((mod) => {
              const isInstalled = installed.includes(mod.code) || mod.isCore;
              return (
                <Grid item xs={12} sm={6} md={4} key={mod.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      border: isInstalled ? '2px solid' : '1px solid',
                      borderColor: isInstalled ? 'success.main' : 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': { transform: 'translateY(-6px)', boxShadow: 8 },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                        <Typography variant="h6" fontWeight={700}>{mod.name}</Typography>
                        <Chip
                          label={mod.category}
                          size="small"
                          color={categoryColors[mod.category] || 'default'}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={2} sx={{ minHeight: 48 }}>
                        {mod.description}
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color={mod.monthlyPrice > 0 ? 'primary' : 'success.main'}>
                        {mod.monthlyPrice > 0 ? `$${mod.monthlyPrice}/mo` : 'Free'}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      {isInstalled ? (
                        <Button variant="contained" color="success" fullWidth disabled>
                          ✓ Installed
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={() => { setSelectedModule(mod); setReason(''); }}
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        >
                          Request Trial
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
      </Grid>

      <Dialog open={!!selectedModule} onClose={() => setSelectedModule(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Request Access — {selectedModule?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            This module costs <strong>${selectedModule?.monthlyPrice}/month</strong> after trial.
            Describe your use case so the Super Admin can approve quickly.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Why do you need this module?"
            fullWidth
            multiline
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. We need EMI support for our electronics store..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSelectedModule(null)} disabled={submitting}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRequest}
            disabled={submitting || !reason.trim()}
            sx={{ minWidth: 140, fontWeight: 600 }}
          >
            {submitting ? <CircularProgress size={20} /> : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppStore;
