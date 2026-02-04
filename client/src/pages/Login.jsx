import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
                <div className="w-full max-w-md glass rounded-3xl p-8 shadow-xl space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold font-display text-foreground">Welcome Back</h1>
                        <p className="text-muted-foreground">Sign in to continue</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all"
                                    placeholder="jdoe@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:border-primary/50 focus:bg-background outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-base mt-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary font-semibold hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default Login;
