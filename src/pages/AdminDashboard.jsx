import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Activity,
  Users,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api.js';
import { useIncidentRealtime } from '../hooks/useIncidentRealtime.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import IncidentFrequencyChart from '../components/IncidentFrequencyChart.jsx';

const RISK_COLORS = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

const PIE_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b'];

export const AdminDashboard = () => {
  const { lang, t } = useLanguage();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.getAnalyticsOverview();
      if (res.success && res.analytics) {
        setAnalytics(res.analytics);
      }
    } catch (e) {
      console.error('Failed to load analytics overview:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Real-time listener: refresh metrics automatically when an incident event fires
  useIncidentRealtime(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-400 font-mono text-sm">
        {lang === 'BN' ? 'এনালাইটিক্স ডাটা লোড হচ্ছে...' : 'Loading analytics data...'}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center text-slate-400">
        {lang === 'BN' ? 'এনালাইটিক্স ডাটা লোড করা সম্ভব হয়নি।' : 'Failed to load analytics data.'}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-mono font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> {t('adminBadge')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            {t('adminTitle')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('adminSub')}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/incidents"
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" /> {t('adminReportMgmt')}
          </Link>
          <Link
            to="/admin/users"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" /> {t('adminUserMgmt')}
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="text-[10px] text-slate-400 font-mono uppercase">মোট রিপোর্ট</div>
          <div className="text-xl font-extrabold text-slate-100">{analytics.totalReports}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="text-[10px] text-slate-400 font-mono uppercase">যাচাইয়ের অপেক্ষায়</div>
          <div className="text-xl font-extrabold text-amber-400">{analytics.pendingReports}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="text-[10px] text-slate-400 font-mono uppercase">যাচাইকৃত</div>
          <div className="text-xl font-extrabold text-cyan-400">{analytics.verifiedReports}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="text-[10px] text-slate-400 font-mono uppercase">উচ্চ ঝুঁকি</div>
          <div className="text-xl font-extrabold text-red-400">{analytics.criticalReports + analytics.highRiskReports}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="text-[10px] text-slate-400 font-mono uppercase">সমাধানকৃত</div>
          <div className="text-xl font-extrabold text-emerald-400">{analytics.resolvedReports}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="text-[10px] text-slate-400 font-mono uppercase">আজকের জমা</div>
          <div className="text-xl font-extrabold text-blue-400">{analytics.todayReports}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="text-[10px] text-slate-400 font-mono uppercase">এই সপ্তাহে</div>
          <div className="text-xl font-extrabold text-indigo-400">{analytics.weekReports}</div>
        </div>
      </div>

      {/* 30-Day Emergency Frequency Chart (Recharts) */}
      <IncidentFrequencyChart />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Incident Category Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> ক্যাটাগরি ভিত্তিক ইনসিডেন্ট ভাগ
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Database Breakdown</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.categoryStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
                />
                <Bar dataKey="value" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Risk Level Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> ঝুঁকিমাত্রা ডিস্ট্রিবিউশন
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Gemini AI Ratings</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.riskStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {analytics.riskStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Incident Status Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> অগ্রগতি স্ট্যাটাস ডায়াগ্রাম
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Workflow States</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.statusStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.statusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: 7-Day Incident Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" /> বিগত ৭ দিনের ট্রেন্ড
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Recent Activity</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.trendStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="reports" stroke="#818cf8" fill="#4f46e5" fillOpacity={0.3} />
                <Area type="monotone" dataKey="resolved" stroke="#34d399" fill="#10b981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
