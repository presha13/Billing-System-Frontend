import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Download, Save } from 'lucide-react';
import apiService from '../../services/api.js';
import Select from '../common/Select.jsx';
import AlertModal from '../common/AlertModal.jsx';

const BillingService = () => {
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [items, setItems] = useState([
    { id: 1, name: '', quantity: 1, rate: 0, total: 0 }
  ]);

  const [taxType, setTaxType] = useState('0%');
  const [discountType, setDiscountType] = useState('fixed');
  const [discountValue, setDiscountValue] = useState(0);
<<<<<<< HEAD
  const [advanceAmount, setAdvanceAmount] = useState(0);
=======
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
  const [loading, setLoading] = useState(false);
  const [editingBillId, setEditingBillId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    onConfirm: null
  });

  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    setItems([...items, { id: newId, name: '', quantity: 1, rate: 0, total: 0 }]);
  };

  const deleteItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.total = updatedItem.quantity * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = taxType === '0%' ? 0 : taxType === '5%' ? 0.05 : taxType === '12%' ? 0.12 : taxType === '18%' ? 0.18 : 0.28;
  const taxAmount = subtotal * taxRate;

  const discountAmount = discountType === 'fixed'
    ? discountValue
    : (subtotal * discountValue) / 100;

  const totalAmount = subtotal + taxAmount - discountAmount;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    if (editId) {
      setEditingBillId(editId);
      preloadBill(editId);
    }
  }, [location.search]);

  const preloadBill = async (id) => {
    try {
      setLoading(true);
      const bill = await apiService.getBillById(id);
      setCustomer(bill.customer);
      setItems(bill.items.map((it, i) => ({ id: i + 1, name: it.name, quantity: it.quantity, rate: it.rate, total: it.total })));
      setTaxType(bill.taxType);
      setDiscountType(bill.discountType);
      setDiscountValue(bill.discountValue || 0);
<<<<<<< HEAD
      setAdvanceAmount(bill.advanceAmount || 0);
=======
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
    } catch (e) {
      console.error('Failed to load bill', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBill = async () => {
    setLoading(true);
    setError('');

    // Client-side validation
    if (!customer.name || !customer.email || !customer.phone || !customer.address) {
      setError('Please fill in all customer details');
      setLoading(false);
      return;
    }

    if (items.some(item => !item.name || item.quantity <= 0 || item.rate <= 0)) {
      setError('Please fill in all item details with valid quantities and rates');
      setLoading(false);
      return;
    }

    try {
      const billData = {
        customer,
        items: items.filter(item => item.name && item.quantity > 0 && item.rate > 0),
        subtotal,
        taxType,
        taxAmount,
        discountType,
        discountValue,
        discountAmount,
<<<<<<< HEAD
        totalAmount,
        advanceAmount: parseFloat(advanceAmount) || 0
=======
        totalAmount
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
      };

      if (editingBillId) {
        await apiService.updateBill(editingBillId, billData);
        setSuccessModal({
          isOpen: true,
          type: 'success',
          title: 'Bill Updated',
          message: 'Bill has been updated successfully!',
          onConfirm: () => {
            setSuccessModal({ isOpen: false, type: 'success', title: '', message: '', onConfirm: null });
            // Reset form
            setCustomer({ name: '', email: '', phone: '', address: '' });
            setItems([{ id: 1, name: '', quantity: 1, rate: 0, total: 0 }]);
            setTaxType('0%');
            setDiscountType('fixed');
            setDiscountValue(0);
<<<<<<< HEAD
            setAdvanceAmount(0);
=======
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
            setEditingBillId(null);
            navigate('/bills');
          }
        });
      } else {
        await apiService.createBill(billData);
        setSuccessModal({
          isOpen: true,
          type: 'success',
          title: 'Bill Created',
          message: 'Bill has been created successfully!',
          onConfirm: () => {
            setSuccessModal({ isOpen: false, type: 'success', title: '', message: '', onConfirm: null });
            // Reset form
            setCustomer({ name: '', email: '', phone: '', address: '' });
            setItems([{ id: 1, name: '', quantity: 1, rate: 0, total: 0 }]);
            setTaxType('0%');
            setDiscountType('fixed');
            setDiscountValue(0);
<<<<<<< HEAD
            setAdvanceAmount(0);
=======
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
            setEditingBillId(null);
            navigate('/bills');
          }
        });
      }
    } catch (error) {
<<<<<<< HEAD
      setError(error);
=======
      setError(error.message || 'Failed to save bill');
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    // Check if bill is saved (has an ID)
    if (!editingBillId) {
      // If bill is not saved, save it first
      try {
        setLoading(true);
        const billData = {
          customer,
          items: items.filter(item => item.name && item.quantity > 0 && item.rate > 0),
          subtotal,
          taxType,
          taxAmount,
          discountType,
          discountValue,
          discountAmount,
<<<<<<< HEAD
          totalAmount,
          advanceAmount: parseFloat(advanceAmount) || 0
=======
          totalAmount
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
        };

        const response = await apiService.createBill(billData);
        const newBillId = response.bill._id;
        setEditingBillId(newBillId);

        // Now download the PDF
        await apiService.downloadBillPDF(newBillId);

        setSuccessModal({
          isOpen: true,
          type: 'success',
          title: 'Bill Created & Downloaded',
          message: 'Bill has been created and PDF downloaded successfully!',
          onConfirm: () => {
            setSuccessModal({ isOpen: false, type: 'success', title: '', message: '', onConfirm: null });
            navigate('/bills');
          }
        });
      } catch (error) {
<<<<<<< HEAD
        setError(error);
=======
        setError(error.message || 'Failed to create and download PDF');
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
      } finally {
        setLoading(false);
      }
    } else {
      // Bill is already saved, just download the PDF
      try {
        await apiService.downloadBillPDF(editingBillId);
        setSuccessModal({
          isOpen: true,
          type: 'success',
          title: 'PDF Downloaded',
          message: 'PDF has been downloaded successfully!',
          onConfirm: () => {
            setSuccessModal({ isOpen: false, type: 'success', title: '', message: '', onConfirm: null });
          }
        });
      } catch (error) {
<<<<<<< HEAD
        setError(error);
=======
        setError(error.message || 'Failed to download PDF');
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Billing Services</h1>

      {error && (
<<<<<<< HEAD
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-slide-down">
          <div className="font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            {typeof error === 'string' ? error : error.message}
          </div>
          {error.details && (
            <div className="mt-2 pl-4 text-sm text-red-600 space-y-1">
              {Array.isArray(error.details) ? (
                error.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    {detail}
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  {error.details}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-4 md:p-8">
=======
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-8">
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
        <h2 className="text-xl font-bold text-gray-800 mb-6">Customer Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              placeholder="customer@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              placeholder="123 MG Road, Mumbai, Maharashtra"
            />
          </div>
        </div>
      </div>

<<<<<<< HEAD
      <div className="bg-white rounded-xl shadow-md p-4 md:p-8">
=======
      <div className="bg-white rounded-xl shadow-md p-8">
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Items</h2>
          <button
            onClick={addItem}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            <Plus size={20} />
            <span>Add Item</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 w-16">Sr. No.</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Item Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rate (₹)</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total (₹)</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      placeholder="Item name"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800">
                    ₹{item.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => deleteItem(item.id)}
                      disabled={items.length === 1}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

<<<<<<< HEAD
      <div className="bg-white rounded-xl shadow-md p-4 md:p-8">
=======
      <div className="bg-white rounded-xl shadow-md p-8">
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
        <h2 className="text-xl font-bold text-gray-800 mb-6">Bill Summary</h2>

        <div className="space-y-4 max-w-md ml-auto">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Subtotal:</span>
            <span className="font-semibold text-gray-800">₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700">GST:</span>
            <Select
              value={taxType}
              onChange={(e) => setTaxType(e.target.value)}
              options={[
                { value: '0%', label: '0% (No GST)' },
                { value: '5%', label: '5% (GST)' },
                { value: '12%', label: '12% (GST)' },
                { value: '18%', label: '18% (GST)' },
                { value: '28%', label: '28% (GST)' }
              ]}
              className="w-40"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700">GST Amount:</span>
            <span className="font-semibold text-gray-800">₹{taxAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center space-x-4">
            <span className="text-gray-700">Discount:</span>
            <div className="flex space-x-2">
              <Select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                options={[
                  { value: 'fixed', label: 'Fixed (₹)' },
                  { value: 'percentage', label: 'Percentage (%)' }
                ]}
                className="w-36"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700">Discount Amount:</span>
            <span className="font-semibold text-gray-800">-₹{discountAmount.toFixed(2)}</span>
          </div>

          <div className="border-t-2 border-gray-200 pt-4 flex justify-between items-center">
            <span className="text-xl font-bold text-gray-800">Total Amount:</span>
            <span className="text-2xl font-bold text-indigo-600">₹{totalAmount.toFixed(2)}</span>
          </div>
<<<<<<< HEAD

          <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
            <span className="text-gray-700 font-medium">Advance Paid:</span>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">-₹</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-right"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-bold text-gray-800">Balance Due:</span>
            <span className="text-xl font-bold text-red-600">
              ₹{Math.max(0, totalAmount - advanceAmount).toFixed(2)}
            </span>
          </div>
=======
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
          >
            <Download size={20} />
            <span>Download PDF</span>
          </button>
          <button
            onClick={handleSaveBill}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 disabled:opacity-50"
          >
            <Save size={20} />
            <span>{loading ? 'Saving...' : editingBillId ? 'Update Bill' : 'Save Bill'}</span>
          </button>
        </div>
      </div>

      {/* Success Alert Modal */}
      <AlertModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, type: 'success', title: '', message: '', onConfirm: null })}
        onConfirm={successModal.onConfirm}
        type={successModal.type}
        title={successModal.title}
        message={successModal.message}
        confirmText="OK"
        showCancel={false}
      />
<<<<<<< HEAD
    </div >
=======
    </div>
>>>>>>> 2f536ddab27e090fc324802b7ea301820f45143a
  );
};

export default BillingService;
