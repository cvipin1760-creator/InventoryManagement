import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Customer } from '../types'
import './Customers.css'

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [form, setForm] = useState({ name: '', phone: '', address: '' })

  const load = () => {
    setLoading(true)
    if (search.trim()) {
      api.searchCustomers(search.trim()).then(setCustomers).catch((e) => setError(e instanceof Error ? e.message : String(e))).finally(() => setLoading(false))
    } else {
      api.getCustomers().then(setCustomers).catch((e) => setError(e instanceof Error ? e.message : String(e))).finally(() => setLoading(false))
    }
  }

  useEffect(() => {
    load()
  }, [search])

  const openAdd = () => {
    setForm({ name: '', phone: '', address: '' })
    setEditing(null)
    setModal('add')
  }

  const openEdit = (c: Customer) => {
    setForm({ name: c.name, phone: c.phone, address: c.address || '' })
    setEditing(c)
    setModal('edit')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        await api.updateCustomer(editing.id, form)
      } else {
        await api.createCustomer(form)
      }
      setModal(null)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this customer?')) return
    try {
      await api.deleteCustomer(id)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Customers</h1>
        <div className="page-actions">
          <input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="button" className="btn btn-primary" onClick={openAdd}>
            Add Customer
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
                <th>Address</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.address || '-'}</td>
                  <td>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                    <button type="button" className="btn btn-ghost btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
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
            <h2>{editing ? 'Edit Customer' : 'Add Customer'}</h2>
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
