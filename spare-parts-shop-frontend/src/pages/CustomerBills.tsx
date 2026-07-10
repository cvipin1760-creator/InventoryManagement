import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Download, Visibility } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { format } from 'date-fns';

const CustomerBills = () => {
  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['customer-bills'],
    queryFn: api.getCustomerBills
  });



  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        My Bills
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        View and download your purchase history and invoices.
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Invoice #</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Total Amount</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ p: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (!bills || bills.length === 0) ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ p: 4 }}>
                  No bills found.
                </TableCell>
              </TableRow>
            ) : (
              (bills || []).map((bill) => (
                <TableRow key={bill.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{bill.invoiceNumber}</TableCell>
                  <TableCell>{format(new Date(bill.billDate), 'dd MMM yyyy')}</TableCell>
                  <TableCell>{bill.items.length} items</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>₹{bill.finalAmount}</TableCell>
                  <TableCell>
                    <Chip 
                      label={'Paid'} 
                      size="small" 
                      color={'success'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                <TableCell align="right">
                  <Tooltip title="View Details">
                    <IconButton size="small" color="primary">
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download PDF">
                    <IconButton size="small" color="secondary" onClick={() => api.getInvoicePdf(bill.id)}>
                      <Download />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CustomerBills;
