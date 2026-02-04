import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { addExpense } from '../services/api';
import { getCurrencySymbol } from '../utils/currency';

const AddExpenseModal = ({ groupId, groupCurrency = 'INR', currentUser, onClose, onExpenseAdded }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const symbol = getCurrencySymbol(groupCurrency);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const num = parseFloat(amount);
        if (isNaN(num) || num <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        setLoading(true);
        try {
            await addExpense({
                title: title.trim(),
                amount: num,
                payerId: currentUser._id,
                groupId,
                date: date || new Date().toISOString().split('T')[0],
            });
            onExpenseAdded();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to add expense');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm safe-area-pb modal-overlay-enter">
            <div className="w-full max-w-sm glass rounded-2xl p-5 sm:p-6 shadow-xl sm:shadow-2xl max-h-[90vh] overflow-y-auto modal-content-enter">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">New Expense</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-400"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">What was it for?</label>
                        <input
                            required
                            autoFocus
                            className="input-field"
                            placeholder="Dinner, Uber, etc."
                            value={title}
                            onChange={(e) => { setTitle(e.target.value); setError(''); }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 text-left">Amount</label>
                        <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/80 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 focus-within:border-transparent transition-all">
                            <span className="flex items-center justify-center w-12 shrink-0 text-gray-600 dark:text-gray-300 font-semibold text-lg border-r border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/80">
                                {symbol}
                            </span>
                            <input
                                required
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="input-field flex-1 pl-3 pr-4 py-3 border-0 rounded-none bg-transparent focus:ring-0 text-left"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Date</label>
                        <input
                            type="date"
                            className="input-field"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary flex justify-center mt-4">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Expense'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddExpenseModal;
