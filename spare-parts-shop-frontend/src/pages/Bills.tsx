import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Bill } from '../types'
import { exportToPDF, exportToExcel } from '../utils/exportUtils'
import ReceiptPrinter from '../components/ReceiptPrinter'
import './Bills.css'

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

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [searchType, setSearchType] = useState<'customer' | 'product'>('customer')
  const [dateFilter, setDateFilter] = useState<'all' | 'range'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [pdfLoading, setPdfLoading] = useState<number | null>(null)
  const [backupLoading, setBackupLoading] = useState(false)
  const [previewBill, setPreviewBill] = useState<Bill | null>(null)
  const [whatsAppLoading, setWhatsAppLoading] = useState<number | null>(null)
  
  const [printBill, setPrintBill] = useState<Bill | null>(null)
  const [receiptSize, setReceiptSize] = useState<'58mm' | '80mm' | 'A4'>('80mm')

  const load = () => {
    setLoading(true)
    if (search.trim()) {
      if (searchType === 'customer') {
        api.searchBills(search.trim())
          .then(setBills)
          .catch((e) => setError(e instanceof Error ? e.message : String(e)))
          .finally(() => setLoading(false))
      } else {
        api.searchBillsByProduct(search.trim())
          .then(setBills)
          .catch(async (e) => {
            setError(e instanceof Error ? e.message : String(e))
            try {
              const all = await api.getBills()
              const keyword = search.trim().toLowerCase()
              const filtered = all.filter((b) =>
                (b.items || []).some((it) =>
                  it.product &&
                  (it.product.name?.toLowerCase().includes(keyword) ||
                   it.product.partNumber?.toLowerCase().includes(keyword))
                )
              )
              setBills(filtered)
            } catch {
              /* keep error as is */
            } finally {
              setLoading(false)
            }
          })
      }
    } else if (dateFilter === 'range' && startDate && endDate) {
      const startStr = `${startDate}T00:00:00`
      const endStr = `${endDate}T23:59:59`
      api.getBillsByDateRange(startStr, endStr)
        .then(setBills)
        .catch((e) => setError(e instanceof Error ? e.message : String(e)))
        .finally(() => setLoading(false))
    } else {
      api.getBills().then(setBills).catch((e) => setError(e instanceof Error ? e.message : String(e))).finally(() => setLoading(false))
    }
  }

  useEffect(() => {
    load()
  }, [search, searchType, dateFilter, startDate, endDate])

  const handleDownloadPdf = async (id: number) => {
    setPdfLoading(id)
    try {
      await api.getInvoicePdf(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF')
    } finally {
      setPdfLoading(null)
    }
  }

  const handleDownloadBackup = async () => {
    setBackupLoading(true)
    setError('')
    try {
      await api.downloadBillsBackup()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download bills backup')
    } finally {
      setBackupLoading(false)
    }
  }

  const handleSendWhatsApp = async (bill: Bill) => {
    const phone = bill.customer.phone
    if (!phone) {
      alert('Customer has no phone number')
      return
    }
    
    setWhatsAppLoading(bill.id)
    try {
      await api.sendBillViaWhatsApp(bill.id, phone)
      alert('Bill sent successfully via WhatsApp!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send bill via WhatsApp')
    } finally {
      setWhatsAppLoading(null)
    }
  }

  return (
    <div className="bills-container">
      <div className="bills-header">
        <h1>Bills</h1>
        <div className="bills-actions">
          <input
            type="search"
            placeholder={searchType === 'customer' ? 'Search by customer...' : 'Search by product...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'customer' | 'product')}
            className="search-input"
            style={{ width: 'auto' }}
          >
            <option value="customer">By customer</option>
            <option value="product">By product</option>
          </select>
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
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              const headers = ['Invoice #', 'Customer', 'Date', 'Amount'];
              const data = (bills || []).map(b => [b.invoiceNumber, b.customer?.name || 'N/A', formatDate(b.billDate), b.finalAmount]);
              exportToPDF('Bills Report', headers, data, 'bills_report');
            }}
          >
            Export PDF
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              const data = (bills || []).map(b => ({
                'Invoice #': b.invoiceNumber,
                'Customer': b.customer.name,
                'Date': formatDate(b.billDate),
                'Amount': b.finalAmount
              }));
              exportToExcel(data, 'bills_report');
            }}
          >
            Export Excel
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDownloadBackup}
            disabled={backupLoading}
          >
            {backupLoading ? 'Backing up...' : 'Download Backup'}
          </button>
          <Link to="/bills/create" className="btn btn-primary">New Bill</Link>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="bills-table-container">
          <table className="bills-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(bills || []).map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.invoiceNumber}</strong></td>
                  <td>{b.customer.name}</td>
                  <td>{formatDate(b.billDate)}</td>
                  <td>{formatCurrency(b.finalAmount)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setPreviewBill(b)}
                      >
                        Preview
                      </button>
                      <Link to={`/bills/${b.id}/edit`} className="btn btn-ghost btn-sm">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDownloadPdf(b.id)}
                        disabled={pdfLoading === b.id}
                      >
                        {pdfLoading === b.id ? '...' : 'PDF'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleSendWhatsApp(b)}
                        disabled={whatsAppLoading === b.id}
                      >
                        {whatsAppLoading === b.id ? '...' : 'WhatsApp'}
                      </button>
                      <div className="dropdown" style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
                        <select 
                          className="btn btn-ghost btn-sm" 
                          value={receiptSize}
                          onChange={(e) => setReceiptSize(e.target.value as any)}
                          style={{ marginRight: '4px', padding: '0 4px' }}
                        >
                          <option value="58mm">58mm</option>
                          <option value="80mm">80mm</option>
                          <option value="A4">A4</option>
                        </select>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setPrintBill(b)}
                        >
                          Print
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {previewBill && (
        <div className="invoice-modal-overlay" onClick={() => setPreviewBill(null)}>
          <div className="invoice-modal" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-modal-header">
              <h2>Invoice Preview</h2>
              <button className="btn btn-ghost" onClick={() => setPreviewBill(null)}>&times;</button>
            </div>
            
            <div className="invoice-content">
              <div className="invoice-branding">
                <div className="shop-info">
                  <h3>StockPilot</h3>
                  <p>Shop Address: Kalamboli</p>
                  <p>Phone: +91-9987654321</p>
                </div>
                <div className="invoice-meta">
                  <h4>INVOICE</h4>
                  <p><strong>No:</strong> {previewBill.invoiceNumber}</p>
                  <p><strong>Date:</strong> {formatDate(previewBill.billDate)}</p>
                </div>
              </div>

              <div className="customer-info-section">
                <p><strong>Bill To:</strong></p>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: '600' }}>{previewBill.customer.name}</p>
                <p>{previewBill.customer.phone}</p>
                {previewBill.customer.address && <p>{previewBill.customer.address}</p>}
              </div>

              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Rate</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(previewBill.items || []).map((it) => (
                    <tr key={it.id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{it.product.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Part No: {it.product.partNumber} | GST: {it.gstPercent}%
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(it.price)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(it.itemTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-totals">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(previewBill.subtotal)}</span>
                </div>
                <div className="total-row">
                  <span>GST Amount:</span>
                  <span>{formatCurrency(previewBill.gstAmount)}</span>
                </div>
                {previewBill.discount > 0 && (
                  <div className="total-row">
                    <span>Discount:</span>
                    <span>-{formatCurrency(previewBill.discount)}</span>
                  </div>
                )}
                <div className="total-row grand-total">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(previewBill.finalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="invoice-modal-footer">
              <Link to={`/bills/${previewBill.id}/edit`} className="btn btn-primary">Edit Bill</Link>
              <button 
                className="btn btn-secondary" 
                onClick={() => handleDownloadPdf(previewBill.id)}
                disabled={pdfLoading === previewBill.id}
              >
                {pdfLoading === previewBill.id ? 'Downloading...' : 'Download PDF'}
              </button>
              <button 
                className="btn" 
                style={{ backgroundColor: '#25D366', color: 'white' }}
                onClick={() => handleSendWhatsApp(previewBill)}
                disabled={whatsAppLoading === previewBill.id}
              >
                {whatsAppLoading === previewBill.id ? 'Sending...' : 'Send via WhatsApp'}
              </button>
              <button className="btn btn-ghost" onClick={() => setPreviewBill(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Print Overlay */}
      <ReceiptPrinter 
        bill={printBill} 
        size={receiptSize} 
        onClose={() => setPrintBill(null)} 
      />
    </div>
  )
}
