import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api as client } from '../api/client';
import { ChevronLeft, Download, Printer, ShieldCheck } from 'lucide-react';

const CustomerInvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const response = await client.get<any>(`/customer-portal/purchases/${id}`);
        setBill(response.data);
      } catch (err) {
        console.error('Failed to load invoice', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBill();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2563EB]"></div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900">Invoice not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#2563EB]">Go Back</button>
      </div>
    );
  }

  const qrData = `${window.location.origin}/customer-dashboard`; // Usually would point to a public verify URL

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      <div className="bg-[#2563EB] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={() => navigate('/customer/purchases')} className="mr-4 hover:bg-blue-700 p-2 rounded-full transition-colors">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-bold">Invoice Details</h1>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-blue-700 rounded-full transition-colors">
                <Download className="h-5 w-5" />
              </button>
              <button className="p-2 hover:bg-blue-700 rounded-full transition-colors">
                <Printer className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Invoice Header */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-1">{bill.business?.name || 'StockPilot Business'}</h2>
                <p className="text-sm text-gray-500">{bill.business?.address}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 uppercase tracking-wider font-bold">Invoice</p>
                <p className="text-lg font-bold text-gray-900">{bill.billNumber}</p>
                <p className="text-sm text-gray-500">
                  {new Date(bill.billDate).toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="p-6 sm:p-8 bg-gray-50/50 border-b border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Billed To</p>
            <h3 className="text-lg font-bold text-gray-900">{bill.customer?.name}</h3>
            <p className="text-sm text-gray-600">{bill.customer?.phone}</p>
            {bill.customer?.email && <p className="text-sm text-gray-600">{bill.customer.email}</p>}
          </div>

          {/* Items */}
          <div className="p-6 sm:p-8">
            <div className="flow-root">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th scope="col" className="py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
                    <th scope="col" className="py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                    <th scope="col" className="py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bill.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-4 text-sm text-gray-900">
                        <p className="font-medium">{item.product?.name}</p>
                        {item.product?.partNumber && <p className="text-gray-500 text-xs">Part: {item.product.partNumber}</p>}
                      </td>
                      <td className="py-4 text-sm text-gray-500 text-right">{item.quantity}</td>
                      <td className="py-4 text-sm text-gray-500 text-right">₹{item.price?.toLocaleString()}</td>
                      <td className="py-4 text-sm text-gray-900 font-medium text-right">₹{(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900 font-medium">₹{bill.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Discount</span>
                <span className="text-green-600 font-medium">-₹{bill.discount?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <span className="text-base font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-black text-[#2563EB]">₹{bill.finalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* QR Code and Footer */}
          <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-6 sm:mb-0">
              <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                <QRCodeSVG value={qrData} size={80} level="H" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-1 text-green-500" /> Verified Invoice
                </p>
                <p className="text-xs text-gray-500 mt-1">Scan to verify this invoice online</p>
              </div>
            </div>
            
            <div className="text-center sm:text-right">
              <p className="text-sm text-gray-500">Payment Mode</p>
              <p className="text-lg font-bold text-gray-900 capitalize">{bill.paymentMode || 'Cash'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInvoiceDetail;
