import React, { useEffect } from 'react'
import type { Bill } from '../types'
import './ReceiptPrinter.css'

interface ReceiptPrinterProps {
  bill: Bill | null
  size: '58mm' | '80mm' | 'A4'
  onClose: () => void
}

export default function ReceiptPrinter({ bill, size, onClose }: ReceiptPrinterProps) {
  useEffect(() => {
    if (bill) {
      setTimeout(() => {
        window.print()
        onClose()
      }, 500)
    }
  }, [bill, onClose])

  if (!bill) return null

  return (
    <div className={`receipt-printer-container size-${size}`}>
      <div className="receipt-content">
        <h2 className="receipt-title">StockPilot</h2>
        <div className="receipt-divider"></div>
        <p><strong>Invoice:</strong> {bill.invoiceNumber}</p>
        <p><strong>Date:</strong> {new Date(bill.billDate).toLocaleString()}</p>
        <p><strong>Customer:</strong> {bill.customer.name}</p>
        <div className="receipt-divider"></div>
        
        <table className="receipt-table">
          <thead>
            <tr>
              <th align="left">Item</th>
              <th align="center">Qty</th>
              <th align="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.product.name}</td>
                <td align="center">{item.quantity}</td>
                <td align="right">{(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="receipt-divider"></div>
        <div className="receipt-totals">
          <div className="receipt-row">
            <span>Gross:</span>
            <span>Rs {bill.subtotal.toFixed(2)}</span>
          </div>
          <div className="receipt-row">
            <span>Discount:</span>
            <span>-Rs {bill.discount.toFixed(2)}</span>
          </div>
          <div className="receipt-row">
            <span>GST:</span>
            <span>Rs {bill.gstAmount.toFixed(2)}</span>
          </div>
          <div className="receipt-row receipt-grand-total">
            <span>TOTAL:</span>
            <span>Rs {bill.finalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="receipt-divider"></div>
        <p className="receipt-footer">Thank you for your business!</p>
      </div>
    </div>
  )
}
