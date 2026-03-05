import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { FileText, IndianRupee, Keyboard } from 'lucide-react';
import apiService from '../../services/api.js';
import Loader from '../common/Loader.jsx';

import Select from '../common/Select.jsx';

const Dashboard = () => {
  const [bills, setBills] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [selectedChart, setSelectedChart] = useState('revenue-expenses');

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stats, expensesData, allBills, allQuotations] = await Promise.all([
          apiService.getBillingStats(),
          apiService.getExpenses(),
          apiService.getAllBills().catch(() => []), // Fail gracefully
          apiService.getAllQuotations().catch(() => []) // Fail gracefully
        ]);
        setBills(stats);
        setExpenses(expensesData);

        // Process Recent Activity
        const billItems = allBills.map(b => ({
          type: 'Bill',
          id: b._id,
          date: b.updatedAt || b.createdAt,
          referenceNumber: b.billNumber,
          customerName: b.customer?.name || 'Unknown',
          amount: b.totalAmount,
          status: b.paymentStatus
        }));

        const quoteItems = allQuotations.map(q => ({
          type: 'Quotation',
          id: q._id,
          date: q.updatedAt || q.createdAt,
          referenceNumber: q.quotationNumber,
          customerName: q.customer?.name || 'Unknown',
          amount: q.totalAmount,
          status: q.status
        }));

        const combined = [...billItems, ...quoteItems].sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentItems(combined);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setBills([]);
        setExpenses([]);
        setRecentItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loader message="Loading Dashboard" />;
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

  // Options for chart selection
  const chartOptions = [
    { value: 'revenue-expenses', label: 'Revenue vs Expenses' },
    { value: 'net-profit', label: 'Net Profit Trend' },
    { value: 'revenue-trend', label: 'Revenue Trend' },
    { value: 'expenses-trend', label: 'Monthly Expenses' },
    { value: 'bills-count', label: 'Bills Count by Month' },
  ];

  /* Combined Chart Renderer */
  const renderChart = () => {
    const XAxisCommon = (
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
    );

    const YAxisCurrency = (
      <YAxis
        tickFormatter={(value) => {
          if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
          return `₹${value}`;
        }}
        tick={{ fill: '#6b7280', fontSize: 12 }}
        tickLine={false}
        axisLine={false}
      />
    );

    const TooltipCurrency = (label, value) => (
      <Tooltip
        formatter={(val) => [`₹${val.toLocaleString()}`, value || '']}
        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
      />
    );

    switch (selectedChart) {
      case 'revenue-expenses':
        return (
          <BarChart data={comparisonData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            {XAxisCommon}
            {YAxisCurrency}
            <Tooltip
              formatter={(val) => [`₹${val.toLocaleString()}`, '']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="revenue" name="Revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#dc2626" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'net-profit':
        return (
          <BarChart data={comparisonData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            {XAxisCommon}
            {YAxisCurrency}
            <Tooltip
              formatter={(val) => [`₹${val.toLocaleString()}`, 'Profit']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="profit" name="Net Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'revenue-trend':
        return (
          <LineChart data={bills} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            {XAxisCommon}
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
              formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
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
        );
      case 'expenses-trend':
        return (
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
            {XAxisCommon}
            {YAxisCurrency}
            <Tooltip
              formatter={(val) => [`₹${val.toLocaleString()}`, 'Expense']}
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
        );
      case 'bills-count':
        return (
          <BarChart data={bills} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            {XAxisCommon}
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
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-base font-semibold text-gray-700">{user?.company?.companyName || ''}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-medium uppercase tracking-wider">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FileText className="text-green-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-medium uppercase tracking-wider">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <IndianRupee className="text-red-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-medium uppercase tracking-wider">Net Income</p>
              <p className={`text-2xl font-bold mt-1 ${netIncome >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                ₹{netIncome.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-full ${netIncome >= 0 ? 'bg-indigo-100' : 'bg-red-100'}`}>
              <IndianRupee className={`${netIncome >= 0 ? 'text-indigo-600' : 'text-red-600'}`} size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs font-medium uppercase tracking-wider">Total Bills</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{totalBills}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="text-blue-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
          <button
            onClick={() => setShowAllRecent(!showAllRecent)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {showAllRecent ? 'Show Less' : 'View More'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-2 sm:px-4 py-3 font-medium">Type</th>
                <th className="px-2 sm:px-4 py-3 font-medium">Reference #</th>
                <th className="px-2 sm:px-4 py-3 font-medium">Customer</th>
                <th className="px-2 sm:px-4 py-3 font-medium">Date</th>
                <th className="px-2 sm:px-4 py-3 font-medium">Amount</th>
                <th className="px-2 sm:px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentItems.slice(0, showAllRecent ? 10 : 5).map((item) => (
                <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-2 sm:px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${item.type === 'Bill' ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs text-gray-900 font-medium">
                    {item.referenceNumber}
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs text-gray-600">
                    {item.customerName}
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs text-gray-500">
                    {new Date(item.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-xs font-semibold text-gray-900">
                    ₹{item.amount.toLocaleString()}
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${item.status === 'paid' || item.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      item.status === 'unpaid' || item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentItems.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-gray-500 text-xs">
                    No recent activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-lg font-bold text-gray-800">
            {chartOptions.find(opt => opt.value === selectedChart)?.label}
          </h2>
          <div className="w-full md:w-56">
            <Select
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value)}
              options={chartOptions}
              placeholder="Select Chart"
              align="right"
            />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Keyboard Shortcuts Section */}
      <div className="bg-white p-4 rounded-xl shadow-md mt-4">
        <div className="flex items-center gap-2 mb-4">
          <Keyboard className="text-indigo-600" size={20} />
          <h2 className="text-lg font-bold text-gray-800">Keyboard Shortcuts</h2>
        </div>

        {/* Navigation Shortcuts */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-xs text-gray-600">Dashboard</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded shadow-sm">Alt + D</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-xs text-gray-600">New Bill</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded shadow-sm">Alt + B</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-xs text-gray-600">New Quote</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded shadow-sm">Alt + Q</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-xs text-gray-600">Products</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded shadow-sm">Alt + P</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-xs text-gray-600">Expenses</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded shadow-sm">Alt + E</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-xs text-gray-600">View Bills</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded shadow-sm">Alt + V</kbd>
            </div>
          </div>
        </div>

        {/* Billing Actions */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Billing Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center justify-between p-2.5 bg-indigo-50 rounded-lg border border-indigo-100">
              <span className="text-xs text-gray-600">Add Item</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded shadow-sm">Alt + A</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-indigo-50 rounded-lg border border-indigo-100">
              <span className="text-xs text-gray-600">Add Heading</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded shadow-sm">Alt + H</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-indigo-50 rounded-lg border border-indigo-100">
              <span className="text-xs text-gray-600">Save Bill</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded shadow-sm">Alt + S</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-indigo-50 rounded-lg border border-indigo-100">
              <span className="text-xs text-gray-600">Save (Alt)</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded shadow-sm">Ctrl + S</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-indigo-50 rounded-lg border border-indigo-100">
              <span className="text-xs text-gray-600">Download PDF</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded shadow-sm">Ctrl + P</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-indigo-50 rounded-lg border border-indigo-100">
              <span className="text-xs text-gray-600">Focus Name</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded shadow-sm">Alt + N</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-indigo-50 rounded-lg border border-indigo-100">
              <span className="text-xs text-gray-600">Reset Form</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded shadow-sm">Alt + R</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-indigo-50 rounded-lg border border-indigo-100">
              <span className="text-xs text-gray-600">Delete Item</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded shadow-sm">Delete</kbd>
            </div>
          </div>
        </div>

        {/* Autocomplete */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Autocomplete</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg border border-green-100">
              <span className="text-xs text-gray-600">Navigate</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded shadow-sm">↑ ↓</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg border border-green-100">
              <span className="text-xs text-gray-600">Select</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded shadow-sm">Enter</kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg border border-green-100">
              <span className="text-xs text-gray-600">Close</span>
              <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded shadow-sm">Esc</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
