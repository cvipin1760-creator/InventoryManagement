import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Customer, Product, BillItemRequest, Bill } from '../types'
import './EditBill.css'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)
}

export default function EditBill() {
  const navigate = useNavigate()
  const { id } = useParams()
  const billId = Number(id)

  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [customerId, setCustomerId] = useState<number | ''>('')
  const [customerPrices, setCustomerPrices] = useState<Record<string, number>>({})
  const [gstType, setGstType] = useState<'INCLUDED' | 'EXCLUDED'>('INCLUDED')
  const [discount, setDiscount] = useState(0)

  const [items, setItems] = useState<Array<{
    productId: number
    product: Product
    quantity: number
    price: number
    gstPercent: number
    discount: number
  }>>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [productLoading, setProductLoading] = useState(false)

  useEffect(() => {
    api.getCustomers()
      .then(setCustomers)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  const loadProducts = () => {
    if (!search.trim()) {
      setProducts([])
      setShowDropdown(false)
      return
    }
    setProductLoading(true)
    api.searchProducts(search.trim())
      .then((res) => {
        setProducts(res)
        setShowDropdown(true)
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setProductLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        loadProducts()
      } else {
        setProducts([])
        setShowDropdown(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (!customerId) {
      setCustomerPrices({})
      return
    }

    api.getCustomerProductPrices(Number(customerId))
      .then(setCustomerPrices)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [customerId])

  useEffect(() => {
    api.getBill(billId)
      .then((b: Bill) => {
        setCustomerId(b.customer.id)
        setGstType(b.gstType as 'INCLUDED' | 'EXCLUDED')
        setDiscount(b.discount)
        const mapped = (b.items || []).map((it) => {
          const base = it.price * it.quantity
          const pct = base > 0 ? (it.discount / base) * 100 : 0
          return {
            productId: it.product.id,
            product: it.product,
            quantity: it.quantity,
            price: it.price,
            gstPercent: it.gstPercent,
            discount: +pct.toFixed(2),
          }
        })
        setItems(mapped)
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [billId])

  const addItem = (p: Product) => {
    const customerPrice = customerPrices[String(p.id)]
    setItems([
      ...items,
      {
        productId: p.id,
        product: p,
        quantity: 1,
        price: customerPrice ?? p.price,
        gstPercent: p.gstPercent,
        discount: 0,
      },
    ])
    setSearch('')
    setShowDropdown(false)
  }

  const updateItem = (idx: number, field: string, value: number) => {
    const next = [...items]
    const item = next[idx]
    ;(item as unknown as Record<string, number>)[field] = value
    setItems(next)
  }

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx))
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
      }))
      await api.updateBill(billId, {
        customerId: Number(customerId),
        items: billItems,
        discount,
        gstType,
        paymentMode: 'FULL', // Default to FULL for existing bills
      })
      navigate('/bills')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bill')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="edit-bill-container">
      <div className="edit-bill-header">
        <h1>Edit Bill</h1>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <div className="edit-bill-card">
        <form onSubmit={handleSubmit}>
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
              <label>Discount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(+e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          <div className="product-search-section">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Add Products
            </label>
            <input
              type="search"
              placeholder="Search product by name or part number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => {
                if (products.length > 0) setShowDropdown(true)
              }}
              className="form-control"
              style={{ width: '100%' }}
            />
            {showDropdown && products.length > 0 && (
              <div className="product-dropdown">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="product-option"
                    onClick={() => addItem(p)}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.partNumber}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, color: 'var(--accent)' }}>
                        {formatCurrency(customerPrices[String(p.id)] ?? p.price)}
                      </div>
                      {customerPrices[String(p.id)] !== undefined && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Customer price</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {productLoading && <p className="text-muted">Searching...</p>}
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

          <div className="edit-bill-footer">
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/bills')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating Bill...' : 'Update Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
