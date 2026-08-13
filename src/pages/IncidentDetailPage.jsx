import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  ShieldCheck,
  User,
  ArrowLeft,
  Sparkles,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AIAnalysisBadge from '../components/AIAnalysisBadge.jsx';
import StatusTimeline from '../components/StatusTimeline.jsx';
import IncidentMap from '../components/IncidentMap.jsx';

export const IncidentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchIncident = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.getIncidentById(id);
      if (res.success && res.incident) {
        setIncident(res.incident);
      } else {
        setError('ঘটনার বিস্তারিত পাওয়া যায়নি।');
      }
    } catch (err) {
      setError(err.message || 'রিপোর্ট লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const handleDelete = async () => {
    if (!incident || !window.confirm('আপনি কি নিশ্চিতভাবে এই রিপোর্টটি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteIncident(incident._id || incident.id);
      alert('রিপোর্টটি মুছে ফেলা হয়েছে।');
      navigate('/incidents');
    } catch (err) {
      alert(err.message || 'রিপোর্ট মুছতে ব্যর্থ হয়েছে।');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-sm font-mono">
        ঘটনার বিস্তারিত ও Gemini AI ঝুঁকি বিশ্লেষণ লোড করা হচ্ছে...
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">{error || 'রিপোর্ট পাওয়া যায়নি'}</h2>
        <Link to="/incidents" className="text-cyan-400 hover:underline text-xs font-mono">
          ← সকল রিপোর্টের তালিকায় ফিরে যান
        </Link>
      </div>
    );
  }

  const isMyPendingReport = user && incident.reporterId === user._id && incident.status === 'PENDING';

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/incidents"
          className="text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> সকল রিপোর্টের তালিকায় ফিরে যান
        </Link>

        {/* Edit / Delete for reporter if pending */}
        {(isMyPendingReport || isAdmin) && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDelete}
              className="bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> রিপোর্ট মুছে ফেলুন
            </button>
          </div>
        )}
      </div>

      {/* Title & Header Badges */}
      <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="bg-slate-800 text-slate-200 font-bold px-3 py-1 rounded-lg border border-slate-700">
              {incident.category}
            </span>
            {incident.verifiedByAdmin && (
              <span className="bg-cyan-950 text-cyan-300 font-bold px-3 py-1 rounded-lg border border-cyan-800 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> অফিশিয়াল যাচাইকৃত রিপোর্ট
              </span>
            )}
          </div>

          <div className="text-slate-400 font-mono text-[11px] flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {incident.createdAt ? new Date(incident.createdAt).toLocaleString() : 'Recent'}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              {incident.isAnonymous ? 'Anonymous Citizen' : incident.reporter?.name || 'Citizen'}
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 leading-snug">
          {incident.title}
        </h1>

        <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
          <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{incident.locationName}</span>
        </div>
      </div>

      {/* Incident Resolution Status Timeline */}
      <StatusTimeline status={incident.status} />

      {/* Grid: Description + Gemini AI Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Photo & Full Description */}
        <div className="lg:col-span-7 space-y-6">
          {incident.imageUrl && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <img
                src={incident.imageUrl}
                alt={incident.title}
                className="w-full h-80 object-cover"
              />
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-3">
              প্রদানকৃত রিপোর্টের বর্ণনা
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {incident.description}
            </p>
          </div>

          {/* Admin Notes if any */}
          {incident.adminNotes && (
            <div className="bg-amber-950/40 border border-amber-800/60 rounded-3xl p-6 shadow-xl space-y-2">
              <h4 className="font-bold text-amber-300 text-xs font-mono uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> এডমিন প্রতিক্রিয়া ও পদক্ষেপ
              </h4>
              <p className="text-xs text-amber-200/90 leading-relaxed font-mono">
                {incident.adminNotes}
              </p>
            </div>
          )}
        </div>

        {/* Right Col: Gemini AI Assessment & Location Map */}
        <div className="lg:col-span-5 space-y-6">
          <AIAnalysisBadge
            incidentType={incident.aiClassification || incident.category}
            riskLevel={incident.riskLevel}
            urgencyLevel={incident.urgencyLevel}
            confidenceScore={incident.aiConfidenceScore}
            shortSummary={incident.aiSummary}
            recommendedAction={incident.aiRecommendation}
          />

          {/* Map Location */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
            <h4 className="font-bold text-slate-100 text-xs font-mono uppercase flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" /> জিপিএস মানচিত্র অবস্থান
            </h4>
            <div className="h-64 rounded-2xl overflow-hidden">
              <IncidentMap incidents={[incident]} height="100%" zoom={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailPage;
