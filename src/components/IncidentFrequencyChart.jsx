import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Flame, Activity, ShieldAlert, AlertTriangle, Calendar, Layers, RefreshCw, Filter } from 'lucide-react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const TYPE_CONFIG = {
  Fire: {
    key: 'Fire',
    labelEn: 'Fire Incidents',
    labelBn: 'ফায়ার সার্ভিস / অগ্নি দুর্ঘটনা',
    color: '#f97316', // Orange
    gradientId: 'gradFire',
    icon: Flame,
  },
  Medical: {
    key: 'Medical',
    labelEn: 'Medical Emergencies',
    labelBn: 'চিকিৎসা ও অ্যাম্বুলেন্স সেবা',
    color: '#10b981', // Emerald
    gradientId: 'gradMedical',
    icon: Activity,
  },
  Crime: {
    key: 'Crime',
    labelEn: 'Crime & Security',
    labelBn: 'অপরাধ ও নিরাপত্তা ঘটনা',
    color: '#a855f7', // Purple
    gradientId: 'gradCrime',
    icon: ShieldAlert,
  },
  Other: {
    key: 'Other',
    labelEn: 'Accidents & Other',
    labelBn: 'দুর্ঘটনা ও অন্যান্য',
    color: '#06b6d4', // Cyan
    gradientId: 'gradOther',
    icon: AlertTriangle,
  },
};

