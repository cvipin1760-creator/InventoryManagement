import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import './Login.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [view, setView] = useState<'login' | 'register' | 'verify' | 'forgot' | 'sso'>('login')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await api.login(username.trim(), password)
      if (res.username) {
        login(res.username, res.role as 'ADMIN' | 'USER')
        navigate('/dashboard')
      } else {
        setError(res.message || 'Invalid credentials')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.register({ username, email, password })
      setSuccess('OTP sent to your email!')
      setView('verify')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.verifyOtp({ email, otp })
      setSuccess('Email verified! You can now login.')
      setView('login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.resendOtp(email)
      setSuccess('A new OTP has been sent to your email.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.forgotPassword(email)
      setSuccess('Password reset OTP sent to your email.')
      setOtpSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.resetPassword({ email, otp, newPassword: password })
      setSuccess('Password reset successful! Redirecting to login...')
      setTimeout(() => {
        setOtpSent(false)
        setView('login')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSso = () => {
    setError('')
    setSuccess('')
    try {
      const g: any = (window as any).google
      if (!g || !g.accounts || !g.accounts.id) {
        setError('Google SSO is not available')
        return
      }
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
      if (!clientId) {
        setError('Google SSO is not configured')
        return
      }
      g.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            const res = await api.ssoGoogle(response.credential)
            if (res.username) {
              login(res.username, res.role as 'ADMIN' | 'USER')
              navigate('/dashboard')
            } else {
              setError(res.message || 'SSO failed')
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : 'SSO failed')
          }
        },
      })
      const el = document.getElementById('google-sso-btn')
      if (el) {
        g.accounts.id.renderButton(el, { theme: 'outline', size: 'large' })
      }
      g.accounts.id.prompt()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SSO not available')
    }
  }

  const handleInitAdmin = async () => {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await api.initAdmin()
      setUsername('admin')
      setPassword('admin123')
      setSuccess('Admin ready. You can now sign in.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to init admin')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (newView: typeof view) => {
    setError('')
    setSuccess('')
    setOtpSent(false)
    setView(newView)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">StockPilot</h1>

        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          justifyContent: 'center', 
          marginBottom: '2rem',
          backgroundColor: '#f3f4f6',
          padding: '0.25rem',
          borderRadius: '10px'
        }}>
            { [ 
              { id: 'login', label: 'Login' },
              { id: 'register', label: 'Register' },
              { id: 'forgot', label: 'Forgot' },
              { id: 'sso', label: 'SSO' }
            ].map((tab) => (
            <button 
              key={tab.id}
              type="button" 
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                border: 'none',
                backgroundColor: view === tab.id ? '#fff' : 'transparent',
                color: view === tab.id ? '#2563eb' : '#6b7280',
                boxShadow: view === tab.id ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : 'none',
                flex: 1,
                textAlign: 'center'
              }}
              onClick={() => handleTabChange(tab.id as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {view === 'login' && (
          <>
            <p className="login-subtitle">Sign in to continue</p>
            <form onSubmit={handleLogin} style={styles.form}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                style={styles.input}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
              {success && (
                <div className="login-success">{success}</div>
              )}
              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading} className="btn btn-primary" style={styles.button}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setView('register')}>
                Don't have an account? Register
              </button>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm init-admin"
              onClick={handleInitAdmin}
              disabled={loading}
            >
              Initialize default admin
            </button>
          </>
        )}

        {view === 'register' && (
          <>
            <p className="login-subtitle">Create a new account</p>
            <form onSubmit={handleRegister} style={styles.form}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                style={styles.input}
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
              {error && (
                <div className="login-error">{error}</div>
              )}
              <button type="submit" disabled={loading} className="btn btn-primary" style={styles.button}>
                {loading ? 'Sending OTP...' : 'Register'}
              </button>
            </form>
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setView('login')}>
                Already have an account? Login
              </button>
            </div>
          </>
        )}

        {view === 'verify' && (
          <>
            <p className="login-subtitle">Verify your email</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center' }}>
              We've sent a 6-digit code to <strong>{email}</strong>
            </p>
            <form onSubmit={handleVerify} style={styles.form}>
              <input
                type="text"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                autoFocus
                style={{ ...styles.input, textAlign: 'center', letterSpacing: '0.5rem', fontSize: '1.5rem' }}
              />
              {success && (
                <div className="login-success">{success}</div>
              )}
              {error && (
                <div className="login-error">{error}</div>
              )}
              <button type="submit" disabled={loading} className="btn btn-primary" style={styles.button}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm" 
                onClick={handleResendOtp}
                disabled={loading}
              >
                Didn't receive OTP? Resend
              </button>
            </div>
            <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setView('register')}>
                Wrong email? Go back
              </button>
            </div>
          </>
        )}

        {view === 'forgot' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p className="login-subtitle">Recover your account</p>
            
            {!otpSent ? (
              <form onSubmit={handleForgot} style={styles.form}>
                <label style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600' }}>Enter your registered email address</label>
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  style={styles.input}
                />
                {error && <div className="login-error">{error}</div>}
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="btn btn-primary" 
                  style={styles.button}
                >
                  {loading ? 'Sending...' : 'Send Verification OTP'}
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ backgroundColor: '#ecfdf5', padding: '1rem', borderRadius: '8px', border: '1px solid #10b981' }}>
                  <p style={{ color: '#065f46', fontSize: '0.9rem', margin: 0 }}>
                    OTP sent to <strong>{email}</strong>
                  </p>
                  <button 
                    type="button" 
                    onClick={() => setOtpSent(false)} 
                    style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.8rem', cursor: 'pointer', padding: 0, marginTop: '0.5rem', textDecoration: 'underline' }}
                  >
                    Change Email
                  </button>
                </div>

                <form onSubmit={handleResetPassword} style={styles.form}>
                  <label style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', display: 'block' }}>
                    Enter 6-digit code and new password
                  </label>
                  <input
                    type="text"
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                    autoFocus
                    style={{ ...styles.input, textAlign: 'center', letterSpacing: '0.5rem' }}
                  />
                  <input
                    type="password"
                    placeholder="Create new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                  />
                  {success && <div className="login-success">{success}</div>}
                  {error && <div className="login-error">{error}</div>}
                  <button type="submit" disabled={loading} className="btn btn-primary" style={styles.button}>
                    {loading ? 'Updating...' : 'Save New Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}


        {view === 'sso' && (
          <>
            <p className="login-subtitle">Sign in with Google</p>
            <div style={{ textAlign: 'center' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleGoogleSso}>
                Continue with Google
              </button>
              <div id="google-sso-btn" style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }} />
            </div>
            {error && <div className="login-error" style={{ marginTop: '0.5rem' }}>{error}</div>}
            {success && <div className="login-success" style={{ marginTop: '0.5rem' }}>{success}</div>}
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  input: {
    padding: '0.85rem 1rem',
    borderRadius: '8px',
    border: '1px solid #e1e4e8',
    fontSize: '1rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
    backgroundColor: '#f9fafb',
    width: '100%',
    boxSizing: 'border-box' as const
  },
  button: {
    padding: '0.85rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
}
