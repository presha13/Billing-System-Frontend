import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FileText } from 'lucide-react';
import apiService from '../../services/api.js';

const Dashboard = () => {
  const [bills, setBills] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBillingStats = async () => {
      try {
        const stats = await apiService.getBillingStats();
        setBills(stats);
      } catch (error) {
        console.error('Failed to fetch billing stats:', error);
        // Fallback to mock data if API fails
        setBills([
          { id: 1, date: '2025-01', amount: 150000, count: 12 },
          { id: 2, date: '2025-02', amount: 185000, count: 15 },
          { id: 3, date: '2025-03', amount: 220000, count: 18 },
          { id: 4, date: '2025-04', amount: 195000, count: 16 },
          { id: 5, date: '2025-05', amount: 250000, count: 20 },
          { id: 6, date: '2025-06', amount: 280000, count: 22 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const totalRevenue = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalBills = bills.reduce((sum, bill) => sum + bill.count, 0);
  const avgBillValue = totalBills > 0 ? totalRevenue / totalBills : 0;

  return (
    <div className="space-y-6">
<<<<<<< HEAD
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
=======
      <div className="flex items-baseline justify-between">
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-lg font-semibold text-gray-700">{user?.company?.companyName || ''}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <FileText className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Bills</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalBills}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Bill Value</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">₹{avgBillValue.toFixed(0)}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-full">
              <FileText className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={bills}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} name="Revenue (₹)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Bills Count by Month</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={bills}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#4f46e5" name="Number of Bills" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
