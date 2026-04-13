import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Download, Save, Type } from 'lucide-react';
import apiService from '../../services/api.js';
import Select from '../common/Select.jsx';
import AlertModal from '../common/AlertModal.jsx';
import VoiceInput from '../common/VoiceInput.jsx';
import SmartVoiceRowInput from '../common/SmartVoiceRowInput.jsx';

const BillingService = () => {
  const [customer, setCustomer] = useState({
    name: '',
    eventDate: '',
    phone: '',
    address: '',
    reference: ''
  });

  const [items, setItems] = useState([
    { id: 1, type: 'item', name: '', quantity: 1, days: 1, rate: 0, total: 0 }
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
  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    eventDate: false,
    phone: false,
    address: false,
    items: false
  });
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    onConfirm: null
  });

  /* Autocomplete & Suggestions Logic */
  const [commonProducts, setCommonProducts] = useState([]);
  const [suggestions, setSuggestions] = useState({
    visible: false,
    list: [],
    activeIndex: -1, // Use -1 to indicate no selection
    rowIndex: null, // Which row is currently showing suggestions
    position: { top: 0, left: 0 } // Position for the suggestions dropdown
  });

  useEffect(() => {
    const fetchCommonProducts = async () => {
      try {
        const products = await apiService.getCommonProducts();
        setCommonProducts(products);
      } catch (err) {
        console.error('Failed to load common products', err);
      }
    };
    fetchCommonProducts();
  }, []);

  const handleSuggestionSelect = (product, index) => {
    console.log("Selected product:", product); // Debugging
    setItems(currentItems => {
      const newItems = [...currentItems];
      if (newItems[index]) {
        const rate = parseFloat(product.price) || 0;
        const days = newItems[index].days || 1;
        newItems[index] = {
          ...newItems[index],
          name: product.name,
          rate: rate,
          quantity: 1,
          total: rate * 1 * days
        };
      }
      return newItems;
    });
    // Hide suggestions immediately
    setSuggestions(prev => ({ ...prev, visible: false, rowIndex: null, activeIndex: -1 }));
  };

  const handleKeyDown = (e, idx) => {
    if (!suggestions.visible || suggestions.rowIndex !== idx) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSuggestions(prev => ({
        ...prev,
        activeIndex: prev.activeIndex < prev.list.length - 1 ? prev.activeIndex + 1 : 0
      }));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSuggestions(prev => ({
        ...prev,
        activeIndex: prev.activeIndex > 0 ? prev.activeIndex - 1 : prev.list.length - 1
      }));
    } else if (e.key === 'Enter') {
      if (suggestions.activeIndex >= 0 && suggestions.list[suggestions.activeIndex]) {
        e.preventDefault();
        handleSuggestionSelect(suggestions.list[suggestions.activeIndex], idx);
      }
    } else if (e.key === 'Escape') {
      setSuggestions(prev => ({ ...prev, visible: false, rowIndex: null, activeIndex: -1 }));
    }
  };

  // Auto-focus helper: focuses the name input of the row at the given index
  const focusItemName = (index) => {
    setTimeout(() => {
      const inputs = document.querySelectorAll(`[data-item-name-index="${index}"]`);
      for (const input of inputs) {
        if (input.offsetParent !== null) {
          input.focus();
          break;
        }
      }
    }, 50);
  };

  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    const newItem = { id: newId, type: 'item', name: '', quantity: 1, days: 1, rate: 0, total: 0 };

    let newIndex;
    if (focusedIndex !== null && focusedIndex >= 0 && focusedIndex < items.length) {
      const newItems = [...items];
      newItems.splice(focusedIndex + 1, 0, newItem);
      setItems(newItems);
      newIndex = focusedIndex + 1;
      setFocusedIndex(newIndex);
    } else {
      setItems([...items, newItem]);
      newIndex = items.length;
      setFocusedIndex(newIndex);
    }
    if (fieldErrors.items) setFieldErrors({ ...fieldErrors, items: false });
    focusItemName(newIndex);
  };

  const handleSmartLineItem = ({ name, quantity, rate }) => {
    // Voice Input detected: "Apple 5 100"
    setItems(prevItems => {
      const newItems = [...prevItems];
      const lastIndex = newItems.length - 1;
      const lastItem = newItems[lastIndex];

      // 1. Fill current empty row OR append new row
      if (lastItem && (!lastItem.name || lastItem.name.trim() === '')) {
        const days = lastItem.days || 1;
        // Update the last empty item
        newItems[lastIndex] = {
          ...lastItem,
          name,
          quantity: parseFloat(quantity) || 1,
          rate: parseFloat(rate) || 0,
          total: (parseFloat(quantity) || 1) * (parseFloat(rate) || 0) * days
        };
      } else {
        // Append new item
        const newId = Math.max(...newItems.map(i => i.id), 0) + 1;
        newItems.push({
          id: newId,
          type: 'item',
          name,
          quantity: parseFloat(quantity) || 1,
          days: 1,
          rate: parseFloat(rate) || 0,
          total: (parseFloat(quantity) || 1) * (parseFloat(rate) || 0)
        });
      }

      // 2. Always add a NEXT blank row for continuous input
      const nextId = Math.max(...newItems.map(i => i.id), 0) + 1;
      newItems.push({
        id: nextId,
        type: 'item',
        name: '',
        quantity: 1,
        days: 1,
        rate: 0,
        total: 0
      });

      return newItems;
    });
    if (fieldErrors.items) setFieldErrors({ ...fieldErrors, items: false });
  };

  const addHeading = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    const newItem = { id: newId, type: 'heading', name: '', quantity: 0, days: 1, rate: 0, total: 0 };

    let newIndex;
    if (focusedIndex !== null && focusedIndex >= 0 && focusedIndex < items.length) {
      const newItems = [...items];
      newItems.splice(focusedIndex + 1, 0, newItem);
      setItems(newItems);
      newIndex = focusedIndex + 1;
      setFocusedIndex(newIndex);
    } else {
      setItems([...items, newItem]);
      newIndex = items.length;
      setFocusedIndex(newIndex);
    }
    if (fieldErrors.items) setFieldErrors({ ...fieldErrors, items: false });
    focusItemName(newIndex);
  };

  const deleteItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  /* Update Item Helper to handle suggestions */
  const updateItem = (id, field, value) => {
    setItems(prevItems => {
      return prevItems.map((item, index) => {
        if (item.id === id) {
            // Calculate total if quantity, days, or rate changes
            let updatedItem = { ...item, [field]: value };
            if (updatedItem.type === 'item') {
              if (field === 'quantity' || field === 'days' || field === 'rate') {
                const qty = parseFloat(field === 'quantity' ? value : item.quantity) || 0;
                const days = parseFloat(field === 'days' ? value : item.days) || 1;
                const rate = parseFloat(field === 'rate' ? value : item.rate) || 0;
                updatedItem.total = qty * days * rate;
              }
            }

          // Handle suggestions if name changes
          if (field === 'name') {
            if (value && value.length > 0) {
              const matches = commonProducts.filter(p =>
                p.name.toLowerCase().includes(value.toLowerCase())
              );

              // Only show if there are matches and it's not an exact match (to hide after selection)
              if (matches.length > 0 && matches[0].name !== value) {
                // Simply set suggestions state. The UI rendering will need to be position aware or just inline.
                // For simplicity in this table row layout, we'll store the rowIndex.
                setSuggestions({
                  visible: true,
                  list: matches.slice(0, 5), // Limit to top 5
                  activeIndex: -1,
                  rowIndex: index
                });
              } else {
                setSuggestions(prev => ({ ...prev, visible: false, rowIndex: null }));
              }
            } else {
              setSuggestions(prev => ({ ...prev, visible: false, rowIndex: null }));
            }
          }

          return updatedItem;
        }
        return item;
      });
    });
    if (fieldErrors.items) setFieldErrors({ ...fieldErrors, items: false });
  };

  const toggleType = (id) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newType = item.type === 'item' ? 'heading' : 'item';
        if (newType === 'heading') {
          return { ...item, type: newType, quantity: 0, days: 1, rate: 0, total: 0 };
        } else {
          return { ...item, type: newType, quantity: 1, days: 1, rate: 0, total: 0 };
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
      setItems(bill.items.map((it, i) => ({ id: i + 1, type: it.type || 'item', name: it.name, quantity: it.quantity, days: it.days || 1, rate: it.rate, total: it.total })));
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

  // Keyboard shortcuts for billing page
  useEffect(() => {
    const handleBillingShortcuts = (e) => {
      // Check if user is typing in an input/textarea
      const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);

      if (e.altKey) {
        if (e.key.toLowerCase() === 'a') {
          e.preventDefault();
          addItem();
        } else if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          document.getElementById('save-bill-btn')?.click();
        } else if (e.key.toLowerCase() === 'h') {
          e.preventDefault();
          // Add a heading row
          const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
          const newHeading = { id: newId, type: 'heading', name: '', quantity: 0, days: 1, rate: 0, total: 0 };
          if (focusedIndex !== null && focusedIndex >= 0 && focusedIndex < items.length) {
            const newItems = [...items];
            newItems.splice(focusedIndex + 1, 0, newHeading);
            setItems(newItems);
          } else {
            setItems([...items, newHeading]);
          }
        } else if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          // Focus on customer name field
          document.querySelector('input[placeholder*="Customer"]')?.focus();
        } else if (e.key.toLowerCase() === 'r') {
          e.preventDefault();
          // Clear/Reset form
          if (confirm('Are you sure you want to clear the form?')) {
            setCustomer({ name: '', eventDate: '', phone: '', address: '', reference: '' });
            setItems([{ id: 1, type: 'item', name: '', quantity: 1, days: 1, rate: 0, total: 0 }]);
            setTaxType('0%');
            setDiscountType('fixed');
            setDiscountValue(0);
            setAdvanceAmount(0);
            setEditingBillId(null);
          }
        }
      } else if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd shortcuts
        if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          document.getElementById('save-bill-btn')?.click();
        } else if (e.key.toLowerCase() === 'p') {
          e.preventDefault();
          handleDownloadPDF();
        }
      }

      // Delete focused item with Delete key
      if (e.key === 'Delete' && !isTyping && focusedIndex !== null) {
        e.preventDefault();
        const itemToDelete = items[focusedIndex];
        if (itemToDelete && items.length > 1) {
          deleteItem(itemToDelete.id);
        }
      }
    };

    window.addEventListener('keydown', handleBillingShortcuts);
    return () => window.removeEventListener('keydown', handleBillingShortcuts);
  }, [items, focusedIndex]);

  // Validation Helper Function
  const validateBill = () => {
    const errors = {
      name: false,
      eventDate: false,
      phone: false,
      address: false,
      items: false
    };

    const missingFields = [];

    // Check customer details
    if (!customer.name || customer.name.trim() === '') {
      errors.name = true;
      missingFields.push('Customer Name');
    }

    if (!customer.eventDate || customer.eventDate.trim() === '') {
      errors.eventDate = true;
      missingFields.push('Event Date');
    }

    if (!customer.phone || customer.phone.trim() === '') {
      errors.phone = true;
      missingFields.push('Phone Number');
    }

    if (!customer.address || customer.address.trim() === '') {
      errors.address = true;
      missingFields.push('Address');
    }

    // Check items
    const validItems = items.filter(item => {
      if (item.type === 'heading') return item.name && item.name.trim() !== '';
      return item.name && item.name.trim() !== '' && item.quantity > 0 && item.rate > 0;
    });

    if (validItems.length === 0) {
      errors.items = true;
      missingFields.push('Valid Items (at least one item with name, quantity, and rate)');
    }

    // Check for incomplete items
    const incompleteItem = items.find(item => {
      if (item.type === 'heading') return false;
      return !item.name || item.name.trim() === '' || item.quantity <= 0 || item.rate <= 0;
    });

    if (incompleteItem && !errors.items) {
      errors.items = true;
      missingFields.push('Complete Item Details (all items must have name, quantity > 0, and rate > 0)');
    }

    // Set all field errors at once
    setFieldErrors(errors);

    // If there are missing fields, show alert with all of them
    if (missingFields.length > 0) {
      setSuccessModal({
        isOpen: true,
        type: 'error',
        title: 'Missing Required Fields',
        message: (
          <div>
            <p className="mb-3">Please fill in the following required fields:</p>
            <ul className="list-disc list-inside space-y-1">
              {missingFields.map((field, index) => (
                <li key={index} className="text-red-700">{field}</li>
              ))}
            </ul>
          </div>
        ),
        onConfirm: () => setSuccessModal({ isOpen: false, type: 'success', title: '', message: '', onConfirm: null })
      });
      return false;
    }

    // Clear all errors if validation passes
    setFieldErrors({ name: false, eventDate: false, phone: false, address: false, items: false });
    return true;
  };

  const handleSaveBill = async () => {
    // Validate first
    if (!validateBill()) {
      return;
    }

    setLoading(true);
    setError('');

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
            setItems([{ id: 1, type: 'item', name: '', quantity: 1, days: 1, rate: 0, total: 0 }]);
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
      setSuccessModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error?.message || 'An error occurred while saving the bill. Please try again.',
        onConfirm: () => setSuccessModal({ isOpen: false, type: 'success', title: '', message: '', onConfirm: null })
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    // Check if bill is saved (has an ID)
    if (!editingBillId) {
      // Validate first before creating
      if (!validateBill()) {
        return;
      }

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
        setSuccessModal({
          isOpen: true,
          type: 'error',
          title: 'Error Creating Bill',
          message: error?.message || 'An error occurred while creating the bill. Please try again.',
          onConfirm: () => setSuccessModal({ isOpen: false, type: 'success', title: '', message: '', onConfirm: null })
        });
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
        setSuccessModal({
          isOpen: true,
          type: 'error',
          title: 'Error Downloading PDF',
          message: error?.message || 'An error occurred while downloading the PDF. Please try again.',
          onConfirm: () => setSuccessModal({ isOpen: false, type: 'success', title: '', message: '', onConfirm: null })
        });
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

      <div className="bg-white rounded-xl shadow-md p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Customer Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Customer Name</label>
            <input
              type="text"
              className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 text-sm transition-colors ${
                fieldErrors.name 
                  ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-indigo-500'
              }`}
              value={customer.name}
              onChange={(e) => {
                setCustomer({ ...customer, name: e.target.value });
                if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: false });
              }}
              placeholder="John Doe"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Event Date</label>
            <input
              type="date"
              className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 text-sm transition-colors ${
                fieldErrors.eventDate 
                  ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-indigo-500'
              }`}
              value={customer.eventDate ? new Date(customer.eventDate).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                setCustomer({ ...customer, eventDate: e.target.value });
                if (fieldErrors.eventDate) setFieldErrors({ ...fieldErrors, eventDate: false });
              }}
            />
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 text-sm transition-colors ${
                fieldErrors.phone 
                  ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-indigo-500'
              }`}
              value={customer.phone}
              onChange={(e) => {
                setCustomer({ ...customer, phone: e.target.value });
                if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: false });
              }}
              placeholder="+91..."
              required
            />
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Address</label>
            <input
              type="text"
              className={`w-full px-3 py-1.5 border rounded-lg focus:ring-2 text-sm transition-colors ${
                fieldErrors.address 
                  ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-indigo-500'
              }`}
              value={customer.address}
              onChange={(e) => {
                setCustomer({ ...customer, address: e.target.value });
                if (fieldErrors.address) setFieldErrors({ ...fieldErrors, address: false });
              }}
              placeholder="City, State"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Ref. Name</label>
            <input
              type="text"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              value={customer.reference || ''}
              onChange={(e) => setCustomer({ ...customer, reference: e.target.value })}
              placeholder="Optional"
            />
          </div>
        </div>
      </div>

      <div className={`bg-white rounded-xl shadow-md p-4 md:p-8 transition-colors ${
        fieldErrors.items 
          ? 'border-2 border-red-500 bg-red-50/30' 
          : 'border border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${fieldErrors.items ? 'text-red-600' : 'text-gray-800'}`}>Items</h2>
          <SmartVoiceRowInput onItemComplete={handleSmartLineItem} onClick={() => {
            if (fieldErrors.items) setFieldErrors({ ...fieldErrors, items: false });
          }} />
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
                    data-item-name-index={idx}
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
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        data-item-name-index={idx}
                        value={item.name}
                        onChange={(e) => {
                          updateItem(item.id, 'name', e.target.value);
                          setSuggestions(prev => ({ ...prev, rowIndex: idx }));
                        }}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        onFocus={() => {
                          setFocusedIndex(idx);
                          setSuggestions(prev => ({ ...prev, rowIndex: idx }));
                        }}
                        onBlur={() => setTimeout(() => setSuggestions(prev => ({ ...prev, visible: false, rowIndex: null })), 200)}
                        placeholder="Item description"
                      />
                      {suggestions.visible && suggestions.rowIndex === idx && suggestions.list.length > 0 && (
                        <div className="absolute z-[60] left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                          {suggestions.list.map((sGroup, sIdx) => (
                            <div
                              key={sIdx}
                              id={`suggestion-mobile-${idx}-${sIdx}`}
                              className={`px-4 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${suggestions.activeIndex === sIdx ? 'bg-indigo-100' : 'hover:bg-indigo-50'}`}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSuggestionSelect(sGroup, idx);
                              }}
                            >
                              <div className="font-medium text-gray-900 text-sm">{sGroup.name}</div>
                              <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                                <span className="font-semibold text-indigo-600">₹{sGroup.price}</span>
                                <span className="bg-gray-100 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide">{sGroup.unit}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value === '' ? '' : parseFloat(e.target.value))}
                        onBlur={(e) => { if (e.target.value === '') updateItem(item.id, 'quantity', 1); }}
                        onFocus={() => setFocusedIndex(idx)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Days</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                        value={item.days || 1}
                        onChange={(e) => updateItem(item.id, 'days', Math.max(1, parseInt(e.target.value) || 1))}
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
                        value={item.rate === 0 ? '' : item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', e.target.value === '' ? '' : parseFloat(e.target.value))}
                        onBlur={(e) => { if (e.target.value === '') updateItem(item.id, 'rate', 0); }}
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
        <div className="hidden md:block overflow-visible">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 w-16">Sr. No.</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Item Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 w-20">Days</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rate (₹)</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total (₹)</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let serialNumber = 0;
                return items.map((item, idx) => {
                  const currentSerial = item.type === 'item' ? ++serialNumber : '';
                  return (
                    <tr key={item.id} className={`border-b border-gray-100 ${item.type === 'heading' ? 'bg-indigo-50/20' : ''}`}>
                      <td className="py-3 px-4 text-gray-700">{currentSerial}</td>

                      {item.type === 'heading' ? (
                        <td colSpan={5} className="py-3 px-4">
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-indigo-200 rounded-lg font-bold text-gray-800 bg-indigo-50/30 placeholder-indigo-300 text-center"
                            data-item-name-index={idx}
                            value={item.name}
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            onFocus={() => setFocusedIndex(idx)}
                            placeholder="Section Heading..."
                          />
                        </td>
                      ) : (
                        <>
                          <td className="py-3 px-4 relative">
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              data-item-name-index={idx}
                              value={item.name}
                              onChange={(e) => {
                                updateItem(item.id, 'name', e.target.value);
                                setSuggestions(prev => ({ ...prev, rowIndex: idx })); // Ensure we track row
                              }}
                              onKeyDown={(e) => handleKeyDown(e, idx)}
                              onFocus={() => {
                                setFocusedIndex(idx);
                                setSuggestions(prev => ({ ...prev, rowIndex: idx }));
                              }}
                              onBlur={() => {
                                // Delay hiding to allow click
                                setTimeout(() => setSuggestions(prev => ({ ...prev, visible: false, rowIndex: null })), 200);
                              }}
                              placeholder="Item name"
                            />
                            {/* Suggestions Dropdown */}
                            {suggestions.visible && suggestions.rowIndex === idx && suggestions.list.length > 0 && (
                              <div className="absolute z-[60] left-0 mt-1 w-full min-w-[250px] bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {suggestions.list.map((sGroup, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className={`px-4 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${suggestions.activeIndex === sIdx ? 'bg-indigo-100' : 'hover:bg-indigo-50'}`}
                                    onMouseDown={(e) => {
                                      e.preventDefault(); // Prevent input blur so we can keep typing if needed, or just standard behavior
                                      handleSuggestionSelect(sGroup, idx);
                                    }}
                                  >
                                    <div className="font-medium text-gray-900 text-sm">{sGroup.name}</div>
                                    <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                                      <span className="font-semibold text-indigo-600">₹{sGroup.price}</span>
                                      <span className="bg-gray-100 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide">{sGroup.unit}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              value={item.quantity === 0 ? '' : item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', e.target.value === '' ? '' : parseFloat(e.target.value))}
                              onBlur={(e) => { if (e.target.value === '') updateItem(item.id, 'quantity', 1); }}
                              onFocus={() => setFocusedIndex(idx)}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              value={item.days || 1}
                              onChange={(e) => updateItem(item.id, 'days', Math.max(1, parseInt(e.target.value) || 1))}
                              onFocus={() => setFocusedIndex(idx)}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              value={item.rate === 0 ? '' : item.rate}
                              onChange={(e) => updateItem(item.id, 'rate', e.target.value === '' ? '' : parseFloat(e.target.value))}
                              onBlur={(e) => { if (e.target.value === '') updateItem(item.id, 'rate', 0); }}
                              onFocus={() => setFocusedIndex(idx)}
                            />
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-800">
                            ₹{item.total.toFixed(2)}
                          </td>
                        </>
                      )}

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => toggleType(item.id)}
                            className={`p-2 rounded-lg ${item.type === 'heading' ? 'text-indigo-600 bg-indigo-100' : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-100'}`}
                            title={item.type === 'heading' ? "Convert to Item" : "Convert to Heading"}
                          >
                            <Type size={18} />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            disabled={items.length === 1}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()}
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

      <div className="bg-white rounded-xl shadow-md p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Bill Summary</h2>

        <div className="flex flex-col md:flex-row justify-end items-start gap-8">
          <div className="w-full md:w-80 space-y-3">
            <div className="grid grid-cols-[1fr_auto_80px] items-center gap-2 text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-400 justify-self-end"></span>
              <span className="font-semibold text-gray-800 text-right">₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-[1fr_auto_80px] items-center gap-2 text-sm">
              <span className="text-gray-600">GST</span>
              <select
                value={taxType}
                onChange={(e) => setTaxType(e.target.value)}
                className="py-1 px-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-indigo-500 justify-self-end w-16"
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
              <span className="font-semibold text-gray-800 text-right">₹{taxAmount.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-[1fr_auto_80px] items-center gap-2 text-sm">
              <span className="text-red-600 font-semibold">Discount</span>
              <div className="flex items-center gap-1 justify-self-end text-xs">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="py-1 px-1 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="fixed">₹</option>
                  <option value="percentage">%</option>
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-16 px-1.5 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500"
                  value={discountValue === 0 ? '' : discountValue}
                  onChange={(e) => setDiscountValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  onBlur={(e) => { if (e.target.value === '') setDiscountValue(0); }}
                />
              </div>
              <span className="font-semibold text-red-600 text-right">-₹{discountAmount.toFixed(2)}</span>
            </div>

            <div className="pt-3 border-t border-gray-200 mt-2 space-y-2">
              <div className="grid grid-cols-[1fr_auto_80px] items-center gap-2">
                <span className="text-base font-bold text-gray-800">Total</span>
                <span className="text-gray-400 justify-self-end"></span>
                <span className="text-lg font-bold text-indigo-600 text-right">₹{totalAmount.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-[1fr_auto_80px] items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Advance</span>
                <span className="text-gray-400 text-xs justify-self-end">-₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-1 focus:ring-indigo-500"
                  value={advanceAmount === 0 ? '' : advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value)))}
                  onBlur={(e) => { if (e.target.value === '') setAdvanceAmount(0); }}
                />
              </div>

              <div className="grid grid-cols-[1fr_auto_80px] items-center gap-2 pt-2 border-t border-gray-100">
                <span className="text-sm font-bold text-gray-700">Balance</span>
                <span className="text-gray-400 justify-self-end"></span>
                <span className="text-base font-bold text-red-600 text-right">
                  ₹{Math.max(0, totalAmount - advanceAmount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-1.5 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition duration-200"
          >
            <Download size={16} />
            <span>Download PDF</span>
          </button>
          <button
            id="save-bill-btn"
            onClick={handleSaveBill}
            disabled={loading}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition duration-200 disabled:opacity-50"
          >
            <Save size={16} />
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
