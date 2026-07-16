export interface Customer {
  id: number
  customerId?: string
  tempPlainPassword?: string
  name: string
  phone: string
  address?: string
  loyaltyPoints?: number
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
  costPrice: number;
  price: number;
  gstPercent: number;
  quantity: number;
  lowStockThreshold: number;
  attachmentPath?: string;
  warrantyDays?: number;
  requiresSerialNumber?: boolean;
  fitments?: any[];
  createdAt: string;
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
  serialNumber?: string
}

export interface Warranty {
  id: number
  bill: Bill
  product: Product
  customer: Customer
  serialNumber?: string
  modelNumber?: string
  warrantyType: string
  warrantyStartDate: string
  warrantyEndDate: string
  warrantyPeriodMonths?: number
  warrantyNotes?: string
  warrantyTerms?: string
  createdAt: string
}

export interface EMIInstallment {
  id: number
  emiId: number
  installmentNumber: number
  dueDate: string
  amount: number
  paidAmount: number
  remainingAmount: number
  status: string
  paidDate?: string
  paymentMethod?: string
  lateFee: number
  remarks?: string
  createdAt: string
}

export interface EMI {
  id: number
  bill: Bill
  customer: Customer
  totalAmount: number
  downPayment: number
  loanAmount: number
  totalEmis: number
  emiAmount: number
  emisPaid: number
  emisRemaining: number
  paidAmount: number
  remainingAmount: number
  interestRate: number
  processingFee: number
  firstEmiDate: string
  nextEmiDate: string
  emiNotes?: string
  installments?: EMIInstallment[]
  createdAt: string
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
  paymentMode: string
  billDate: string
  items: BillItem[]
  emis?: EMI[]
  warranties?: Warranty[]
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
  serialNumber?: string
}

export interface EMIDto {
  downPayment: number
  totalEmis: number
  interestRate?: number
  firstEmiDate?: string
  processingFee?: number
  emiNotes?: string
}

export interface WarrantyItemDto {
  productId: number
  serialNumber?: string
  modelNumber?: string
  warrantyType: string
  warrantyPeriodMonths?: number
  warrantyStartDate?: string
  warrantyNotes?: string
  warrantyTerms?: string
}

export interface BillRequest {
  customerId: number
  items: BillItemRequest[]
  discount?: number
  gstType: 'INCLUDED' | 'EXCLUDED'
  paidAmount?: number
  paymentMode: string
  emi?: EMIDto
  warranties?: WarrantyItemDto[]
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
  todaySales: number;
  weeklySales: number;
  monthlySales: number;
  todayBillsCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  deadStockCount: number;
  fastMovingProductsCount: number;
  netProfit: number;
  gstCollected: number;
  totalCustomers: number;
  newCustomers: number;
  activeCustomers: number;
  customerGrowthPercent: number;
  todayEMIDue: number;
  overdueEMI: number;
  totalEMICollection: number;
  pendingEMIAmount: number;
  upcomingWarrantyExpiry: number;
  expiredWarranty: number;
  activeWarrantyCustomers: number;
  expiredWarrantyCustomers: number;
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
  configuration?: any
  token?: string
  message: string
}

export interface SupportTicket {
  id: number;
  customer: Customer;
  warranty?: Warranty;
  billItem?: BillItem;
  subject: string;
  description: string;
  ticketType: 'GENERAL' | 'WARRANTY' | 'RETURN' | 'EXCHANGE';
  attachmentPath?: string;
  resolution?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface AuditTask {
  id: number;
  product: Product;
  auditor: any;
  expectedQuantity: number;
  actualQuantity?: number;
  status: 'PENDING' | 'COMPLETED' | 'DISCREPANCY';
  createdAt: string;
  completedAt?: string;
}