export const IncidentFrequencyChart = ({ rawIncidents = null }) => {
  const { lang, t } = useLanguage();
  const [incidents, setIncidents] = useState(rawIncidents || []);
  const [loading, setLoading] = useState(!rawIncidents);
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar' | 'line'
  const [visibleTypes, setVisibleTypes] = useState({
    Fire: true,
    Medical: true,
    Crime: true,
    Other: true,
  });

  const fetchIncidentsData = async () => {
    setLoading(true);
    try {
      const res = await api.getIncidents();
      if (res && res.incidents) {
        setIncidents(res.incidents);
      }
    } catch (err) {
      console.warn('Failed to fetch incidents for frequency chart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!rawIncidents) {
      fetchIncidentsData();
    } else {
      setIncidents(rawIncidents);
      setLoading(false);
    }
  }, [rawIncidents]);

  // Process incidents for the last 30 days frequency breakdown
  const { chartData, totals, maxDayCount } = useMemo(() => {
    const daysMap = {};
    const now = new Date();
    
    // Create 30 days timeline
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().split('T')[0]; // YYYY-MM-DD
      const dateDisplay = d.toLocaleDateString(lang === 'BN' ? 'bn-BD' : 'en-US', {
        month: 'short',
        day: 'numeric',
      });

      daysMap[dateKey] = {
        dateKey,
        displayDate: dateDisplay,
        Fire: 0,
        Medical: 0,
        Crime: 0,
        Other: 0,
        Total: 0,
      };
    }

    const typeTotals = { Fire: 0, Medical: 0, Crime: 0, Other: 0, Total: 0 };

    if (incidents && incidents.length > 0) {
      incidents.forEach((inc) => {
        if (!inc.createdAt) return;
        const incDateKey = new Date(inc.createdAt).toISOString().split('T')[0];

        if (daysMap[incDateKey]) {
          const cat = String(inc.category || '').toUpperCase();
          let typeKey = 'Other';

          if (cat.includes('FIRE') || cat.includes('FLAME') || cat.includes('BURN')) {
            typeKey = 'Fire';
          } else if (cat.includes('MEDICAL') || cat.includes('HEALTH') || cat.includes('AMBULANCE') || cat.includes('HOSPITAL')) {
            typeKey = 'Medical';
          } else if (cat.includes('CRIME') || cat.includes('ROBBERY') || cat.includes('THEFT') || cat.includes('VIOLENCE') || cat.includes('HARASSMENT') || cat.includes('POLICE')) {
            typeKey = 'Crime';
          }

          daysMap[incDateKey][typeKey] += 1;
          daysMap[incDateKey].Total += 1;

          typeTotals[typeKey] += 1;
          typeTotals.Total += 1;
        }
      });
    }

    const dataArray = Object.values(daysMap);
    const highestCount = Math.max(...dataArray.map((d) => d.Total), 5);

    return {
      chartData: dataArray,
      totals: typeTotals,
      maxDayCount: highestCount,
    };
  }, [incidents, lang]);

  const toggleTypeVisibility = (typeKey) => {
    setVisibleTypes((prev) => ({
      ...prev,
      [typeKey]: !prev[typeKey],
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-bold text-slate-200 flex items-center gap-1.5 font-mono">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            {label}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">30-Day Metric</span>
        </div>

        <div className="space-y-1.5 pt-1">
          {payload.map((item) => {
            const conf = TYPE_CONFIG[item.dataKey];
            if (!conf) return null;
            const Icon = conf.icon;
            return (
              <div key={item.dataKey} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-[11px]">
                    {lang === 'BN' ? conf.labelBn : conf.labelEn}
                  </span>
                </div>
                <span className="font-extrabold font-mono text-slate-100">{item.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-5 md:p-6 shadow-2xl space-y-6">
      {/* Component Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono font-bold mb-2">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            {lang === 'BN' ? 'গত ৩০ দিনের ইনসিডেন্ট রিপোর্ট বিশ্লেষণ' : '30-Day Emergency Frequency Analytics'}
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-100 flex items-center gap-2">
            {lang === 'BN' ? 'জরুরি ইনসিডেন্ট ফ্রিকোয়েন্সি (Fire, Medical, Crime)' : 'Emergency Incident Frequency by Type'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'BN'
              ? 'অগ্নি, দুর্ঘটনা, চিকিৎসা ও অপরাধমূলক বিষয়ের গত ৩০ দিনের দৈনিক ফ্রিকোয়েন্সি ম্যাট্রিক্স।'
              : 'Daily frequency distribution of reported Fire, Medical, and Crime emergency incidents over the last 30 days.'}
          </p>
        </div>

        {/* View Mode & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                chartType === 'area' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Area Stream Chart"
            >
              Area
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                chartType === 'bar' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Stacked Bar Chart"
            >
              Bar
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                chartType === 'line' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Multi Line Chart"
            >
              Line
            </button>
          </div>

          <button
            onClick={fetchIncidentsData}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 cursor-pointer transition-colors"
            title={lang === 'BN' ? 'ডাটা রিফ্রেশ করুন' : 'Refresh Chart'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 30-Day Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.keys(TYPE_CONFIG).map((typeKey) => {
          const conf = TYPE_CONFIG[typeKey];
          const Icon = conf.icon;
          const isVisible = visibleTypes[typeKey];
          const count = totals[typeKey] || 0;

          return (
            <button
              key={typeKey}
              onClick={() => toggleTypeVisibility(typeKey)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isVisible
                  ? 'bg-slate-950/80 border-slate-700 shadow-lg'
                  : 'bg-slate-950/30 border-slate-800/50 opacity-50 grayscale'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold font-mono text-slate-300 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" style={{ color: conf.color }} />
                  {typeKey}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: conf.color }}
                />
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-100 font-mono">{count}</span>
                <span className="text-[10px] text-slate-400 font-mono">30D Reports</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Recharts Container */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 h-72 sm:h-80 w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400 font-mono text-xs gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            {lang === 'BN' ? 'ইনসিডেন্ট ফ্রিকোয়েন্সি ডাটা লোড হচ্ছে...' : 'Loading 30-day frequency analytics...'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {Object.values(TYPE_CONFIG).map((conf) => (
                    <linearGradient key={conf.gradientId} id={conf.gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={conf.color} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={conf.color} stopOpacity={0.05} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="displayDate" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                {visibleTypes.Fire && (
                  <Area
                    type="monotone"
                    dataKey="Fire"
                    stroke={TYPE_CONFIG.Fire.color}
                    fill={`url(#${TYPE_CONFIG.Fire.gradientId})`}
                    strokeWidth={2}
                    stackId="1"
                  />
                )}
                {visibleTypes.Medical && (
                  <Area
                    type="monotone"
                    dataKey="Medical"
                    stroke={TYPE_CONFIG.Medical.color}
                    fill={`url(#${TYPE_CONFIG.Medical.gradientId})`}
                    strokeWidth={2}
                    stackId="1"
                  />
                )}
                {visibleTypes.Crime && (
                  <Area
                    type="monotone"
                    dataKey="Crime"
                    stroke={TYPE_CONFIG.Crime.color}
                    fill={`url(#${TYPE_CONFIG.Crime.gradientId})`}
                    strokeWidth={2}
                    stackId="1"
                  />
                )}
                {visibleTypes.Other && (
                  <Area
                    type="monotone"
                    dataKey="Other"
                    stroke={TYPE_CONFIG.Other.color}
                    fill={`url(#${TYPE_CONFIG.Other.gradientId})`}
                    strokeWidth={2}
                    stackId="1"
                  />
                )}
              </AreaChart>
            ) : chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="displayDate" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                {visibleTypes.Fire && <Bar dataKey="Fire" fill={TYPE_CONFIG.Fire.color} stackId="a" radius={[2, 2, 0, 0]} />}
                {visibleTypes.Medical && <Bar dataKey="Medical" fill={TYPE_CONFIG.Medical.color} stackId="a" radius={[2, 2, 0, 0]} />}
                {visibleTypes.Crime && <Bar dataKey="Crime" fill={TYPE_CONFIG.Crime.color} stackId="a" radius={[2, 2, 0, 0]} />}
                {visibleTypes.Other && <Bar dataKey="Other" fill={TYPE_CONFIG.Other.color} stackId="a" radius={[2, 2, 0, 0]} />}
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="displayDate" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                {visibleTypes.Fire && (
                  <Line type="monotone" dataKey="Fire" stroke={TYPE_CONFIG.Fire.color} strokeWidth={2.5} dot={false} />
                )}
                {visibleTypes.Medical && (
                  <Line type="monotone" dataKey="Medical" stroke={TYPE_CONFIG.Medical.color} strokeWidth={2.5} dot={false} />
                )}
                {visibleTypes.Crime && (
                  <Line type="monotone" dataKey="Crime" stroke={TYPE_CONFIG.Crime.color} strokeWidth={2.5} dot={false} />
                )}
                {visibleTypes.Other && (
                  <Line type="monotone" dataKey="Other" stroke={TYPE_CONFIG.Other.color} strokeWidth={2.5} dot={false} />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Instructions / Legend Info */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 font-mono">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>{lang === 'BN' ? 'ফিল্টার করতে টাইপ কার্ডে ক্লিক করুন' : 'Click type badges above to toggle chart series'}</span>
        </div>
        <div>
          {lang === 'BN' ? 'মোট ৩০ দিনের রিপোর্ট:' : 'Total 30-Day Reports:'}{' '}
          <strong className="text-slate-100">{totals.Total}</strong>
        </div>
      </div>
    </div>
  );
};

export default IncidentFrequencyChart;
