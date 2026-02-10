import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Download, Save, Type } from 'lucide-react';
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
    { id: 1, type: 'item', name: '', quantity: 1, rate: 0, total: 0 }
  ]);

  const [taxType, setTaxType] = useState('0%');
  const [discountType, setDiscountType] = useState('fixed');
  const [discountValue, setDiscountValue] = useState(0);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editingBillId, setEditingBillId] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(null);
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
    const newItem = { id: newId, type: 'item', name: '', quantity: 1, rate: 0, total: 0 };

    if (focusedIndex !== null && focusedIndex >= 0 && focusedIndex < items.length) {
      const newItems = [...items];
      newItems.splice(focusedIndex + 1, 0, newItem);
      setItems(newItems);
      setFocusedIndex(focusedIndex + 1);
    } else {
      setItems([...items, newItem]);
      setFocusedIndex(items.length);
    }
  };

  const addHeading = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    const newItem = { id: newId, type: 'heading', name: '', quantity: 0, rate: 0, total: 0 };

    if (focusedIndex !== null && focusedIndex >= 0 && focusedIndex < items.length) {
      const newItems = [...items];
      newItems.splice(focusedIndex + 1, 0, newItem);
      setItems(newItems);
      setFocusedIndex(focusedIndex + 1);
    } else {
      setItems([...items, newItem]);
      setFocusedIndex(items.length);
    }
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
        if (item.type === 'item' && (field === 'quantity' || field === 'rate')) {
          updatedItem.total = updatedItem.quantity * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const toggleType = (id) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newType = item.type === 'item' ? 'heading' : 'item';
        if (newType === 'heading') {
          return { ...item, type: newType, quantity: 0, rate: 0, total: 0 };
        } else {
          return { ...item, type: newType, quantity: 1, rate: 0, total: 0 };
        }
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => {
    if (item.type === 'heading') return sum;
    return sum + item.total;
  }, 0);
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
      setItems(bill.items.map((it, i) => ({ id: i + 1, type: it.type || 'item', name: it.name, quantity: it.quantity, rate: it.rate, total: it.total })));
      setTaxType(bill.taxType);
      setDiscountType(bill.discountType);
      setDiscountValue(bill.discountValue || 0);
      setAdvanceAmount(bill.advanceAmount || 0);
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

    if (items.some(item => {
      if (item.type === 'heading') return !item.name;
      return !item.name || item.quantity <= 0 || item.rate < 0;
    })) {
      setError('Please fill in all item details with valid quantities and rates');
      setLoading(false);
      return;
    }

    try {
      const billData = {
        customer,
        items: items.filter(item => {
          if (item.type === 'heading') return item.name && item.name.trim() !== '';
          return item.name && item.quantity > 0 && item.rate >= 0;
        }),
        subtotal,
        taxType,
        taxAmount,
        discountType,
        discountValue,
        discountAmount,
        totalAmount,
        advanceAmount: parseFloat(advanceAmount) || 0
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
            setItems([{ id: 1, type: 'item', name: '', quantity: 1, rate: 0, total: 0 }]);
            setTaxType('0%');
            setDiscountType('fixed');
            setDiscountValue(0);
            setAdvanceAmount(0);
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
            setItems([{ id: 1, type: 'item', name: '', quantity: 1, rate: 0, total: 0 }]);
            setTaxType('0%');
            setDiscountType('fixed');
            setDiscountValue(0);
            setAdvanceAmount(0);
            setEditingBillId(null);
            navigate('/bills');
          }
        });
      }
    } catch (error) {
      setError(error);
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
          items: items.filter(item => {
            if (item.type === 'heading') return item.name && item.name.trim() !== '';
            return item.name && item.quantity > 0 && item.rate > 0;
          }),
          subtotal,
          taxType,
          taxAmount,
          discountType,
          discountValue,
          discountAmount,
          totalAmount,
          advanceAmount: parseFloat(advanceAmount) || 0
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
        setError(error);
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
        setError(error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Billing Services</h1>

      {error && (
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

      <div className="bg-white rounded-xl shadow-md p-3 md:p-8">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-6">Customer Details</h2>
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 md:gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Customer Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-[10px] md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              placeholder="customer@example.com"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-[10px] md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Phone</label>
            <input
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              placeholder="+91..."
            />
          </div>

          <div className="col-span-1">
            <label className="block text-[10px] md:text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Address</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              placeholder="City, State"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Items</h2>
        </div>

        {/* Mobile View - Item Cards */}
        <div className="md:hidden space-y-4">
          {items.map((item, idx) => (
            <div key={item.id} className={`bg-gray-50 rounded-lg p-4 space-y-3 relative ${item.type === 'heading' ? 'border-2 border-indigo-100' : ''}`}>
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => toggleType(item.id)}
                  className="p-1.5 text-indigo-500 hover:bg-indigo-100 rounded-full"
                  title={item.type === 'item' ? "Convert to Heading" : "Convert to Item"}
                >
                  <Type size={18} />
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  disabled={items.length === 1}
                  className="p-1.5 text-red-500 hover:bg-red-100 rounded-full disabled:opacity-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {item.type === 'heading' ? (
                <div className="pr-20">
                  <label className="text-xs font-semibold text-indigo-500 uppercase">Heading</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm font-bold bg-indigo-50/50"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    onFocus={() => setFocusedIndex(idx)}
                    placeholder="Section Heading"
                  />
                </div>
              ) : (
                <>
                  <div className="pr-10">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Item Name</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      onFocus={() => setFocusedIndex(idx)}
                      placeholder="Item description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        onFocus={() => setFocusedIndex(idx)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Rate (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        onFocus={() => setFocusedIndex(idx)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                    <span className="text-sm font-medium text-gray-600">Total:</span>
                    <span className="text-base font-bold text-gray-900">₹{item.total.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-x-auto">
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
                <tr key={item.id} className={`border-b border-gray-100 ${item.type === 'heading' ? 'bg-indigo-50/20' : ''}`}>
                  <td className="py-3 px-4 text-gray-700">{idx + 1}</td>

                  {item.type === 'heading' ? (
                    <td colSpan={4} className="py-3 px-4">
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg font-bold text-gray-800 bg-indigo-50/30 placeholder-indigo-300 text-center"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        onFocus={() => setFocusedIndex(idx)}
                        placeholder="Section Heading..."
                        autoFocus
                      />
                    </td>
                  ) : (
                    <>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          onFocus={() => setFocusedIndex(idx)}
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
                          onFocus={() => setFocusedIndex(idx)}
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
                          onFocus={() => setFocusedIndex(idx)}
                        />
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        ₹{item.total.toFixed(2)}
                      </td>
                    </>
                  )}

                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleType(item.id)}
                        className={`p-2 rounded-lg ${item.type === 'heading' ? 'text-indigo-600 bg-indigo-100' : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100'}`}
                        title={item.type === 'heading' ? "Convert to Item" : "Convert to Heading"}
                      >
                        <Type size={20} />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        disabled={items.length === 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-start">
          <button
            onClick={addItem}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            <Plus size={20} />
            <span>Add Item</span>
          </button>
          <button
            onClick={addHeading}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition duration-200 ml-3"
          >
            <Type size={20} />
            <span>Add Heading</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 md:p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Bill Summary</h2>

        <div className="space-y-4 max-w-md ml-auto">


          <div className="pt-2 border-t border-gray-200 space-y-2">
            <div className="flex justify-between items-center text-sm md:text-base">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-800">₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-sm md:text-base">
              <span className="text-gray-600">GST</span>
              <div className="flex items-center gap-2">
                <Select
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value)}
                  options={[
                    { value: '0%', label: '0%' },
                    { value: '5%', label: '5%' },
                    { value: '12%', label: '12%' },
                    { value: '18%', label: '18%' },
                    { value: '28%', label: '28%' }
                  ]}
                  className="w-20 md:w-32 py-1 text-xs md:text-sm"
                />
                <span className="font-semibold text-gray-800 min-w-[60px] text-right">₹{taxAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm md:text-base">
              <span className="text-gray-600">Discount</span>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <Select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    options={[
                      { value: 'fixed', label: '₹' },
                      { value: 'percentage', label: '%' }
                    ]}
                    className="w-14 md:w-20 py-1 text-xs md:text-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-16 md:w-24 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs md:text-sm"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <span className="font-semibold text-gray-800 min-w-[60px] text-right text-red-500">-₹{discountAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3 mt-2 border-t border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-base md:text-lg font-bold text-gray-800">Total</span>
                <span className="text-lg md:text-2xl font-bold text-indigo-600">₹{totalAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mb-2">
                <span className="text-xs md:text-sm font-medium text-gray-600">Advance</span>
                <div className="flex items-center">
                  <span className="text-gray-400 text-xs mr-1">-₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-20 md:w-28 px-2 py-1 border border-gray-200 rounded md:rounded-lg focus:ring-indigo-500 text-right text-sm bg-white"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm md:text-lg font-bold text-gray-700">Balance</span>
                <span className="text-base md:text-xl font-bold text-red-600">
                  ₹{Math.max(0, totalAmount - advanceAmount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
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
    </div >
  );
};

export default BillingService;
