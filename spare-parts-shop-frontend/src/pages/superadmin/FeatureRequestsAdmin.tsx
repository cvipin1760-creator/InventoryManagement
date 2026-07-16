import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableHead, TableRow, Button, Chip } from '@mui/material';
import { api } from '../../api/client';

export interface FeatureRequest {
    id: number;
    business: { id: number; name: string };
    featureCode: string;
    reason: string;
    status: string;
    requestDate: string;
}

const FeatureRequestsAdmin: React.FC = () => {
    const [requests, setRequests] = useState<FeatureRequest[]>([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res: any = await api.get('/api/feature-requests');
            setRequests(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleApprove = async (id: number, trialDays: number) => {
        try {
            await api.post(`/api/feature-requests/${id}/approve?trialDays=${trialDays}`);
            fetchRequests();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight="bold" mb={3}>Feature Requests Admin</Typography>
            <Card>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Business</TableCell>
                            <TableCell>Module</TableCell>
                            <TableCell>Reason</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.map(req => (
                            <TableRow key={req.id}>
                                <TableCell>{req.business?.name}</TableCell>
                                <TableCell><Chip label={req.featureCode} color="primary" size="small" /></TableCell>
                                <TableCell>{req.reason}</TableCell>
                                <TableCell>
                                    <Chip label={req.status} color={req.status === 'PENDING' ? 'warning' : 'success'} size="small" />
                                </TableCell>
                                <TableCell>
                                    {req.status === 'PENDING' && (
                                        <>
                                            <Button size="small" variant="contained" color="success" sx={{ mr: 1 }} onClick={() => handleApprove(req.id, 14)}>
                                                Approve 14-Day Trial
                                            </Button>
                                            <Button size="small" variant="contained" color="primary" onClick={() => handleApprove(req.id, 0)}>
                                                Approve Full
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </Box>
    );
};

export default FeatureRequestsAdmin;


