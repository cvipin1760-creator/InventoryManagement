import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import type { Product } from '../types'
import BarcodeScanner from '../components/BarcodeScanner'
import { ScanBarcode, Brain } from 'lucide-react'
import './Products.css'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)
}

export default function Products() {
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const lowStockOnly = searchParams.get('lowStock') === '1'
  const [search, setSearch] = useState('')
  
  const { data = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['products', lowStockOnly, search],
    queryFn: () => {
      if (lowStockOnly) return api.getLowStockProducts();
      if (search.trim()) return api.searchProducts(search.trim());
      return api.getProducts();
    }
  })
  
  const products: Product[] = Array.isArray(data) ? data : (data?.content || data?._embedded?.products || []);
  
  const [modal, setModal] = useState<'add' | 'edit' | 'bulk' | null>(null)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<any>({})
  const [uploading, setUploading] = useState(false)
  const [excelLoading, setExcelLoading] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [visibleCosts, setVisibleCosts] = useState<{[key:number]: boolean}>({})
  
  const toggleCost = (id: number) => {
    setVisibleCosts(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const [modalError, setModalError] = useState('')
  const error = queryError ? (queryError instanceof Error ? queryError.message : String(queryError)) : modalError;

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createProduct(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    onError: (err) => setModalError(err instanceof Error ? err.message : 'Failed to create')
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => api.updateProduct(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    onError: (err) => setModalError(err instanceof Error ? err.message : 'Failed to update')
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    onError: (err) => setModalError(err instanceof Error ? err.message : 'Failed to delete')
  })

  const openAdd = () => {
    setForm({
      name: '',
      partNumber: '',
      costPrice: 0,
      price: 0,
      gstPercent: 18,
      quantity: 0,
      lowStockThreshold: 10,
      attachmentPath: '',
    })
    setAttachment(null)
    setEditing(null)
    setModal('add')
  }

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      partNumber: p.partNumber,
      costPrice: p.costPrice,
      price: p.price,
      gstPercent: p.gstPercent,
      quantity: p.quantity,
      lowStockThreshold: p.lowStockThreshold,
      attachmentPath: p.attachmentPath || '',
    })
    setAttachment(null)
    setEditing(p)
    setModal('edit')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setModalError('')
    try {
      let attachmentPath = form.attachmentPath
      if (attachment) {
        attachmentPath = await api.uploadBillAttachment(attachment)
      }

      const data = { ...form, attachmentPath }

      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data })
      } else {
        await createMutation.mutateAsync(data)
      }
      
      setModal(null)
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return
    setModalError('')
    try {
      await deleteMutation.mutateAsync(id)
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed')
    }
  }

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setExcelLoading(true)
    setModalError('')
    api.uploadExcel(file)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ['products'] })
        e.target.value = ''
      })
      .catch((err) => setModalError(err instanceof Error ? err.message : String(err)))
      .finally(() => setExcelLoading(false))
  }

  const confirmBulkProducts = async () => {
    setUploading(true)
    setModalError('')
    try {
      const listToAdd = parseBulkText(bulkText)
      for (const p of listToAdd) {
        await api.createProduct({
          name: p.name,
          partNumber: p.partNumber,
          costPrice: p.costPrice,
          price: p.costPrice * 1.2, // Default 20% margin
          gstPercent: p.gstPercent,
          quantity: p.quantity,
          lowStockThreshold: 5,
        })
      }
      setModal(null)
      setBulkText('')
      queryClient.invalidateQueries({ queryKey: ['products'] })
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to add products')
    } finally {
      setUploading(false)
    }
  }

  const parseBulkText = (text: string) => {
    return text.split('\n').filter(line => line.trim()).map(line => {
      const parts = line.split(/[,|\t]/);
      return {
        name: parts[0]?.trim() || 'New Product',
        partNumber: parts[1]?.trim() || 'PN-' + Date.now(),
        costPrice: parseFloat(parts[2]) || 0,
        gstPercent: parseFloat(parts[3]) || 18,
        quantity: parseInt(parts[4]) || 0
      }
    });
  }

  const handleExcelExport = () => {
    setExcelLoading(true)
    api.exportExcel().finally(() => setExcelLoading(false))
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Products {lowStockOnly && '(Low Stock)'}</h1>
        <div className="page-actions">
          {!lowStockOnly && (
            <>
              <input
                type="search"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsScanning(true)}
                title="Scan Barcode"
                style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ScanBarcode size={20} />
              </button>
              <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                {excelLoading ? 'Uploading...' : 'Import Excel'}
                <input type="file" accept=".xlsx,.xls" hidden onChange={handleExcelUpload} />
              </label>
              <button type="button" className="btn btn-secondary" onClick={handleExcelExport} disabled={excelLoading}>
                Export Excel
              </button>
            </>
          )}
          <button type="button" className="btn btn-primary" onClick={openAdd}>
            Add Product
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setModal('bulk')}>
            Bulk Add
          </button>
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
                <th>Name</th>
                <th>Part #</th>
                <th>Cost</th>
                <th>Selling</th>
                <th>CP=SP?</th>
                <th>GST %</th>
                <th>Qty</th>
                <th>Low Stock</th>
                <th>Bill</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p.id} className={p.quantity <= p.lowStockThreshold ? 'low-stock' : ''}>
                  <td>{p.name}</td>
                  <td>{p.partNumber}</td>
                  <td>
                    <div 
                      onClick={() => toggleCost(p.id)} 
                      style={{ cursor: 'pointer', fontFamily: visibleCosts[p.id] ? 'inherit' : 'monospace' }}
                      title="Click to reveal/hide cost"
                    >
                      {visibleCosts[p.id] ? formatCurrency(p.costPrice) : '••••••'}
                    </div>
                  </td>
                  <td>{formatCurrency(p.price)}</td>
                  <td style={{ textAlign: 'center' }}>
                    {p.costPrice === p.price ? '✓' : ''}
                  </td>
                  <td>{p.gstPercent}%</td>
                  <td>
                    {p.quantity}
                    {p.quantity <= p.lowStockThreshold && (
                      <span title="Low stock, restock recommended" style={{ marginLeft: '8px', color: '#d97706' }}>
                        <Brain size={16} />
                      </span>
                    )}
                  </td>
                  <td>{p.lowStockThreshold}</td>
                  <td>
                    {p.attachmentPath ? (
                      <a href={`/api/bills/attachments/${p.attachmentPath}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">View</a>
                    ) : '-'}
                  </td>
                  <td>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    <button type="button" className="btn btn-ghost btn-sm btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {modal === 'bulk' ? (
              <>
                <h2>Bulk Add Products</h2>
                <p>Paste products below (Format: Name, Part#, Cost, GST%, Qty)</p>
                <textarea 
                  className="form-control" 
                  style={{ width: '100%', height: '200px', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  placeholder="Example: Brake Pad, BP-001, 500, 18, 10"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                />
                <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                  <button type="button" className="btn btn-primary" onClick={confirmBulkProducts} disabled={!bulkText.trim()}>
                    Add All Items
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Name</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Part Number</label>
                    <input value={form.partNumber} onChange={(e) => setForm({ ...form, partNumber: e.target.value })} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Cost Price</label>
                      <input type="number" step="0.01" min="0" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: +e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Selling Price</label>
                      <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} required />
                      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'normal' }}>
                          <input 
                            type="checkbox" 
                            checked={form.price === form.costPrice} 
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm({ ...form, price: form.costPrice })
                              }
                            }}
                          />
                          Same as Cost Price?
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>GST %</label>
                    <input type="number" step="0.1" min="0" value={form.gstPercent} onChange={(e) => setForm({ ...form, gstPercent: +e.target.value })} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Quantity</label>
                      <input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Low Stock Threshold</label>
                      <input type="number" min="0" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: +e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Warranty Days</label>
                      <input type="number" min="0" value={form.warrantyDays || 0} onChange={(e) => setForm({ ...form, warrantyDays: +e.target.value })} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={form.requiresSerialNumber || false} 
                          onChange={(e) => setForm({ ...form, requiresSerialNumber: e.target.checked })}
                        />
                        Requires Serial Number?
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Upload Purchase Bill (Photo/PDF)</label>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Save'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
      
      {isScanning && (
        <BarcodeScanner 
          onScan={(code) => setSearch(code)} 
          onClose={() => setIsScanning(false)} 
        />
      )}
    </div>
  )
}
