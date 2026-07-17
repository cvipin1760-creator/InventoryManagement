import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, TextField, Box, CircularProgress,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { api } from '../api/client';

const FeatureLockedModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [moduleCode, setModuleCode] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleLocked = (e: Event) => {
      const custom = e as CustomEvent<{ moduleCode: string; message: string }>;
      setModuleCode(custom.detail.moduleCode);
      setOpen(true);
      setSuccess(false);
      setReason('');
    };
    window.addEventListener('feature-locked', handleLocked);
    return () => window.removeEventListener('feature-locked', handleLocked);
  }, []);

  const handleRequest = async () => {
    setSubmitting(true);
    try {
      await api.post<void>('/feature-requests', {
        featureCode: moduleCode,
        reason,
        priority: 'HIGH',
      });
      setSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: 'error.light',
            color: 'error.main',
          }}
        >
          <LockIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700}>Feature Locked</Typography>
          <Typography variant="caption" color="text.secondary">{moduleCode}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {success ? (
          <Box textAlign="center" py={2}>
            <Typography variant="h6" color="success.main" fontWeight={700} mb={1}>
              ✓ Request Submitted!
            </Typography>
            <Typography color="text.secondary">
              Your Super Admin will review and approve your access shortly. You'll get a notification once it's approved.
            </Typography>
          </Box>
        ) : (
          <>
            <Typography mb={2}>
              The <strong>{moduleCode}</strong> module is not activated for your business. Request access from your Super Admin to start a free trial or upgrade your subscription.
            </Typography>
            <TextField
              label="Why do you need this feature?"
              fullWidth
              multiline
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. We need EMI support for customer financing..."
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => setOpen(false)}>Close</Button>
        {!success && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleRequest}
            disabled={submitting || !reason.trim()}
            sx={{ minWidth: 130, fontWeight: 600 }}
          >
            {submitting ? <CircularProgress size={20} /> : 'Request Access'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FeatureLockedModal;
