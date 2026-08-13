import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, ShieldAlert, Sparkles, UserCheck, ArrowRight, ShieldCheck, User } from 'lucide-react';
import AIAnalysisBadge from './AIAnalysisBadge.jsx';

export const IncidentCard = ({ incident, showAdminActions = false }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'VERIFIED':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'UNDER_REVIEW':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-200 shadow-xl flex flex-col group">
      {/* Image if available */}
      {incident.imageUrl ? (
        <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
          <img
            src={incident.imageUrl}
            alt={incident.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="bg-slate-950/80 backdrop-blur text-slate-200 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-700 shadow">
              {incident.category}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <AIAnalysisBadge riskLevel={incident.riskLevel} compact />
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between">
          <span className="bg-slate-800 text-slate-200 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-700">
            {incident.category}
          </span>
          <AIAnalysisBadge riskLevel={incident.riskLevel} compact />
        </div>
      )}

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Status & Verification Badges */}
          <div className="flex items-center justify-between text-xs gap-2">
            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${getStatusBadge(incident.status)}`}>
              STATUS: {incident.status ? incident.status.replace('_', ' ') : 'PENDING'}
            </span>

            {incident.verifiedByAdmin && (
              <span className="text-cyan-400 text-[11px] font-semibold flex items-center gap-1 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Verified
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-2">
            {incident.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {incident.aiSummary || incident.description}
          </p>
        </div>

        {/* Location & Metadata */}
        <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
          <div className="flex items-center space-x-2 text-slate-300 truncate">
            <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <span className="truncate">{incident.locationName}</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{incident.createdAt ? new Date(incident.createdAt).toLocaleDateString() : 'Today'}</span>
            </div>

            <div className="flex items-center space-x-1 text-slate-400">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>{incident.isAnonymous ? 'Anonymous' : incident.reporter?.name || 'Citizen'}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            to={`/incidents/${incident._id || incident.id}`}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs py-2 px-3 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all group-hover:border-cyan-500/40"
          >
            <span>View Complete Analysis & Map</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IncidentCard;
