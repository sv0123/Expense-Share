import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { getGroup, getExpenses, getReminders, sendReminder, getSettlements, addSettlement, deleteExpense } from '../services/api';
import Layout from '../components/Layout';
import AddExpenseModal from '../components/AddExpenseModal';
import AddReminderModal from '../components/AddReminderModal';
import Avatar from '../components/Avatar';
import { getCurrencySymbol } from '../utils/currency';
import { Plus, Copy, ArrowLeft, Receipt, Loader2, AlertCircle, Bell, Mail, Calendar, CheckCircle, Wallet, ArrowRight, Trash2 } from 'lucide-react';

const GroupDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [remindLoading, setRemindLoading] = useState(false);
    const [remindSuccess, setRemindSuccess] = useState('');
    const [remindConfirm, setRemindConfirm] = useState(null);

    const socket = useSocket();

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currency = group?.currency || 'INR';
    const symbol = getCurrencySymbol(currency);

    const handleCopy = () => {
        if (!group?.code) return;
        navigator.clipboard.writeText(group.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const fetchData = async () => {
        setError('');
        try {
            const [groupRes, expRes, remRes, setRes] = await Promise.all([
                getGroup(id),
                getExpenses(id),
                getReminders(id).catch(() => ({ data: [] })),
                getSettlements(id).catch(() => ({ data: [] })),
            ]);
            setGroup(groupRes.data);
            setExpenses(expRes.data);
            setReminders(Array.isArray(remRes?.data) ? remRes.data : []);
            setSettlements(Array.isArray(setRes?.data) ? setRes.data : []);
        } catch (err) {
            setError(err.message || 'Failed to load group');
            setGroup(null);
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    // Socket.io integration
    useEffect(() => {
        if (!socket || !id) return;

        socket.emit('join-group', id);

        const handleGroupUpdate = (data) => {
            console.log('Group updated:', data);
            fetchData(); // Reload data when anyone changes anything
        };

        socket.on('group-updated', handleGroupUpdate);

        return () => {
            socket.off('group-updated', handleGroupUpdate);
        };
    }, [socket, id]);

    const handleRemindGroup = async () => {
        setRemindSuccess('');
        setRemindConfirm(null);
        setRemindLoading(true);
        try {
            const { data } = await sendReminder({ groupId: id });
            const sent = data.sent ?? (data.emails?.length ?? 0);
            setRemindConfirm({
                title: 'Reminder Sent!',
                message: sent ? `A friendly reminder email has been sent to ${sent} member(s).` : 'Reminder notification sent successfully.'
            });
            setRemindSuccess(sent ? `Reminder sent to ${sent} member(s) by email.` : 'Reminder sent.');
        } catch (err) {
            setRemindSuccess('');
            setRemindConfirm(null);
            alert(err.message || 'Failed to send reminder');
        } finally {
            setRemindLoading(false);
        }
    };


    const handleRemindMember = async (memberId) => {
        setRemindLoading(true);
        try {
            await sendReminder({ groupId: id, memberId });
            setRemindSuccess('Reminder sent by email.');
            setTimeout(() => setRemindSuccess(''), 3000);
        } catch (err) {
            alert(err.message || 'Failed to send reminder');
        } finally {
            setRemindLoading(false);
        }
    };

    const handleMarkPaid = async (toUserId, amount) => {
        try {
            await addSettlement({
                groupId: id,
                fromUserId: currentUser._id,
                toUserId,
                amount: Math.abs(amount),
            });
            fetchData();
        } catch (err) {
            alert(err.message || 'Failed to record payment');
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        try {
            await deleteExpense(expenseId);
            fetchData();
        } catch (err) {
            alert(err.message || 'Failed to delete expense');
        }
    };

    useEffect(() => {
        if (!currentUser?._id) {
            navigate('/', { replace: true });
            return;
        }
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <Layout variant="top">
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-muted-foreground text-sm font-medium">Loading group...</p>
                </div>
            </Layout>
        );
    }

    if (error && !group) {
        return (
            <Layout variant="top">
                <div className="glass rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto mt-10">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                    <h2 className="text-xl font-bold text-foreground">Something went wrong</h2>
                    <p className="text-muted-foreground">{error}</p>
                    <button onClick={() => navigate('/')} className="btn-primary w-full">
                        Back to Home
                    </button>
                </div>
            </Layout>
        );
    }

    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const myExpenses = expenses.filter((e) => e.payer?._id === currentUser._id).reduce((acc, curr) => acc + curr.amount, 0);
    const mySettlements = settlements.filter((s) => (s.fromUser?._id ?? s.fromUser) === currentUser._id).reduce((acc, curr) => acc + curr.amount, 0);
    const mySpend = myExpenses + mySettlements;

    return (
        <Layout variant="top">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="pb-32 space-y-8"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-1">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        aria-label="Back to home"
                    >
                        <ArrowLeft className="w-6 h-6 text-foreground" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-xl font-bold font-display text-foreground">{group.name}</h1>
                        <button
                            onClick={handleCopy}
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full mt-1 border border-border/50 hover:bg-secondary transition-colors"
                        >
                            {copied ? (
                                <span className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">Copied!</span>
                            ) : (
                                <>
                                    Code: <span className="font-mono font-semibold text-foreground">{group.code}</span>
                                    <Copy className="w-3 h-3 ml-0.5" />
                                </>
                            )}
                        </button>
                    </div>
                    <div className="w-10" />
                </div>

                {/* Summary Card */}
                <div className="glass rounded-3xl p-6 relative overflow-hidden ring-1 ring-white/20 dark:ring-white/5 shadow-xl">
                    {/* Subtle bg decoration instead of big icon */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                    <div className="relative z-10">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Group Spend</p>
                        <h2 className="text-4xl font-extrabold text-foreground tracking-tight font-display">
                            {symbol}{totalSpent.toFixed(2)}
                        </h2>

                        <div className="mt-6 pt-6 border-t border-border/50 flex justify-between items-end">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">You paid</p>
                                <p className="text-2xl font-bold text-primary mt-0.5 font-display">{symbol}{mySpend.toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Members</p>
                                <div className="flex -space-x-2 justify-end pl-2">
                                    {group.members?.map((m) => (
                                        <div key={m._id} className="ring-2 ring-background rounded-full">
                                            <Avatar userId={m._id} name={m.name} size="sm" title={m.name} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions: Remind Group & Add Reminder */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Bell className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-lg text-foreground font-display">Notify & Reminders</h3>
                    </div>

                    {/* Buttons equal size and style */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={handleRemindGroup}
                            disabled={remindLoading}
                            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-70"
                        >
                            {remindLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                            <span className="text-sm">Remind Group</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowReminderModal(true)}
                            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-card border border-border text-foreground font-semibold shadow-sm hover:bg-secondary active:scale-[0.98] transition-all"
                        >
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Add Reminder</span>
                        </button>
                    </div>

                    {remindSuccess && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-sm text-green-600 dark:text-green-400 font-medium text-center bg-green-500/10 py-2 rounded-xl"
                        >
                            {remindSuccess}
                        </motion.div>
                    )}

                    {reminders.length > 0 && (
                        <div className="space-y-3 mt-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Upcoming</p>
                            {reminders.slice(0, 5).map((r, i) => (
                                <motion.div
                                    key={r._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass rounded-xl px-4 py-3 flex items-center justify-between text-sm border-l-4 border-primary"
                                >
                                    <span className="text-foreground font-medium truncate">{r.message || 'Settle up'}</span>
                                    <span className="text-muted-foreground text-xs bg-secondary px-2 py-1 rounded-md border border-border/50">
                                        {new Date(r.dueDate).toLocaleDateString()}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Balances Section - FIXED ALIGNMENT */}
                {expenses.length > 0 && group.members?.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Wallet className="w-5 h-5 text-primary" />
                            <h3 className="font-bold text-lg text-foreground font-display">Balances</h3>
                        </div>

                        {(() => {
                            const balances = {};
                            group.members.forEach((m) => (balances[m._id] = 0));
                            expenses.forEach((e) => {
                                const splitAmount = e.amount / group.members.length;
                                group.members.forEach((m) => {
                                    if (m._id === e.payer?._id) balances[m._id] += e.amount - splitAmount;
                                    else balances[m._id] -= splitAmount;
                                });
                            });
                            settlements.forEach((s) => {
                                const from = s.fromUser?._id ?? s.fromUser;
                                const to = s.toUser?._id ?? s.toUser;
                                if (from && to && s.amount) {
                                    balances[from] = (balances[from] ?? 0) + s.amount;
                                    balances[to] = (balances[to] ?? 0) - s.amount;
                                }
                            });
                            const entries = Object.entries(balances).filter(([, amount]) => Math.abs(amount) >= 0.01);

                            if (entries.length === 0) return (
                                <div className="text-center py-8 bg-card/50 rounded-3xl border border-dashed border-border">
                                    <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2 opacity-50" />
                                    <p className="text-muted-foreground font-medium">All settled up!</p>
                                </div>
                            );

                            return (
                                <div className="grid grid-cols-1 gap-3">
                                    {entries.map(([memberId, amount], index) => {
                                        const member = group.members.find((m) => m._id === memberId);
                                        if (!member) return null;
                                        const isPositive = amount > 0;
                                        const isMe = member._id === currentUser._id;

                                        return (
                                            <motion.div
                                                key={memberId}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={`
                                                    relative p-4 rounded-2xl border flex items-center gap-3 overflow-hidden
                                                    ${isPositive
                                                        ? 'bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-background border-emerald-200/60 dark:border-emerald-800/60'
                                                        : 'bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/30 dark:to-background border-rose-200/60 dark:border-rose-800/60'
                                                    }
                                                `}
                                            >
                                                <Avatar userId={member._id} name={isMe ? 'You' : member.name} size="md" className="shrink-0 shadow-sm" />

                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <span className="font-semibold text-foreground truncate text-base leading-tight">
                                                        {isMe ? 'You' : member.name}
                                                    </span>
                                                    <div className={`flex items-baseline gap-1.5 text-sm font-bold mt-0.5 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                        <span className="text-xs font-medium uppercase opacity-80 tracking-wide">
                                                            {isPositive ? 'gets' : 'owes'}
                                                        </span>
                                                        <span className="font-display text-lg">
                                                            {symbol}{Math.abs(Number(amount)).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                {!isMe && (
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <button
                                                            onClick={() => handleRemindMember(member._id)}
                                                            disabled={remindLoading}
                                                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-black/20 border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors shadow-sm"
                                                            title="Remind"
                                                        >
                                                            <Mail className="w-4 h-4" />
                                                        </button>
                                                        {isPositive && (
                                                            <button
                                                                onClick={() => handleMarkPaid(member._id, amount)}
                                                                className="h-10 px-3 flex items-center gap-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                                                            >
                                                                <span className="hidden sm:inline">Mark</span> Paid
                                                                <ArrowRight className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* Expenses List */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Receipt className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-lg text-foreground font-display">Recent Activity</h3>
                    </div>

                    <div className="space-y-3">
                        {expenses.length === 0 ? (
                            <div className="glass rounded-3xl p-10 text-center border-dashed border-2 border-border/60">
                                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Receipt className="w-8 h-8 text-muted-foreground/50" />
                                </div>
                                <p className="text-muted-foreground font-medium">No expenses yet</p>
                                <p className="text-sm text-muted-foreground/70 mt-1">Tap the + button to add one</p>
                            </div>
                        ) : (
                            expenses.map((expense, i) => (
                                <motion.div
                                    key={expense._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass p-4 rounded-2xl flex items-center justify-between group hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <Avatar userId={expense.payer?._id} name={expense.payer?.name} size="md" className="shrink-0 ring-2 ring-white dark:ring-gray-800" />
                                        <div className="min-w-0">
                                            <p className="font-semibold text-foreground truncate">{expense.title}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <span className="font-medium text-primary">{expense.payer?.name}</span> paid • {new Date(expense.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-bold text-lg text-foreground font-display">{symbol}{expense.amount.toFixed(2)}</p>
                                        {expense.payer?._id === currentUser._id && (
                                            <button
                                                onClick={() => handleDeleteExpense(expense._id)}
                                                className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                                                title="Delete Expense"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* FAB */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowModal(true)}
                    className="fixed bottom-6 right-6 w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center z-20"
                    style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))', right: 'max(1.5rem, env(safe-area-inset-right))' }}
                    aria-label="Add expense"
                >
                    <Plus className="w-8 h-8" />
                </motion.button>

                {showModal && (
                    <AddExpenseModal
                        groupId={id}
                        groupCurrency={currency}
                        currentUser={currentUser}
                        onClose={() => setShowModal(false)}
                        onExpenseAdded={fetchData}
                    />
                )}
                {showReminderModal && (
                    <AddReminderModal
                        groupId={id}
                        currentUser={currentUser}
                        onClose={() => setShowReminderModal(false)}
                        onReminderAdded={fetchData}
                        onSuccess={() => setRemindConfirm({
                            title: 'Reminder Added',
                            message: 'The reminder has been added to the list successfully.'
                        })}
                    />
                )}

                {/* Success confirmation popup */}
                {remindConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="w-full max-w-sm glass rounded-3xl p-8 shadow-2xl text-center space-y-6"
                        >
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">{remindConfirm.title || 'Success!'}</h3>
                                <p className="text-muted-foreground mt-2">
                                    {remindConfirm.message || 'Action completed successfully.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setRemindConfirm(null)}
                                className="btn-primary w-full py-3"
                            >
                                Got it
                            </button>
                        </motion.div>
                    </div>
                )}
            </motion.div>
        </Layout>
    );
};

export default GroupDashboard;
