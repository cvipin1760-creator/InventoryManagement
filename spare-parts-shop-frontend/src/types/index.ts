export interface Customer {
  id: number
  name: string
  phone: string
  address?: string
  createdAt: string
}

export interface Supplier {
  id: number
  name: string
  phone: string
  email?: string
  address?: string
  createdAt: string
}

export interface Product {
  id: number
  name: string
  partNumber: string
  costPrice: number
  price: number
  gstPercent: number
  quantity: number
  lowStockThreshold: number
  attachmentPath?: string
  createdAt: string
  updatedAt: string
}

export interface BillItem {
  id: number
  product: Product
  quantity: number
  price: number
  gstPercent: number
  itemTotal: number
  discount: number
}

export interface Bill {
  id: number
  invoiceNumber: string
  customer: Customer
  subtotal: number
  gstAmount: number
  discount: number
  finalAmount: number
  gstType: string
  billDate: string
  items: BillItem[]
}

export interface PurchaseItem {
  id: number
  product: Product
  quantity: number
  price: number
  gstPercent: number
  itemTotal: number
  discount: number
}

export interface Purchase {
  id: number
  invoiceNumber: string
  supplier: Supplier
  subtotal: number
  gstAmount: number
  discount: number
  finalAmount: number
  gstType: string
  purchaseDate: string
  attachmentPath?: string
  items: PurchaseItem[]
}

export interface BillItemRequest {
  productId: number
  quantity: number
  price: number
  gstPercent: number
  discount?: number
}

export interface BillRequest {
  customerId: number
  items: BillItemRequest[]
  discount?: number
  gstType: 'INCLUDED' | 'EXCLUDED'
  paidAmount?: number
}

export type CustomerProductPrices = Record<string, number>

export interface Payment {
  id: number
  customer: Customer
  bill?: Bill
  amount: number
  paymentDate: string
  note?: string
}

export interface PaymentRequest {
  customerId: number
  billId?: number
  amount: number
  note?: string
}

export interface CustomerBalance {
  customerId: number
  totalBilled: number
  totalPaid: number
  remainingAmount: number
}

export interface PurchaseItemRequest {
  productId: number
  quantity: number
  price: number
  gstPercent: number
  discount?: number
}

export interface PurchaseRequest {
  supplierId: number
  items: PurchaseItemRequest[]
  discount?: number
  gstType: 'INCLUDED' | 'EXCLUDED'
  attachmentPath?: string
}

export interface DashboardStats {
  todaySales: number
  weeklySales: number
  monthlySales: number
  todayBillsCount: number
  lowStockCount: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  userId?: number
  username: string
  role: string
  businessId?: number
  branchId?: number
  mustChangePassword?: boolean
  features?: {
    inventoryEnabled: boolean
    billingEnabled: boolean
    warrantyEnabled: boolean
    emiEnabled: boolean
    gstEnabled: boolean
    customerPortalEnabled: boolean
    reportsEnabled: boolean
    whatsappNotificationsEnabled: boolean
    smsNotificationsEnabled: boolean
    multiUserSupportEnabled: boolean
    employeeManagementEnabled: boolean
  }
  token?: string
  message: string
}
