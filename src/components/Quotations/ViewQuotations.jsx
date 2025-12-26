import React, { useState, useEffect } from 'react';
import { FileText, Edit, Trash2, Eye, Download, Search, Plus, FilePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api.js';
import Toast from '../common/Toast.jsx';
import AlertModal from '../common/AlertModal.jsx';
import Select from '../common/Select.jsx';

const ViewQuotations = () => {
    const navigate = useNavigate();
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Toast and Alert states
    const [toast, setToast] = useState({ isOpen: false, type: 'info', message: '' });
    const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'warning', title: '', message: '', onConfirm: null });

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            setLoading(true);
            const data = await apiService.getAllQuotations();
            setQuotations(data);
        } catch (error) {
            console.error('Failed to fetch quotations:', error);
            setError('Failed to load quotations');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuotation = (id) => {
        setAlertModal({
            isOpen: true,
            type: 'warning',
            title: 'Delete Quotation',
            message: 'Are you sure you want to delete this quotation? This action cannot be undone.',
            onConfirm: async () => {
                try {
                    await apiService.deleteQuotation(id);
                    setQuotations(quotations.filter(q => q._id !== id));
                    setToast({ isOpen: true, type: 'success', message: 'Quotation deleted successfully' });
                } catch (error) {
                    console.error('Delete error:', error);
                    setToast({ isOpen: true, type: 'error', message: 'Failed to delete quotation: ' + (error.message || 'Unknown error') });
                }
            }
        });
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await apiService.updateQuotationStatus(id, newStatus);
            setQuotations(quotations.map(q =>
                q._id === id ? { ...q, status: newStatus } : q
            ));
            setToast({
                isOpen: true,
                type: 'success',
                message: `Quotation status updated to ${newStatus}`
            });
        } catch (error) {
            console.error('Status update error:', error);
            setToast({
                isOpen: true,
                type: 'error',
                message: 'Failed to update status: ' + (error.message || 'Unknown error')
            });
        }
    };

    const handleViewQuotation = (quotation) => {
        setSelectedQuotation(quotation);
        setShowModal(true);
    };

    const handleDownloadQuotation = async (quotation) => {
        try {
            await apiService.downloadQuotationPDF(quotation._id);
            setToast({ isOpen: true, type: 'success', message: 'PDF downloaded successfully' });
        } catch (error) {
            setToast({ isOpen: true, type: 'error', message: error.message || 'Failed to download PDF' });
        }
    };

    const handleCloseToast = () => {
        setToast({ isOpen: false, type: 'info', message: '' });
    };

    const handleCloseAlert = () => {
        setAlertModal({ isOpen: false, type: 'warning', title: '', message: '', onConfirm: null });
    };

    const filteredQuotations = quotations.filter(q => {
        const matchesSearch = (q.quotationNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.customer.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterStatus === 'all') return matchesSearch;
        return matchesSearch && q.status === filterStatus;
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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">View Quotations</h1>
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search quotations..."
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
                        <option value="all">All Status</option>
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <button
                        onClick={() => navigate('/quotation/create')}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
                    >
                        <Plus size={20} />
                        <span>New Quotation</span>
                    </button>
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
                            <p className="text-gray-600 text-sm">Total Quotations</p>
                            <p className="text-2xl font-bold text-gray-800 mt-2">{quotations.length}</p>
                        </div>
                        <div className="bg-blue-100 p-4 rounded-full">
                            <FilePlus className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Accepted</p>
                            <p className="text-2xl font-bold text-gray-800 mt-2">
                                {quotations.filter(q => q.status === 'accepted').length}
                            </p>
                        </div>
                        <div className="bg-green-100 p-4 rounded-full">
                            <CheckCircleWrapper className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Drafts</p>
                            <p className="text-2xl font-bold text-gray-800 mt-2">
                                {quotations.filter(q => q.status === 'draft').length}
                            </p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-full">
                            <Edit className="text-gray-600" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total Value</p>
                            <p className="text-2xl font-bold text-gray-800 mt-2">
                                ₹{quotations.reduce((sum, q) => sum + q.totalAmount, 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-purple-100 p-4 rounded-full">
                            <FileText className="text-purple-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Mobile View - Cards */}
                <div className="md:hidden space-y-3 p-3">
                    {filteredQuotations.map((q) => (
                        <div key={q._id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    <div className="p-1.5 bg-indigo-50 rounded-lg">
                                        <FileText className="h-3.5 w-3.5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-900 block">{q.customer.name}</span>
                                        <span className="text-[10px] text-gray-500">{formatDate(q.createdAt)}</span>
                                    </div>
                                </div>
                                <Select
                                    value={q.status}
                                    onChange={(e) => handleStatusChange(q._id, e.target.value)}
                                    options={[
                                        { value: 'draft', label: 'Draft' },
                                        { value: 'sent', label: 'Sent' },
                                        { value: 'accepted', label: 'Accepted' },
                                        { value: 'rejected', label: 'Rejected' },
                                    ]}
                                    variant="status"
                                    className="text-[10px] py-0.5 px-2 h-6"
                                />
                            </div>

                            <div className="pt-2 border-t border-gray-50">
                                <p className="text-[10px] text-gray-500 truncate">{q.customer.email}</p>
                            </div>

                            <div className="pt-2 border-t border-gray-50 flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-900">₹{q.totalAmount.toLocaleString()}</span>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleViewQuotation(q)}
                                        className="text-indigo-600 hover:bg-indigo-50 p-1 rounded-full transition-colors"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => navigate(`/quotation/create?edit=${q._id}`)}
                                        className="text-blue-600 hover:bg-blue-50 p-1 rounded-full transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDownloadQuotation(q)}
                                        className="text-green-600 hover:bg-green-50 p-1 rounded-full transition-colors"
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteQuotation(q._id)}
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
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
                            {filteredQuotations.map((q) => (
                                <tr key={q._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(q.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{q.customer.name}</div>
                                            <div className="text-sm text-gray-500">{q.customer.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-gray-900">₹{q.totalAmount.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Select
                                            value={q.status}
                                            onChange={(e) => handleStatusChange(q._id, e.target.value)}
                                            options={[
                                                { value: 'draft', label: 'Draft' },
                                                { value: 'sent', label: 'Sent' },
                                                { value: 'accepted', label: 'Accepted' },
                                                { value: 'rejected', label: 'Rejected' },
                                            ]}
                                            variant="status"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleViewQuotation(q)}
                                                className="text-indigo-600 hover:text-indigo-900 p-1"
                                                title="View Quotation"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/quotation/create?edit=${q._id}`)}
                                                className="text-blue-600 hover:text-blue-900 p-1"
                                                title="Edit Quotation"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDownloadQuotation(q)}
                                                className="text-green-600 hover:text-green-900 p-1"
                                                title="Download PDF"
                                            >
                                                <Download size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteQuotation(q._id)}
                                                className="text-red-600 hover:text-red-900 p-1"
                                                title="Delete Quotation"
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

                {filteredQuotations.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No quotations found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'Try adjusting your search terms.' : 'Create a new quotation to get started.'}
                        </p>
                        <button
                            onClick={() => navigate('/quotation/create')}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Create Quotation
                        </button>
                    </div>
                )}
            </div>

            {/* Quotation Details Modal */}
            {showModal && selectedQuotation && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{selectedQuotation.companyId?.companyName || 'Company'}</h3>
                                    <p className="text-sm text-gray-500">Quotation Details</p>
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
                                        <p className="text-sm text-gray-600">{selectedQuotation.customer.name}</p>
                                        <p className="text-sm text-gray-600">{selectedQuotation.customer.email}</p>
                                        <p className="text-sm text-gray-600">{selectedQuotation.customer.phone}</p>
                                        <p className="text-sm text-gray-600">{selectedQuotation.customer.address}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700">Quotation Information</h4>
                                        <p className="text-sm text-gray-600">Date: {formatDate(selectedQuotation.createdAt)}</p>
                                        <p className="text-sm text-gray-600">Status: {selectedQuotation.status}</p>
                                        <p className="text-sm text-gray-600">GST: {selectedQuotation.taxType}</p>
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
                                                {selectedQuotation.items.map((item, index) => (
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

                                {selectedQuotation.notes && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-gray-700 mb-1">Notes</h4>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedQuotation.notes}</p>
                                    </div>
                                )}

                                <div className="border-t pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal:</span>
                                        <span>₹{selectedQuotation.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>GST ({selectedQuotation.taxType}):</span>
                                        <span>₹{selectedQuotation.taxAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Discount:</span>
                                        <span>-₹{selectedQuotation.discountAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                                        <span>Total:</span>
                                        <span>₹{selectedQuotation.totalAmount.toLocaleString()}</span>
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
                                    onClick={() => handleDownloadQuotation(selectedQuotation)}
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

// Helper component for Icon in summary (since CheckCircle is not imported as CheckCircleWrapper or used directly)
// I'll just use CheckCircle from lucide-react directly in the JSX above, assuming I can import it.
// Wait, I missed importing CheckCircle in the top import statement.
// I will just use a generic icon or fix the import.
// I will fix the import in the file content.

const CheckCircleWrapper = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);


export default ViewQuotations;
