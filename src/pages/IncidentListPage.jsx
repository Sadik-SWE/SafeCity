import React, { useEffect, useState } from 'react';
import { Search, Filter, MapPin, Grid, ShieldAlert, Sparkles } from 'lucide-react';
import { api } from '../services/api.js';
import IncidentCard from '../components/IncidentCard.jsx';
import IncidentMap from '../components/IncidentMap.jsx';

export const IncidentListPage = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [riskLevel, setRiskLevel] = useState('ALL');

  const [viewMode, setViewMode] = useState('grid');

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await api.getIncidents({
        search,
        category,
        status,
        riskLevel,
      });
      if (res.success && res.incidents) {
        setIncidents(res.incidents);
      }
    } catch (e) {
      console.error('Failed to fetch incidents:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [search, category, status, riskLevel]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> পাবলিক সিকিউরিটি ফিড
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">সকল রিপোর্ট ও ইন্টারঅ্যাক্টিভ ম্যাপ</h1>
          <p className="text-xs text-slate-400 mt-1">
            নাগরিকদের প্রদানকৃত যাচাইকৃত নিরাপত্তা রিপোর্টসমূহ দেখুন, ফিল্টার করুন এবং জিপিএস ম্যাপে অবস্থান পরীক্ষা করুন।
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-2xl self-start md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-4 h-4" /> কার্ড ভিউ (Grid)
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" /> ম্যাপ ভিউ (GIS Map)
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="শিরোনাম, বর্ণনা, বা স্থান সার্চ করুন..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
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

          {/* Risk Level */}
          <div>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">সকল ঝুঁকির মাত্রা</option>
              <option value="CRITICAL">CRITICAL Risk</option>
              <option value="HIGH">HIGH Risk</option>
              <option value="MEDIUM">MEDIUM Risk</option>
              <option value="LOW">LOW Risk</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">সকল স্ট্যাটাস</option>
              <option value="PENDING">PENDING</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
          <span>{incidents.length} টি মানানসই রিপোর্ট পাওয়া গেছে</span>
          {(search || category !== 'ALL' || status !== 'ALL' || riskLevel !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setCategory('ALL');
                setStatus('ALL');
                setRiskLevel('ALL');
              }}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              ফিল্টার রিসেট করুন
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">রিপোর্ট লোড করা হচ্ছে...</div>
      ) : incidents.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm space-y-2">
          <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto opacity-50" />
          <p className="font-semibold text-slate-200">কোনো ম্যাচিং রিপোর্ট পাওয়া যায়নি।</p>
          <p className="text-xs text-slate-500">অন্য ফিল্টার বা সার্চ টার্ম ব্যবহার করে আবার চেষ্টা করুন।</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {incidents.map((inc) => (
            <IncidentCard key={inc._id || inc.id} incident={inc} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <IncidentMap incidents={incidents} height="600px" />
        </div>
      )}
    </div>
  );
};

export default IncidentListPage;
