import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import client from '../api/client';
import { 
  LogOut, PackageOpen, Shield, IndianRupee, Wallet, 
  Gift, Bell, ChevronRight, FileText, Wrench, HeadphonesIcon 
} from 'lucide-react';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await client.get('/customer-portal/dashboard');
        setData(response.data);
      } catch (err) {
        console.error('Failed to load customer dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/customer/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2563EB]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <PackageOpen className="h-8 w-8 text-[#2563EB]" />
              <span className="ml-2 text-xl font-bold text-gray-900">StockPilot Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-900 relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-[#EF4444] ring-2 ring-white"></span>
              </button>
              <button onClick={handleLogout} className="text-gray-500 hover:text-red-500">
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-[#2563EB] rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Welcome back, {data?.customerName || 'Customer'}!
            </h1>
            <p className="text-blue-100 mb-6">ID: {data?.customerId || 'N/A'}</p>
            <div className="flex space-x-4">
              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm border border-white/30">
                <p className="text-blue-100 text-sm">Reward Points</p>
                <div className="flex items-center mt-1">
                  <Gift className="h-5 w-5 mr-2 text-yellow-300" />
                  <span className="text-xl font-bold">{data?.loyaltyPoints || 0}</span>
                </div>
              </div>
              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm border border-white/30">
                <p className="text-blue-100 text-sm">Wallet Balance</p>
                <div className="flex items-center mt-1">
                  <Wallet className="h-5 w-5 mr-2 text-green-300" />
                  <span className="text-xl font-bold">₹0</span>
                </div>
              </div>
            </div>
          </div>
          {/* Abstract background design */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 right-20 w-40 h-40 rounded-full bg-blue-400 opacity-20 blur-2xl"></div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FileText, label: 'Invoices', color: 'bg-blue-50 text-blue-600', path: '/customer/purchases' },
            { icon: IndianRupee, label: 'Pay EMI', color: 'bg-green-50 text-green-600', path: '#' },
            { icon: Shield, label: 'Warranty', color: 'bg-purple-50 text-purple-600', path: '#' },
            { icon: Wrench, label: 'Book Repair', color: 'bg-orange-50 text-orange-600', path: '#' },
          ].map((action, i) => (
            <button key={i} onClick={() => action.path !== '#' && navigate(action.path)} className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center border border-gray-100">
              <div className={`p-3 rounded-xl mb-3 ${action.color}`}>
                <action.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Purchase Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Purchase Summary</h2>
                <button onClick={() => navigate('/customer/purchases')} className="text-[#2563EB] text-sm font-medium flex items-center hover:underline">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                  <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{data?.totalPurchases || 0}</p>
                </div>
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                  <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">₹{data?.totalSpent?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
              </div>
              {data?.recentPurchases?.length > 0 ? (
                <div className="space-y-4">
                  {data.recentPurchases.map((bill: any) => (
                    <div key={bill.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-50 p-3 rounded-lg text-[#2563EB]">
                          <PackageOpen className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{bill.billNumber}</p>
                          <p className="text-sm text-gray-500">{new Date(bill.billDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{bill.finalAmount?.toLocaleString()}</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {bill.paymentMode || 'Paid'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent purchases found.
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Active Warranty Card */}
            <div className="bg-gradient-to-br from-[#14B8A6] to-teal-600 rounded-2xl shadow-sm p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Active Warranty</h2>
                <Shield className="h-6 w-6 text-teal-200" />
              </div>
              <p className="text-4xl font-extrabold mb-2">0</p>
              <p className="text-teal-100 text-sm mb-4">Products currently covered</p>
              <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                View Warranties
              </button>
            </div>

            {/* EMI Progress Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Active EMIs</h2>
                <IndianRupee className="h-5 w-5 text-gray-400" />
              </div>
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 border-2 border-gray-100 mb-3">
                  <IndianRupee className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm">No active EMIs currently.</p>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h2>
              <button className="w-full flex items-center justify-center space-x-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 rounded-xl border border-gray-200 transition-colors font-medium">
                <HeadphonesIcon className="h-5 w-5" />
                <span>Contact Support</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
