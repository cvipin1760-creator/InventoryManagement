import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { 
  PackageOpen, ChevronLeft, Search, FileText, Download, Share2, 
  IndianRupee, Calendar
} from 'lucide-react';

const CustomerPurchases = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await client.get('/customer-portal/purchases');
        setPurchases(response.data);
      } catch (err) {
        console.error('Failed to load purchases', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  const filteredPurchases = purchases.filter(p => 
    p.billNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      {/* Header */}
      <div className="bg-[#2563EB] text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button onClick={() => navigate('/customer-dashboard')} className="mr-4 hover:bg-blue-700 p-2 rounded-full transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold">My Purchases</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Search */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] sm:text-sm shadow-sm outline-none"
            placeholder="Search by invoice number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#2563EB]"></div>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <PackageOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No purchases found</h3>
            <p className="mt-1 text-gray-500">You haven't made any purchases yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPurchases.map((bill) => (
              <div key={bill.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{bill.billNumber}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(bill.billDate).toLocaleDateString('en-IN', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[#2563EB]">₹{bill.finalAmount?.toLocaleString()}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                        {bill.paymentMode || 'Paid'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">Products</p>
                    <div className="space-y-2">
                      {bill.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600 truncate pr-4">
                            {item.quantity}x {item.product?.name || 'Unknown Product'}
                          </span>
                          <span className="text-gray-900 font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between space-x-3">
                    <button 
                      onClick={() => navigate(`/customer/purchases/${bill.id}`)}
                      className="flex-1 flex justify-center items-center py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-2" /> View
                    </button>
                    <button className="flex-1 flex justify-center items-center py-2.5 border border-[#2563EB] rounded-xl text-sm font-medium text-[#2563EB] bg-blue-50 hover:bg-blue-100 transition-colors">
                      <Download className="h-4 w-4 mr-2" /> Download
                    </button>
                    <button className="flex justify-center items-center p-2.5 border border-gray-200 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerPurchases;
