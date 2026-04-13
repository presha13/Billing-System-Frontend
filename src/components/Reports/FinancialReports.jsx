
import React, { useState, useContext } from 'react';
import { FileDown, Download, FileText, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import apiService from '../../services/api.js';
import { FinancialYearContext } from '../../contexts/FinancialYearContext.jsx';
import Button from '../common/Button.jsx';
import Select from '../common/Select.jsx';
import Loader from '../common/Loader.jsx';

const FinancialReports = () => {
    const { currentFinancialYear } = useContext(FinancialYearContext);
    const [reportType, setReportType] = useState('bills');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [previewData, setPreviewData] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    };

    const reportOptions = [
        { value: 'bills', label: 'Invoices / Bills (Sales Register)' },
        { value: 'expenses', label: 'Expenses Register' },
        { value: 'quotations', label: 'Quotations Summary' },
        { value: 'events', label: 'Events Schedule' }
    ];

    const convertToCSV = (data, type) => {
        if (!data || data.length === 0) return '';

        let headers = [];
        let rows = [];

        if (type === 'bills') {
            headers = ['Bill Number', 'Date', 'Customer Name', 'Customer Phone', 'Subtotal', 'Tax Type', 'Tax Amount', 'Discount', 'Total Amount', 'Status'];
            rows = data.map(b => [
                b.billNumber,
                formatDate(b.billDate),
                b.customer.name,
                b.customer.phone,
                b.subtotal,
                b.taxType,
                b.taxAmount,
                b.discountAmount,
                b.totalAmount,
                b.status
            ]);
        } else if (type === 'expenses') {
            headers = ['Date', 'Item / Category', 'Amount', 'Source'];
            rows = data.map(e => [
                formatDate(e.date),
                e.item,
                e.amount,
                e.source || 'Manual'
            ]);
        } else if (type === 'quotations') {
            headers = ['Quotation No', 'Date', 'Customer Name', 'Event Date', 'Subtotal', 'Tax', 'Total Amount', 'Status'];
            rows = data.map(q => [
                q.quotationNumber,
                formatDate(q.createdAt),
                q.customer.name,
                formatDate(q.customer?.eventDate),
                q.subtotal,
                q.taxAmount,
                q.totalAmount,
                q.status
            ]);
        } else if (type === 'events') {
            headers = ['Event Date', 'Event Name', 'Client Name', 'Type', 'Start Time', 'End Time', 'Advance', 'Source'];
            rows = data.map(e => [
                formatDate(e.eventDate),
                e.eventName,
                e.clientName,
                e.eventType,
                e.startTime,
                e.endTime,
                e.advancePayment,
                e.source || 'Manual'
            ]);
        }

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        return csvContent;
    };

    const getFormattedData = (data, type) => {
        if (!data || data.length === 0) return { headers: [], rows: [] };

        let headers = [];
        let rows = [];

        if (type === 'bills') {
            headers = ['Bill Number', 'Date', 'Customer', 'Subtotal', 'Tax', 'Total', 'Status'];
            rows = data.map(b => ({
                id: b._id,
                cells: [
                    b.billNumber,
                    formatDate(b.billDate),
                    b.customer.name,
                    `₹${b.subtotal.toLocaleString()}`,
                    `₹${b.taxAmount.toLocaleString()}`,
                    `₹${b.totalAmount.toLocaleString()}`,
                    b.status
                ]
            }));
        } else if (type === 'expenses') {
            headers = ['Date', 'Item', 'Amount', 'Source'];
            rows = data.map(e => ({
                id: e._id,
                cells: [
                    formatDate(e.date),
                    e.item,
                    `₹${e.amount.toLocaleString()}`,
                    e.source || 'Manual'
                ]
            }));
        } else if (type === 'quotations') {
            headers = ['Quotation No', 'Date', 'Customer', 'Total', 'Status'];
            rows = data.map(q => ({
                id: q._id,
                cells: [
                    q.quotationNumber,
                    formatDate(q.createdAt),
                    q.customer.name,
                    `₹${q.totalAmount.toLocaleString()}`,
                    q.status
                ]
            }));
        } else if (type === 'events') {
            headers = ['Date', 'Event Name', 'Client', 'Advance', 'Total'];
            rows = data.map(e => ({
                id: e._id,
                cells: [
                    formatDate(e.eventDate),
                    e.eventName,
                    e.clientName,
                    `₹${(e.advancePayment || 0).toLocaleString()}`,
                    `₹${(e.totalEventValue || 0).toLocaleString()}`
                ]
            }));
        }

        return { headers, rows };
    };

    const fetchReportData = async () => {
        if (!currentFinancialYear) {
            setStatus({ type: 'error', message: 'No financial year selected.' });
            return null;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            let data = [];
            if (reportType === 'bills') {
                data = await apiService.getAllBills(currentFinancialYear._id);
            } else if (reportType === 'expenses') {
                data = await apiService.getExpenses(currentFinancialYear._id);
            } else if (reportType === 'quotations') {
                data = await apiService.getAllQuotations(currentFinancialYear._id);
            } else if (reportType === 'events') {
                const response = await apiService.getAllEvents(null, currentFinancialYear.startDate, currentFinancialYear.endDate, currentFinancialYear._id);
                data = response.events || [];
            }

            if (!data || data.length === 0) {
                setStatus({ type: 'error', message: 'No records found for the selected year and category.' });
                setPreviewData(null);
                return null;
            }

            // SMART FILTER: Strictly enforce date boundaries of the Financial Year
            const start = new Date(currentFinancialYear.startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(currentFinancialYear.endDate);
            end.setHours(23, 59, 59, 999);

            const getValidDate = (item) => {
                const d = item.billDate || item.date || item.customer?.eventDate || item.eventDate || item.createdAt;
                const date = new Date(d);
                return isNaN(date.getTime()) ? null : date;
            };

            const filteredData = data.filter(item => {
                const itemDate = getValidDate(item);
                if (!itemDate) return true; // Keep if date is unparseable but backend found it
                return itemDate >= start && itemDate <= end;
            });

            // If strict filtering removed everything but we had data, fall back to unfiltered (trusting backend)
            const finalData = filteredData.length > 0 ? filteredData : data;

            // SMART SORT: Chronological order
            finalData.sort((a, b) => {
                const dateA = getValidDate(a) || new Date(0);
                const dateB = getValidDate(b) || new Date(0);
                return dateA - dateB;
            });

            const formatted = getFormattedData(finalData, reportType);
            setPreviewData({ ...formatted, raw: finalData });
            return finalData;
        } catch (error) {
            console.error('Fetch failed:', error);
            setStatus({ type: 'error', message: 'Failed to fetch data. Please try again.' });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        let data = previewData?.raw;
        if (!data) {
            data = await fetchReportData();
        }

        if (!data) return;

        const fileName = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)}_Register_${currentFinancialYear.name}.csv`;
        const csvString = convertToCSV(data, reportType);
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setStatus({ type: 'success', message: `${fileName} exported successfully.` });
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 md:p-12 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <FileDown size={120} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Financial Reports & Exports</h1>
                    <p className="text-indigo-100 max-w-lg">
                        Securely export and preview your data for CA compliance. 
                        Active Year: <span className="font-bold underline">{currentFinancialYear?.name}</span>
                    </p>
                </div>

                <div className="p-8 md:p-12 space-y-10">
                    <div className="flex flex-col md:flex-row gap-8 items-end justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="space-y-3 flex-1 w-full">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <FileText size={14} />
                                Data Category
                            </label>
                            <Select
                                value={reportType}
                                onChange={(e) => {
                                    setReportType(e.target.value);
                                    setPreviewData(null);
                                    setStatus({ type: '', message: '' });
                                }}
                                options={reportOptions}
                                className="w-full text-lg h-14 bg-white"
                            />
                        </div>

                        <div className="flex gap-4 w-full md:w-auto">
                            <Button
                                onClick={fetchReportData}
                                disabled={loading}
                                variant="secondary"
                                className="h-14 px-8 border-2 border-indigo-100 text-indigo-600 font-bold"
                            >
                                Preview Data
                            </Button>
                            <Button
                                onClick={handleExport}
                                disabled={loading || !currentFinancialYear}
                                className="h-14 px-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 text-lg font-bold min-w-[200px]"
                            >
                                {loading ? <Loader size="small" /> : <Download size={24} />}
                                Export CSV
                            </Button>
                        </div>
                    </div>

                    {status.message && (
                        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${
                            status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                        }`}>
                            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            <p className="font-medium text-sm">{status.message}</p>
                        </div>
                    )}

                    {previewData && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2 px-1">
                                <Sparkles size={18} className="text-purple-500" />
                                Data Preview (Latest {previewData.rows.length} records)
                            </h3>
                            <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm bg-white">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            {previewData.headers.map((h, i) => (
                                                <th key={i} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.rows.map((row, i) => (
                                            <tr key={row.id || i} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                                                {row.cells.map((cell, j) => (
                                                    <td key={j} className="p-4 text-sm text-slate-600 font-medium">
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Info size={18} className="text-indigo-600" />
                            Smart Audit Notice
                        </h3>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li className="flex gap-2">
                                <span className="font-bold text-indigo-600">•</span>
                                <b>Sales Register:</b> Includes full breakdown of Taxable Value vs Tax Amount for GST reconciliation.
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-indigo-600">•</span>
                                <b>Expense Ledger:</b> Tracks operational costs and outflows for P&L statements.
                            </li>
                            <li className="flex gap-2">
                                <span className="font-bold text-indigo-600">•</span>
                                <b>Consistency:</b> The exported file name will automatically include the financial year tag.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialReports;
