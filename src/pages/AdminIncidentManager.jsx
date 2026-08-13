import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Eye,
  Trash2,
  MapPin,
  X,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export const AdminIncidentManager = () => {
  const { lang, t } = useLanguage();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [riskLevel, setRiskLevel] = useState('ALL');

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('PENDING');
  const [adminNotes, setAdminNotes] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await api.getIncidents({ search, category, status, riskLevel });
      if (res.success && res.incidents) {
        setIncidents(res.incidents);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [search, category, status, riskLevel]);

  const handleVerifyToggle = async (incident) => {
    try {
      const res = await api.verifyIncident(incident._id || incident.id, {
        verified: !incident.verifiedByAdmin,
      });
      if (res.success) {
        fetchIncidents();
      }
    } catch (e) {
      alert(e.message || (lang === 'BN' ? 'যাচাই করতে ব্যর্থ হয়েছে।' : 'Failed to verify incident.'));
    }
  };

  const handleDelete = async (id, title) => {
    if (!id) return;
    if (!window.confirm(t('adminDeleteIncidentConfirm'))) return;
    try {
      const res = await api.deleteIncident(id, title);
      if (res && res.success) {
        alert(t('adminDeleteSuccess'));
        fetchIncidents();
      } else {
        alert(res?.message || t('adminDeleteFailed'));
      }
    } catch (e) {
      alert(e.message || t('adminDeleteFailed'));
    }
  };

  const openStatusModal = (incident) => {
    setSelectedIncident(incident);
    setNewStatus(incident.status);
    setAdminNotes(incident.adminNotes || '');
    setStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;
    setModalLoading(true);
    try {
      const res = await api.updateIncidentStatus(selectedIncident._id || selectedIncident.id, {
        status: newStatus,
        adminNotes,
      });
      if (res.success) {
        setStatusModalOpen(false);
        fetchIncidents();
      }
    } catch (e) {
      alert(e.message || 'স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে।');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-mono font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> {t('adminIncBadge')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            {t('adminIncTitle')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('adminIncSub')}
          </p>
        </div>

        <Link
          to="/admin"
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl self-start md:self-auto"
        >
          {t('adminBackToDash')}
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">সকল ক্যাটাগরি</option>
              <option value="Crime">Crime</option>
              <option value="Accident">Accident</option>
              <option value="Fire">Fire</option>
              <option value="Medical Emergency">Medical Emergency</option>
              <option value="Natural Disaster">Natural Disaster</option>
              <option value="Suspicious Activity">Suspicious Activity</option>
              <option value="Road Hazard">Road Hazard</option>
              <option value="Infrastructure Problem">Infrastructure Problem</option>
              <option value="Theft">Theft</option>
              <option value="Violence">Violence</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">সকল ঝুঁকির মাত্রা</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">সকল স্ট্যাটাস</option>
              <option value="PENDING">PENDING</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="text-center py-16 text-slate-400 font-mono text-sm">
            ডাটাবেজ থেকে রিপোর্ট লোড করা হচ্ছে...
          </div>
        ) : incidents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            কোনো ইনসিডেন্ট রিপোর্ট পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                  <th className="p-4">ক্যাটাগরি / ঝুঁকি</th>
                  <th className="p-4">শিরোনাম ও স্থান</th>
                  <th className="p-4">রিপোর্টার</th>
                  <th className="p-4">স্ট্যাটাস</th>
                  <th className="p-4">যাচাইকরণ</th>
                  <th className="p-4 text-right">একশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {incidents.map((inc) => (
                  <tr key={inc._id || inc.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 space-y-1">
                      <div className="font-bold text-slate-200">{inc.category}</div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          inc.riskLevel === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : inc.riskLevel === 'HIGH'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                            : inc.riskLevel === 'MEDIUM'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {inc.riskLevel} RISK
                      </span>
                    </td>

                    <td className="p-4 space-y-1 max-w-xs">
                      <Link
                        to={`/incidents/${inc._id || inc.id}`}
                        className="font-bold text-slate-100 hover:text-cyan-400 line-clamp-1"
                      >
                        {inc.title}
                      </Link>
                      <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-red-400 flex-shrink-0" />
                        <span className="truncate">{inc.locationName}</span>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-[11px]">
                      <div>{inc.isAnonymous ? 'Anonymous Citizen' : inc.reporter?.name || 'Citizen'}</div>
                      <div className="text-slate-500 text-[10px]">
                        {inc.createdAt ? new Date(inc.createdAt).toLocaleDateString() : ''}
                      </div>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => openStatusModal(inc)}
                        className="px-2.5 py-1 rounded-xl font-bold text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors font-mono cursor-pointer"
                      >
                        {inc.status ? inc.status.replace('_', ' ') : 'PENDING'}
                      </button>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleVerifyToggle(inc)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                          inc.verifiedByAdmin
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {inc.verifiedByAdmin ? 'VERIFIED' : 'UNVERIFIED'}
                      </button>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <Link
                        to={`/incidents/${inc._id || inc.id}`}
                        className="p-1.5 inline-block bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg border border-slate-700"
                        title="বিস্তারিত দেখুন"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(inc._id || inc.id, inc.title)}
                        className="p-1.5 inline-block bg-red-950 hover:bg-red-900 text-red-400 rounded-lg border border-red-800 cursor-pointer"
                        title={lang === 'BN' ? 'রিপোর্ট মুছুন' : 'Delete Report'}
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

      {/* Status Modal */}
      {statusModalOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">রিপোর্ট স্ট্যাটাস পরিবর্তন</h3>
              <button
                onClick={() => setStatusModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">স্ট্যাটাস নির্বাচন করুন</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">এডমিন নোটস (Admin Notes)</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="রেসপন্স টিম পাঠানো, পুলিশ/ফায়ার সার্ভিসের আপডেট বা কারণ উল্লেখ করুন..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow cursor-pointer"
                >
                  {modalLoading ? 'সেভ হচ্ছে...' : 'পরিবর্তন সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminIncidentManager;
