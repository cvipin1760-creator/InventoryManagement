import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button, CircularProgress, Chip } from '@mui/material';
import { approvalApi, ManagerApprovalRequest } from '../api/approvalApi';
import toast from 'react-hot-toast';

export default function ManagerApprovals() {
  const [approvals, setApprovals] = useState<ManagerApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const data = await approvalApi.getPendingApprovals();
      setApprovals(data);
    } catch (e) {
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await approvalApi.approve(id);
      toast.success('Approved');
      fetchApprovals();
    } catch (e) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await approvalApi.reject(id);
      toast.success('Rejected');
      fetchApprovals();
    } catch (e) {
      toast.error('Failed to reject');
    }
  };

  if (loading) return <Box p={3}><CircularProgress /></Box>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Manager Approvals</Typography>
      
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Requested At</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {approvals.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No pending approvals.</TableCell>
              </TableRow>
            )}
            {approvals.map(req => (
              <TableRow key={req.id}>
                <TableCell>{req.id}</TableCell>
                <TableCell><Chip label={req.type} color="warning" size="small" /></TableCell>
                <TableCell>{new Date(req.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <pre style={{ margin: 0, fontSize: '0.8rem' }}>
                    {JSON.stringify(req.payload, null, 2)}
                  </pre>
                </TableCell>
                <TableCell>{req.status}</TableCell>
                <TableCell align="right">
                  <Button size="small" variant="contained" color="success" onClick={() => handleApprove(req.id)} sx={{ mr: 1 }}>
                    Approve
                  </Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => handleReject(req.id)}>
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
