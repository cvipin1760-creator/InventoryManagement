import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Supplier } from '../types'
import './Customers.css' // Reusing Customers.css

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' })

  const load = () => {
    setLoading(true)
    if (search.trim()) {
      api.searchSuppliers(search.trim()).then(setSuppliers).catch((e) => setError(e instanceof Error ? e.message : String(e))).finally(() => setLoading(false))
    } else {
      api.getSuppliers().then(setSuppliers).catch((e) => setError(e instanceof Error ? e.message : String(e))).finally(() => setLoading(false))
    }
  }

  useEffect(() => {
    load()
  }, [search])

  const openAdd = () => {
    setForm({ name: '', phone: '', email: '', address: '' })
    setEditing(null)
    setModal('add')
  }

  const openEdit = (s: Supplier) => {
    setForm({ name: s.name, phone: s.phone, email: s.email || '', address: s.address || '' })
    setEditing(s)
    setModal('edit')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.updateSupplier(editing.id, form)
      } else {
        await api.createSupplier(form)
      }
      setModal(null)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this supplier?')) return
    try {
      await api.deleteSupplier(id)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Suppliers</h1>
        <div className="page-actions">
          <input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="button" className="btn btn-primary" onClick={openAdd}>
            Add Supplier
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
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.phone}</td>
                  <td>{s.email || '-'}</td>
                  <td>{s.address || '-'}</td>
                  <td>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>Edit</button>
                    <button type="button" className="btn btn-ghost btn-sm btn-danger" onClick={() => handleDelete(s.id)}>Delete</button>
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
            <h2>{editing ? 'Edit Supplier' : 'Add Supplier'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
