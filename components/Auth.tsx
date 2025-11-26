
import React, { useState } from 'react';
import { Eye, EyeOff, Github, Mail, ArrowRight, Lock, User } from 'lucide-react';
import { apiService } from '../services/apiService';

interface AuthProps {
    mode: 'login' | 'signup';
    onToggleMode: (mode: 'login' | 'signup') => void;
    onSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ mode, onToggleMode, onSuccess }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const isLogin = mode === 'login';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                // Login
                await apiService.login({ email, password });
                onSuccess();
            } else {
                // Signup
                if (!fullName.trim()) {
                    setError('Full name is required');
                    setLoading(false);
                    return;
                }
                await apiService.signup({ email, password, full_name: fullName });
                // Auto-login after signup
                await apiService.login({ email, password });
                onSuccess();
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#000] flex items-center justify-center px-4 py-20">
            <div className="max-w-md w-full bg-[#121212] rounded-2xl border border-[#333] p-8 shadow-[0_0_50px_-10px_rgba(220,38,38,0.15)]">

                <div className="text-center mb-8">
                    <img src="CodimAi logo.webp" alt="CodimAi" className="h-10 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">{isLogin ? 'Welcome back' : 'Create an account'}</h1>
                    <p className="text-gray-400 text-sm">
                        {isLogin ? 'Enter your credentials to access your account' : 'Start optimizing your search presence today'}
                    </p>
                </div>

                <div className="space-y-3 mb-6">
                    <button className="w-full bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white py-2.5 rounded-lg flex items-center justify-center gap-3 transition-colors text-sm font-medium">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                        Continue with Google
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="h-px bg-[#333] flex-1"></div>
                    <span className="text-xs text-gray-500 uppercase">Or continue with email</span>
                    <div className="h-px bg-[#333] flex-1"></div>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {!isLogin && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 text-gray-600" size={18} />
                                <input
                                    type="text"
                                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:border-red-500 outline-none"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required={!isLogin}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-400">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 text-gray-600" size={18} />
                            <input
                                type="email"
                                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:border-red-500 outline-none"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-400">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-gray-600" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-10 pr-10 py-2.5 text-white text-sm focus:border-red-500 outline-none"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-600 hover:text-white">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {isLogin && (
                        <div className="flex justify-end">
                            <a href="#" className="text-xs text-red-500 hover:text-red-400">Forgot password?</a>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? 'Please wait...' : (isLogin ? 'Log In' : 'Get Started')}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-8">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => onToggleMode(isLogin ? 'signup' : 'login')} className="text-white font-medium hover:underline">
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth;
