import { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface AuthContextType {
  username: string | null
  role: 'ADMIN' | 'USER' | null
  login: (username: string, role: 'ADMIN' | 'USER') => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username'))
  const [role, setRole] = useState<'ADMIN' | 'USER' | null>(() => {
    const r = localStorage.getItem('role')
    return r === 'ADMIN' || r === 'USER' ? r : null
  })

  const login = useCallback((u: string, r: 'ADMIN' | 'USER') => {
    localStorage.setItem('username', u)
    localStorage.setItem('role', r)
    setUsername(u)
    setRole(r)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    setUsername(null)
    setRole(null)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('username')
    if (stored) {
      setUsername(stored)
    }
    const r = localStorage.getItem('role')
    if (r === 'ADMIN' || r === 'USER') setRole(r)
  }, [])

  return (
    <AuthContext.Provider value={{ username, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
