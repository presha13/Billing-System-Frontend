import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Download, Save, FilePlus, Type } from 'lucide-react';
import apiService from '../../services/api.js';
import Select from '../common/Select.jsx';
import AlertModal from '../common/AlertModal.jsx';
import VoiceInput from '../common/VoiceInput.jsx';
import SmartVoiceRowInput from '../common/SmartVoiceRowInput.jsx';
import { FinancialYearContext } from '../../contexts/FinancialYearContext.jsx';

const CreateQuotation = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [quotationId, setQuotationId] = useState(null);
    const [focusedIndex, setFocusedIndex] = useState(null);
    const { currentFinancialYear } = useContext(FinancialYearContext);

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
    const [notes, setNotes] = useState('');

    const [successModal, setSuccessModal] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: '',
        onConfirm: null
    });

    useEffect(() => {
        if (editId) {
            fetchQuotationDetails(editId);
        }
    }, [editId]);

    const fetchQuotationDetails = async (id) => {
        try {
            setLoading(true);
            const data = await apiService.getQuotationById(id);
            setCustomer(data.customer);
            // Ensure items display correctly
            const mappedItems = data.items.map(item => ({
                ...item,
                type: item.type || 'item',
                days: item.days || 1,
                id: item.id || Math.random() // Ensure ID exists for React keys
            }));
            setItems(mappedItems);
            // Derived values will be handled by state, but we set the "inputs"
            setTaxType(data.taxType);
            setDiscountType(data.discountType);
            setDiscountValue(data.discountValue);
            setNotes(data.notes || '');
            setQuotationId(data._id);
        } catch (error) {
            console.error('Failed to fetch quotation details:', error);
            setError('Failed to load quotation details');
        } finally {
            setLoading(false);
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
        focusItemName(newIndex);
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
                if (item.type === 'item' && (field === 'quantity' || field === 'days' || field === 'rate')) {
                    const qty = parseFloat(field === 'quantity' ? value : item.quantity) || 0;
                    const days = parseFloat(field === 'days' ? value : item.days) || 1;
                    const rate = parseFloat(field === 'rate' ? value : item.rate) || 0;
                    updatedItem.total = qty * days * rate;
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
                    return { ...item, type: newType, quantity: 0, days: 1, rate: 0, total: 0 };
                } else {
                    return { ...item, type: newType, quantity: 1, days: 1, rate: 0, total: 0 };
                }
            }
            return item;
        }));
    };

    // Derived calculations
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

    const handleSaveQuotation = async () => {
        setLoading(true);
        setError('');

        if (!customer.name || !customer.eventDate || !customer.phone || !customer.address) {
            setError('Please fill in all customer details');
            setLoading(false);
            return;
        }

        try {
            const quotationData = {
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
                notes,
                financialYear: currentFinancialYear._id
            };

            let response;
            if (editId) {
                response = await apiService.updateQuotation(editId, quotationData);
            } else {
                response = await apiService.createQuotation(quotationData);
            }

            setQuotationId(response.quotation._id);

            setSuccessModal({
                isOpen: true,
                type: 'success',
                title: editId ? 'Quotation Updated' : 'Quotation Created',
                message: editId ? 'Quotation has been updated successfully!' : 'Quotation has been created successfully!',
                onConfirm: () => {
                    setSuccessModal({ isOpen: false, type: 'success', title: '', message: '', onConfirm: null });
                    if (editId) navigate('/quotations');
                }
            });
        } catch (err) {
            setError(err.message || 'Failed to save quotation');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            if (!quotationId) {
                setError('Please save the quotation first before downloading.');
                return;
            }
            await apiService.downloadQuotationPDF(quotationId);
        } catch (err) {
            setError('Failed to download PDF');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <div className="p-3 bg-indigo-600 rounded-lg text-white">
                    <FilePlus size={24} />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">{editId ? 'Edit Quotation' : 'Create Quotation'}</h1>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Customer Form */}
            <div className="bg-white rounded-xl shadow-md p-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Customer Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Customer Name</label>
                        <input
                            type="text"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                            value={customer.name}
                            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Event Date</label>
                        <input
                            type="date"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                            value={customer.eventDate ? new Date(customer.eventDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => setCustomer({ ...customer, eventDate: e.target.value })}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                        <input
                            type="tel"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                            value={customer.phone}
                            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                            placeholder="+91..."
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Address</label>
                        <input
                            type="text"
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                            value={customer.address}
                            onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
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

            {/* Items Table */}
            <div className="bg-white rounded-xl shadow-md p-3 md:p-8">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">Items</h2>
                    <SmartVoiceRowInput onItemComplete={handleSmartLineItem} />
                </div>

                {/* Mobile View - Item Cards */}
                <div className="md:hidden space-y-3">
                    {items.map((item, idx) => (
                        <div key={item.id} className={`bg-gray-50 rounded-lg p-3 space-y-2 relative ${item.type === 'heading' ? 'border-2 border-indigo-100' : ''}`}>
                            <div className="absolute top-3 right-3 flex gap-2">
                                <button
                                    onClick={() => toggleType(item.id)}
                                    className="p-1 text-indigo-500 hover:bg-indigo-100 rounded-full"
                                    title={item.type === 'item' ? "Convert to Heading" : "Convert to Item"}
                                >
                                    <Type size={16} />
                                </button>
                                <button
                                    onClick={() => deleteItem(item.id)}
                                    disabled={items.length === 1}
                                    className="p-1 text-red-500 hover:bg-red-100 rounded-full disabled:opacity-50"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {item.type === 'heading' ? (
                                <div className="pr-16">
                                    <label className="text-[10px] font-semibold text-indigo-500 uppercase">Heading</label>
                                    <input
                                        type="text"
                                        className="w-full mt-0.5 px-2 py-1.5 border border-indigo-200 rounded-md focus:ring-2 focus:ring-indigo-500 text-sm font-bold bg-indigo-50/50"
                                        data-item-name-index={idx}
                                        value={item.name}
                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                        onFocus={() => setFocusedIndex(idx)}
                                        placeholder="Section Heading"
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="pr-16">
                                        <label className="text-[10px] font-semibold text-gray-500 uppercase">Item Name</label>
                                        <input
                                            type="text"
                                            className="w-full mt-0.5 px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-xs"
                                            data-item-name-index={idx}
                                            value={item.name}
                                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                            onFocus={() => setFocusedIndex(idx)}
                                            placeholder="Item description"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase">Quantity</label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full mt-0.5 px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-xs"
                                                value={item.quantity === 0 ? '' : item.quantity}
                                                onChange={(e) => updateItem(item.id, 'quantity', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                                onBlur={(e) => { if (e.target.value === '') updateItem(item.id, 'quantity', 1); }}
                                                onFocus={() => setFocusedIndex(idx)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase">Days</label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full mt-0.5 px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-xs"
                                                value={item.days || 1}
                                                onChange={(e) => updateItem(item.id, 'days', Math.max(1, parseInt(e.target.value) || 1))}
                                                onFocus={() => setFocusedIndex(idx)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase">Rate (₹)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                className="w-full mt-0.5 px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-xs"
                                                value={item.rate === '' ? '' : item.rate}
                                                onChange={(e) => updateItem(item.id, 'rate', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                                onBlur={(e) => { if (e.target.value === '') updateItem(item.id, 'rate', 0); }}
                                                onFocus={() => setFocusedIndex(idx)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-1">
                                        <span className="text-xs font-medium text-gray-600">Total:</span>
                                        <span className="text-sm font-bold text-gray-900">
                                            {item.rate === 0 ? <span className="text-green-600">Free</span> : `₹${item.total.toFixed(2)}`}
                                        </span>
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
                                <th className="text-left py-3 px-4 font-semibold text-gray-700 w-16">No.</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Item</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Qty</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700 w-20">Days</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rate</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                let serialNumber = 0;
                                return items.map((item, idx) => {
                                    const currentSerial = item.type === 'item' ? ++serialNumber : '';

                                    return (
                                        <tr key={item.id} className={`border-b border-gray-100 ${item.type === 'heading' ? 'bg-gray-50' : ''}`}>
                                            <td className="py-3 px-4 text-gray-700 font-medium">{currentSerial}</td>

                                            {item.type === 'heading' ? (
                                                <td colSpan={5} className="py-3 px-4">
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg font-bold text-gray-800 bg-indigo-50/30 placeholder-indigo-300 text-center"
                                                        data-item-name-index={idx}
                                                        value={item.name}
                                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                                        placeholder="Part A: Development Phase..."
                                                        onFocus={() => setFocusedIndex(idx)}
                                                    />
                                                </td>
                                            ) : (
                                                <>
                                                    <td className="py-3 px-4">
                                                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" data-item-name-index={idx} value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} onFocus={() => setFocusedIndex(idx)} placeholder="Item" />
                                                    </td>
                                                    <td className="py-3 px-4"><input type="number" min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={item.quantity === 0 ? '' : item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value === '' ? '' : parseFloat(e.target.value))} onBlur={(e) => { if (e.target.value === '') updateItem(item.id, 'quantity', 1); }} onFocus={() => setFocusedIndex(idx)} /></td>
                                                    <td className="py-3 px-4"><input type="number" min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={item.days || 1} onChange={(e) => updateItem(item.id, 'days', Math.max(1, parseInt(e.target.value) || 1))} onFocus={() => setFocusedIndex(idx)} /></td>
                                                    <td className="py-3 px-4"><input type="number" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={item.rate === '' ? '' : item.rate} onChange={(e) => updateItem(item.id, 'rate', e.target.value === '' ? '' : parseFloat(e.target.value))} onBlur={(e) => { if (e.target.value === '') updateItem(item.id, 'rate', 0); }} onFocus={() => setFocusedIndex(idx)} /></td>
                                                    <td className="py-3 px-4 font-semibold text-gray-800">
                                                        {item.rate === 0 ? <span className="text-green-600">Free</span> : `₹${item.total.toFixed(2)}`}
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
                                                    <button onClick={() => deleteItem(item.id)} disabled={items.length === 1} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button>
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
                    <button onClick={addItem} className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 text-sm md:text-base">
                        <Plus size={18} /><span>Add Item</span>
                    </button>
                    <button onClick={addHeading} className="flex items-center space-x-2 px-3 py-2 bg-white border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition duration-200 text-sm md:text-base ml-3">
                        <Type size={18} /><span>Add Heading</span>
                    </button>
                </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-xl shadow-md p-4 md:p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Notes</h2>
                <p className="text-sm text-gray-600 mb-3">Add any important points, terms, or conditions for this quotation.</p>
                <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-[120px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Example:&#10;• Payment terms: 50% advance, 50% on delivery&#10;• Validity: 30 days from quotation date&#10;• Delivery timeline: 2-3 weeks&#10;• Installation charges not included"
                />
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-md p-3 md:p-8">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Quotation Summary</h2>
                <div className="space-y-2 max-w-md ml-auto pt-2 border-t border-gray-200">
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
                                    value={discountValue === 0 ? '' : discountValue}
                                    onChange={(e) => setDiscountValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                    onBlur={(e) => { if (e.target.value === '') setDiscountValue(0); }}
                                />
                            </div>
                            <span className="font-semibold text-gray-800 min-w-[60px] text-right text-red-500">-₹{discountAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-100">
                        <span className="text-base md:text-lg font-bold text-gray-800">Total</span>
                        <span className="text-lg md:text-2xl font-bold text-indigo-600">₹{totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={handleDownloadPDF} disabled={!quotationId} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm md:text-base"><Download size={18} /><span>Download PDF</span></button>
                    <button onClick={handleSaveQuotation} disabled={loading} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm md:text-base"><Save size={18} /><span>{loading ? 'Saving...' : (editId ? 'Update' : 'Create')}</span></button>
                </div>
            </div>
            <AlertModal isOpen={successModal.isOpen} onClose={() => setSuccessModal({ ...successModal, isOpen: false })} onConfirm={successModal.onConfirm} type={successModal.type} title={successModal.title} message={successModal.message} confirmText="OK" showCancel={false} />
        </div >
    );
};
export default CreateQuotation;
