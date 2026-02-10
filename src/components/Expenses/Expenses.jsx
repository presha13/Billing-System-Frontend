
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Calendar, IndianRupee, Tag } from 'lucide-react';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newExpense, setNewExpense] = useState({
        date: new Date().toISOString().split('T')[0],
        item: '',
        amount: ''
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const data = await api.getExpenses();
            setExpenses(data);
        } catch (err) {
            setError('Failed to fetch expenses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewExpense(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.addExpense(newExpense);
            setNewExpense({
                date: new Date().toISOString().split('T')[0],
                item: '',
                amount: ''
            });
            fetchExpenses();
        } catch (err) {
            setError('Failed to add expense');
            console.error(err);
        }
    };

    const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, id: null });

    const handleDeleteClick = (id) => {
        setDeleteConfirmation({ show: true, id });
    };

    const confirmDelete = async () => {
        if (deleteConfirmation.id) {
            try {
                await api.deleteExpense(deleteConfirmation.id);
                fetchExpenses();
                setDeleteConfirmation({ show: false, id: null });
            } catch (err) {
                setError('Failed to delete expense');
                console.error(err);
            }
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmation({ show: false, id: null });
    };

    // Group expenses by date
    const groupedExpenses = expenses.reduce((groups, expense) => {
        const date = new Date(expense.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(expense);
        return groups;
    }, {});

    // Sort dates (newest first)
    const sortedDates = Object.keys(groupedExpenses).sort((a, b) => new Date(b) - new Date(a));



    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Expense Tracker</h1>

            {/* Add Expense Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <Plus className="mr-2" size={24} /> Add New Expense
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                            Date
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={newExpense.date}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="item">
                            Description
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Tag className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="item"
                                name="item"
                                value={newExpense.item}
                                onChange={handleInputChange}
                                placeholder="What did you spend on?"
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                            Amount
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IndianRupee className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={newExpense.amount}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center font-semibold h-10"
                    >
                        Add Expense
                    </button>
                </form>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8" role="alert">
                    <p>{error}</p>
                </div>
            )}



            {/* Expenses List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow p-8">
                        <p className="text-xl">No expenses recorded yet.</p>
                    </div>
                ) : (
                    sortedDates.map(date => (
                        <div key={date} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-800 flex items-center">
                                    <Calendar className="mr-2 h-4 w-4 text-indigo-600" />
                                    {date}
                                </h3>
                                <span className="text-sm font-medium text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                                    Total: ₹{groupedExpenses[date].reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                                </span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {groupedExpenses[date].map(expense => (
                                    <div key={expense._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex-1">
                                            <p className="text-gray-800 font-medium">{expense.item}</p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="font-bold text-gray-800">₹{expense.amount.toFixed(2)}</span>
                                            <button
                                                onClick={() => handleDeleteClick(expense._id)}
                                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                title="Delete Expense"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmation.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all scale-100 opacity-100">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Delete Expense</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to delete this expense? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
