import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { Customer, Product, BillItemRequest, CustomerBalance, EMIDto, WarrantyItemDto } from '../types'
import BarcodeScanner from '../components/BarcodeScanner'
import { useAppSelector } from '../store/hooks'
import { selectConfiguration } from '../store/slices/authSlice'
import './CreateBill.css'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)
}

const EMI_TENURES = [3, 6, 9, 12, 18, 24, 36]
const WARRANTY_TYPES = [
  { value: 'NO_WARRANTY', label: 'No Warranty' },
  { value: 'MANUFACTURER', label: 'Manufacturer Warranty' },
  { value: 'SELLER', label: 'Seller Warranty' },
  { value: 'EXTENDED', label: 'Extended Warranty' },
  { value: 'CUSTOM', label: 'Custom Warranty' },
]

const WARRANTY_DURATIONS = [
  { days: 30, label: '30 Days' },
  { days: 90, label: '90 Days' },
  { days: 180, label: '6 Months' },
  { days: 365, label: '1 Year' },
  { days: 730, label: '2 Years' },
  { days: 1095, label: '3 Years' },
  { days: 1825, label: '5 Years' },
  { days: null, label: 'Custom' },
]

const STEPS = [
  { id: 'customer', label: 'Customer' },
  { id: 'products', label: 'Products' },
  { id: 'discounts', label: 'Discounts' },
  { id: 'payment', label: 'Payment Mode' },
  { id: 'warranty', label: 'Warranty' },
  { id: 'review', label: 'Review' },
]

