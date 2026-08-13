import React from 'react';
import { Sparkles, ShieldAlert, AlertTriangle, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';

export const AIAnalysisBadge = ({
  incidentType,
  riskLevel = 'MEDIUM',
  urgencyLevel,
  confidenceScore = 0.9,
  shortSummary,
  recommendedAction,
  compact = false,
}) => {
  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'LOW':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'IMMEDIATE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'MEDIUM':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'LOW':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${getRiskColor(
            riskLevel
          )}`}
        >
          <ShieldAlert className="w-3 h-3" /> RISK: {riskLevel}
        </span>
        {urgencyLevel && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${getUrgencyBadge(
              urgencyLevel
            )}`}
          >
            {urgencyLevel} Urgency
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shadow-lg relative overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-cyan-950 border border-cyan-800/60 rounded-xl">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
              স্বয়ংক্রিয় ঝুঁকি বিশ্লেষণ
              <span className="text-[10px] text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-1.5 py-0.2 rounded font-mono">
                সক্রিয়
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 font-mono">জরুরি নিরাপত্তা অ্যাসেসমেন্ট</p>
          </div>
        </div>

        <div className="text-right font-mono text-[11px]">
          <span className="text-slate-400">সঠিকতা স্কোর: </span>
          <span className="text-cyan-400 font-bold">{Math.round(confidenceScore * 100)}%</span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-3">
        {incidentType && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
            <div className="text-[10px] text-slate-400 font-mono uppercase">ঘটনার ধরন</div>
            <div className="font-bold text-slate-200 text-xs mt-0.5 truncate">{incidentType}</div>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Assessed Risk</div>
          <div className="mt-0.5">
            <span
              className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getRiskColor(
                riskLevel
              )}`}
            >
              {riskLevel}
            </span>
          </div>
        </div>

        {urgencyLevel && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 col-span-2 sm:col-span-1">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Urgency Level</div>
            <div className="mt-0.5">
              <span
                className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${getUrgencyBadge(
                  urgencyLevel
                )}`}
              >
                {urgencyLevel}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Executive Summary */}
      {shortSummary && (
        <div className="mb-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
          <div className="font-semibold text-cyan-400 mb-1 flex items-center gap-1 text-[11px] font-mono">
            <Cpu className="w-3.5 h-3.5" /> EXECUTIVE SUMMARY
          </div>
          <p className="leading-relaxed text-slate-300">{shortSummary}</p>
        </div>
      )}

      {/* Recommended Action */}
      {recommendedAction && (
        <div className="bg-blue-950/30 border border-blue-800/40 p-3 rounded-xl text-xs">
          <div className="font-semibold text-blue-300 mb-1 flex items-center gap-1 text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> RECOMMENDED ACTION FOR AUTHORITIES
          </div>
          <p className="text-blue-200/90 leading-relaxed">{recommendedAction}</p>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisBadge;
