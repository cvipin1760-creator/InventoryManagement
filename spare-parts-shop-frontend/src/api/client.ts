const API_BASE = '/api'

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const token = localStorage.getItem('token')
  const branchId = localStorage.getItem('activeBranchId')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  if (branchId) {
    headers['X-Branch-ID'] = branchId
  }
  return headers
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method || 'GET'
  const isJson = options.body !== undefined || method === 'POST' || method === 'PUT'
  
  const headers: HeadersInit = {
    ...(isJson ? { 'Content-Type': 'application/json' } : {}),
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string>),
  }
  
  if (!navigator.onLine && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
    import('../utils/offlineSync').then(({ OfflineSyncService }) => {
      OfflineSyncService.queueRequest({
        url: `${API_BASE}${path}`,
        method,
        headers: headers as Record<string, string>,
        body: (options.body as string) || '',
        timestamp: Date.now(),
      })
    })
    // Return a mocked success for offline mutations
    return { id: Date.now(), offline: true } as unknown as T
  }
  
  try {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })
  if (!res.ok) {
    const text = await res.text()
    let errMsg = text || `HTTP ${res.status}`
    try {
      const json = JSON.parse(text)
      if (json?.message) errMsg = json.message
    } catch {
      /* use text as fallback */
    }
    throw new Error(errMsg)
  }
    const contentType = res.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const data = await res.json()
      return (data && typeof data === 'object' && 'content' in data && Array.isArray(data.content)) ? data.content : data
    }
    return res.blob() as unknown as T
  } catch (error) {
    if (error instanceof TypeError && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
      import('../utils/offlineSync').then(({ OfflineSyncService }) => {
        OfflineSyncService.queueRequest({
          url: `${API_BASE}${path}`,
          method,
          headers: headers as Record<string, string>,
          body: (options.body as string) || '',
          timestamp: Date.now(),
        })
      })
      return { id: Date.now(), offline: true } as unknown as T
    }
    throw error
  }
}

