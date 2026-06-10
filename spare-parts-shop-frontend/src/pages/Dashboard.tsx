import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { DashboardStats } from '../types'
import './Dashboard.css'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .getDashboardStats()
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading dashboard...</div>
  if (error) return <div className="error">{error}</div>
  if (!stats) return null

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Today&apos;s Sales</span>
          <span className="stat-value">{formatCurrency(stats.todaySales)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Weekly Sales</span>
          <span className="stat-value">{formatCurrency(stats.weeklySales)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Monthly Sales</span>
          <span className="stat-value">{formatCurrency(stats.monthlySales)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Bills Today</span>
          <span className="stat-value">{stats.todayBillsCount}</span>
        </div>
        <div className="stat-card warning">
          <span className="stat-label">Low Stock Items</span>
          <span className="stat-value">{stats.lowStockCount}</span>
          {stats.lowStockCount > 0 && (
            <Link to="/products?lowStock=1" className="stat-link">View →</Link>
          )}
        </div>
      </div>
      <div className="quick-actions">
        <Link to="/bills/new" className="btn btn-primary">Create New Bill</Link>
        <Link to="/purchases/new" className="btn btn-primary">Create New Purchase</Link>
        <Link to="/bills" className="btn btn-secondary">View All Bills</Link>
        <Link to="/suppliers" className="btn btn-secondary">Manage Suppliers</Link>
      </div>
    </div>
  )
}
