import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import { selectIsAuthenticated, selectCurrentUser } from './store/slices/authSlice';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Role-Based Route component
const RoleBasedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const user = useAppSelector(selectCurrentUser);
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Super Admin Routes */}
        <Route path="admins" element={
          <RoleBasedRoute allowedRoles={['SUPER_ADMIN']}>
            <div>Admin Management</div>
          </RoleBasedRoute>
        } />
        <Route path="businesses" element={
          <RoleBasedRoute allowedRoles={['SUPER_ADMIN']}>
            <div>Business Management</div>
          </RoleBasedRoute>
        } />
        <Route path="subscriptions" element={
          <RoleBasedRoute allowedRoles={['SUPER_ADMIN']}>
            <div>Subscriptions</div>
          </RoleBasedRoute>
        } />
        <Route path="permissions" element={
          <RoleBasedRoute allowedRoles={['SUPER_ADMIN']}>
            <div>Feature Permissions</div>
          </RoleBasedRoute>
        } />
        <Route path="analytics" element={
          <RoleBasedRoute allowedRoles={['SUPER_ADMIN']}>
            <div>Analytics</div>
          </RoleBasedRoute>
        } />

        {/* Admin/Employee Routes */}
        <Route path="products" element={
          <RoleBasedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
            <div>Products</div>
          </RoleBasedRoute>
        } />
        <Route path="customers" element={
          <RoleBasedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
            <div>Customers</div>
          </RoleBasedRoute>
        } />
        <Route path="bills" element={
          <RoleBasedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
            <div>Billing</div>
          </RoleBasedRoute>
        } />
        <Route path="purchases" element={
          <RoleBasedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
            <div>Purchases</div>
          </RoleBasedRoute>
        } />
        <Route path="suppliers" element={
          <RoleBasedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
            <div>Suppliers</div>
          </RoleBasedRoute>
        } />
        <Route path="payments" element={
          <RoleBasedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
            <div>Payments</div>
          </RoleBasedRoute>
        } />
        <Route path="reports" element={
          <RoleBasedRoute allowedRoles={['ADMIN', 'EMPLOYEE', 'SUPER_ADMIN']}>
            <div>Reports</div>
          </RoleBasedRoute>
        } />

        {/* Customer Routes */}
        <Route path="my-products" element={
          <RoleBasedRoute allowedRoles={['CUSTOMER']}>
            <div>My Products</div>
          </RoleBasedRoute>
        } />
        <Route path="my-bills" element={
          <RoleBasedRoute allowedRoles={['CUSTOMER']}>
            <div>My Bills</div>
          </RoleBasedRoute>
        } />
        <Route path="warranties" element={
          <RoleBasedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'EMPLOYEE']}>
            <div>Warranties</div>
          </RoleBasedRoute>
        } />
        <Route path="my-emi" element={
          <RoleBasedRoute allowedRoles={['CUSTOMER']}>
            <div>My EMI</div>
          </RoleBasedRoute>
        } />
        <Route path="support" element={
          <RoleBasedRoute allowedRoles={['CUSTOMER']}>
            <div>Support</div>
          </RoleBasedRoute>
        } />

        <Route path="settings" element={<div>Settings</div>} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