export const api = {
  // Generic GET
  get: <T>(path: string) => request<T>(path),
  // Auth (purely for login check; backend is otherwise open)
  login: (username: string, password: string) =>
    request<import('../types').LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username: username.trim(), password: password.trim() }),
    }),
  register: (data: any) =>
    request<string>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  verifyOtp: (data: { email: string; otp: string }) =>
    request<string>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  resendOtp: (email: string) =>
    request<string>(`/auth/resend-otp?email=${encodeURIComponent(email)}`, {
      method: 'POST',
    }),
  getUsers: () => request<any[]>('/auth/users'),
  deleteUser: (id: number) => request<void>(`/auth/users/${id}`, { method: 'DELETE' }),
  updateUserRole: (id: number, role: string) =>
    request<string>(`/auth/users/${id}/role?role=${role}`, { method: 'PUT' }),
  updateUserStatus: (id: number, enabled: boolean) =>
    request<string>(`/auth/users/${id}/status?enabled=${enabled}`, { method: 'PUT' }),
  initAdmin: () =>
    request<string>('/auth/init-admin', { method: 'POST' }),
  ssoGoogle: (idToken: string) =>
    request<import('../types').LoginResponse>('/auth/sso/google', {
      method: 'POST',
      body: JSON.stringify({ provider: 'google', idToken }),
    }),
  forgotPassword: (email: string) =>
    request<string>(`/auth/forgot-password?email=${encodeURIComponent(email)}`, {
      method: 'POST',
    }),
  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    request<string>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Customers
  getCustomers: () => request<import('../types').Customer[]>('/customers'),
  getCustomer: (id: number) => request<import('../types').Customer>(`/customers/${id}`),
  searchCustomers: (keyword: string) =>
    request<import('../types').Customer[]>(`/customers/search?keyword=${encodeURIComponent(keyword)}`),
  createCustomer: (data: Omit<import('../types').Customer, 'id' | 'createdAt'>) =>
    request<import('../types').Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCustomer: (id: number, data: Partial<import('../types').Customer>) =>
    request<import('../types').Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCustomer: (id: number) =>
    request<void>(`/customers/${id}`, { method: 'DELETE' }),
  getCustomerProducts: () => request<import('../types').Product[]>('/customers/me/products'),
  getCustomerBills: () => request<import('../types').Bill[]>('/customers/me/bills'),
  getWarranties: () => request<any[]>('/warranties'),
  getEmis: () => request<any[]>('/emis'),
  submitSupportTicket: (data: { subject: string; description: string }) => 
    request<any>('/support-tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Analytics
  getPredictiveAnalytics: () => request<any>('/analytics/predictive'),
  getFullAnalytics: () => request<any>('/analytics/full'),
  getAdminDashboard: () => request<any>('/analytics/admin-dashboard'),
  getMyTasks: () => request<any>('/tasks/me'),
  // Marketing
  sendWhatsAppMessage: (data: { customerId: number; message: string }) =>
    request<any>('/marketing/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Suppliers
  getSuppliers: () => request<import('../types').Supplier[]>('/suppliers'),
  getSupplier: (id: number) => request<import('../types').Supplier>(`/suppliers/${id}`),
  searchSuppliers: (keyword: string) =>
    request<import('../types').Supplier[]>(`/suppliers/search?keyword=${encodeURIComponent(keyword)}`),
  createSupplier: (data: Omit<import('../types').Supplier, 'id' | 'createdAt'>) =>
    request<import('../types').Supplier>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSupplier: (id: number, data: Partial<import('../types').Supplier>) =>
    request<import('../types').Supplier>(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSupplier: (id: number) =>
    request<void>(`/suppliers/${id}`, { method: 'DELETE' }),

  // Products
  getProducts: () => request<any>('/products'),
  getProduct: (id: number) => request<import('../types').Product>(`/products/${id}`),
  searchProducts: (keyword: string) =>
    request<any>(`/products/search?keyword=${encodeURIComponent(keyword)}`),
  getLowStockProducts: () =>
    request<any>('/products/low-stock'),
  createProduct: (data: Omit<import('../types').Product, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<import('../types').Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProduct: (id: number, data: Partial<import('../types').Product>) =>
    request<import('../types').Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteProduct: (id: number) =>
    request<void>(`/products/${id}`, { method: 'DELETE' }),
  uploadExcel: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${API_BASE}/products/upload-excel`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  },
  exportExcel: async () => {
    const res = await fetch(`${API_BASE}/products/export-excel`, {
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error(await res.text())
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  },

  // Bills
  getBills: () => request<import('../types').Bill[]>('/bills'),
  getBill: (id: number) => request<import('../types').Bill>(`/bills/${id}`),
  createBill: (data: import('../types').BillRequest) =>
    request<import('../types').Bill>('/bills', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBill: (id: number, data: import('../types').BillRequest) =>
    request<import('../types').Bill>(`/bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getBillsByDateRange: (startDate: string, endDate: string) =>
    request<import('../types').Bill[]>(
      `/bills/by-date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    ),
  searchBills: (customerName: string) =>
    request<import('../types').Bill[]>(`/bills/search?customerName=${encodeURIComponent(customerName)}`),
  searchBillsByProduct: (keyword: string) =>
    request<import('../types').Bill[]>(`/bills/search-by-product?keyword=${encodeURIComponent(keyword)}`),
  getCustomerProductPrices: (customerId: number) =>
    request<import('../types').CustomerProductPrices>(`/bills/customer-prices?customerId=${customerId}`),
  uploadBillAttachment: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${API_BASE}/bills/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    })
    if (!res.ok) throw new Error(await res.text())
    return res.text()
  },
  getInvoicePdf: async (id: number) => {
    const res = await fetch(`${API_BASE}/bills/${id}/invoice-pdf`, {
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error(await res.text())
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${id}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  },
  downloadBillsBackup: async () => {
    const res = await fetch(`${API_BASE}/backups/bills/download`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error(await res.text())

    const blob = await res.blob()
    const disposition = res.headers.get('content-disposition') || ''
    const match = disposition.match(/filename="?([^"]+)"?/)
    const filename = match?.[1] || `bills-backup-${new Date().toISOString().slice(0, 10)}.json`
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  },
  sendBillViaWhatsApp: async (id: number, phone: string) => {
    const res = await request<string>(`/bills/${id}/send-whatsapp?phone=${encodeURIComponent(phone)}`, {
      method: 'POST',
    })
    return res
  },

  // Bill Templates
  getBillTemplates: () => request<any[]>('/bills/templates'),
  getBillTemplate: (id: number) => request<any>(`/bills/templates/${id}`),
  createBillTemplate: (data: any) =>
    request<any>('/bills/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBillTemplate: (id: number, data: any) =>
    request<any>(`/bills/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBillTemplate: (id: number) => request<void>(`/bills/templates/${id}`, { method: 'DELETE' }),

  // Staff & Permissions
  createStaff: (data: any) =>
    request<any>('/auth/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStaff: (id: number, data: any) =>
    request<any>(`/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Payments
  getCustomerPayments: (customerId: number) =>
    request<import('../types').Payment[]>(`/payments/customer/${customerId}`),
  getCustomerBalance: (customerId: number) =>
    request<import('../types').CustomerBalance>(`/payments/customer/${customerId}/balance`),
  createPayment: (data: import('../types').PaymentRequest) =>
    request<import('../types').Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Purchases
  getPurchases: () => request<import('../types').Purchase[]>('/purchases'),
  getPurchase: (id: number) => request<import('../types').Purchase>(`/purchases/${id}`),
  createPurchase: (data: import('../types').PurchaseRequest) =>
    request<import('../types').Purchase>('/purchases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getPurchasesByDateRange: (startDate: string, endDate: string) =>
    request<import('../types').Purchase[]>(
      `/purchases/by-date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    ),
  searchPurchases: (supplierName: string) =>
    request<import('../types').Purchase[]>(`/purchases/search?supplierName=${encodeURIComponent(supplierName)}`),
  searchPurchasesByProduct: (keyword: string) =>
    request<import('../types').Purchase[]>(`/purchases/search-by-product?keyword=${encodeURIComponent(keyword)}`),

  // Dashboard
  getDashboardStats: () =>
    request<import('../types').DashboardStats>('/dashboard/stats'),

  // Branches
  getBranches: () => request<any[]>('/branches'),
  getBranch: (id: number) => request<any>(`/branches/${id}`),
  createBranch: (data: any) =>
    request<any>('/branches', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBranch: (id: number, data: any) =>
    request<any>(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBranch: (id: number) =>
    request<void>(`/branches/${id}`, { method: 'DELETE' }),

  // Business & Subscription
  getBusiness: () => request<any>('/business'),
  updateSubscription: (id: number, subscriptionPlan: string) =>
    request<any>(`/super-admin/businesses/${id}/subscription`, {
      method: 'PUT',
      body: JSON.stringify({ subscriptionPlan }),
    }),
  toggleSubscriptionStatus: (id: number, isActive: boolean) =>
    request<any>(`/super-admin/businesses/${id}/subscription/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    }),

  // Notifications
  getNotifications: () => request<any[]>('/notifications'),
  getUnreadNotifications: () => request<any[]>('/notifications/unread'),
  getUnreadCount: () => request<number>('/notifications/unread/count'),
  markAsRead: (id: number) => request<any>(`/notifications/${id}/read`, { method: 'PUT' }),
  sendNotification: (payload: { title: string; message: string; sendToAll?: boolean; userIds?: number[] }) =>
    request<string>('/notifications/send', { method: 'POST', body: JSON.stringify(payload) }),
}
