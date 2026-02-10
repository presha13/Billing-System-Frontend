import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { FileText, IndianRupee } from 'lucide-react';
import apiService from '../../services/api.js';

const Dashboard = () => {
  const [bills, setBills] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stats, expensesData] = await Promise.all([
          apiService.getBillingStats(),
          apiService.getExpenses()
        ]);
        setBills(stats);
        setExpenses(expensesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Fallback to mock data if API fails
        setBills([
          { id: 1, date: '2025-01', amount: 150000, count: 12 },
          { id: 2, date: '2025-02', amount: 185000, count: 15 },
          { id: 3, date: '2025-03', amount: 220000, count: 18 },
          { id: 4, date: '2025-04', amount: 195000, count: 16 },
          { id: 5, date: '2025-05', amount: 250000, count: 20 },
          { id: 6, date: '2025-06', amount: 280000, count: 22 }
        ]);
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netIncome = totalRevenue - totalExpenses;

  // Prepare comparison data
  const monthlyStats = {};

  bills.forEach(bill => {
    const month = bill.date.substring(0, 7);
    if (!monthlyStats[month]) monthlyStats[month] = { date: month, revenue: 0, expenses: 0 };
    monthlyStats[month].revenue += bill.amount;
  });

  expenses.forEach(expense => {
    const month = expense.date.substring(0, 7);
    if (!monthlyStats[month]) monthlyStats[month] = { date: month, revenue: 0, expenses: 0 };
    monthlyStats[month].expenses += expense.amount;
  });

  const comparisonData = Object.values(monthlyStats).map(stat => ({
    ...stat,
    profit: stat.revenue - stat.expenses
  })).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-lg font-semibold text-gray-700">{user?.company?.companyName || ''}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <p className="text-gray-600 text-sm">Total Expenses</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-red-100 p-4 rounded-full">
              <IndianRupee className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Net Income</p>
              <p className={`text-3xl font-bold mt-2 ${netIncome >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                ₹{netIncome.toLocaleString()}
              </p>
            </div>
            <div className={`p-4 rounded-full ${netIncome >= 0 ? 'bg-indigo-100' : 'bg-red-100'}`}>
              <IndianRupee className={`${netIncome >= 0 ? 'text-indigo-600' : 'text-red-600'}`} size={24} />
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Revenue vs Expenses</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={comparisonData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                }}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                tickFormatter={(value) => {
                  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
                  return `₹${value}`;
                }}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="revenue" name="Revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Net Profit Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={comparisonData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                }}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                tickFormatter={(value) => {
                  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
                  return `₹${value}`;
                }}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Profit']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="profit" name="Net Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={bills} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                }}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                tickFormatter={(value) => {
                  if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
                  return value;
                }}
                width={60}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Monthly Expenses</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={Object.values(expenses.reduce((acc, curr) => {
              const month = curr.date.substring(0, 7);
              if (!acc[month]) acc[month] = { date: month, amount: 0 };
              acc[month].amount += curr.amount;
              return acc;
            }, {})).sort((a, b) => a.date.localeCompare(b.date))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                }}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                tickFormatter={(value) => {
                  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
                  return `₹${value}`;
                }}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Expense']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#dc2626"
                fillOpacity={1}
                fill="url(#colorExpense)"
                name="Expenses"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Bills Count by Month</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bills} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                }}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar
                dataKey="count"
                fill="#4f46e5"
                name="Bills"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
