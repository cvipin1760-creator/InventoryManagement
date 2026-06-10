import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Products from './pages/Products'
import Bills from './pages/Bills'
import CreateBill from './pages/CreateBill'
import EditBill from './pages/EditBill'
import Purchases from './pages/Purchases'
import CreatePurchase from './pages/CreatePurchase'
import Suppliers from './pages/Suppliers'
import Users from './pages/Users'
import Payments from './pages/Payments'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { username } = useAuth()
  if (!username) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { role, username } = useAuth()
  const isAdmin = role === 'ADMIN' || username === 'admin'
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="products" element={<Products />} />
        <Route path="bills" element={<Bills />} />
        <Route path="bills/new" element={<CreateBill />} />
        <Route path="bills/:id/edit" element={<EditBill />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="payments" element={<Payments />} />
        <Route path="purchases/new" element={<CreatePurchase />} />
        <Route path="users" element={<AdminRoute><Users /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
