import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Send,
  Sparkles,
  Image as ImageIcon,
  MapPin,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api.js';
import LocationPickerMap from '../components/LocationPickerMap.jsx';
import AIAnalysisBadge from '../components/AIAnalysisBadge.jsx';

const CATEGORIES = [
  'Crime',
  'Accident',
  'Fire',
  'Medical Emergency',
  'Natural Disaster',
  'Suspicious Activity',
  'Road Hazard',
  'Infrastructure Problem',
  'Theft',
  'Violence',
  'Other',
];

const PRESET_IMAGES = [
  { label: 'অগ্নিকাণ্ড (Building Fire)', url: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80' },
  { label: 'সড়ক দুর্ঘটনা (Road Accident)', url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80' },
  { label: 'সড়ক মেরামত / বিপদ', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80' },
  { label: 'বন্যা / জলবদ্ধতা', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80' },
];

export const ReportIncidentPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Crime');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState(23.8103);
  const [longitude, setLongitude] = useState(90.4125);
  const [imageUrl, setImageUrl] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [preAiLoading, setPreAiLoading] = useState(false);
  const [previewAiResult, setPreviewAiResult] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLocationSelect = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
    if (!locationName) {
      setLocationName(`Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const handleRunAiPreview = async () => {
    if (!title || !description) {
      setError('AI প্রিভিউ দেখতে ঘটনার শিরোনাম ও বিবরণ লিখুন।');
      return;
    }
    setError('');
    setPreAiLoading(true);
    try {
      const res = await api.analyzeIncidentAI({ title, description, category });
      if (res.success && res.analysis) {
        setPreviewAiResult(res.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPreAiLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ফাইল সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে পারবে।');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !locationName.trim()) {
      setError('শিরোনাম, বিবরণ এবং স্থানের নাম দেওয়া আবশ্যক।');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createIncident({
        title,
        description,
        category,
        locationName,
        latitude,
        longitude,
        imageUrl,
        isAnonymous,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/incidents/${res.incident._id || res.incident.id}`);
        }, 1500);
      } else {
        setError(res.message || 'রিপোর্ট জমা দিতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      setError(err.message || 'সার্ভার সমস্যা। আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">জরুরি রিপোর্ট সফলভাবে জমা হয়েছে!</h2>
        <p className="text-xs text-slate-300">
          আপনার রিপোর্টটি গ্রহণ করা হয়েছে এবং Gemini AI ঝুঁকি বিশ্লেষণ সম্পন্ন হয়েছে। ডিটেইল পেজে রিডাইরেক্ট করা হচ্ছে...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-800 text-red-400 text-xs font-mono font-bold">
          <ShieldAlert className="w-3.5 h-3.5" /> নাগরিক জরুরি রিপোর্ট পোর্টাল
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">জরুরি ঘটনার রিপোর্ট প্রদান করুন</h1>
        <p className="text-xs text-slate-400">
          সঠিক তথ্য প্রদান করুন। Google Gemini AI স্বয়ংক্রিয়ভাবে ঝুঁকির তীব্রতা নির্ণয় করে এডমিন প্যানেল ও জরুরি বিভাগকে জানাবে।
        </p>
      </div>

      {error && (
        <div className="bg-red-950/80 border border-red-800 text-red-300 text-xs p-4 rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" /> ঘটনার মূল তথ্য (Incident Info)
          </h3>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ঘটনার শিরোনাম (Title) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: ধানমন্ডি ২৭ নম্বর রোডে বহুতল ভবনে অগ্নিকাণ্ড"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ঘটনার শ্রেণী (Category) *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                স্থানের নাম / ঠিকানা (Location Name) *
              </label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="যেমন: মিরপুর ১০ গোলচত্বর, ঢাকা"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                ঘটনার বিস্তারিত বিবরণ (Description) *
              </label>
              <button
                type="button"
                onClick={handleRunAiPreview}
                disabled={preAiLoading || !title || !description}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 bg-cyan-950/60 border border-cyan-800 px-2.5 py-1 rounded-lg transition-all disabled:opacity-40 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {preAiLoading ? 'বিশ্লেষণ হচ্ছে...' : 'Gemini AI পূর্বরূপ দেখুন'}
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ঘটনাটি কীভাবে ঘটেছে, ক্ষতির পরিমাণ, কোনো আহত ব্যক্তি বা বিশেষ ঝুঁকি রয়েছে কিনা তা লিখুন..."
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* AI Preview Result */}
          {previewAiResult && (
            <div className="mt-4">
              <AIAnalysisBadge
                incidentType={previewAiResult.incidentType}
                riskLevel={previewAiResult.riskLevel}
                urgencyLevel={previewAiResult.urgencyLevel}
                confidenceScore={previewAiResult.confidenceScore}
                shortSummary={previewAiResult.shortSummary}
                recommendedAction={previewAiResult.recommendedAction}
              />
            </div>
          )}
        </div>

        {/* GIS Location Picker */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" /> ম্যাপ পিন ও জিপিএস স্থানাঙ্ক
          </h3>

          <LocationPickerMap
            latitude={latitude}
            longitude={longitude}
            onLocationSelect={handleLocationSelect}
          />
        </div>

        {/* Photos & Media Attachment */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-3 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-400" /> ছবি যুক্ত করুন (Media Photo)
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ছবি লিংক অথবা আপনার ডিভাইস থেকে সিলেক্ট করুন
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 mb-2"
              />

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Sample Photos */}
            <div>
              <div className="text-[11px] text-slate-400 font-mono mb-1.5">অথবা ডেমো নমুনা ছবি নির্বাচন করুন:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`p-1.5 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                      imageUrl === preset.url
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-[11px] font-medium truncate">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {imageUrl && (
              <div className="mt-2 p-2 bg-slate-950 border border-slate-800 rounded-2xl max-w-xs">
                <p className="text-[10px] text-slate-400 font-mono mb-1">সংযুক্ত ছবির প্রিভিউ:</p>
                <img src={imageUrl} alt="Attached Preview" className="w-full h-32 object-cover rounded-xl" />
              </div>
            )}
          </div>
        </div>

        {/* Anonymous Reporting Toggle */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-purple-400" /> গোপনীয় / নামহীন রিপোর্ট (Anonymous Reporting)
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              চালু করলে আপনার নাম বা পরিচয় পাবলিক ভিউ থেকে সম্পূর্ণ গোপন থাকবে।
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-base py-4 rounded-2xl shadow-xl shadow-red-950/50 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-5 h-5" />
            {submitting ? 'রিপোর্ট জমা ও Gemini AI বিশ্লেষণ হচ্ছে...' : 'জরুরি রিপোর্ট জমা দিন'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportIncidentPage;
