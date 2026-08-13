import React from 'react';
import { Phone, MapPin, Clock, ShieldCheck, Flame, Building, Ambulance, AlertOctagon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

export const EmergencyServiceCard = ({
  service,
  isAdmin = false,
  onEdit,
  onDelete,
}) => {
  const { lang, t } = useLanguage();

  const getIcon = (type) => {
    switch (type) {
      case 'POLICE':
        return <ShieldCheck className="w-5 h-5 text-blue-400" />;
      case 'FIRE':
        return <Flame className="w-5 h-5 text-amber-500" />;
      case 'HOSPITAL':
        return <Building className="w-5 h-5 text-emerald-400" />;
      case 'AMBULANCE':
        return <Ambulance className="w-5 h-5 text-rose-400" />;
      default:
        return <AlertOctagon className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'POLICE':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      case 'FIRE':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'HOSPITAL':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'AMBULANCE':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
            {getIcon(service.type)}
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border font-mono ${getTypeBadge(service.type)}`}>
            {service.type}
          </span>
        </div>

        <div>
          <h3 className="font-bold text-slate-100 text-base">{service.name}</h3>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
            <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <span className="truncate">{service.address}</span>
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {service.available24x7 ? t('emg247') : t('emgHours')}
          </span>
        </div>

        <a
          href={`tel:${service.phone ? service.phone.split('/')[0].trim() : '999'}`}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Phone className="w-4 h-4" /> {t('emgCallHotline')}: {service.phone}
        </a>

        {isAdmin && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => onEdit && onEdit(service)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-1.5 rounded-lg border border-slate-700 font-medium cursor-pointer"
            >
              {t('emgEdit')}
            </button>
            <button
              onClick={() => onDelete && onDelete(service._id || service.id)}
              className="flex-1 bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs py-1.5 rounded-lg border border-red-800/60 font-medium cursor-pointer"
            >
              {t('emgDelete')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyServiceCard;
