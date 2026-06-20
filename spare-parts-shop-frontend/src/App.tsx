import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import { selectIsAuthenticated, selectCurrentUser } from './store/slices/authSlice';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Bills from './pages/Bills';
import CreateBill from './pages/CreateBill';
import EditBill from './pages/EditBill';
import Purchases from './pages/Purchases';
import CreatePurchase from './pages/CreatePurchase';
import Suppliers from './pages/Suppliers';
import Payments from './pages/Payments';
import Users from './pages/Users';
import AdminManagement from './pages/AdminManagement';
import BusinessManagement from './pages/BusinessManagement';


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
          <RoleBasedRoute allowedRoles={['SUPER_MANAGER']}>
            <AdminManagement />
          </RoleBasedRoute>
        } />
        <Route path="businesses" element={
          <RoleBasedRoute allowedRoles={['SUPER_MANAGER']}>
            <BusinessManagement />
          </RoleBasedRoute>
        } />
        <Route path="subscriptions" element={
          <RoleBasedRoute allowedRoles={['SUPER_MANAGER']}>
            <div className="p-4"><h1>Subscriptions</h1><p>Coming soon...</p></div>
          </RoleBasedRoute>
        } />
        <Route path="permissions" element={
          <RoleBasedRoute allowedRoles={['SUPER_MANAGER']}>
            <div className="p-4"><h1>Feature Permissions</h1><p>Coming soon...</p></div>
          </RoleBasedRoute>
        } />
        <Route path="analytics" element={
          <RoleBasedRoute allowedRoles={['SUPER_MANAGER']}>
            <div className="p-4"><h1>Analytics</h1><p>Coming soon...</p></div>
          </RoleBasedRoute>
        } />

        {/* Admin/Employee Routes */}
        <Route path="products" element={
          <RoleBasedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
            <Products />
          </RoleBasedRoute>
        } />
        <Route path="customers" element={
          <RoleBasedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
            <Customers />
          </RoleBasedRoute>
        } />
        <Route path="bills" element={
          <RoleBasedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
            <Bills />
          </RoleBasedRoute>
        } />
        <Route path="bills/create" element={
          <RoleBasedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
            <CreateBill />
          </RoleBasedRoute>
        } />
        <Route path="bills/:id/edit" element={
          <RoleBasedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
            <EditBill />
          </RoleBasedRoute>
        } />
        <Route path="purchases" element={
          <RoleBasedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
            <Purchases />
          </RoleBasedRoute>
        } />
        <Route path="purchases/create" element={
          <RoleBasedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
            <CreatePurchase />
          </RoleBasedRoute>
        } />
        <Route path="suppliers" element={
          <RoleBasedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
            <Suppliers />
          </RoleBasedRoute>
        } />
        <Route path="payments" element={
          <RoleBasedRoute allowedRoles={['ADMIN', 'EMPLOYEE']}>
            <Payments />
          </RoleBasedRoute>
        } />
        <Route path="users" element={
          <RoleBasedRoute allowedRoles={['ADMIN']}>
            <Users />
          </RoleBasedRoute>
        } />
        <Route path="reports" element={
          <RoleBasedRoute allowedRoles={['ADMIN', 'EMPLOYEE', 'SUPER_MANAGER']}>
            <div className="p-4"><h1>Reports</h1><p>Coming soon...</p></div>
          </RoleBasedRoute>
        } />

        {/* Customer Routes */}
        <Route path="my-products" element={
          <RoleBasedRoute allowedRoles={['CUSTOMER']}>
            <div className="p-4"><h1>My Products</h1><p>Coming soon...</p></div>
          </RoleBasedRoute>
        } />
        <Route path="my-bills" element={
          <RoleBasedRoute allowedRoles={['CUSTOMER']}>
            <div className="p-4"><h1>My Bills</h1><p>Coming soon...</p></div>
          </RoleBasedRoute>
        } />
        <Route path="warranties" element={
          <RoleBasedRoute allowedRoles={['CUSTOMER', 'ADMIN', 'EMPLOYEE']}>
            <div className="p-4"><h1>Warranties</h1><p>Coming soon...</p></div>
          </RoleBasedRoute>
        } />
        <Route path="my-emi" element={
          <RoleBasedRoute allowedRoles={['CUSTOMER']}>
            <div className="p-4"><h1>My EMI</h1><p>Coming soon...</p></div>
          </RoleBasedRoute>
        } />
        <Route path="support" element={
          <RoleBasedRoute allowedRoles={['CUSTOMER']}>
            <div className="p-4"><h1>Support</h1><p>Coming soon...</p></div>
          </RoleBasedRoute>
        } />

        <Route path="settings" element={<div className="p-4"><h1>Settings</h1><p>Coming soon...</p></div>} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
