import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Sparkles,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Users,
  Building,
  PhoneCall,
  Search,
  Eye,
  Radio,
  Database,
  Compass,
} from 'lucide-react';
import { api } from '../services/api.js';
import IncidentCard from '../components/IncidentCard.jsx';
import IncidentMap from '../components/IncidentMap.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export const LandingPage = () => {
  const { lang, t } = useLanguage();
  const { isDark } = useTheme();

  const [incidents, setIncidents] = useState([]);
  const [latestIncidents, setLatestIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    active: 0,
    verified: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getIncidents();
        if (res.success && res.incidents) {
          setIncidents(res.incidents);
          setLatestIncidents(res.incidents.slice(0, 3));
          const total = res.incidents.length;
          const resolved = res.incidents.filter((i) => i.status === 'RESOLVED').length;
          const verified = res.incidents.filter((i) => i.verifiedByAdmin || i.status === 'VERIFIED').length;
          const active = res.incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'REJECTED').length;
          setStats({ total, resolved, active, verified });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-12 py-4 pb-16">
      {/* Live Security Alert Banner / Ticker */}
      <div className={`border-y py-3 px-4 shadow-md transition-colors ${
        isDark 
          ? 'bg-gradient-to-r from-red-950/90 via-slate-900 to-slate-900 border-red-900/40 text-slate-100' 
          : 'bg-gradient-to-r from-red-50 via-slate-100 to-white border-red-200 text-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <div className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 font-mono text-xs">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <span>{t('liveAlertTitle')}</span>
            </div>
            <span className="bg-red-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
              LIVE 24/7
            </span>
          </div>

          <div className="overflow-hidden whitespace-nowrap font-mono text-[11px] flex-1 w-full md:px-4 py-1 rounded-lg bg-black/10 dark:bg-black/30 border border-red-500/10">
            {latestIncidents.length > 0 ? (
              <span className="inline-block animate-marquee font-medium">
                {latestIncidents.map((i) => `[🚨 ${i.category} - ${i.riskLevel} RISK] ${i.title} (${i.locationName || 'Bangladesh'})`).join('   •••   ')}
              </span>
            ) : (
              <span className="opacity-90">{t('liveAlertDefault')}</span>
            )}
          </div>

          <Link 
            to="/incidents" 
            className="text-cyan-600 dark:text-cyan-400 hover:underline flex-shrink-0 text-xs font-mono font-bold flex items-center gap-1 self-end md:self-auto"
          >
            {t('viewLiveMap')}
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${
              isDark 
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <Database className="w-3.5 h-3.5 text-emerald-500" /> {t('heroBadge')}
            </div>

            <h1 className={`text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}>
              {t('heroTitlePrefix')}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
                {t('heroTitleHighlight')}
              </span>
            </h1>

            <p className={`text-sm sm:text-base leading-relaxed max-w-2xl ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {t('heroSubtitle')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/report"
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-red-950/30 flex items-center justify-center gap-2 transition-all border border-red-500/30 active:scale-95"
              >
                <ShieldAlert className="w-5 h-5" /> {t('btnReportNow')}
              </Link>

              <Link
                to="/incidents"
                className={`border font-semibold text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                }`}
              >
                <Search className="w-4 h-4 text-cyan-500" /> {t('btnViewIncidents')}
              </Link>
            </div>

            {/* Key Stats Grid */}
            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('statTotal')}</div>
                <div className={`text-2xl font-black mt-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{stats.total}</div>
              </div>
              <div className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('statActive')}</div>
                <div className="text-2xl font-black text-amber-500 mt-1">{stats.active}</div>
              </div>
              <div className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('statVerified')}</div>
                <div className="text-2xl font-black text-cyan-500 mt-1">{stats.verified}</div>
              </div>
              <div className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('statResolved')}</div>
                <div className="text-2xl font-black text-emerald-500 mt-1">{stats.resolved}</div>
              </div>
            </div>
          </div>

          {/* Hero Feature Showcase Box */}
          <div className={`lg:col-span-5 p-6 rounded-3xl border shadow-2xl space-y-5 relative overflow-hidden transition-colors ${
            isDark 
              ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800' 
              : 'bg-white border-slate-200 shadow-xl'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />

            <div className={`flex items-center justify-between border-b pb-4 ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <h3 className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  Supabase & Gemini AI System
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                SYSTEM ONLINE
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className={`p-3.5 rounded-xl border space-y-1 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="font-bold text-emerald-500 flex items-center justify-between">
                  <span>{lang === 'BN' ? '১. রিয়েলটাইম ক্লাউড ডাটাবেজ (Supabase)' : '1. Realtime Cloud Sync (Supabase)'}</span>
                  <Database className="w-4 h-4 text-emerald-500" />
                </div>
                <p className={isDark ? 'text-slate-400 text-[11px]' : 'text-slate-600 text-[11px]'}>
                  {lang === 'BN' 
                    ? 'PostgreSQL ক্লাউড ডাটাবেজে সকল সিকিউরিটি ও জরুরি তথ্য নিরাপদ।'
                    : 'All incident data securely persisted in real-time PostgreSQL storage.'}
                </p>
              </div>

              <div className={`p-3.5 rounded-xl border space-y-1 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="font-bold text-amber-500 flex items-center justify-between">
                  <span>{lang === 'BN' ? '২. Gemini AI অটো রিস্ক অ্যানালিসিস' : '2. Gemini AI Risk & Urgency Analysis'}</span>
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                </div>
                <p className={isDark ? 'text-slate-400 text-[11px]' : 'text-slate-600 text-[11px]'}>
                  {lang === 'BN'
                    ? 'এআই রিপোর্ট পড়ে স্বয়ংক্রিয়ভাবে ঝুঁকির গুরুত্ব (CRITICAL/HIGH) যাচাই করে।'
                    : 'AI reads reports automatically and assigns priority levels (CRITICAL/HIGH).'}
                </p>
              </div>

              <div className={`p-3.5 rounded-xl border space-y-1 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="font-bold text-cyan-500 flex items-center justify-between">
                  <span>{lang === 'BN' ? '৩. জিও-ম্যাপ ও লাইভ পিন' : '3. Geo-Mapping & Live Pin'}</span>
                  <MapPin className="w-4 h-4 text-cyan-500" />
                </div>
                <p className={isDark ? 'text-slate-400 text-[11px]' : 'text-slate-600 text-[11px]'}>
                  {lang === 'BN'
                    ? 'ঘটনাস্থল জিপিএস ইন্টারেক্টিভ ম্যাপে পিন পয়েন্ট করে প্রদর্শিত হয়।'
                    : 'Exact event location marked on Leaflet GIS interactive map.'}
                </p>
              </div>
            </div>

            <Link
              to="/emergency"
              className={`w-full text-xs py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-cyan-700 border-slate-300'
              }`}
            >
              <span>{t('emergencyBannerTitle')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Real-time Interactive Leaflet GIS Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono font-bold mb-2">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                {lang === 'BN' ? 'রিয়েলটাইম জিপিএস ম্যাপ নেভিগেশন' : 'Real-time GPS Incident Map'}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
                {lang === 'BN' ? 'আপনার আশপাশের সক্রিয় জরুরি ইনসিডেন্টসমূহ' : 'Active Emergency Incidents Near You'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'BN'
                  ? 'আপনার বর্তমান ভৌগোলিক অবস্থান (GPS) অনুযায়ী আশপাশের সকল জরুরি ইমারজেন্সি মার্কার একনজরে দেখুন।'
                  : 'View live emergency incident markers around your detected current geolocation with risk pulses.'}
              </p>
            </div>

            <Link
              to="/incidents"
              className="bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0"
            >
              <span>{lang === 'BN' ? 'পূর্ণাঙ্গ ম্যাপ প্যানেল' : 'Full GIS Panel'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <IncidentMap
            incidents={incidents}
            height="460px"
            interactiveHeader={true}
            showUserLocationByDefault={true}
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-mono font-bold text-cyan-500 uppercase tracking-widest">
            {lang === 'BN' ? 'জরুরি সেবা সিস্টেম নির্দেশিকা' : 'How Emergency Safety Works'}
          </span>
          <h2 className={`text-2xl sm:text-3xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {lang === 'BN' ? 'সহজ ৪ টি ধাপে নাগরিক সুরক্ষা' : '4 Easy Steps for Citizen Protection'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-5 rounded-2xl border space-y-2.5 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-500 text-sm">
              01
            </div>
            <h3 className={`font-bold text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {lang === 'BN' ? 'রিপোর্ট জমা দিন' : 'Submit Incident Report'}
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {lang === 'BN' ? 'অবস্থান, বিবরণ ও ছবি যুক্ত করে গোপনীয়তা রেখে রিপোর্ট করুন।' : 'Upload coordinates, photo, details with optional anonymous reporting.'}
            </p>
          </div>

          <div className={`p-5 rounded-2xl border space-y-2.5 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-500 text-sm">
              02
            </div>
            <h3 className={`font-bold text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {lang === 'BN' ? 'Gemini AI বিশ্লেষণ' : 'Gemini AI Processing'}
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {lang === 'BN' ? 'এআই রিপোর্টের সত্যতা ও ঝুঁকিমাত্রা পরিমাপ করে ট্যাগ করে।' : 'AI scans report content and tags risk severity and emergency level.'}
            </p>
          </div>

          <div className={`p-5 rounded-2xl border space-y-2.5 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-500 text-sm">
              03
            </div>
            <h3 className={`font-bold text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {lang === 'BN' ? 'এডমিন নোটিফিকেশন' : 'Admin & Agency Dispatch'}
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {lang === 'BN' ? 'এডমিন সিকিউরিটি টিম যাচাই করে যথাযথ এজেন্সিকে বার্তা পাঠায়।' : 'Verified by official moderators to dispatch police or fire units.'}
            </p>
          </div>

          <div className={`p-5 rounded-2xl border space-y-2.5 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-500 text-sm">
              04
            </div>
            <h3 className={`font-bold text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {lang === 'BN' ? 'লাইভ স্ট্যাটাস ট্র্যাকিং' : 'Live Incident Tracking'}
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {lang === 'BN' ? 'ড্যাশবোর্ড থেকে রিয়েলটাইমে অগ্রগতি পর্যবেক্ষণ করতে পারবেন।' : 'Track progress and status updates live from your citizen dashboard.'}
            </p>
          </div>
        </div>
      </section>

      {/* Recent Incidents Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {t('recentIncidentsTitle')}
            </h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {lang === 'BN' ? 'ক্লাউড ডাটাবেজ থেকে সর্বশেষ নাগরিক রিপোর্টসমূহ' : 'Latest emergency reports fetched from cloud database'}
            </p>
          </div>
          <Link
            to="/incidents"
            className="text-cyan-600 dark:text-cyan-400 hover:underline text-xs font-bold font-mono flex items-center gap-1"
          >
            {lang === 'BN' ? 'সব রিপোর্ট দেখুন' : 'View All'} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading incident feed...</div>
        ) : latestIncidents.length === 0 ? (
          <div className={`p-8 text-center text-sm rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
          }`}>
            {t('noIncidents')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestIncidents.map((inc) => (
              <IncidentCard key={inc._id || inc.id} incident={inc} />
            ))}
          </div>
        )}
      </section>

      {/* Emergency Hotline Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className={`rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border ${
          isDark
            ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/70 border-red-900/40 text-slate-100'
            : 'bg-gradient-to-r from-red-600 via-rose-600 to-slate-900 border-red-500 text-white'
        }`}>
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/90 border border-red-800 text-red-300 rounded-full text-xs font-mono font-bold">
              <ShieldAlert className="w-4 h-4 text-red-400" /> {t('call999')}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {lang === 'BN' ? 'আপনি কি কোনো জরুরি আপদকালীন সমস্যায় পড়েছেন?' : 'Facing an Immediate Security Emergency?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
              {lang === 'BN'
                ? 'সরাসরি জাতীয় জরুরি হটলাইনে ফোন দিন অথবা পোর্টালে ম্যাপ লোকেশনসহ আপনার ঘটনা রিপোর্ট করুন।'
                : 'Call national helpline hotlines or submit a location-mapped report immediately.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full md:w-auto">
            <Link
              to="/report"
              className="bg-white hover:bg-slate-100 text-red-600 font-extrabold text-sm px-6 py-3.5 rounded-2xl shadow-lg text-center transition-all active:scale-95"
            >
              {t('btnReportNow')}
            </Link>
            <Link
              to="/emergency"
              className="bg-slate-900/80 hover:bg-slate-900 text-white border border-white/20 font-semibold text-sm px-6 py-3.5 rounded-2xl text-center transition-all"
            >
              {t('emergency')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
