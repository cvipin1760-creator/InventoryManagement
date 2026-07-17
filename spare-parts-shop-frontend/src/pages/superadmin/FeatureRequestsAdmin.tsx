import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableHead, TableRow,
  Button, Chip, Tabs, Tab, CircularProgress, Alert, Badge
} from '@mui/material';
import { api } from '../../api/client';

interface FeatureRequest {
  id: number;
  business: { id: number; name: string };
  featureCode: string;
  reason: string;
  status: string;
  requestDate: string;
}

interface BusinessModule {
  id: number;
  business: { id: number; name: string };
  module: { code: string; name: string };
  status: string;
  trialEnd: string | null;
  activatedAt: string;
}

const FeatureRequestsAdmin: React.FC = () => {
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [modules, setModules] = useState<BusinessModule[]>([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [alert, setAlert] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [reqs, mods] = await Promise.all([
        api.get<FeatureRequest[]>('/feature-requests'),
        api.get<BusinessModule[]>('/modules/all-installed'),
      ]);
      setRequests(Array.isArray(reqs) ? reqs : []);
      setModules(Array.isArray(mods) ? mods : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number, trialDays: number) => {
    setActionLoading(id);
    try {
      await api.post<void>(`/feature-requests/${id}/approve?trialDays=${trialDays}`, {});
      setAlert(`Request #${id} approved${trialDays > 0 ? ` with ${trialDays}-day trial` : ' with full access'}!`);
      fetchAll();
    } catch (e: any) {
      setAlert(`Error: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(id);
    try {
      await api.post<void>(`/feature-requests/${id}/reject`, {});
      setAlert(`Request #${id} rejected.`);
      fetchAll();
    } catch (e: any) {
      setAlert(`Error: ${e.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={800} mb={0.5}>
          Feature Requests & Module Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve business module requests, manage installed modules.
        </Typography>
      </Box>

      {alert && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={() => setAlert('')}>
          {alert}
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label={
          <Badge badgeContent={pendingCount} color="error" sx={{ pr: pendingCount > 0 ? 2 : 0 }}>
            Feature Requests
          </Badge>
        } />
        <Tab label="Installed Modules" />
      </Tabs>

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : tab === 0 ? (
        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Business</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Module</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No feature requests yet.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id} hover>
                    <TableCell>{req.business?.name || '—'}</TableCell>
                    <TableCell>
                      <Chip label={req.featureCode} color="primary" size="small" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.reason || '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={req.status}
                        color={req.status === 'PENDING' ? 'warning' : req.status === 'APPROVED' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{req.requestDate ? new Date(req.requestDate).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>
                      {req.status === 'PENDING' && (
                        <Box display="flex" gap={1}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            disabled={actionLoading === req.id}
                            onClick={() => handleApprove(req.id, 14)}
                            sx={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}
                          >
                            {actionLoading === req.id ? <CircularProgress size={14} /> : '14-Day Trial'}
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            disabled={actionLoading === req.id}
                            onClick={() => handleApprove(req.id, 0)}
                            sx={{ fontSize: '0.7rem' }}
                          >
                            Full Access
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={actionLoading === req.id}
                            onClick={() => handleReject(req.id)}
                            sx={{ fontSize: '0.7rem' }}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Business</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Module</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Trial End</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Activated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {modules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No modules installed.
                  </TableCell>
                </TableRow>
              ) : (
                modules.map((mod) => (
                  <TableRow key={mod.id} hover>
                    <TableCell>{mod.business?.name || '—'}</TableCell>
                    <TableCell>
                      <Chip label={mod.module?.name || mod.module?.code} color="primary" size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={mod.status}
                        color={mod.status === 'ACTIVE' ? 'success' : mod.status === 'TRIAL' ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{mod.trialEnd ? new Date(mod.trialEnd).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>{mod.activatedAt ? new Date(mod.activatedAt).toLocaleDateString() : '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </Box>
  );
};

export default FeatureRequestsAdmin;
