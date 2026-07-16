import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CardActions, Button, Grid, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material';
import { api } from '../api/client';

export interface ModuleDefinition {
    id: number;
    code: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    dependencies: string;
    monthlyPrice: number;
    isCore: boolean;
}

const AppStore: React.FC = () => {
    const [modules, setModules] = useState<ModuleDefinition[]>([]);
    const [installed, setInstalled] = useState<string[]>([]);
    const [selectedModule, setSelectedModule] = useState<ModuleDefinition | null>(null);
    const [reason, setReason] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchModules();
        fetchInstalled();
    }, []);

    const fetchModules = async () => {
        try {
            const res: any = await api.get('/api/modules/available');
            setModules(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchInstalled = async () => {
        try {
            const res: any = await api.get('/api/modules/installed');
            setInstalled(res.data.map((m: any) => m.module.code));
        } catch (e) {
            console.error(e);
        }
    };

    const handleRequest = async () => {
        if (!selectedModule) return;
        try {
            await api.post('/api/feature-requests', {
                featureCode: selectedModule.code,
                reason,
                priority: 'MEDIUM'
            });
            setSuccess('Request submitted successfully! Auto-approval may trigger shortly.');
            setSelectedModule(null);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight="bold" mb={1} color="primary">Module Marketplace</Typography>
            <Typography variant="body1" mb={4} color="textSecondary">Browse and install Enterprise Modules for your business.</Typography>

            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            <Grid container spacing={3}>
                {modules.map(mod => (
                    <Grid item xs={12} sm={6} md={4} key={mod.id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6" fontWeight="bold">{mod.name}</Typography>
                                    <Chip label={mod.category} size="small" color="secondary" />
                                </Box>
                                <Typography variant="body2" color="textSecondary" mb={2}>{mod.description}</Typography>
                                <Typography variant="h6" color="primary">
                                    {mod.monthlyPrice > 0 ? '$' + mod.monthlyPrice + '/mo' : 'Free'}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                {installed.includes(mod.code) || mod.isCore ? (
                                    <Button variant="contained" color="success" fullWidth disabled>Installed</Button>
                                ) : (
                                    <Button variant="contained" color="primary" fullWidth onClick={() => setSelectedModule(mod)}>
                                        Request Trial
                                    </Button>
                                )}
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={!!selectedModule} onClose={() => setSelectedModule(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Request Access to {selectedModule?.name}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" mb={2}>
                        This module requires an enterprise subscription or an active trial.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Reason for Request / Business Use Case"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedModule(null)}>Cancel</Button>
                    <Button variant="contained" onClick={handleRequest}>Submit Request</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AppStore;


