import React, { useState, useEffect } from 'react';
import { Receipt, Edit, Trash2, Eye, Download, Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import apiService from '../../services/api.js';
import Toast from '../common/Toast.jsx';
import AlertModal from '../common/AlertModal.jsx';
import Select from '../common/Select.jsx';

const BillsList = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBill, setSelectedBill] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Toast and Alert states
  const [toast, setToast] = useState({ isOpen: false, type: 'info', message: '' });
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'warning', title: '', message: '', onConfirm: null });

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const billsData = await apiService.getAllBills();
      setBills(billsData);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
      setError('Failed to load bills');
      // Fallback to mock data for demonstration
      setBills([
        {
          _id: '1',
          billNumber: 'EVT-000001',
          customer: {
            name: 'Rajesh Kumar',
            email: 'rajesh@example.com',
            phone: '+91 98765 43210',
            address: '123 MG Road, Mumbai, Maharashtra'
          },
          items: [
            { name: 'Event Planning', quantity: 1, rate: 50000, total: 50000 },
            { name: 'Catering Services', quantity: 1, rate: 25000, total: 25000 }
          ],
          subtotal: 75000,
          taxType: '18%',
          taxAmount: 13500,
          discountType: 'fixed',
          discountValue: 5000,
          discountAmount: 5000,
          totalAmount: 83500,
          paymentStatus: 'paid',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          billNumber: 'EVT-000002',
          customer: {
            name: 'Priya Sharma',
            email: 'priya@example.com',
            phone: '+91 98765 43211',
            address: '456 Park Street, Delhi, Delhi'
          },
          items: [
            { name: 'Wedding Photography', quantity: 1, rate: 30000, total: 30000 },
            { name: 'Video Recording', quantity: 1, rate: 20000, total: 20000 }
          ],
          subtotal: 50000,
          taxType: '18%',
          taxAmount: 9000,
          discountType: 'percentage',
          discountValue: 10,
          discountAmount: 5000,
          totalAmount: 54000,
          paymentStatus: 'unpaid',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBill = (billId) => {
    setAlertModal({
      isOpen: true,
      type: 'warning',
      title: 'Delete Bill',
      message: 'Are you sure you want to delete this bill? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await apiService.deleteBill(billId);
          setBills(bills.filter(bill => bill._id !== billId));
          setToast({ isOpen: true, type: 'success', message: 'Bill deleted successfully' });
        } catch (error) {
          console.error('Delete error:', error);
          setToast({ isOpen: true, type: 'error', message: 'Failed to delete bill: ' + (error.message || 'Unknown error') });
        }
      }
    });
  };

  const handleStatusChange = async (billId, newStatus) => {
    try {
      await apiService.updateBillStatus(billId, newStatus);
      setBills(bills.map(bill =>
        bill._id === billId ? { ...bill, paymentStatus: newStatus } : bill
      ));
      setToast({
        isOpen: true,
        type: 'success',
        message: `Bill status updated to ${newStatus}`
      });
    } catch (error) {
      console.error('Status update error:', error);
      setToast({
        isOpen: true,
        type: 'error',
        message: 'Failed to update bill status: ' + (error.message || 'Unknown error')
      });
    }
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setShowModal(true);
  };

  const handleEditBill = (bill) => {
    window.location.href = `/billing?edit=${bill._id}`;
  };

  const handleCloseToast = () => {
    setToast({ isOpen: false, type: 'info', message: '' });
  };

  const handleCloseAlert = () => {
    setAlertModal({ isOpen: false, type: 'warning', title: '', message: '', onConfirm: null });
  };

  const handleDownloadBill = async (bill) => {
    try {
      let fileHandle = null;
      const suggestedName = `Invoice_${bill.billNumber || bill._id}.pdf`;

      if (window.showSaveFilePicker) {
        try {
          fileHandle = await window.showSaveFilePicker({
            suggestedName,
            types: [
              {
                description: 'PDF Files',
                accept: { 'application/pdf': ['.pdf'] }
              }
            ]
          });
        } catch (e) {
          // user canceled; fall back to normal download
        }
      }

      await apiService.downloadBillPDF(bill._id, fileHandle);
      setToast({ isOpen: true, type: 'success', message: 'PDF downloaded successfully' });
    } catch (error) {
      setToast({ isOpen: true, type: 'error', message: error.message || 'Failed to download PDF' });
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'paid') return matchesSearch && (bill.paymentStatus || 'unpaid') === 'paid';
    if (filterStatus === 'unpaid') return matchesSearch && (bill.paymentStatus || 'unpaid') === 'unpaid';
    if (filterStatus === 'recent') {
      const billDate = new Date(bill.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return matchesSearch && billDate > weekAgo;
    }
    if (filterStatus === 'high-value') {
      return matchesSearch && bill.totalAmount > 50000;
    }
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">View Bills</h1>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search bills..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Bills</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="recent">Recent (Last 7 days)</option>
            <option value="high-value">High Value ({'₹'}50,000+)</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Bills</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">{bills.length}</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <Receipt className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                ₹{bills.reduce((sum, bill) => sum + bill.totalAmount, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <Receipt className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">This Month</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {bills.filter(bill => {
                  const billDate = new Date(bill.createdAt);
                  const now = new Date();
                  return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <div className="bg-purple-100 p-4 rounded-full">
              <Receipt className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Bill Value</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                ₹{bills.length > 0 ? Math.round(bills.reduce((sum, bill) => sum + bill.totalAmount, 0) / bills.length).toLocaleString() : '0'}
              </p>
            </div>
            <div className="bg-orange-100 p-4 rounded-full">
              <Receipt className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.map((bill) => (
                <tr key={bill._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Receipt className="h-5 w-5 text-indigo-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{bill.billNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{bill.customer.name}</div>
                      <div className="text-sm text-gray-500">{bill.customer.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(bill.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">₹{bill.totalAmount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Select
                      value={bill.paymentStatus || 'unpaid'}
                      onChange={(e) => handleStatusChange(bill._id, e.target.value)}
                      options={[
                        { value: 'paid', label: 'Paid' },
                        { value: 'unpaid', label: 'Unpaid' }
                      ]}
                      variant="status"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewBill(bill)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="View Bill"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditBill(bill)}
                        className="text-yellow-600 hover:text-yellow-900 p-1"
                        title="Edit Bill"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDownloadBill(bill)}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteBill(bill._id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete Bill"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBills.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bills found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new bill.'}
            </p>
          </div>
        )}
      </div>

      {/* Bill Details Modal */}
      {showModal && selectedBill && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedBill.companyId?.companyName || 'Company'}</h3>
                  <p className="text-sm text-gray-500">Bill Details - {selectedBill.billNumber}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700">Customer Information</h4>
                    <p className="text-sm text-gray-600">{selectedBill.customer.name}</p>
                    <p className="text-sm text-gray-600">{selectedBill.customer.email}</p>
                    <p className="text-sm text-gray-600">{selectedBill.customer.phone}</p>
                    <p className="text-sm text-gray-600">{selectedBill.customer.address}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700">Bill Information</h4>
                    <p className="text-sm text-gray-600">Date: {formatDate(selectedBill.createdAt)}</p>
                    <p className="text-sm text-gray-600">GST: {selectedBill.taxType}</p>
                    <p className="text-sm text-gray-600">Status: Paid</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Items</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Sr. No.</th>
                          <th className="px-3 py-2 text-left">Item</th>
                          <th className="px-3 py-2 text-left">Qty</th>
                          <th className="px-3 py-2 text-left">Rate</th>
                          <th className="px-3 py-2 text-left">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBill.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2">{index + 1}</td>
                            <td className="px-3 py-2">{item.name}</td>
                            <td className="px-3 py-2">{item.quantity}</td>
                            <td className="px-3 py-2">₹{item.rate.toLocaleString()}</td>
                            <td className="px-3 py-2">₹{item.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{selectedBill.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST ({selectedBill.taxType}):</span>
                    <span>₹{selectedBill.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount:</span>
                    <span>-₹{selectedBill.discountAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span>₹{selectedBill.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadBill(selectedBill)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        onClose={handleCloseToast}
        type={toast.type}
        message={toast.message}
        duration={3000}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={handleCloseAlert}
        onConfirm={alertModal.onConfirm}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        confirmText="Confirm"
        showCancel={true}
      />
    </div>
  );
};

export default BillsList;
