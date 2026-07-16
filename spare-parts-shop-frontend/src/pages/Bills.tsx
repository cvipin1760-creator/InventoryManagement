import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Bill, Business } from '../types'
import { QRCodeSVG } from 'qrcode.react'
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
  const [paymentModeFilter, setPaymentModeFilter] = useState<'all' | 'FULL' | 'EMI'>('all')
  const [pdfLoading, setPdfLoading] = useState<number | null>(null)
  const [backupLoading, setBackupLoading] = useState(false)
  const [previewBill, setPreviewBill] = useState<Bill | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [whatsAppLoading, setWhatsAppLoading] = useState<number | null>(null)
  
  const [printBill, setPrintBill] = useState<Bill | null>(null)
  const [receiptSize, setReceiptSize] = useState<'58mm' | '80mm' | 'A4'>('80mm')

  const load = () => {
    setLoading(true)
    if (search.trim()) {
      if (searchType === 'customer') {
        api.searchBills(search.trim())
          .then(bills => {
            const filtered = paymentModeFilter === 'all' ? bills : bills.filter(b => b.paymentMode === paymentModeFilter)
            setBills(filtered)
          })
          .catch((e) => setError(e instanceof Error ? e.message : String(e)))
          .finally(() => setLoading(false))
      } else {
        api.searchBillsByProduct(search.trim())
          .then(bills => {
            const filtered = paymentModeFilter === 'all' ? bills : bills.filter(b => b.paymentMode === paymentModeFilter)
            setBills(filtered)
          })
          .catch(async (e) => {
            setError(e instanceof Error ? e.message : String(e))
            try {
              const all = await api.getBills()
              const keyword = search.trim().toLowerCase()
              let filtered = all.filter((b) =>
                (b.items || []).some((it) =>
                  it.product &&
                  (it.product.name?.toLowerCase().includes(keyword) ||
                   it.product.partNumber?.toLowerCase().includes(keyword))
                )
              )
              if (paymentModeFilter !== 'all') {
                filtered = filtered.filter(b => b.paymentMode === paymentModeFilter)
              }
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
        .then(bills => {
          const filtered = paymentModeFilter === 'all' ? bills : bills.filter(b => b.paymentMode === paymentModeFilter)
          setBills(filtered)
        })
        .catch((e) => setError(e instanceof Error ? e.message : String(e)))
        .finally(() => setLoading(false))
    } else {
      api.getBills().then(bills => {
        const filtered = paymentModeFilter === 'all' ? bills : bills.filter(b => b.paymentMode === paymentModeFilter)
        setBills(filtered)
      }).catch((e) => setError(e instanceof Error ? e.message : String(e))).finally(() => setLoading(false))
    }
  }

  useEffect(() => {
    load()
    api.getBusiness().then(setBusiness).catch(console.error)
  }, [search, searchType, dateFilter, startDate, endDate, paymentModeFilter])

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
          <select
            value={paymentModeFilter}
            onChange={(e) => setPaymentModeFilter(e.target.value as 'all' | 'FULL' | 'EMI')}
            className="search-input"
            style={{ width: 'auto' }}
          >
            <option value="all">All Payment Modes</option>
            <option value="FULL">Full Payment</option>
            <option value="EMI">EMI</option>
          </select>
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
                <th>Payment Mode</th>
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
                  <td><span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '0.25rem', 
                    backgroundColor: b.paymentMode === 'EMI' ? 'var(--warning-light)' : 'var(--success-light)', 
                    color: b.paymentMode === 'EMI' ? 'var(--warning-dark)' : 'var(--success-dark)',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}>{b.paymentMode}</span></td>
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
                  <h3>{business?.businessName || 'Business Name'}</h3>
                  <p>{[business?.address, business?.city, business?.state, business?.pincode].filter(Boolean).join(', ')}</p>
                  <p>Phone: {business?.contactNumber || 'N/A'} {business?.email ? ` | Email: ${business.email}` : ''}</p>
                  {business?.website && <p>Web: {business.website}</p>}
                  {business?.gstNumber && <p><strong>GSTIN: {business.gstNumber}</strong></p>}
                </div>
                <div className="invoice-meta">
                  <h4>INVOICE</h4>
                  <p><strong>No:</strong> {previewBill.invoiceNumber}</p>
                  <p><strong>Date:</strong> {formatDate(previewBill.billDate)}</p>
                  {previewBill.paymentMode && <p><strong>Mode:</strong> {previewBill.paymentMode}</p>}
                  <div style={{ marginTop: '0.5rem' }}>
                    <QRCodeSVG value={`${window.location.origin}/customer/invoice/${previewBill.id}`} size={64} />
                  </div>
                </div>
              </div>

              <div className="customer-info-section">
                <p><strong>Billed To:</strong></p>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: '600' }}>{previewBill.customer.name}</p>
                <p>Phone: {previewBill.customer.phone}</p>
                {previewBill.customer.address && <p>{previewBill.customer.address}</p>}
                {previewBill.customer.email && <p>Email: {previewBill.customer.email}</p>}
              </div>

              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU/Serial</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Rate</th>
                    <th style={{ textAlign: 'right' }}>Disc.</th>
                    {['GST', 'INCLUDED', 'EXCLUDED'].includes(previewBill.gstType?.toUpperCase() || '') && (
                      <>
                        <th style={{ textAlign: 'right' }}>GST %</th>
                        <th style={{ textAlign: 'right' }}>GST Amt</th>
                      </>
                    )}
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(previewBill.items || []).map((it) => (
                    <tr key={it.id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{it.product.name}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {it.product.partNumber}
                          {it.serialNumber && <div>SN: {it.serialNumber}</div>}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(it.price)}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(it.discount || 0)}</td>
                      {['GST', 'INCLUDED', 'EXCLUDED'].includes(previewBill.gstType?.toUpperCase() || '') && (
                        <>
                          <td style={{ textAlign: 'right' }}>{it.gstPercent}%</td>
                          <td style={{ textAlign: 'right' }}>{formatCurrency(it.itemTotal - ((it.price * it.quantity) - (it.discount || 0)))}</td>
                        </>
                      )}
                      <td style={{ textAlign: 'right' }}>{formatCurrency(it.itemTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-totals">
                <div className="total-row">
                  <span>Gross Total:</span>
                  <span>{formatCurrency(previewBill.subtotal + (previewBill.items || []).reduce((sum, it) => sum + (it.discount || 0), 0))}</span>
                </div>
                <div className="total-row">
                  <span>Total Discount:</span>
                  <span>-{formatCurrency(previewBill.discount + (previewBill.items || []).reduce((sum, it) => sum + (it.discount || 0), 0))}</span>
                </div>
                {['GST', 'INCLUDED', 'EXCLUDED'].includes(previewBill.gstType?.toUpperCase() || '') && (
                <div className="total-row">
                  <span>Total GST:</span>
                  <span>{formatCurrency(previewBill.gstAmount)}</span>
                </div>
                )}
                <div className="total-row grand-total">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(previewBill.finalAmount)}</span>
                </div>
              </div>

              {/* EMI Details */}
              {previewBill.emis && previewBill.emis.length > 0 && (
                <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                  <h4 style={{ marginBottom: '1rem' }}>EMI Details</h4>
                  {previewBill.emis.map((emi) => (
                    <div key={emi.id} style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <p><strong>Total Amount:</strong> {formatCurrency(emi.totalAmount)}</p>
                        <p><strong>Down Payment:</strong> {formatCurrency(emi.downPayment)}</p>
                        <p><strong>Loan Amount:</strong> {formatCurrency(emi.loanAmount)}</p>
                        <p><strong>Total EMIs:</strong> {emi.totalEmis}</p>
                        <p><strong>EMI Amount:</strong> {formatCurrency(emi.emiAmount)}</p>
                        <p><strong>EMIs Paid:</strong> {emi.emisPaid}</p>
                        <p><strong>EMIs Remaining:</strong> {emi.emisRemaining}</p>
                        <p><strong>Next EMI Date:</strong> {emi.nextEmiDate ? new Date(emi.nextEmiDate).toLocaleDateString('en-IN') : 'N/A'}</p>
                        <p><strong>Interest Rate:</strong> {emi.interestRate}%</p>
                        <p><strong>Processing Fee:</strong> {formatCurrency(emi.processingFee)}</p>
                      </div>
                      {emi.installments && emi.installments.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                          <h5 style={{ marginBottom: '0.5rem' }}>EMI Schedule</h5>
                          <table className="invoice-items-table" style={{ fontSize: '0.875rem' }}>
                            <thead>
                              <tr>
                                <th>Installment #</th>
                                <th>Due Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {emi.installments.map((installment) => (
                                <tr key={installment.id}>
                                  <td>{installment.installmentNumber}</td>
                                  <td>{new Date(installment.dueDate).toLocaleDateString('en-IN')}</td>
                                  <td>{formatCurrency(installment.amount)}</td>
                                  <td><span style={{ 
                                    padding: '0.25rem 0.5rem', 
                                    borderRadius: '0.25rem', 
                                    backgroundColor: installment.status === 'PAID' ? 'var(--success-light)' : installment.status === 'OVERDUE' ? 'var(--danger-light)' : 'var(--warning-light)', 
                                    color: installment.status === 'PAID' ? 'var(--success-dark)' : installment.status === 'OVERDUE' ? 'var(--danger-dark)' : 'var(--warning-dark)',
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                  }}>{installment.status}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Warranty Details */}
              {previewBill.warranties && previewBill.warranties.length > 0 && (
                <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                  <h4 style={{ marginBottom: '1rem' }}>Warranty Details</h4>
                  {previewBill.warranties.map((warranty) => (
                    <div key={warranty.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                      <h5 style={{ marginBottom: '0.5rem' }}>{warranty.product.name} ({warranty.product.partNumber})</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <p><strong>Warranty Type:</strong> {warranty.warrantyType}</p>
                        <p><strong>Start Date:</strong> {new Date(warranty.warrantyStartDate).toLocaleDateString('en-IN')}</p>
                        <p><strong>End Date:</strong> {new Date(warranty.warrantyEndDate).toLocaleDateString('en-IN')}</p>
                        {warranty.serialNumber && <p><strong>Serial #:</strong> {warranty.serialNumber}</p>}
                        {warranty.warrantyNotes && <p><strong>Notes:</strong> {warranty.warrantyNotes}</p>}
                        {warranty.warrantyTerms && <p><strong>Terms:</strong> {warranty.warrantyTerms}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Invoice Footer Details */}
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {business?.bankAccountInfo && (
                  <div>
                    <h5 style={{ marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Bank Details</h5>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.85rem' }}>{business.bankAccountInfo}</pre>
                  </div>
                )}
                
                {business?.termsAndConditions && (
                  <div>
                    <h5 style={{ marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Terms & Conditions</h5>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{business.termsAndConditions}</pre>
                  </div>
                )}
                
                <div style={{ marginTop: '1rem', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <h5 style={{ marginBottom: '0.5rem' }}>Authorized Signatory</h5>
                  <div style={{ fontSize: '1.2rem', fontFamily: 'cursive', color: 'var(--primary-main)', fontWeight: 600 }}>
                    {business?.signatureText || business?.businessName || 'Authorized Signatory'}
                  </div>
                </div>
                
                <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                  Thank you for your business!
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
