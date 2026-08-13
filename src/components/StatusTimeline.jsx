import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, AlertCircle, RefreshCw, XCircle } from 'lucide-react';

export const StatusTimeline = ({ status = 'PENDING' }) => {
  if (status === 'REJECTED') {
    return (
      <div className="bg-red-950/40 border border-red-800/50 rounded-2xl p-4 flex items-center space-x-3 text-red-300">
        <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
        <div>
          <div className="font-semibold text-sm">Report Rejected</div>
          <div className="text-xs text-red-400/80">
            This incident report was reviewed by administrators and flagged as invalid, duplicate, or unverified.
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'PENDING', label: 'Submitted', desc: 'Awaiting Review' },
    { key: 'UNDER_REVIEW', label: 'Under Review', desc: 'Evaluating Report' },
    { key: 'VERIFIED', label: 'Verified', desc: 'Confirmed by Admin' },
    { key: 'IN_PROGRESS', label: 'In Progress', desc: 'Units Dispatched' },
    { key: 'RESOLVED', label: 'Resolved', desc: 'Incident Cleared' },
  ];

  const getStepIndex = (st) => {
    switch (st) {
      case 'PENDING':
        return 0;
      case 'UNDER_REVIEW':
        return 1;
      case 'VERIFIED':
        return 2;
      case 'IN_PROGRESS':
        return 3;
      case 'RESOLVED':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
      <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
        <span>Incident Resolution Timeline</span>
        <span className="text-cyan-400 font-bold px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded-full text-[10px]">
          STATUS: {status ? status.replace('_', ' ') : 'PENDING'}
        </span>
      </div>

      <div className="relative flex items-center justify-between">
        {/* Connecting Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500 transition-all duration-500 z-0"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        {steps.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-400'
                    : isCurrent
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-900/50 ring-4 ring-cyan-500/20 animate-pulse'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 font-bold" />
                ) : (
                  <span className="text-xs font-mono">{idx + 1}</span>
                )}
              </div>

              <div className="mt-2 hidden sm:block">
                <div
                  className={`text-xs font-medium ${
                    isCurrent ? 'text-cyan-400 font-bold' : isDone ? 'text-slate-200' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sm:hidden mt-4 pt-3 border-t border-slate-800 text-center">
        <div className="text-xs font-semibold text-cyan-400">Current Step: {steps[currentIndex].label}</div>
        <div className="text-[11px] text-slate-400">{steps[currentIndex].desc}</div>
      </div>
    </div>
  );
};

export default StatusTimeline;
