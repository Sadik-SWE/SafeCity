import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import {
  MapPin,
  ArrowRight,
  Crosshair,
  Compass,
  Layers,
  Phone,
  Navigation,
  Flame,
  Activity,
  Shield,
  Maximize2,
  Minimize2,
  AlertOctagon,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.jsx';

// Distance calculation helper (Haversine formula in KM)
function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
};

// Custom Leaflet Icons
const createUserLocationIcon = () => {
  const html = `
    <div class="relative flex items-center justify-center">
      <div class="w-8 h-8 rounded-full bg-cyan-500/30 border-2 border-cyan-400 animate-ping absolute"></div>
      <div class="w-6 h-6 rounded-full bg-cyan-500 border-2 border-white shadow-xl flex items-center justify-center relative z-10 text-slate-950 font-extrabold text-[10px]">
        <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-user-location-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const createIncidentRiskIcon = (riskLevel, category) => {
  let bgColor = '#f59e0b'; // Amber default
  let borderColor = '#fcd34d';
  let pulse = '';

  const level = String(riskLevel || '').toUpperCase();
  const cat = String(category || '').toUpperCase();

  if (level === 'CRITICAL') {
    bgColor = '#ef4444'; // Red
    borderColor = '#fca5a5';
    pulse = 'animate-bounce';
  } else if (level === 'HIGH') {
    bgColor = '#f97316'; // Orange
    borderColor = '#fdba74';
  } else if (level === 'LOW') {
    bgColor = '#10b981'; // Emerald
    borderColor = '#6ee7b7';
  }

  if (cat.includes('FIRE') || cat.includes('FLAME')) {
    bgColor = '#ea580c';
  } else if (cat.includes('CRIME') || cat.includes('POLICE') || cat.includes('ROBBERY')) {
    bgColor = '#a855f7';
  } else if (cat.includes('MEDICAL') || cat.includes('AMBULANCE')) {
    bgColor = '#10b981';
  }

  const html = `
    <div class="relative flex items-center justify-center ${pulse}">
      <div class="w-8 h-8 rounded-full border-2 shadow-2xl flex items-center justify-center text-slate-950 font-bold" style="background-color: ${bgColor}; border-color: ${borderColor};">
        <svg class="w-4 h-4 text-slate-950" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-incident-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export const IncidentMap = ({
  incidents = [],
  height = '520px',
  center = [23.8103, 90.4125], // Default Dhaka center
  zoom = 12,
  interactiveHeader = true,
  showUserLocationByDefault = true,
}) => {
  const { lang } = useLanguage();
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [mapTileStyle, setMapTileStyle] = useState('dark'); // 'dark' | 'standard' | 'voyager'
  const [selectedRadius, setSelectedRadius] = useState('ALL'); // '5', '10', '25', 'ALL'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto detect user geolocation on mount
  useEffect(() => {
    if (showUserLocationByDefault && 'geolocation' in navigator) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userCoords = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(userCoords);
          setMapCenter(userCoords);
          setMapZoom(13);
          setLocating(false);
        },
        (err) => {
          console.warn('Geolocation warning or denied:', err.message);
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, [showUserLocationByDefault]);

  const handleLocateMe = () => {
    if (!('geolocation' in navigator)) {
      alert(lang === 'BN' ? 'আপনার ব্রাউজারে জিপিএস সুবিধা সমর্থিত নয়।' : 'Geolocation not supported by browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userCoords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(userCoords);
        setMapCenter(userCoords);
        setMapZoom(14);
        setLocating(false);
      },
      (err) => {
        alert(lang === 'BN' ? 'আপনার বর্তমান অবস্থান পাওয়া যায়নি।' : 'Could not detect current position.');
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Filter incidents based on category and radius
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Category filter
      if (categoryFilter !== 'ALL') {
        const cat = String(inc.category || '').toUpperCase();
        if (categoryFilter === 'FIRE' && !cat.includes('FIRE') && !cat.includes('FLAME')) return false;
        if (categoryFilter === 'MEDICAL' && !cat.includes('MEDICAL') && !cat.includes('AMBULANCE')) return false;
        if (categoryFilter === 'CRIME' && !cat.includes('CRIME') && !cat.includes('POLICE') && !cat.includes('ROBBERY')) return false;
      }

      // Radius filter
      if (selectedRadius !== 'ALL' && userLocation && inc.latitude && inc.longitude) {
        const dist = getDistanceKm(userLocation[0], userLocation[1], inc.latitude, inc.longitude);
        if (dist !== null && dist > parseFloat(selectedRadius)) return false;
      }

      return true;
    });
  }, [incidents, categoryFilter, selectedRadius, userLocation]);

  const tileUrls = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  };

  return (
    <div
      className={`w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800/90 shadow-2xl relative transition-all duration-300 flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen border-none' : ''
      }`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* Map Control Bar / Header */}
      {interactiveHeader && (
        <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-2.5 z-20 text-xs">
          {/* Left: Live status & Radius */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono font-bold text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {lang === 'BN' ? 'লাইভ ইনসিডেন্ট ম্যাপ' : 'Live Emergency Map'}
            </span>

            {userLocation && (
              <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px]">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {lang === 'BN' ? 'ব্যাসার্ধ:' : 'Radius:'}
                </span>
                <select
                  value={selectedRadius}
                  onChange={(e) => setSelectedRadius(e.target.value)}
                  className="bg-transparent text-cyan-400 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900 text-slate-200">
                    {lang === 'BN' ? 'সকল এলাকা' : 'Nationwide All'}
                  </option>
                  <option value="5" className="bg-slate-900 text-slate-200">5 KM Nearby</option>
                  <option value="10" className="bg-slate-900 text-slate-200">10 KM Nearby</option>
                  <option value="25" className="bg-slate-900 text-slate-200">25 KM Nearby</option>
                </select>
              </div>
            )}

            {/* Category Quick Pills */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono transition-all ${
                  categoryFilter === 'ALL' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategoryFilter('FIRE')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono transition-all flex items-center gap-1 ${
                  categoryFilter === 'FIRE' ? 'bg-orange-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className="w-3 h-3 text-orange-400" /> Fire
              </button>
              <button
                onClick={() => setCategoryFilter('MEDICAL')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono transition-all flex items-center gap-1 ${
                  categoryFilter === 'MEDICAL' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3 h-3 text-emerald-400" /> Medical
              </button>
              <button
                onClick={() => setCategoryFilter('CRIME')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono transition-all flex items-center gap-1 ${
                  categoryFilter === 'CRIME' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3 h-3 text-purple-400" /> Crime
              </button>
            </div>
          </div>

          {/* Right: Map style, GPS button, Fullscreen */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Locate Me button */}
            <button
              onClick={handleLocateMe}
              disabled={locating}
              className="bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 px-3 py-1 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <Crosshair className={`w-3.5 h-3.5 ${locating ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{lang === 'BN' ? 'আমার অবস্থান' : 'My Location'}</span>
            </button>

            {/* Map Theme Toggle */}
            <button
              onClick={() =>
                setMapTileStyle((prev) => (prev === 'dark' ? 'standard' : prev === 'standard' ? 'voyager' : 'dark'))
              }
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 p-1.5 rounded-xl transition-colors cursor-pointer"
              title={lang === 'BN' ? 'ম্যাপ থিম পরিবর্তন' : 'Toggle Map Theme'}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 p-1.5 rounded-xl transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="w-full flex-1 relative z-0">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="w-full h-full min-h-[300px]"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={tileUrls[mapTileStyle]}
          />

          <RecenterMap center={mapCenter} zoom={mapZoom} />

          {/* User Location Pulse Marker */}
          {userLocation && (
            <>
              <Marker position={userLocation} icon={createUserLocationIcon()}>
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 max-w-xs text-slate-900">
                    <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wide font-mono block mb-1">
                      {lang === 'BN' ? 'আপনার চিহ্নিত জিপিএস অবস্থান' : 'Your Detected GPS Position'}
                    </span>
                    <p className="text-xs font-bold text-slate-900">
                      {lang === 'BN' ? 'আপনি এখানে আছেন' : 'You Are Here'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      Lat: {userLocation[0].toFixed(4)}, Lng: {userLocation[1].toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>

              {/* Accuracy / Radius Circle */}
              <Circle
                center={userLocation}
                radius={selectedRadius === 'ALL' ? 3000 : parseFloat(selectedRadius) * 1000}
                pathOptions={{
                  color: '#06b6d4',
                  fillColor: '#06b6d4',
                  fillOpacity: 0.08,
                  weight: 1.5,
                  dashArray: '4, 8',
                }}
              />
            </>
          )}

          {/* Emergency Incident Markers */}
          {filteredIncidents.map((incident) => {
            const incLat = incident.latitude || 23.8103;
            const incLng = incident.longitude || 90.4125;
            const distance = userLocation ? getDistanceKm(userLocation[0], userLocation[1], incLat, incLng) : null;

            return (
              <Marker
                key={incident._id || incident.id}
                position={[incLat, incLng]}
                icon={createIncidentRiskIcon(incident.riskLevel, incident.category)}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1.5 max-w-xs text-slate-900 font-sans">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                        {incident.category}
                      </span>
                      <span className="text-[10px] font-extrabold text-red-600 font-mono">
                        {incident.riskLevel} RISK
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-900 leading-snug mb-1">
                      {incident.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 line-clamp-2 mb-2 leading-tight">
                      {incident.aiSummary || incident.description}
                    </p>

                    {/* Location & Distance */}
                    <div className="space-y-1 mb-2.5 pt-1 border-t border-slate-200">
                      <div className="text-[10px] text-slate-600 font-mono flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="truncate">{incident.locationName}</span>
                      </div>

                      {distance !== null && (
                        <div className="text-[10px] font-bold text-cyan-700 font-mono flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-cyan-600 shrink-0" />
                          <span>
                            {lang === 'BN' ? `আপনার থেকে ${distance} কি.মি. দূরে` : `${distance} km away from you`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons in popup */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${incLat},${incLng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold py-1 px-2 rounded-lg border border-slate-300 flex items-center justify-center gap-1 transition-colors"
                      >
                        <Navigation className="w-3 h-3 text-blue-600" /> Directions
                      </a>

                      <Link
                        to={`/incidents/${incident._id || incident.id}`}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold py-1 px-2 rounded-lg flex items-center justify-center gap-1 shadow transition-all"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Footer Info overlay */}
      <div className="bg-slate-950/90 border-t border-slate-800/80 px-4 py-2 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 font-mono">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {lang === 'BN'
              ? `প্রদর্শিত হচ্ছে ${filteredIncidents.length} টি সক্রিয় জরুরি ঘটনা`
              : `Showing ${filteredIncidents.length} active emergency incident markers`}
          </span>
        </div>

        <a
          href="tel:999"
          className="bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 px-3 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
        >
          <Phone className="w-3 h-3 text-red-400" /> Call 999 Hotline
        </a>
      </div>
    </div>
  );
};

export default IncidentMap;
