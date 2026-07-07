import { Box, Typography, Card, CardContent, Switch, FormControlLabel, FormGroup, Chip, Button, useTheme, TextField, InputAdornment } from '@mui/material';
import { Shield, Lock, Unlock, Search, Save } from 'lucide-react';
import { useState } from 'react';

type Role = 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';
type Feature = 'products' | 'customers' | 'bills' | 'purchases' | 'suppliers' | 'payments' | 'reports' | 'users' | 'bill_templates' | 'analytics';

interface RolePermission {
  role: Role;
  features: { [key in Feature]: boolean };
}

const FeaturePermissions = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const [permissions, setPermissions] = useState<RolePermission[]>([
    {
      role: 'ADMIN',
      features: {
        products: true,
        customers: true,
        bills: true,
        purchases: true,
        suppliers: true,
        payments: true,
        reports: true,
        users: true,
        bill_templates: true,
        analytics: false
      }
    },
    {
      role: 'EMPLOYEE',
      features: {
        products: true,
        customers: true,
        bills: true,
        purchases: true,
        suppliers: false,
        payments: true,
        reports: true,
        users: false,
        bill_templates: false,
        analytics: false
      }
    },
    {
      role: 'CUSTOMER',
      features: {
        products: true,
        customers: false,
        bills: true,
        purchases: false,
        suppliers: false,
        payments: false,
        reports: false,
        users: false,
        bill_templates: false,
        analytics: false
      }
    }
  ]);

  const featureLabels: { [key in Feature]: string } = {
    products: 'Products Management',
    customers: 'Customers Management',
    bills: 'Bills Management',
    purchases: 'Purchases Management',
    suppliers: 'Suppliers Management',
    payments: 'Payments Management',
    reports: 'Reports Access',
    users: 'Users Management',
    bill_templates: 'Bill Templates',
    analytics: 'Analytics Access'
  };

  const filteredFeatures = (Object.keys(featureLabels) as Feature[]).filter(feature =>
    featureLabels[feature].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePermissionChange = (role: Role, feature: Feature, checked: boolean) => {
    setPermissions(prev =>
      prev.map(p =>
        p.role === role
          ? { ...p, features: { ...p.features, [feature]: checked } }
          : p
      )
    );
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'ADMIN': return theme.palette.primary.main;
      case 'EMPLOYEE': return theme.palette.info.main;
      case 'CUSTOMER': return theme.palette.success.main;
      default: return theme.palette.text.secondary;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Feature Permissions
        </Typography>
        <Button
          variant="contained"
          startIcon={<Save size={20} />}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Save Changes
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search features..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ borderRadius: 2 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* Permissions Grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {permissions.map((perm) => (
          <Box key={perm.role} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' } }}>
            <Card
              sx={{
                borderRadius: 3,
                height: '100%',
                borderTop: `4px solid ${getRoleColor(perm.role)}`
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: `${getRoleColor(perm.role)}20`,
                      color: getRoleColor(perm.role)
                    }}
                  >
                    <Shield size={24} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {perm.role}
                    </Typography>
                    <Chip
                      icon={filteredFeatures.filter(f => perm.features[f]).length === filteredFeatures.length ? <Unlock size={16} /> : <Lock size={16} />}
                      label={`${filteredFeatures.filter(f => perm.features[f]).length}/${filteredFeatures.length} features`}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
                <FormGroup sx={{ gap: 1 }}>
                  {filteredFeatures.map((feature) => (
                    <FormControlLabel
                      key={feature}
                      control={
                        <Switch
                          checked={perm.features[feature]}
                          onChange={(e) => handlePermissionChange(perm.role, feature, e.target.checked)}
                        />
                      }
                      label={featureLabels[feature]}
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: perm.features[feature] ? `${getRoleColor(perm.role)}10` : 'transparent'
                      }}
                    />
                  ))}
                </FormGroup>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default FeaturePermissions;