export default function CreateBill() {
  const navigate = useNavigate()
  const config = useAppSelector(selectConfiguration)
  const hasModule = (key: string) => {
    if (!config || !config.modules) return false;
    return config.modules.some((m: any) => m.key === key && m.enabled);
  };
  const [currentStep, setCurrentStep] = useState(0)

  const [customers, setCustomers] = useState<Customer[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [customerId, setCustomerId] = useState<number | ''>('')
  const [customerPrices, setCustomerPrices] = useState<Record<string, number>>({})
  const [customerBalance, setCustomerBalance] = useState<CustomerBalance | null>(null)
  const [gstType, setGstType] = useState<'INCLUDED' | 'EXCLUDED'>('INCLUDED')
  const [discount, setDiscount] = useState(0)
  const [paidAmount, setPaidAmount] = useState(0)
  const [paymentMode, setPaymentMode] = useState<string>('FULL')
  const [emi, setEmi] = useState<EMIDto>({
    downPayment: 0,
    totalEmis: 12,
    interestRate: 0,
    processingFee: 0,
    firstEmiDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    emiNotes: ''
  })
  const [itemWarranties, setItemWarranties] = useState<Record<number, WarrantyItemDto>>({})

  const [items, setItems] = useState<Array<{
    productId: number
    product: Product
    quantity: number
    price: number
    gstPercent: number
    discount: number
    serialNumber?: string
  }>>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [productLoading, setProductLoading] = useState(false)

  // ✅ Load customers once
  useEffect(() => {
    api.getCustomers()
      .then(setCustomers)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  // ✅ Load ALL products once on mount
  useEffect(() => {
    setProductsLoading(true)
    setProductsError('')
    api.getProducts()
      .then((res: any) => {
        const list: Product[] = Array.isArray(res) ? res : (res?.content ?? [])
        setAllProducts(list)
        setProducts(list)
      })
      .catch((e) => setProductsError(e instanceof Error ? e.message : String(e)))
      .finally(() => setProductsLoading(false))
  }, [])

  // ✅ Filter products client-side as user types
  useEffect(() => {
    if (!search.trim()) {
      setProducts(allProducts)
      return
    }
    const q = search.toLowerCase()
    const filtered = allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.partNumber ?? '').toLowerCase().includes(q)
    )
    setProducts(filtered)
    // Also query API for thoroughness (e.g. barcode fields not in allProducts)
    const timer = setTimeout(() => {
      if (search.trim()) {
        setProductLoading(true)
        api.searchProducts(search.trim())
          .then((res: any) => {
            const apiList: Product[] = Array.isArray(res) ? res : (res?.content ?? [])
            setProducts((prev) => {
              const existingIds = new Set(prev.map((p) => p.id))
              const newItems = apiList.filter((p) => !existingIds.has(p.id))
              return newItems.length > 0 ? [...prev, ...newItems] : prev
            })
          })
          .catch(() => { /* silent — local filter already shows results */ })
          .finally(() => setProductLoading(false))
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search, allProducts])

  useEffect(() => {
    if (!customerId) {
      setCustomerPrices({})
      setCustomerBalance(null)
      return
    }

    api.getCustomerProductPrices(Number(customerId))
      .then(setCustomerPrices)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
    api.getCustomerBalance(Number(customerId))
      .then(setCustomerBalance)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [customerId])

  // ➕ Add item
  const addItem = (p: Product) => {
    if ((p.quantity ?? 0) <= 0) {
      setError(`⚠️ ${p.name} is out of stock and cannot be added.`)
      setTimeout(() => setError(''), 3000)
      return
    }
    // Check for duplicate — merge quantity instead of adding new line
    const existingIdx = items.findIndex((i) => i.productId === p.id)
    if (existingIdx !== -1) {
      const next = [...items]
      next[existingIdx] = { ...next[existingIdx], quantity: next[existingIdx].quantity + 1 }
      setItems(next)
      return
    }
    const customerPrice = customerPrices[String(p.id)]
    const newItem = {
      productId: p.id,
      product: p,
      quantity: 1,
      price: customerPrice ?? p.price,
      gstPercent: p.gstPercent,
      discount: 0,
    }
    setItems([...items, newItem])
    // Initialize warranty for this item
    setItemWarranties(prev => ({
      ...prev,
      [p.id]: {
        productId: p.id,
        serialNumber: '',
        modelNumber: p.partNumber,
        warrantyType: 'NO_WARRANTY',
        warrantyPeriodMonths: p.warrantyDays ? Math.floor(p.warrantyDays / 30) : undefined,
        warrantyStartDate: new Date().toISOString().split('T')[0],
        warrantyNotes: '',
        warrantyTerms: ''
      }
    }))
    // Don't clear search — user may want to add more products
  }

  const updateItem = (idx: number, field: string, value: number | string) => {
    const next = [...items]
    const item = next[idx]

    if (field === 'productId') {
      const p = products.find((x) => x.id === value)
      if (p) {
        item.productId = p.id
        item.product = p
        item.price = p.price
        item.gstPercent = p.gstPercent
      }
    } else {
      ;(item as unknown as Record<string, any>)[field] = value
    }

    setItems(next)
  }

  const removeItem = (idx: number) => {
    const removedItem = items[idx]
    setItems(items.filter((_, i) => i !== idx))
    // Remove warranty for this item
    setItemWarranties(prev => {
      const next = { ...prev }
      delete next[removedItem.productId]
      return next
    })
  }

  const grossTotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0)
  const lineDiscountTotal = items.reduce(
    (sum, i) => sum + (i.price * i.quantity * i.discount) / 100,
    0
  )

  const subtotal = grossTotal - lineDiscountTotal
  const percentDiscountAmount = (subtotal * discount) / 100
  const totalDiscount = lineDiscountTotal + percentDiscountAmount

  const gstAmount = items.reduce((sum, i) => {
    const lineBase = i.price * i.quantity
    const lineDiscount = (lineBase * i.discount) / 100
    const line = lineBase - lineDiscount

    if (gstType === 'INCLUDED') {
      const rate = i.gstPercent / 100
      return sum + (line * rate) / (1 + rate)
    }

    return sum + line * (i.gstPercent / 100)
  }, 0)

  const finalAmount =
    gstType === 'INCLUDED'
      ? subtotal - percentDiscountAmount
      : subtotal + gstAmount - percentDiscountAmount
  const previousRemaining = customerBalance?.remainingAmount ?? 0
  const remainingAfterBill = previousRemaining + finalAmount - paidAmount

  // Calculate EMI values
  const loanAmount = Math.max(0, finalAmount - emi.downPayment)
  const monthlyEMI = (() => {
    if (emi.interestRate && emi.interestRate > 0 && loanAmount > 0) {
      const monthlyRate = emi.interestRate / (12 * 100)
      if (monthlyRate > 0) {
        return (
          loanAmount *
          monthlyRate *
          Math.pow(1 + monthlyRate, emi.totalEmis) /
          (Math.pow(1 + monthlyRate, emi.totalEmis) - 1)
        )
      }
    }
    return loanAmount > 0 ? loanAmount / emi.totalEmis : 0
  })()

  const totalAmountPayable = monthlyEMI * emi.totalEmis + (emi.processingFee || 0)

  // Step navigation
  const nextStep = () => setCurrentStep(Math.min(currentStep + 1, STEPS.length - 1))
  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 0))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerId || items.length === 0) {
      setError('Select customer and add at least one item')
      return
    }

    setLoading(true)
    setError('')

    try {
      const billItems: BillItemRequest[] = items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price,
        gstPercent: i.gstPercent,
        discount: (i.price * i.quantity * i.discount) / 100,
        serialNumber: i.serialNumber,
      }))

      // Prepare warranties
      const billWarranties = items.map(item => {
        const itemWarranty = itemWarranties[item.productId]
        return {
          productId: item.productId,
          serialNumber: item.serialNumber,
          modelNumber: item.product.partNumber,
          warrantyType: itemWarranty?.warrantyType || 'NO_WARRANTY',
          warrantyPeriodMonths: itemWarranty?.warrantyPeriodMonths,
          warrantyStartDate: itemWarranty?.warrantyStartDate,
          warrantyNotes: itemWarranty?.warrantyNotes || '',
          warrantyTerms: itemWarranty?.warrantyTerms || ''
        }
      })

      // Optimistic navigation
      api.createBill({
        customerId: Number(customerId),
        items: billItems,
        discount,
        gstType,
        paidAmount,
        paymentMode,
        emi: paymentMode === 'EMI' ? emi : undefined,
        warranties: billWarranties
      }).catch(err => {
         console.error('Failed to create bill:', err)
         alert('Failed to create bill: ' + (err instanceof Error ? err.message : 'Unknown error'))
      })

      navigate('/bills')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bill')
    }
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Customer
        return (
          <div className="form-section">
            <div className="form-group">
              <label>Customer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : '')}
                required
                className="form-control"
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.phone}
                  </option>
                ))}
              </select>
            </div>
            {customerId && customerBalance && (
              <div className="summary-box">
                <div className="summary-row">
                  <span>Total Billed:</span>
                  <span>{formatCurrency(customerBalance.totalBilled)}</span>
                </div>
                <div className="summary-row">
                  <span>Total Paid:</span>
                  <span>{formatCurrency(customerBalance.totalPaid)}</span>
                </div>
                <div className="summary-row total">
                  <span>Remaining:</span>
                  <span>{formatCurrency(customerBalance.remainingAmount)}</span>
                </div>
              </div>
            )}
          </div>
        )
      case 1: // Products
        return (
          <>
            <div className="product-search-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Add Products {!productsLoading && allProducts.length > 0 && (
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
                      — {products.length} of {allProducts.length} shown
                    </span>
                  )}
                </label>
                <button 
                  type="button" 
                  onClick={() => setShowScanner(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}
                >
                  📷 Scan Barcode
                </button>
              </div>
              
              <input
                type="search"
                placeholder="Search by name, part number, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control"
                style={{ width: '100%' }}
              />
              
              {showScanner && (
                <BarcodeScanner 
                  onScan={(text) => {
                    setSearch(text);
                    setShowScanner(false);
                  }} 
                  onClose={() => setShowScanner(false)} 
                />
              )}

              {/* Product list area */}
              {productsLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <div className="spinner" style={{ margin: '0 auto 0.75rem' }} />
                  Loading products...
                </div>
              ) : productsError ? (
                <div style={{ 
                  padding: '1rem', marginTop: '0.75rem', borderRadius: '8px',
                  background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c'
                }}>
                  <div style={{ marginBottom: '0.75rem' }}>⚠️ {productsError}</div>
                  <button
                    type="button"
                    onClick={() => {
                      setProductsLoading(true)
                      setProductsError('')
                      api.getProducts()
                        .then((res: any) => {
                          const list: Product[] = Array.isArray(res) ? res : (res?.content ?? [])
                          setAllProducts(list)
                          setProducts(list)
                        })
                        .catch((e) => setProductsError(e instanceof Error ? e.message : String(e)))
                        .finally(() => setProductsLoading(false))
                    }}
                    className="btn btn-sm"
                    style={{ background: '#b91c1c', color: '#fff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    🔄 Retry
                  </button>
                </div>
              ) : allProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No products found</div>
                  <div style={{ fontSize: '0.8rem' }}>Add products in the Products module first.</div>
                </div>
              ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                  <div>No products match "{search}"</div>
                </div>
              ) : (
                <div className="product-dropdown" style={{ 
                  display: 'block', position: 'relative', 
                  maxHeight: '320px', overflowY: 'auto',
                  border: '1px solid var(--border)', borderRadius: '8px',
                  marginTop: '0.5rem'
                }}>
                  {products.map((p) => {
                    const outOfStock = (p.quantity ?? 0) <= 0
                    const price = customerPrices[String(p.id)] ?? p.price
                    return (
                      <div 
                        key={p.id} 
                        className="product-option"
                        onClick={() => !outOfStock && addItem(p)}
                        style={{ 
                          opacity: outOfStock ? 0.55 : 1, 
                          cursor: outOfStock ? 'not-allowed' : 'pointer',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '0.6rem 1rem'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {p.name}
                            {outOfStock && (
                              <span style={{ 
                                fontSize: '0.65rem', background: '#fee2e2', color: '#b91c1c',
                                padding: '1px 5px', borderRadius: '4px', fontWeight: 700
                              }}>OUT OF STOCK</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '12px', marginTop: '2px' }}>
                            {p.partNumber && <span>SKU: {p.partNumber}</span>}
                            <span style={{ 
                              color: outOfStock ? '#b91c1c' : (p.quantity ?? 0) < 5 ? '#d97706' : '#16a34a',
                              fontWeight: 600
                            }}>
                              Stock: {p.quantity ?? 0}
                            </span>
                            {(p.gstPercent ?? 0) > 0 && <span>GST: {p.gstPercent}%</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.75rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.95rem' }}>
                            {formatCurrency(price)}
                          </div>
                          {customerPrices[String(p.id)] !== undefined && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Special price</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {productLoading && <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>🔍 Fetching more...</p>}
            </div>

            <table className="items-table">
              <thead>
                <tr>
                  <th>Product Details</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'center' }}>GST %</th>
                  <th style={{ textAlign: 'center' }}>Discount %</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const lineTotal = item.price * item.quantity
                  const lineDiscount = (lineTotal * item.discount) / 100
                  const taxable = lineTotal - lineDiscount
                  let lineFinal = taxable
                  if (gstType === 'EXCLUDED') {
                    lineFinal = taxable * (1 + item.gstPercent / 100)
                  }

                  return (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.product.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.product.partNumber}</div>
                        {item.product.requiresSerialNumber && (
                          <input
                            type="text"
                            placeholder="Enter Serial No."
                            value={item.serialNumber || ''}
                            onChange={(e) => updateItem(idx, 'serialNumber', e.target.value)}
                            className="form-control"
                            style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
                          />
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', +e.target.value)}
                          className="form-control"
                          style={{ width: 80, textAlign: 'center' }}
                        />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.price}
                          onChange={(e) => updateItem(idx, 'price', +e.target.value)}
                          className="form-control"
                          style={{ width: 110, textAlign: 'right' }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={item.gstPercent}
                          onChange={(e) => updateItem(idx, 'gstPercent', +e.target.value)}
                          className="form-control"
                          style={{ width: 70, textAlign: 'center' }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.discount}
                          onChange={(e) => updateItem(idx, 'discount', +e.target.value)}
                          className="form-control"
                          style={{ width: 70, textAlign: 'center' }}
                        />
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatCurrency(lineFinal)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => removeItem(idx)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        )
      case 2: // Discounts
        return (
          <div className="form-section">
            <div className="form-group">
              <label>GST Type</label>
              <select
                value={gstType}
                onChange={(e) => setGstType(e.target.value as 'INCLUDED' | 'EXCLUDED')}
                className="form-control"
              >
                <option value="INCLUDED">GST Included</option>
                <option value="EXCLUDED">GST Excluded</option>
              </select>
            </div>

            <div className="form-group">
              <label>Overall Discount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(+e.target.value)}
                className="form-control"
              />
            </div>

            <div className="bill-summary">
              <div className="summary-box">
                <div className="summary-row">
                  <span>Gross Total:</span>
                  <span>{formatCurrency(grossTotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Total Discount:</span>
                  <span>-{formatCurrency(totalDiscount)}</span>
                </div>
                <div className="summary-row">
                  <span>Taxable Amount:</span>
                  <span>{formatCurrency(subtotal - percentDiscountAmount)}</span>
                </div>
                <div className="summary-row">
                  <span>GST ({gstType === 'INCLUDED' ? 'Incl.' : 'Excl.'}):</span>
                  <span>{formatCurrency(gstAmount)}</span>
                </div>
                <div className="summary-row total">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(finalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        )
      case 3: // Payment Mode
        return (
          <div className="form-section">
            <div className="form-group">
              <label>Payment Mode</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="paymentMode"
                    value="FULL"
                    checked={paymentMode === 'FULL'}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  />
                  Full Payment
                </label>
                {hasModule('emi') && (
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="paymentMode"
                      value="EMI"
                      checked={paymentMode === 'EMI'}
                      onChange={(e) => {
                        setPaymentMode('EMI')
                        setEmi(prev => ({ ...prev, downPayment: Math.min(finalAmount * 0.2, finalAmount) }))
                      }}
                    />
                    EMI
                  </label>
                )}
              </div>
            </div>

            {paymentMode === 'FULL' && (
              <div className="form-group">
                <label>Paid Now (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(+e.target.value)}
                  className="form-control"
                />
              </div>
            )}

            {paymentMode === 'EMI' && (
              <div className="emi-section" style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                <div className="form-group">
                  <label>Down Payment (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={emi.downPayment}
                    onChange={(e) => setEmi({ ...emi, downPayment: +e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="summary-row" style={{ padding: '0.75rem', background: 'var(--bg)', borderRadius: '0.25rem', marginBottom: '1rem' }}>
                  <span>Loan Amount:</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(loanAmount)}</span>
                </div>

                <div className="form-group">
                  <label>EMI Tenure</label>
                  <select
                    value={emi.totalEmis}
                    onChange={(e) => setEmi({ ...emi, totalEmis: +e.target.value })}
                    className="form-control"
                  >
                    {EMI_TENURES.map(months => (
                      <option key={months} value={months}>{months} Months</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Interest Rate (%) (Optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={emi.interestRate}
                    onChange={(e) => setEmi({ ...emi, interestRate: +e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>First EMI Date</label>
                  <input
                    type="date"
                    value={emi.firstEmiDate}
                    onChange={(e) => setEmi({ ...emi, firstEmiDate: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="summary-row" style={{ padding: '0.75rem', background: 'var(--bg)', borderRadius: '0.25rem', marginBottom: '1rem' }}>
                  <span>Monthly EMI Amount:</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(monthlyEMI)}</span>
                </div>

                <div className="form-group">
                  <label>Processing Fee (₹) (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={emi.processingFee}
                    onChange={(e) => setEmi({ ...emi, processingFee: +e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="summary-row" style={{ padding: '0.75rem', background: 'var(--accent-light)', borderRadius: '0.25rem', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 600 }}>Total Amount Payable:</span>
                  <span style={{ fontWeight: 600 }}>{formatCurrency(totalAmountPayable)}</span>
                </div>

                <div className="form-group">
                  <label>EMI Notes (Optional)</label>
                  <textarea
                    value={emi.emiNotes}
                    onChange={(e) => setEmi({ ...emi, emiNotes: e.target.value })}
                    className="form-control"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
        )
      case 4: // Warranty
        if (!hasModule('warranty')) return null;
        return (
          <div className="item-warranty-section">
            <h3 style={{ marginBottom: '1rem' }}>Product Warranties</h3>
            {items.length === 0 ? (
              <p className="text-muted">Add products to configure warranties</p>
            ) : (
              items.map((item, idx) => {
                const warranty = itemWarranties[item.productId]
                return (
                  <div key={item.productId} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.75rem' }}>
                      {item.product.name} ({item.product.partNumber})
                    </div>

                    <div className="form-group">
                      <label>Warranty Type</label>
                      <select
                        value={warranty?.warrantyType || 'NO_WARRANTY'}
                        onChange={(e) => setItemWarranties(prev => ({
                          ...prev,
                          [item.productId]: { ...prev[item.productId], warrantyType: e.target.value }
                        }))}
                        className="form-control"
                      >
                        {WARRANTY_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>

                    {warranty?.warrantyType !== 'NO_WARRANTY' && (
                      <>
                        <div className="form-group">
                          <label>Warranty Duration</label>
                          <select
                            value={warranty?.warrantyPeriodMonths ? Math.floor(warranty.warrantyPeriodMonths * 30) : 'custom'}
                            onChange={(e) => {
                              const days = e.target.value === 'custom' ? null : +e.target.value
                              setItemWarranties(prev => ({
                                ...prev,
                                [item.productId]: { 
                                  ...prev[item.productId], 
                                  warrantyPeriodMonths: days ? Math.floor(days / 30) : undefined 
                                }
                              }))
                            }}
                            className="form-control"
                          >
                            {WARRANTY_DURATIONS.map(dur => (
                              <option key={dur.days || 'custom'} value={dur.days || 'custom'}>{dur.label}</option>
                            ))}
                          </select>
                        </div>

                        {!warranty?.warrantyPeriodMonths && (
                          <div className="form-group">
                            <label>Custom Duration (Months)</label>
                            <input
                              type="number"
                              min="1"
                              value={warranty?.warrantyPeriodMonths || ''}
                              onChange={(e) => setItemWarranties(prev => ({
                                ...prev,
                                [item.productId]: { 
                                  ...prev[item.productId], 
                                  warrantyPeriodMonths: +e.target.value 
                                }
                              }))}
                              className="form-control"
                            />
                          </div>
                        )}

                        <div className="form-group">
                          <label>Warranty Start Date</label>
                          <input
                            type="date"
                            value={warranty?.warrantyStartDate || new Date().toISOString().split('T')[0]}
                            onChange={(e) => setItemWarranties(prev => ({
                              ...prev,
                              [item.productId]: { ...prev[item.productId], warrantyStartDate: e.target.value }
                            }))}
                            className="form-control"
                          />
                        </div>

                        {warranty?.warrantyStartDate && warranty?.warrantyPeriodMonths && (
                          <div className="summary-row" style={{ padding: '0.5rem', background: 'var(--bg)', borderRadius: '0.25rem', marginBottom: '0.75rem' }}>
                            <span>Warranty End Date:</span>
                            <span style={{ fontWeight: 600 }}>
                              {(() => {
                                const startDate = new Date(warranty.warrantyStartDate);
                                startDate.setMonth(startDate.getMonth() + warranty.warrantyPeriodMonths);
                                return startDate.toISOString().split('T')[0];
                              })()}
                            </span>
                          </div>
                        )}

                        <div className="form-group">
                          <label>Warranty Notes (Optional)</label>
                          <textarea
                            value={warranty?.warrantyNotes || ''}
                            onChange={(e) => setItemWarranties(prev => ({
                              ...prev,
                              [item.productId]: { ...prev[item.productId], warrantyNotes: e.target.value }
                            }))}
                            className="form-control"
                            rows={2}
                          />
                        </div>

                        <div className="form-group">
                          <label>Warranty Terms (Optional)</label>
                          <textarea
                            value={warranty?.warrantyTerms || ''}
                            onChange={(e) => setItemWarranties(prev => ({
                              ...prev,
                              [item.productId]: { ...prev[item.productId], warrantyTerms: e.target.value }
                            }))}
                            className="form-control"
                            rows={2}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )
      case 5: // Review
        return (
          <div className="form-section">
            <h3 style={{ marginBottom: '1rem' }}>Review Bill</h3>
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Customer</h4>
              {customers.find(c => c.id === customerId) && (
                <div>
                  <div style={{ fontWeight: 600 }}>{customers.find(c => c.id === customerId)?.name}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{customers.find(c => c.id === customerId)?.phone}</div>
                </div>
              )}
            </div>

            <h4 style={{ marginBottom: '0.75rem' }}>Products</h4>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const lineTotal = item.price * item.quantity
                  const lineDiscount = (lineTotal * item.discount) / 100
                  const taxable = lineTotal - lineDiscount
                  let lineFinal = taxable
                  if (gstType === 'EXCLUDED') {
                    lineFinal = taxable * (1 + item.gstPercent / 100)
                  }
                  return (
                    <tr key={idx}>
                      <td>{item.product.name}</td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(lineFinal)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="bill-summary" style={{ marginTop: '1.5rem' }}>
              <div className="summary-box">
                <div className="summary-row">
                  <span>Gross Total:</span>
                  <span>{formatCurrency(grossTotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Total Discount:</span>
                  <span>-{formatCurrency(totalDiscount)}</span>
                </div>
                <div className="summary-row">
                  <span>GST:</span>
                  <span>{formatCurrency(gstAmount)}</span>
                </div>
                <div className="summary-row total">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(finalAmount)}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Payment Mode</h4>
              <div style={{ fontWeight: 600 }}>{paymentMode === 'FULL' ? 'Full Payment' : 'EMI'}</div>
              {paymentMode === 'EMI' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div>Down Payment: {formatCurrency(emi.downPayment)}</div>
                  <div>Loan Amount: {formatCurrency(loanAmount)}</div>
                  <div>Tenure: {emi.totalEmis} months</div>
                  <div>Monthly EMI: {formatCurrency(monthlyEMI)}</div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Warranties</h4>
              {items.length === 0 ? (
                <p className="text-muted">No products</p>
              ) : (
                items.map(item => {
                  const warranty = itemWarranties[item.productId]
                  return (
                    <div key={item.productId} style={{ marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{item.product.name}</div>
                      <div style={{ color: 'var(--text-muted)' }}>
                        {warranty?.warrantyType === 'NO_WARRANTY' ? 'No Warranty' : warranty?.warrantyType}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="create-bill-container">
      <div className="create-bill-header">
        <h1>Create Bill</h1>
      </div>

      {/* Step Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', padding: '0 1rem' }}>
        {STEPS.map((step, idx) => (
          <div key={step.id} style={{ flex: 1, textAlign: 'center' }}>
            <div 
              style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 0.5rem auto',
                background: idx <= currentStep ? 'var(--accent)' : 'var(--bg-secondary)',
                color: idx <= currentStep ? 'white' : 'var(--text-muted)',
                fontWeight: 600
              }}
            >
              {idx + 1}
            </div>
            <div style={{ fontSize: '0.875rem', color: idx <= currentStep ? 'var(--text)' : 'var(--text-muted)' }}>
              {step.label}
            </div>
          </div>
        ))}
      </div>

      {error && <div className="error">{error}</div>}

      <div className="create-bill-card">
        <form onSubmit={handleSubmit}>
          {renderStepContent()}

          <div className="create-bill-footer" style={{ marginTop: '2rem' }}>
            {currentStep > 0 && (
              <button type="button" className="btn btn-ghost" onClick={prevStep}>
                Previous
              </button>
            )}
            {currentStep < STEPS.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Next
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating Bill...' : 'Generate Invoice'}
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/bills')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
