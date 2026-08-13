import React, { useState } from 'react';
import { User, ShieldCheck, CheckCircle2, UserCheck, Key, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export const UserProfilePage = () => {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [infoMsg, setInfoMsg] = useState('');
  const [infoError, setInfoError] = useState('');
  const [infoLoading, setInfoLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setInfoMsg('');
    setInfoError('');

    if (!name.trim()) {
      setInfoError('নাম খালি রাখা যাবে না।');
      return;
    }

    setInfoLoading(true);
    try {
      const res = await api.updateProfile({ name, phone });
      if (res.success && res.user) {
        setUser(res.user);
        setInfoMsg('প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে।');
      } else {
        setInfoError(res.message || 'প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      setInfoError(err.message || 'সার্ভার সমস্যা।');
    } finally {
      setInfoLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPassMsg('');
    setPassError('');

    if (!currentPassword || !newPassword) {
      setPassError('বর্তমান ও নতুন পাসওয়ার্ড উভয়ই লিখুন।');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড ম্যাচ করেনি।');
      return;
    }

    if (newPassword.length < 6) {
      setPassError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    setPassLoading(true);
    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      if (res.success) {
        setPassMsg('পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে।');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassError(res.message || 'পাসওয়ার্ড আপডেট করতে ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      setPassError(err.message || 'পাসওয়ার্ড পরিবর্তনে সমস্যা হয়েছে।');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono font-bold">
          <UserCheck className="w-3.5 h-3.5" /> প্রোফাইল ও সিকিউরিটি
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">ইউজার প্রোফাইল পোর্টাল</h1>
        <p className="text-xs text-slate-400">
          আপনার ব্যক্তিগত নাম, যোগাযোগের তথ্য এবং অ্যাকাউন্ট পাসওয়ার্ড পরিচালনা করুন।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Account Overview Badge */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-xl space-y-4">
            <div className="w-20 h-20 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white font-extrabold text-3xl shadow-lg border border-cyan-400/30">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div>
              <h3 className="font-bold text-slate-100 text-lg">{user?.name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</p>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-950 border border-cyan-800 text-cyan-300 rounded-full text-xs font-bold font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> SYSTEM ROLE: {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Update Forms */}
        <div className="md:col-span-8 space-y-6">
          {/* Form 1: Contact Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" /> যোগাযোগের তথ্য (Contact Info)
            </h3>

            {infoMsg && (
              <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {infoMsg}
              </div>
            )}
            {infoError && (
              <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-3 rounded-xl">
                {infoError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">পূর্ণ নাম</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ইমেইল এড্রেস (শুধুমাত্র দেখার জন্য)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-800/80 rounded-xl text-slate-500 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ফোন নম্বর</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01711000000"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={infoLoading}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {infoLoading ? 'সেভ হচ্ছে...' : 'তথ্য আপডেট করুন'}
              </button>
            </form>
          </div>

          {/* Form 2: Password Change */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" /> পাসওয়ার্ড পরিবর্তন (Change Password)
            </h3>

            {passMsg && (
              <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {passMsg}
              </div>
            )}
            {passError && (
              <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-3 rounded-xl">
                {passError}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">বর্তমান পাসওয়ার্ড</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">নতুন পাসওয়ার্ড</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">পাসওয়ার্ড নিশ্চিত করুন</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs py-2.5 px-5 rounded-xl shadow flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Key className="w-4 h-4" />
                {passLoading ? 'পাসওয়ার্ড আপডেট হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
