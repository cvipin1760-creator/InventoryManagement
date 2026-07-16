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
import SubscriptionBilling from './pages/SubscriptionBilling';
import StockTransfers from './pages/StockTransfers';
import Branches from './pages/Branches';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import CustomerProducts from './pages/CustomerProducts';
import CustomerBills from './pages/CustomerBills';
import Warranties from './pages/Warranties';
import CustomerEmi from './pages/CustomerEmi';
import Support from './pages/Support';
import PaymentSettings from './pages/PaymentSettings';
import AccountingExport from './pages/AccountingExport';
import Marketing from './pages/Marketing';
import PurchaseOrders from './pages/PurchaseOrders';
import B2bLogin from './pages/B2bLogin';
import B2bShop from './pages/B2bShop';
import Audit from './pages/Audit'
import Emis from './pages/Emis';
import SupportTickets from './pages/SupportTickets';
import RoleManagement from './pages/RoleManagement';
import CustomerLogin from './pages/CustomerLogin';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerPurchases from './pages/CustomerPurchases';
import CustomerInvoiceDetail from './pages/CustomerInvoiceDetail';


// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Role-Based Route component
const RoleGuard = ({ children, allowedRoles, requiredPermission }: { children: React.ReactNode; allowedRoles: string[], requiredPermission?: string }) => {
  const user = useAppSelector(selectCurrentUser);
  if (!user) {
    return <Navigate to="/dashboard" replace />;
  }
  const role = user.role as string;
  
  if (role === 'SUPER_ADMIN' || role === 'SUPER_MANAGER') {
    return <>{children}</>;
  }
  
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (role === 'EMPLOYEE' && requiredPermission) {
    const perms = user.permissions || [];
    if (!perms.includes(requiredPermission)) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
};

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Public B2B Portal Routes */}
      <Route path="/b2b/:businessId/login" element={<B2bLogin />} />
      <Route path="/b2b/:businessId/shop" element={<B2bShop />} />

      {/* Customer Portal Routes */}
      <Route path="/customer/login" element={<CustomerLogin />} />
      <Route 
        path="/customer-dashboard" 
        element={
          <ProtectedRoute>
            <CustomerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/purchases" 
        element={
          <ProtectedRoute>
            <CustomerPurchases />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/purchases/:id" 
        element={
          <ProtectedRoute>
            <CustomerInvoiceDetail />
          </ProtectedRoute>
        } 
      />

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
        <Route path="predictive-analytics" element={
          <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
            <PredictiveAnalytics />
          </RoleGuard>
        } />
        <Route path="admins" element={
          <RoleGuard allowedRoles={['SUPER_ADMIN']}>
            <AdminManagement />
          </RoleGuard>
        } />
        <Route path="roles" element={
          <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
            <RoleManagement />
          </RoleGuard>
        } />
        <Route path="payment-settings" element={
          <RoleGuard allowedRoles={['SUPER_ADMIN']}>
            <PaymentSettings />
          </RoleGuard>
        } />
        <Route path="businesses" element={
          <RoleGuard allowedRoles={['SUPER_ADMIN']}>
            <BusinessManagement />
          </RoleGuard>
        } />
        <Route path="subscriptions" element={
          <RoleGuard allowedRoles={['SUPER_ADMIN']}>
            <Subscriptions />
          </RoleGuard>
        } />
        <Route path="feature-management" element={
          <RoleGuard allowedRoles={['SUPER_ADMIN']}>
            <FeaturePermissions />
          </RoleGuard>
        } />
        <Route path="analytics" element={
          <RoleGuard allowedRoles={['SUPER_ADMIN']}>
            <Analytics />
          </RoleGuard>
        } />
        <Route path="send-notifications" element={
          <RoleGuard allowedRoles={['SUPER_ADMIN']}>
            <SendNotifications />
          </RoleGuard>
        } />
        <Route path="notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />

        {/* Admin/Employee Routes */}
        <Route path="products" element={
          <RoleGuard allowedRoles={['ADMIN', 'EMPLOYEE']} requiredPermission="products">
            <Products />
          </RoleGuard>
        } />
        <Route path="customers" element={
          <RoleGuard allowedRoles={['ADMIN', 'EMPLOYEE']} requiredPermission="customers">
            <Customers />
          </RoleGuard>
        } />
        <Route path="bills" element={
          <RoleGuard allowedRoles={['ADMIN', 'EMPLOYEE']} requiredPermission="bills">
            <Bills />
          </RoleGuard>
        } />
        <Route path="bills/create" element={
          <RoleGuard allowedRoles={['ADMIN', 'EMPLOYEE']} requiredPermission="bills">
            <CreateBill />
          </RoleGuard>
        } />
        <Route path="bills/:id/edit" element={
          <RoleGuard allowedRoles={['ADMIN', 'EMPLOYEE']} requiredPermission="bills">
            <EditBill />
          </RoleGuard>
        } />
        <Route path="purchases" element={
          <RoleGuard allowedRoles={['ADMIN', 'EMPLOYEE']} requiredPermission="purchases">
            <Purchases />
          </RoleGuard>
        } />
        <Route path="purchases/create" element={
          <RoleGuard allowedRoles={['ADMIN', 'EMPLOYEE']} requiredPermission="purchases">
            <CreatePurchase />
          </RoleGuard>
        } />
        <Route path="suppliers" element={
          <RoleGuard allowedRoles={['ADMIN', 'EMPLOYEE']} requiredPermission="suppliers">
            <Suppliers />
          </RoleGuard>
        } />
        <Route path="payments" element={
          <RoleGuard allowedRoles={['ADMIN', 'EMPLOYEE']} requiredPermission="payments">
            <Payments />
          </RoleGuard>
        } />
        <Route path="bill-templates" element={
          <RoleGuard allowedRoles={['ADMIN']}>
            <BillTemplates />
          </RoleGuard>
        } />
        <Route path="users" element={
          <RoleGuard allowedRoles={['ADMIN']}>
            <Users />
          </RoleGuard>
        } />
        <Route path="billing" element={
          <RoleGuard allowedRoles={['ADMIN']}>
            <SubscriptionBilling />
          </RoleGuard>
        } />
        <Route path="stock-transfers" element={
          <RoleGuard allowedRoles={['ADMIN', 'EMPLOYEE']} requiredPermission="products">
            <StockTransfers />
          </RoleGuard>
        } />
        <Route path="reports" element={
          <RoleGuard allowedRoles={['ADMIN', 'EMPLOYEE', 'SUPER_ADMIN']} requiredPermission="reports">
            <Reports />
          </RoleGuard>
        } />
        <Route path="accounting-export" element={
          <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
            <AccountingExport />
          </RoleGuard>
        } />
        <Route path="marketing" element={
          <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
            <Marketing />
          </RoleGuard>
        } />

        {/* Customer Routes */}
        <Route path="my-products" element={
          <RoleGuard allowedRoles={['CUSTOMER']}>
            <CustomerProducts />
          </RoleGuard>
        } />
        <Route path="my-bills" element={
          <RoleGuard allowedRoles={['CUSTOMER']}>
            <CustomerBills />
          </RoleGuard>
        } />
        <Route path="warranties" element={
          <RoleGuard allowedRoles={['CUSTOMER', 'ADMIN', 'EMPLOYEE']} requiredPermission="warranty">
            <Warranties />
          </RoleGuard>
        } />
        <Route path="emis" element={
          <RoleGuard allowedRoles={['ADMIN', 'EMPLOYEE']} requiredPermission="emi">
            <Emis />
          </RoleGuard>
        } />
        <Route path="support-tickets" element={
          <RoleGuard allowedRoles={['ADMIN', 'EMPLOYEE', 'SUPER_ADMIN', 'SUPER_MANAGER']}>
            <SupportTickets />
          </RoleGuard>
        } />
        <Route path="my-emi" element={
          <RoleGuard allowedRoles={['CUSTOMER']}>
            <CustomerEmi />
          </RoleGuard>
        } />
        <Route path="support" element={
          <RoleGuard allowedRoles={['CUSTOMER']}>
            <Support />
          </RoleGuard>
        } />

        {/* Global Settings (Super Admin/Admin have different scopes) */}
        <Route path="settings" element={
          <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
            <Settings />
          </RoleGuard>
        } />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
