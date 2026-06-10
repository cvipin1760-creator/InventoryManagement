import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function Users() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    api.getUsers()
      .then(setUsers)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: number, username: string) => {
    if (username === 'admin') {
      alert('Cannot delete the main admin account')
      return
    }
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) return
    
    try {
      await api.deleteUser(id)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  const handleToggleRole = async (id: number, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
    try {
      await api.updateUserRole(id, newRole)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await api.updateUserStatus(id, !currentStatus)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>User Management</h1>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.email || '-'}</td>
                  <td>
                    <button 
                      className={`badge ${u.role === 'ADMIN' ? 'badge-primary' : 'badge-secondary'}`}
                      style={{ cursor: u.username === 'admin' ? 'default' : 'pointer', border: 'none' }}
                      onClick={() => u.username !== 'admin' && handleToggleRole(u.id, u.role)}
                      title={u.username === 'admin' ? '' : 'Click to change role'}
                    >
                      {u.role}
                    </button>
                  </td>
                  <td>
                    <button 
                      className={`badge ${u.enabled ? 'badge-success' : 'badge-danger'}`}
                      style={{ cursor: u.username === 'admin' ? 'default' : 'pointer', border: 'none' }}
                      onClick={() => u.username !== 'admin' && handleToggleStatus(u.id, u.enabled)}
                      title={u.username === 'admin' ? '' : 'Click to toggle status'}
                    >
                      {u.enabled ? 'Verified' : 'Pending'}
                    </button>
                  </td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                  <td>
                    {u.username !== 'admin' && (
                      <button 
                        className="btn btn-ghost btn-sm btn-danger" 
                        onClick={() => handleDelete(u.id, u.username)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
