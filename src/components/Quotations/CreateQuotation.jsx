import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Download, Save, FilePlus } from 'lucide-react';
import apiService from '../../services/api.js';
import Select from '../common/Select.jsx';
import AlertModal from '../common/AlertModal.jsx';

const CreateQuotation = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [quotationId, setQuotationId] = useState(null);

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

    // Derived calculations
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = taxType === '0%' ? 0 : taxType === '5%' ? 0.05 : taxType === '12%' ? 0.12 : taxType === '18%' ? 0.18 : 0.28;
    const taxAmount = subtotal * taxRate;
    const discountAmount = discountType === 'fixed'
        ? discountValue
        : (subtotal * discountValue) / 100;
    const totalAmount = subtotal + taxAmount - discountAmount;

    const handleSaveQuotation = async () => {
        setLoading(true);
        setError('');

        if (!customer.name || !customer.email || !customer.phone || !customer.address) {
            setError('Please fill in all customer details');
            setLoading(false);
            return;
        }

        try {
            const quotationData = {
                customer,
                items: items.filter(item => item.name && item.quantity > 0 && item.rate >= 0),
                subtotal,
                taxType,
                taxAmount,
                discountType,
                discountValue,
                discountAmount,
                totalAmount,
                notes
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
                            placeholder="john@example.com"
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

            {/* Items Table */}
            <div className="bg-white rounded-xl shadow-md p-3 md:p-8">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">Items</h2>
                </div>

                {/* Mobile View - Item Cards */}
                <div className="md:hidden space-y-3">
                    {items.map((item, idx) => (
                        <div key={item.id} className="bg-gray-50 rounded-lg p-3 space-y-2 relative">
                            <div className="absolute top-3 right-3">
                                <button
                                    onClick={() => deleteItem(item.id)}
                                    disabled={items.length === 1}
                                    className="p-1 text-red-500 hover:bg-red-100 rounded-full disabled:opacity-50"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="pr-8">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase">Item Name</label>
                                <input
                                    type="text"
                                    className="w-full mt-0.5 px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-xs"
                                    value={item.name}
                                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                    placeholder="Item description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] font-semibold text-gray-500 uppercase">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full mt-0.5 px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-xs"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-gray-500 uppercase">Rate (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="w-full mt-0.5 px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-xs"
                                        value={item.rate}
                                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-1">
                                <span className="text-xs font-medium text-gray-600">Total:</span>
                                <span className="text-sm font-bold text-gray-900">₹{item.total.toFixed(2)}</span>
                            </div>
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
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rate</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={item.id} className="border-b border-gray-100">
                                    <td className="py-3 px-4 text-gray-700">{idx + 1}</td>
                                    <td className="py-3 px-4"><input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} placeholder="Item" /></td>
                                    <td className="py-3 px-4"><input type="number" min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} /></td>
                                    <td className="py-3 px-4"><input type="number" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} /></td>
                                    <td className="py-3 px-4 font-semibold text-gray-800">₹{item.total.toFixed(2)}</td>
                                    <td className="py-3 px-4"><button onClick={() => deleteItem(item.id)} disabled={items.length === 1} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex justify-start">
                    <button onClick={addItem} className="flex items-center space-x-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 text-sm md:text-base">
                        <Plus size={18} /><span>Add Item</span>
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
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
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
        </div>
    );
};
export default CreateQuotation;
