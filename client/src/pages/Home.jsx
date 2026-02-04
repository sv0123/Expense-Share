import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGroup, joinGroup } from '../services/api';
import { Wallet, Users, ArrowRight, Loader2, Split, Receipt, Share2 } from 'lucide-react';
import Layout from '../components/Layout';

import { useAuth } from '../context/AuthContext';

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [mode, setMode] = useState('welcome');
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState('');

    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [groupName, setGroupName] = useState('');
    const [groupCode, setGroupCode] = useState('');

    const clearError = () => setError('');

    const validatePhone = (phone) => {
        const trimmed = phone.trim();
        if (!trimmed) return { valid: true };
        if (!/^\d{10}$/.test(trimmed)) return { valid: false, message: 'Phone number must be exactly 10 digits.' };
        return { valid: true };
    };

    const validateEmail = (email) => {
        const trimmed = email.trim();
        if (!trimmed) return { valid: false, message: 'Email is required.' };
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(trimmed)) return { valid: false, message: 'Enter a valid email address.' };
        return { valid: true };
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        const emailCheck = validateEmail(userEmail);
        if (!emailCheck.valid) {
            setError(emailCheck.message);
            return;
        }
        const phoneCheck = validatePhone(userPhone);
        if (!phoneCheck.valid) {
            setError(phoneCheck.message);
            return;
        }
        setLoading(true);
        try {
            const { data } = await createGroup({ userName, userEmail, groupName, ...(userPhone.trim() && { phone: userPhone.trim() }) });
            localStorage.setItem('user', JSON.stringify(data.user));
            if (data.token) {
                localStorage.setItem('token', data.token);
                window.location.href = `/group/${data.group._id}`; // Force reload to init auth context properly or use a setToken method if available
            } else {
                navigate(`/group/${data.group._id}`);
            }
        } catch (err) {
            setError(err.message || 'Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        setError('');
        const emailCheck = validateEmail(userEmail);
        if (!emailCheck.valid) {
            setError(emailCheck.message);
            return;
        }
        const phoneCheck = validatePhone(userPhone);
        if (!phoneCheck.valid) {
            setError(phoneCheck.message);
            return;
        }
        setLoading(true);
        try {
            const { data } = await joinGroup({ userName, userEmail, code: groupCode.trim().toUpperCase(), ...(userPhone.trim() && { phone: userPhone.trim() }) });
            localStorage.setItem('user', JSON.stringify(data.user));
            if (data.token) {
                localStorage.setItem('token', data.token);
                window.location.href = `/group/${data.group._id}`;
            } else {
                navigate(`/group/${data.group._id}`);
            }
        } catch (err) {
            setError(err.message || 'Failed to join group. Check the code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout variant="centered">
            <div className="w-full space-y-8">
                {/* Landing hero - only when welcome */}
                {mode === 'welcome' && (
                    <div className="relative text-center space-y-8 animate-in fade-in duration-500 py-8 sm:py-12">
                        {/* Background Blobs */}
                        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
                        <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
                        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300/30 dark:bg-pink-800/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

                        <div className="relative">
                            <div className="flex justify-center mb-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold tracking-wide border border-secondary/20 shadow-sm">
                                    <Users className="w-3 h-3" />
                                    <span>Trusted by 1,000+ groups</span>
                                </div>
                            </div>

                            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground font-display mb-4">
                                Split bills <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">stress-free.</span>
                            </h1>

                            <p className="max-w-md mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
                                The easiest way to track shared expenses. No sign-up required to start.
                            </p>
                        </div>

                        {/* Feature pills */}
                        <div className="flex flex-wrap justify-center gap-3 relative z-10">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-sm text-foreground text-sm font-medium hover:scale-105 transition-transform duration-200 cursor-default">
                                <Split className="w-4 h-4 text-primary" /> Equal split
                            </span>
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-sm text-foreground text-sm font-medium hover:scale-105 transition-transform duration-200 cursor-default">
                                <Receipt className="w-4 h-4 text-secondary" /> One place
                            </span>
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-sm text-foreground text-sm font-medium hover:scale-105 transition-transform duration-200 cursor-default">
                                <Share2 className="w-4 h-4 text-pink-500" /> Share code
                            </span>
                        </div>

                        <div className="pt-6 space-y-4 max-w-sm mx-auto relative z-10">
                            <button
                                onClick={() => { setMode('create'); clearError(); }}
                                className="btn-primary flex items-center justify-center gap-2 group w-full text-lg"
                            >
                                Create a Group
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => { setMode('join'); clearError(); }}
                                className="btn-secondary flex items-center justify-center gap-2 w-full"
                            >
                                <span className="font-medium">Have a code?</span> Join Existing
                            </button>
                        </div>
                    </div>
                )}

                {/* Create form */}
                {mode === 'create' && (
                    <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 w-full max-w-[100%]">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Group</h2>
                            <button
                                type="button"
                                onClick={() => { setMode('welcome'); setError(''); }}
                                className="text-sm text-gray-500 dark:text-gray-400 mt-1 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                                ← Back
                            </button>
                        </div>
                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleCreate} className="space-y-5">
                            <input
                                required
                                placeholder="Your Name"
                                className="input-field"
                                value={userName}
                                onChange={(e) => { setUserName(e.target.value); clearError(); }}
                            />
                            <input
                                required
                                placeholder="Your Email"
                                type="email"
                                className="input-field"
                                value={userEmail}
                                onChange={(e) => { setUserEmail(e.target.value); clearError(); }}
                            />
                            {userEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim()) && (
                                <p className="text-sm text-amber-600 dark:text-amber-400 -mt-2">Enter a valid email address</p>
                            )}
                            <input
                                placeholder="Phone (optional, 10 digits for SMS)"
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                className="input-field"
                                value={userPhone}
                                onChange={(e) => { setUserPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); clearError(); }}
                            />
                            {userPhone && userPhone.length !== 10 && (
                                <p className="text-sm text-amber-600 dark:text-amber-400 -mt-2">Enter 10 digits only</p>
                            )}
                            <input
                                required
                                placeholder="Group Name (e.g., Trip to Bali)"
                                className="input-field"
                                value={groupName}
                                onChange={(e) => { setGroupName(e.target.value); clearError(); }}
                            />
                            <button type="submit" disabled={loading} className="btn-primary flex justify-center">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Group'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Join form */}
                {mode === 'join' && (
                    <div className="glass rounded-2xl sm:rounded-3xl p-5 sm:p-8 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 w-full max-w-[100%]">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Join Group</h2>
                            <button
                                type="button"
                                onClick={() => { setMode('welcome'); setError(''); }}
                                className="text-sm text-gray-500 dark:text-gray-400 mt-1 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                                ← Back
                            </button>
                        </div>
                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleJoin} className="space-y-5">
                            <input
                                required
                                placeholder="Your Name"
                                className="input-field"
                                value={userName}
                                onChange={(e) => { clearError(); setUserName(e.target.value); }}
                            />
                            <input
                                required
                                placeholder="Your Email"
                                type="email"
                                className="input-field"
                                value={userEmail}
                                onChange={(e) => { clearError(); setUserEmail(e.target.value); }}
                            />
                            {userEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim()) && (
                                <p className="text-sm text-amber-600 dark:text-amber-400 -mt-2">Enter a valid email address</p>
                            )}
                            <input
                                placeholder="Phone (optional, 10 digits for SMS)"
                                type="tel"
                                inputMode="numeric"
                                maxLength={10}
                                className="input-field"
                                value={userPhone}
                                onChange={(e) => { setUserPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); clearError(); }}
                            />
                            {userPhone && userPhone.length !== 10 && (
                                <p className="text-sm text-amber-600 dark:text-amber-400 -mt-2">Enter 10 digits only</p>
                            )}
                            <input
                                required
                                placeholder="Group Code (e.g., A1B2C3)"
                                className="input-field uppercase tracking-widest font-mono"
                                maxLength={6}
                                value={groupCode}
                                onChange={(e) => { clearError(); setGroupCode(e.target.value.toUpperCase()); }}
                            />
                            <button type="submit" disabled={loading} className="btn-primary flex justify-center">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join Group'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Home;
