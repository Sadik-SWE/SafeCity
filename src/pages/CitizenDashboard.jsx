import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, MapPin, Compass } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useIncidentRealtime } from '../hooks/useIncidentRealtime.js';
import IncidentCard from '../components/IncidentCard.jsx';
import IncidentMap from '../components/IncidentMap.jsx';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const [myIncidents, setMyIncidents] = useState([]);
  const [allIncidents, setAllIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyReports = async () => {
    setLoading(true);
    try {
      const [resMy, resAll] = await Promise.all([
        api.getIncidents({ myReportsOnly: true }),
        api.getIncidents(),
      ]);

      if (resMy.success && resMy.incidents) {
        setMyIncidents(resMy.incidents);
      }
      if (resAll.success && resAll.incidents) {
        setAllIncidents(resAll.incidents);
      }
    } catch (e) {
      console.error('Error fetching reports for dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  // Real-time listener for user reports & map updates
  useIncidentRealtime((event) => {
    if (event.eventType === 'INSERT' && event.incident) {
      setAllIncidents((prev) => {
        const exists = prev.some((i) => (i._id === event.incident._id || i.id === event.incident.id));
        if (exists) return prev;
        return [event.incident, ...prev];
      });
      if (event.incident.reporterId === user?._id || event.incident.reporter?._id === user?._id) {
        setMyIncidents((prev) => [event.incident, ...prev.filter((i) => (i._id !== event.incident._id && i.id !== event.incident.id))]);
      }
    } else if (event.eventType === 'UPDATE' && event.incident) {
      setAllIncidents((prev) => prev.map((i) => (i._id === event.incident._id || i.id === event.incident.id ? { ...i, ...event.incident } : i)));
      setMyIncidents((prev) => prev.map((i) => (i._id === event.incident._id || i.id === event.incident.id ? { ...i, ...event.incident } : i)));
    } else if (event.eventType === 'DELETE' && event.incident) {
      const targetId = event.incident._id || event.incident.id;
      setAllIncidents((prev) => prev.filter((i) => (i._id !== targetId && i.id !== targetId)));
      setMyIncidents((prev) => prev.filter((i) => (i._id !== targetId && i.id !== targetId)));
    }
  }, [user?._id]);

  const totalReports = myIncidents.length;
  const pendingReports = myIncidents.filter((i) => i.status === 'PENDING').length;
  const verifiedReports = myIncidents.filter((i) => i.verifiedByAdmin || i.status === 'VERIFIED').length;
  const resolvedReports = myIncidents.filter((i) => i.status === 'RESOLVED').length;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            নাগরিক পোর্টাল (Citizen Safety Dashboard)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            স্বাগতম, <span className="text-cyan-400 font-semibold">{user?.name}</span>। আপনার প্রদানকৃত সকল রিপোর্ট ও অগ্রগতি এখানে দেখতে পাবেন।
          </p>
        </div>

        <Link
          to="/report"
          className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm px-5 py-2.5 rounded-2xl shadow-lg flex items-center gap-2 self-start md:self-auto transition-all"
        >
          <PlusCircle className="w-4 h-4" /> নতুন জরুরি রিপোর্ট জমা দিন
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-400 font-mono">আমার মোট রিপোর্ট</div>
          <div className="text-2xl font-extrabold text-slate-100">{totalReports}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-400 font-mono">যাচাইয়ের অপেক্ষায়</div>
          <div className="text-2xl font-extrabold text-amber-400">{pendingReports}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-400 font-mono">যাচাইকৃত রিপোর্ট</div>
          <div className="text-2xl font-extrabold text-cyan-400">{verifiedReports}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-400 font-mono">সমাধানকৃত রিপোর্ট</div>
          <div className="text-2xl font-extrabold text-emerald-400">{resolvedReports}</div>
        </div>
      </div>

      {/* Geolocation Interactive Map View */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">
              আপনার আশপাশের লাইভ ইমারজেন্সি জিপিএস ম্যাপ
            </h2>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800">
            {allIncidents.length} Incident Pins
          </span>
        </div>

        <IncidentMap
          incidents={allIncidents}
          height="400px"
          interactiveHeader={true}
          showUserLocationByDefault={true}
        />
      </div>

      {/* List of my reports */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" /> আমার জমার ইতিহাস (My Report History)
        </h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm font-mono">
            রিপোর্ট ইতিহাস লোড করা হচ্ছে...
          </div>
        ) : myIncidents.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
            <FileText className="w-12 h-12 text-slate-600 mx-auto opacity-40" />
            <p className="font-semibold text-slate-200">আপনি এখনো কোনো নতুন রিপোর্ট জমা দেননি।</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              কোনো জরুরি দুর্ঘটনা বা নিরাপত্তা ঝুঁকির মুখোমুখি হলে সাথে সাথে রিপোর্ট জমা দিন।
            </p>
            <Link
              to="/report"
              className="inline-block mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-4 py-2 rounded-xl"
            >
              প্রথম রিপোর্ট জমা দিন
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {myIncidents.map((inc) => (
              <IncidentCard key={inc._id || inc.id} incident={inc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenDashboard;
