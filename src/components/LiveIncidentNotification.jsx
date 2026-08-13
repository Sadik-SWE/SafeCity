import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, X, AlertTriangle, ArrowRight, Radio } from 'lucide-react';
import { useIncidentRealtime } from '../hooks/useIncidentRealtime.js';
import { useLanguage } from '../context/LanguageContext.jsx';

export const LiveIncidentNotification = () => {
  const { lang } = useLanguage();
  const [activeAlert, setActiveAlert] = useState(null);

  useIncidentRealtime((event) => {
    if (event.eventType === 'INSERT' && event.incident) {
      const inc = event.incident;
      setActiveAlert({
        id: inc._id || inc.id,
        title: inc.title,
        locationName: inc.locationName || 'Bangladesh',
        category: inc.category,
        riskLevel: inc.riskLevel || 'MEDIUM',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // Auto dismiss after 9 seconds unless critical
      const timer = setTimeout(() => {
        setActiveAlert((current) => (current?.id === (inc._id || inc.id) ? null : current));
      }, 9000);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!activeAlert) return null;

  const isCritical = activeAlert.riskLevel === 'CRITICAL' || activeAlert.riskLevel === 'HIGH';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
      <div
        className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all ${
          isCritical
            ? 'bg-slate-900/95 border-red-500/80 text-slate-100 ring-1 ring-red-500/30'
            : 'bg-slate-900/95 border-cyan-500/80 text-slate-100 ring-1 ring-cyan-500/30'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Icon & Pulse */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isCritical ? 'bg-red-400' : 'bg-cyan-400'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isCritical ? 'bg-red-500' : 'bg-cyan-500'
                }`}
              ></span>
            </span>

            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
              <Radio className={`w-3.5 h-3.5 ${isCritical ? 'text-red-400' : 'text-cyan-400'}`} />
              <span className={isCritical ? 'text-red-400' : 'text-cyan-400'}>
                {lang === 'BN' ? 'সরাসরি নতুন রিপোর্ট' : 'Live Emergency Update'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{activeAlert.time}</span>
            </div>
          </div>

          <button
            onClick={() => setActiveAlert(null)}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                activeAlert.riskLevel === 'CRITICAL'
                  ? 'bg-red-950 text-red-300 border border-red-800'
                  : activeAlert.riskLevel === 'HIGH'
                  ? 'bg-orange-950 text-orange-300 border border-orange-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {activeAlert.riskLevel}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">{activeAlert.category}</span>
          </div>

          <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{activeAlert.title}</h4>
          <p className="text-[11px] text-slate-400 truncate">📍 {activeAlert.locationName}</p>
        </div>

        {/* Action Link */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-mono">
            {lang === 'BN' ? 'রিয়েলটাইম সিংক সক্রিয়' : 'Real-time database synced'}
          </span>
          <Link
            to={`/incidents/${activeAlert.id}`}
            onClick={() => setActiveAlert(null)}
            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl transition-all ${
              isCritical
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            {lang === 'BN' ? 'বিস্তারিত দেখুন' : 'View Report'}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LiveIncidentNotification;
