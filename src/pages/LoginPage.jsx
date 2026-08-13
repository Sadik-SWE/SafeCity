import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, LogIn, Lock, Mail, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('ইমেইল এবং পাসওয়ার্ড উভয়ই প্রদান করুন।');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        if (res.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate(from === '/login' ? '/my-dashboard' : from);
        }
      } else {
        setError(res.message || 'লগইন ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      setError(err.message || 'ভুল ইমেইল/পাসওয়ার্ড অথবা সার্ভার সমস্যা।');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-600 p-0.5 mx-auto shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-100">পোর্টাল লগইন (Portal Login)</h2>
          <p className="text-xs text-slate-400">
            নাগরিক রিপোর্ট ট্র্যাকিং এবং এডমিন সিকিউরিটি ড্যাশবোর্ডে প্রবেশ করতে লগইন করুন।
          </p>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
          <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> ডেমো অ্যাকাউন্ট পপুলেট:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@safecity.ai', 'Admin@123456')}
              className="px-2.5 py-1.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/60 rounded-xl font-medium flex items-center justify-center gap-1 text-[11px] transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> এডমিন একাউন্ট
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('citizen@safecity.ai', 'Citizen@123456')}
              className="px-2.5 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/60 rounded-xl font-medium flex items-center justify-center gap-1 text-[11px] transition-all cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" /> সাধারণ নাগরিক
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">ইমেইল এড্রেস (Email)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">পাসওয়ার্ড (Password)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-sm py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          আপনার কি অ্যাকাউন্ট নেই?{' '}
          <Link to="/register" className="text-cyan-400 hover:underline font-bold">
            নতুন একাউন্ট রেজিস্টার করুন
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
