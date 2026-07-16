import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { api } from '../api/client';

const FeatureLockedModal: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [moduleCode, setModuleCode] = useState('');
    const [reason, setReason] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const handleLocked = (e: any) => {
            setModuleCode(e.detail.moduleCode);
            setOpen(true);
            setSuccess(false);
            setReason('');
        };
        window.addEventListener('feature-locked', handleLocked);
        return () => window.removeEventListener('feature-locked', handleLocked);
    }, []);

    const handleRequest = async () => {
        try {
            await api.post('/api/feature-requests', {
                featureCode: moduleCode,
                reason,
                priority: 'HIGH'
            });
            setSuccess(true);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                <LockIcon /> Feature Locked
            </DialogTitle>
            <DialogContent>
                {success ? (
                    <Typography color="success.main" mt={2}>
                        Your request has been submitted successfully! The Super Admin will review it shortly.
                    </Typography>
                ) : (
                    <>
                        <Typography mb={2}>
                            You are trying to access the <strong>{moduleCode}</strong> module, which is currently locked for your business or your trial has expired.
                        </Typography>
                        <Typography variant="body2" color="textSecondary" mb={2}>
                            To use this feature, you can request access from your Super Admin to start a trial or upgrade your plan.
                        </Typography>
                        <TextField
                            label="Why do you need this feature?"
                            fullWidth
                            multiline
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)}>Close</Button>
                {!success && <Button variant="contained" color="primary" onClick={handleRequest}>Request Access</Button>}
            </DialogActions>
        </Dialog>
    );
};

export default FeatureLockedModal;

