import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin } from 'lucide-react';

const defaultPinIcon = L.divIcon({
  html: `<div class="w-8 h-8 bg-red-600 text-white rounded-full border-2 border-white shadow-xl flex items-center justify-center font-bold text-sm animate-bounce">
    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
    </svg>
  </div>`,
  className: 'custom-picker-pin',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const MapClickHandler = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const MapRecenter = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], map.getZoom(), { duration: 1 });
    }
  }, [lat, lng, map]);
  return null;
};

export const LocationPickerMap = ({
  latitude = 23.8103,
  longitude = 90.4125,
  onLocationSelect,
  height = '280px',
}) => {
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        onLocationSelect(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setGpsLoading(false);
        console.error('Geolocation error:', err);
        alert('Could not retrieve current location. Please pick location manually on the map.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300 font-medium flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-cyan-400" /> Click Map to Set Precise Incident Location
        </span>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={gpsLoading}
          className="bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors text-xs active:scale-95 cursor-pointer"
        >
          <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
          {gpsLoading ? 'Locating...' : 'Use My GPS Location'}
        </button>
      </div>

      <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-slate-800 relative shadow-inner z-0">
        <MapContainer center={[latitude, longitude]} zoom={13} scrollWheelZoom={false} className="w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onSelect={onLocationSelect} />
          <MapRecenter lat={latitude} lng={longitude} />

          <Marker position={[latitude, longitude]} icon={defaultPinIcon} />
        </MapContainer>
      </div>

      <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between px-1">
        <span>Latitude: {latitude ? latitude.toFixed(6) : '23.810300'}</span>
        <span>Longitude: {longitude ? longitude.toFixed(6) : '90.412500'}</span>
      </div>
    </div>
  );
};

export default LocationPickerMap;
