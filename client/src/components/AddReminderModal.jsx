import React, { useState } from 'react';
import { X, Loader2, Calendar } from 'lucide-react';
import { createReminder } from '../services/api';

const AddReminderModal = ({ groupId, currentUser, onClose, onReminderAdded, onSuccess }) => {
    const [dueDate, setDueDate] = useState('');
    const [message, setMessage] = useState('Please settle your balance.');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!dueDate) {
            setError('Please pick a due date.');
            return;
        }
        if (new Date(dueDate) < new Date()) {
            setError('Due date must be in the future.');
            return;
        }
        setLoading(true);
        try {
            await createReminder({
                groupId,
                userId: currentUser._id,
                dueDate,
                message: message.trim() || 'Please settle your balance.',
            });
            onReminderAdded?.();
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to create reminder');
        } finally {
            setLoading(false);
        }
    };

    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
    const minStr = minDate.toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm modal-overlay-enter">
            <div className="w-full max-w-sm glass rounded-2xl p-6 shadow-2xl modal-content-enter">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5" /> Add Reminder
                    </h3>
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
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 text-left">Remind on date</label>
                        <input
                            type="date"
                            className="input-field"
                            value={dueDate}
                            min={minStr}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 text-left">Message (optional)</label>
                        <textarea
                            className="input-field min-h-[80px] resize-y"
                            placeholder="e.g. Please settle your balance by this date."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary flex justify-center">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Reminder'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddReminderModal;
