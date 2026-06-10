import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { Supplier, Product, PurchaseItemRequest } from '../types'
import './CreateBill.css'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)
}

export default function CreatePurchase() {
  const navigate = useNavigate()

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [supplierId, setSupplierId] = useState<number | ''>('')
  const [gstType, setGstType] = useState<'INCLUDED' | 'EXCLUDED'>('EXCLUDED')
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
  const [attachment, setAttachment] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // ✅ Load suppliers once
  useEffect(() => {
    api.getSuppliers()
      .then(setSuppliers)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  // ✅ Load products based on search
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

  // ➕ Add item
  const addItem = (p: Product) => {
    setItems([
      ...items,
      {
        productId: p.id,
        product: p,
        quantity: 1,
        price: p.price,
        gstPercent: p.gstPercent,
        discount: 0,
      },
    ])
    setSearch('')
    setShowDropdown(false)
  }

  const updateItem = (idx: number, field: string, value: number) => {
    const next = [...items]
    const item = next[idx] as typeof items[0]
    (item as Record<string, any>)[field] = value
    setItems(next)
  }

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  const subtotal = items.reduce((sum, i) => {
    return sum + (i.price * i.quantity - i.discount)
  }, 0)

  const gstAmount = items.reduce((sum, i) => {
    const line = i.price * i.quantity - i.discount
    if (gstType === 'INCLUDED') {
      const rate = i.gstPercent / 100
      return sum + (line * rate) / (1 + rate)
    }
    return sum + line * (i.gstPercent / 100)
  }, 0)

  const finalAmount =
    gstType === 'INCLUDED'
      ? subtotal - discount
      : subtotal + gstAmount - discount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supplierId || items.length === 0) {
      setError('Select supplier and add at least one item')
      return
    }

    setLoading(true)
    setError('')

    try {
      let attachmentPath = undefined
      if (attachment) {
        setUploading(true)
        attachmentPath = await api.uploadBillAttachment(attachment)
      }

      const purchaseItems: PurchaseItemRequest[] = items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.price,
        gstPercent: i.gstPercent,
        discount: i.discount,
      }))

      await api.createPurchase({
        supplierId: Number(supplierId),
        items: purchaseItems,
        discount,
        gstType,
        attachmentPath,
      })

      navigate('/purchases')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create purchase')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <div className="page">
      <h1>New Purchase</h1>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="create-bill-form">
        <div className="form-row">
          <div className="form-group">
            <label>Supplier</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value ? Number(e.target.value) : '')}
              required
            >
              <option value="">Select supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>GST Type</label>
            <select
              value={gstType}
              onChange={(e) => setGstType(e.target.value as 'INCLUDED' | 'EXCLUDED')}
            >
              <option value="INCLUDED">GST Included</option>
              <option value="EXCLUDED">GST Excluded</option>
            </select>
          </div>

          <div className="form-group">
            <label>Purchase Discount (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(+e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Purchase Bill (Photo/PDF)</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setAttachment(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <div className="bill-items-section">
          <div className="section-header">
            <h3>Purchase Items</h3>
          </div>

          <div className="product-search-container">
            <input
              type="search"
              placeholder="Search product to add..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => {
                if (products.length > 0) setShowDropdown(true)
              }}
              className="search-input"
              style={{ width: '100%' }}
            />
            
            {showDropdown && products.length > 0 && (
              <div className="search-results-dropdown">
                {products.map((p) => (
                  <div 
                    key={p.id} 
                    className="search-result-item"
                    onClick={() => addItem(p)}
                  >
                    <div className="result-info">
                      <span className="result-name">{p.name}</span>
                      <span className="result-part">{p.partNumber}</span>
                    </div>
                    <span className="result-price">{formatCurrency(p.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {productLoading && <p className="text-muted">Searching...</p>}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Cost Price</th>
                  <th>GST %</th>
                  <th>Discount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="item-product-info">
                        <strong>{item.product.name}</strong>
                        <div className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
                          {item.product.partNumber}
                        </div>
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', +e.target.value)}
                        style={{ width: 70 }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.price}
                        onChange={(e) => updateItem(idx, 'price', +e.target.value)}
                        style={{ width: 90 }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={item.gstPercent}
                        onChange={(e) => updateItem(idx, 'gstPercent', +e.target.value)}
                        style={{ width: 60 }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.discount}
                        onChange={(e) => updateItem(idx, 'discount', +e.target.value)}
                        style={{ width: 70 }}
                      />
                    </td>
                    <td>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeItem(idx)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '1rem' }}>Search products above to add to purchase</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bill-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>GST</span>
            <span>{formatCurrency(gstAmount)}</span>
          </div>
          <div className="summary-row">
            <span>Discount</span>
            <span>{formatCurrency(discount)}</span>
          </div>
          <div className="summary-row total">
            <span>Total Cost</span>
            <span>{formatCurrency(finalAmount)}</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/purchases')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
            {uploading ? 'Uploading...' : loading ? 'Processing...' : 'Complete Purchase'}
          </button>
        </div>
      </form>
    </div>
  )
}
