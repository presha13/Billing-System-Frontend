import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, Edit, Trash2, Eye, Download, Search, Filter, CheckCircle, XCircle, Printer, FilePlus } from 'lucide-react';
import apiService from '../../services/api.js';
import Toast from '../common/Toast.jsx';
import AlertModal from '../common/AlertModal.jsx';
import Select from '../common/Select.jsx';
import Loader from '../common/Loader.jsx';
import { FinancialYearContext } from '../../contexts/FinancialYearContext.jsx';

const BillsList = () => {
  const navigate = useNavigate();
  const { currentFinancialYear } = useContext(FinancialYearContext);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBill, setSelectedBill] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBills, setSelectedBills] = useState([]);
  const [isDownloadingBulk, setIsDownloadingBulk] = useState(false);

  // Toast and Alert states
  const [toast, setToast] = useState({ isOpen: false, type: 'info', message: '' });
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'warning', title: '', message: '', onConfirm: null });

  useEffect(() => {
    if (currentFinancialYear) {
      fetchBills();
    }
  }, [currentFinancialYear]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const billsData = await apiService.getAllBills(currentFinancialYear._id);
      setBills(billsData);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
      setError('Failed to load bills');
      setBills([]);
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
    navigate(`/billing?edit=${bill._id}`);
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

  const handlePrintBill = async (bill) => {
    try {
      // Fetch PDF as a blob
      const response = await apiService.getBillPDFBlob(bill._id);

      // Create a Blob URL
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Open in a new window/iframe
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          // Optional: Clean up URL object after printing
          // window.URL.revokeObjectURL(url);
        };
      } else {
        setToast({ isOpen: true, type: 'error', message: 'Please allow popups to print the bill' });
      }
    } catch (error) {
      // If fetching the blob fails, or apiService lacks this specific method, fallback logic can go here.
      // Assuming apiService needs an update or we use the download endpoint differently.
      // If apiService.getBillPDFBlob doesn't exist, we might need to rely on the existing downloadBillPDF behavior
      // but modified to return the blob instead of auto-downloading.

      // Alternative: Just call the download URL in a new window which browser might treat as preview/print
      console.error('Print error:', error);
      setToast({ isOpen: true, type: 'error', message: 'Failed to prepare print: ' + (error.message || 'Unknown error') });
    }
  };

  const handleSelectBill = (billId) => {
    setSelectedBills((prev) =>
      prev.includes(billId) ? prev.filter(id => id !== billId) : [...prev, billId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBills.length === filteredBills.length && filteredBills.length > 0) {
      setSelectedBills([]);
    } else {
      setSelectedBills(filteredBills.map(bill => bill._id));
    }
  };

  const handleBulkDownload = async () => {
    if (selectedBills.length === 0) return;
    try {
      setIsDownloadingBulk(true);
      let fileHandle = null;
      if (window.showSaveFilePicker) {
        try {
          fileHandle = await window.showSaveFilePicker({
            suggestedName: 'Bulk_Invoices.pdf',
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

      await apiService.downloadBulkBillsPDF(selectedBills, fileHandle);
      setToast({ isOpen: true, type: 'success', message: 'Bulk PDF downloaded successfully' });
      setSelectedBills([]);
    } catch (error) {
      setToast({ isOpen: true, type: 'error', message: error.message || 'Failed to download Bulk PDF' });
    } finally {
      setIsDownloadingBulk(false);
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customer.name.toLowerCase().includes(searchTerm.toLowerCase());

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
    return <Loader message="Loading Bills" />;
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
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'All Bills' },
              { value: 'paid', label: 'Paid' },
              { value: 'unpaid', label: 'Unpaid' },
              { value: 'recent', label: 'Recent (Last 7 days)' },
              { value: 'high-value', label: 'High Value (₹50,000+)' }
            ]}
            className="w-full md:w-48"
            align="right"
          />
          {selectedBills.length > 0 && (
            <button
              onClick={handleBulkDownload}
              disabled={isDownloadingBulk}
              className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              {isDownloadingBulk ? (
                <>Downloading...</>
              ) : (
                <>
                  <Download size={18} />
                  <span>Download Selected ({selectedBills.length})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Bills</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">{bills.length}</p>
            </div>
            <div className="bg-blue-100 p-3 lg:p-4 rounded-full">
              <Receipt className="text-blue-600 w-5 h-5 lg:w-6 lg:h-6" />
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
            <div className="bg-green-100 p-3 lg:p-4 rounded-full">
              <Receipt className="text-green-600 w-5 h-5 lg:w-6 lg:h-6" />
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
            <div className="bg-purple-100 p-3 lg:p-4 rounded-full">
              <Receipt className="text-purple-600 w-5 h-5 lg:w-6 lg:h-6" />
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
            <div className="bg-orange-100 p-3 lg:p-4 rounded-full">
              <Receipt className="text-orange-600 w-5 h-5 lg:w-6 lg:h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Mobile View - Cards */}
        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-3 p-3">
          {filteredBills.map((bill) => (
            <div key={bill._id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedBills.includes(bill._id)}
                    onChange={() => handleSelectBill(bill._id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <div className="p-1.5 bg-indigo-50 rounded-lg">
                    <Receipt className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">{bill.billNumber}</span>
                    <span className="text-[10px] text-gray-500">{formatDate(bill.createdAt)}</span>
                  </div>
                </div>
                <Select
                  value={bill.paymentStatus || 'unpaid'}
                  onChange={(e) => handleStatusChange(bill._id, e.target.value)}
                  options={[
                    { value: 'paid', label: 'Paid' },
                    { value: 'unpaid', label: 'Unpaid' }
                  ]}
                  variant="status"
                  align="right"
                  className="text-[10px] py-0.5 px-2 h-6"
                />
              </div>

              <div className="pt-2 border-t border-gray-50">
                <p className="text-xs font-medium text-gray-900">{bill.customer.name}</p>
                <p className="text-[10px] text-gray-500 truncate">Event: {new Date(bill.customer.eventDate).toLocaleDateString('en-IN')}</p>
              </div>

              <div className="pt-2 border-t border-gray-50 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900">₹{bill.totalAmount.toLocaleString()}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewBill(bill)}
                    className="text-indigo-600 hover:bg-indigo-50 p-1 rounded-full transition-colors"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleEditBill(bill)}
                    className="text-yellow-600 hover:bg-yellow-50 p-1 rounded-full transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to convert this bill to a quotation?')) {
                        try {
                          await apiService.convertToQuotation(bill._id);
                          setToast({ isOpen: true, type: 'success', message: 'Converted to Quotation successfully!' });
                        } catch (error) {
                          setToast({ isOpen: true, type: 'error', message: 'Conversion failed: ' + error.message });
                        }
                      }
                    }}
                    className="text-teal-600 hover:bg-teal-50 p-1 rounded-full transition-colors"
                    title="Convert to Quotation"
                  >
                    <FilePlus size={16} />
                  </button>
                  <button
                    onClick={() => handleDownloadBill(bill)}
                    className="text-green-600 hover:bg-green-50 p-1 rounded-full transition-colors"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteBill(bill._id)}
                    className="text-red-600 hover:bg-red-50 p-1 rounded-full transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    checked={selectedBills.length === filteredBills.length && filteredBills.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
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
                <tr key={bill._id} className={`hover:bg-gray-50 ${selectedBills.includes(bill._id) ? 'bg-indigo-50/50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedBills.includes(bill._id)}
                      onChange={() => handleSelectBill(bill._id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Receipt className="h-5 w-5 text-indigo-600 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{bill.billNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{bill.customer.name}</div>
                      <div className="text-sm text-gray-500">Event: {new Date(bill.customer.eventDate).toLocaleDateString('en-IN')}</div>
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
                      align="right"
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
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to convert this bill to a quotation?')) {
                            try {
                              await apiService.convertToQuotation(bill._id);
                              setToast({ isOpen: true, type: 'success', message: 'Converted to Quotation successfully!' });
                            } catch (error) {
                              setToast({ isOpen: true, type: 'error', message: 'Conversion failed: ' + error.message });
                            }
                          }
                        }}
                        className="text-teal-600 hover:text-teal-900 p-1"
                        title="Convert to Quotation"
                      >
                        <FilePlus size={16} />
                      </button>
                      <button
                        onClick={() => handleDownloadBill(bill)}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handlePrintBill(bill)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Print Bill"
                      >
                        <Printer size={16} />
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
                    <p className="text-sm text-gray-600">Event Date: {new Date(selectedBill.customer.eventDate).toLocaleDateString('en-IN')}</p>
                    <p className="text-sm text-gray-600">{selectedBill.customer.phone}</p>
                    <p className="text-sm text-gray-600">{selectedBill.customer.address}</p>
                    {selectedBill.customer.reference && (
                      <p className="text-sm text-gray-600"><span className="font-medium">Ref:</span> {selectedBill.customer.reference}</p>
                    )}
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
                        {(() => {
                          let serialNumber = 0;
                          return selectedBill.items.map((item, index) => {
                            const isHeading = item.type === 'heading';
                            if (!isHeading) serialNumber++;

                            return (
                              <tr key={index} className={isHeading ? "bg-gray-50 bg-opacity-70" : ""}>
                                <td className="px-3 py-2 font-medium text-gray-500">{isHeading ? "" : serialNumber}</td>
                                {isHeading ? (
                                  <td colSpan={4} className="px-3 py-2 font-bold text-center text-indigo-800 bg-indigo-50 border-b border-indigo-100">
                                    {item.name}
                                  </td>
                                ) : (
                                  <>
                                    <td className="px-3 py-2">{item.name}</td>
                                    <td className="px-3 py-2">{item.quantity}</td>
                                    <td className="px-3 py-2">₹{item.rate.toLocaleString()}</td>
                                    <td className="px-3 py-2">₹{item.total.toLocaleString()}</td>
                                  </>
                                )}
                              </tr>
                            );
                          });
                        })()}
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
