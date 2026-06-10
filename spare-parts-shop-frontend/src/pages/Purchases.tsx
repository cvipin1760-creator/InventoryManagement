import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Purchase } from '../types'
import './Bills.css' // Reusing Bills.css for consistent table styling

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)
}

function formatDate(s: string) {
  return new Date(s).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [searchType, setSearchType] = useState<'supplier' | 'product'>('supplier')
  const [dateFilter, setDateFilter] = useState<'all' | 'range'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [visibleCosts, setVisibleCosts] = useState<Record<number, boolean>>({})

  const toggleCost = (id: number) => {
    setVisibleCosts(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const load = () => {
    setLoading(true)
    let request: Promise<Purchase[]>

    if (search.trim()) {
      if (searchType === 'supplier') {
        request = api.searchPurchases(search.trim())
      } else {
        request = api.searchPurchasesByProduct(search.trim())
      }
    } else if (dateFilter === 'range' && startDate && endDate) {
      const startStr = `${startDate}T00:00:00`
      const endStr = `${endDate}T23:59:59`
      request = api.getPurchasesByDateRange(startStr, endStr)
    } else {
      request = api.getPurchases()
    }

    request
      .then(setPurchases)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [search, searchType, dateFilter, startDate, endDate])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Purchases</h1>
        <div className="page-actions bills-actions">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'supplier' | 'product')}
            className="search-input"
            style={{ width: 'auto' }}
          >
            <option value="supplier">By supplier</option>
            <option value="product">By product</option>
          </select>
          <input
            type="search"
            placeholder={searchType === 'supplier' ? "Search by supplier..." : "Search by product..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as 'all' | 'range')}
            className="search-input"
            style={{ width: 'auto' }}
          >
            <option value="all">All dates</option>
            <option value="range">Date range</option>
          </select>
          {dateFilter === 'range' && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="search-input"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="search-input"
              />
            </>
          )}
          <Link to="/purchases/new" className="btn btn-primary">New Purchase</Link>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Supplier</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Bill</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td>{p.invoiceNumber}</td>
                  <td>{p.supplier.name}</td>
                  <td>{formatDate(p.purchaseDate)}</td>
                  <td>
                    <div 
                      onClick={() => toggleCost(p.id)} 
                      style={{ cursor: 'pointer', fontFamily: visibleCosts[p.id] ? 'inherit' : 'monospace' }}
                      title="Click to reveal/hide amount"
                    >
                      {visibleCosts[p.id] ? formatCurrency(p.finalAmount) : '••••••'}
                    </div>
                  </td>
                  <td>
                    {p.attachmentPath ? (
                      <a href={`/api/bills/attachments/${p.attachmentPath}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">View</a>
                    ) : '-'}
                  </td>
                  <td>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                      {p.items.map(i => `${i.product.name} (x${i.quantity})`).join(', ')}
                    </div>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No purchases found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
