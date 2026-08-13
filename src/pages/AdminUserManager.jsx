import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, UserX, UserCheck, Trash2 } from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export const AdminUserManager = () => {
  const { lang, t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers();
      if (res.success && res.users) {
        setUsers(res.users);
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    try {
      const res = await api.updateUserStatus(user._id || user.id, {
        isActive: !user.isActive,
      });
      if (res.success) {
        fetchUsers();
      }
    } catch (e) {
      alert(e.message || (lang === 'BN' ? 'ইউজার স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে।' : 'Failed to update user status.'));
    }
  };

  const handleChangeRole = async (user, newRole) => {
    try {
      const res = await api.updateUserStatus(user._id || user.id, {
        role: newRole,
      });
      if (res.success) {
        fetchUsers();
      }
    } catch (e) {
      alert(e.message || (lang === 'BN' ? 'ইউজার রোল পরিবর্তন করতে ব্যর্থ হয়েছে।' : 'Failed to change user role.'));
    }
  };

  const handleDeleteUser = async (user) => {
    const userId = user._id || user.id;
    if (!userId) return;
    if (!window.confirm(t('adminUserDeleteConfirm'))) return;

    try {
      const res = await api.deleteUser(userId);
      if (res && res.success) {
        alert(t('adminUserDeleteSuccess'));
        fetchUsers();
      } else {
        alert(res?.message || t('adminUserDeleteFailed'));
      }
    } catch (e) {
      alert(e.message || t('adminUserDeleteFailed'));
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-mono font-bold mb-2">
            <Users className="w-3.5 h-3.5 text-amber-400" /> {t('adminUserBadge')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            {t('adminUserTitle')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('adminUserSub')}
          </p>
        </div>

        <Link
          to="/admin"
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl self-start md:self-auto"
        >
          {t('adminBackToDash')}
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === 'BN' ? 'নাম বা ইমেইল দিয়ে সার্চ করুন...' : 'Search by name or email...'}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="text-xs font-mono text-slate-400">
          {filteredUsers.length} {lang === 'BN' ? 'জন রেজিস্টার্ড ইউজার' : 'Registered Users'}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="text-center py-16 text-slate-400 font-mono text-sm">
            {lang === 'BN' ? 'ইউজারদের তালিকা লোড করা হচ্ছে...' : 'Loading users list...'}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            {lang === 'BN' ? 'কোনো ইউজার পাওয়া যায়নি।' : 'No users found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                  <th className="p-4">{lang === 'BN' ? 'ইউজার তথ্য' : 'User Info'}</th>
                  <th className="p-4">{lang === 'BN' ? 'ফোন নম্বর' : 'Phone'}</th>
                  <th className="p-4">{lang === 'BN' ? 'রোল (Role)' : 'Role'}</th>
                  <th className="p-4">{lang === 'BN' ? 'অ্যাকোউন্ট স্ট্যাটাস' : 'Status'}</th>
                  <th className="p-4 text-right">{lang === 'BN' ? 'একশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {filteredUsers.map((u) => (
                  <tr key={u._id || u.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 space-y-0.5">
                      <div className="font-bold text-slate-100">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>

                    <td className="p-4 font-mono text-slate-400">{u.phone || 'N/A'}</td>

                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u, e.target.value)}
                        className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="CITIZEN">CITIZEN</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                          u.isActive
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : 'bg-red-950 text-red-400 border-red-800'
                        }`}
                      >
                        {u.isActive ? (
                          <>
                            <UserCheck className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3" /> Suspended
                          </>
                        )}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                          u.isActive
                            ? 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-800'
                            : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {u.isActive ? (lang === 'BN' ? 'স্থগিত করুন' : 'Suspend') : (lang === 'BN' ? 'সক্রিয় করুন' : 'Reactivate')}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="p-1.5 inline-flex items-center justify-center bg-red-950/80 hover:bg-red-900 text-red-400 rounded-xl border border-red-800 cursor-pointer transition-colors align-middle"
                        title={lang === 'BN' ? 'ইউজার মুছুন' : 'Delete User'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManager;
