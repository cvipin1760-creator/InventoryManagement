import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import { selectIsAuthenticated, selectCurrentUser } from './store/slices/authSlice';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
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
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import SendNotifications from './pages/SendNotifications';
import Notifications from './pages/Notifications';
import BillTemplates from './pages/BillTemplates';
import Subscriptions from './pages/Subscriptions';
import FeaturePermissions from './pages/FeaturePermissions';


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
      <Route path="/register" element={<Register />} />

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
            <Subscriptions />
          </RoleBasedRoute>
        } />
        <Route path="permissions" element={
          <RoleBasedRoute allowedRoles={['SUPER_MANAGER']}>
            <FeaturePermissions />
          </RoleBasedRoute>
        } />
        <Route path="analytics" element={
          <RoleBasedRoute allowedRoles={['SUPER_MANAGER']}>
            <Analytics />
          </RoleBasedRoute>
        } />
        <Route path="send-notifications" element={
          <RoleBasedRoute allowedRoles={['SUPER_MANAGER']}>
            <SendNotifications />
          </RoleBasedRoute>
        } />
        <Route path="notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
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
        <Route path="bill-templates" element={
          <RoleBasedRoute allowedRoles={['ADMIN']}>
            <BillTemplates />
          </RoleBasedRoute>
        } />
        <Route path="users" element={
          <RoleBasedRoute allowedRoles={['ADMIN']}>
            <Users />
          </RoleBasedRoute>
        } />
        <Route path="reports" element={
          <RoleBasedRoute allowedRoles={['ADMIN', 'EMPLOYEE', 'SUPER_MANAGER']}>
            <Reports />
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

        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
