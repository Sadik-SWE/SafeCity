import React, { useEffect, useState } from 'react';
import { Phone, MapPin, Plus, Search, ShieldCheck, Flame, Building, Ambulance, AlertOctagon, X } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import EmergencyServiceCard from '../components/EmergencyServiceCard.jsx';
import LocationPickerMap from '../components/LocationPickerMap.jsx';

export const EmergencyServicesPage = () => {
  const { isAdmin } = useAuth();
  const { lang, t } = useLanguage();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Admin Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('POLICE');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(23.8103);
  const [longitude, setLongitude] = useState(90.4125);
  const [available24x7, setAvailable24x7] = useState(true);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.getEmergencyServices({ type: typeFilter });
      if (res.success && res.services) {
        setServices(res.services);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [typeFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('emgDeleteConfirm'))) return;
    try {
      await api.deleteEmergencyService(id);
      fetchServices();
    } catch (e) {
      alert(e.message || (lang === 'BN' ? 'জরুরি সার্ভিস মুছতে ব্যর্থ হয়েছে।' : 'Failed to delete emergency service.'));
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      alert('Name, phone, and address are required.');
      return;
    }

    setModalSubmitting(true);
    try {
      const res = await api.createEmergencyService({
        name,
        type,
        phone,
        address,
        latitude,
        longitude,
        available24x7,
      });

      if (res.success) {
        setModalOpen(false);
        // reset form
        setName('');
        setPhone('');
        setAddress('');
        fetchServices();
      }
    } catch (e) {
      alert(e.message || 'Failed to add emergency service.');
    } finally {
      setModalSubmitting(false);
    }
  };

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search)
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-800 text-red-400 text-xs font-mono font-bold mb-2">
            <Phone className="w-3.5 h-3.5" /> {t('emgBadge')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            {t('emgTitle')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('emgSub')}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow flex items-center gap-2 self-start md:self-auto transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {t('emgAddNew')}
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('emgSearchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'POLICE', 'FIRE', 'HOSPITAL', 'AMBULANCE'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                typeFilter === t
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 font-mono text-sm">
          জরুরি সার্ভিসের তথ্য লোড করা হচ্ছে...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm">
          কোনো সার্ভিস পাওয়া যায়নি।
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredServices.map((s) => (
            <EmergencyServiceCard
              key={s._id || s.id}
              service={s}
              isAdmin={isAdmin}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Admin Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">নতুন জরুরি সার্ভিস স্টেশন যোগ করুন</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">স্টেশন / সার্ভিসের নাম *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: ধানমন্ডি থানা / ঢাকা ফায়ার স্টেশন"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">সার্ভিসের ধরণ *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    <option value="POLICE">POLICE</option>
                    <option value="FIRE">FIRE</option>
                    <option value="HOSPITAL">HOSPITAL</option>
                    <option value="AMBULANCE">AMBULANCE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">হটলাইন / ফোন নম্বর *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="যেমন: ৯৯৯ / ০২-৯৯৯৯৯"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ঠিকানা *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="যেমন: ধানমন্ডি ২৭, ঢাকা-১২০৯"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ম্যাপে স্থান নির্বাচন করুন</label>
                <LocationPickerMap
                  latitude={latitude}
                  longitude={longitude}
                  onLocationSelect={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                  height="200px"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="24x7"
                  checked={available24x7}
                  onChange={(e) => setAvailable24x7(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-500"
                />
                <label htmlFor="24x7" className="text-slate-300 font-semibold cursor-pointer">
                  ২৪ ঘন্টা খোলা সেবা
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow cursor-pointer"
                >
                  {modalSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সার্ভিস যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyServicesPage;
