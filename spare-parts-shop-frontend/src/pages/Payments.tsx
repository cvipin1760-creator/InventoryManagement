import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Customer, CustomerBalance, Payment } from '../types'
import './Customers.css'

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

export default function Payments() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState<number | ''>('')
  const [balance, setBalance] = useState<CustomerBalance | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [amount, setAmount] = useState(0)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getCustomers()
      .then(setCustomers)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  const loadCustomerLedger = (id: number) => {
    setLoading(true)
    setError('')
    Promise.all([
      api.getCustomerBalance(id),
      api.getCustomerPayments(id),
    ])
      .then(([nextBalance, nextPayments]) => {
        setBalance(nextBalance)
        setPayments(nextPayments)
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!customerId) {
      setBalance(null)
      setPayments([])
      return
    }
    loadCustomerLedger(Number(customerId))
  }, [customerId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId || amount <= 0) {
      setError('Select customer and enter a payment amount')
      return
    }

    setSaving(true)
    setError('')
    try {
      await api.createPayment({
        customerId: Number(customerId),
        amount,
        note,
      })
      setAmount(0)
      setNote('')
      loadCustomerLedger(Number(customerId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save payment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Payments</h1>
        <div className="page-actions">
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : '')}
            className="search-input"
          >
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {balance && (
        <div className="table-container" style={{ marginBottom: '1rem' }}>
          <table>
            <thead>
              <tr>
                <th>Total Bills</th>
                <th>Total Paid</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{formatCurrency(balance.totalBilled)}</td>
                <td>{formatCurrency(balance.totalPaid)}</td>
                <td><strong>{formatCurrency(balance.remainingAmount)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {customerId && (
        <div className="modal" style={{ maxWidth: 'none', marginBottom: '1rem' }}>
          <h2>Record Payment</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Amount Paid</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(+e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Note</label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Cash, UPI, cheque number, etc."
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Payment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Invoice</th>
                <th>Amount</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{formatDate(payment.paymentDate)}</td>
                  <td>{payment.bill?.invoiceNumber || '-'}</td>
                  <td>{formatCurrency(payment.amount)}</td>
                  <td>{payment.note || '-'}</td>
                </tr>
              ))}
              {customerId && payments.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>No payments recorded</td>
                </tr>
              )}
              {!customerId && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>Select a customer to view payment history</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
