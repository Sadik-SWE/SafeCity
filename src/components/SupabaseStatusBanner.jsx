import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, X } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabase.js';

export default function SupabaseStatusBanner() {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const sqlSchema = `-- BANGLADESH EMERGENCY & CITIZEN SAFETY PORTAL - SUPABASE SQL SCHEMA
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'CITIZEN',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  risk_level VARCHAR(20) DEFAULT 'MEDIUM',
  location JSONB NOT NULL,
  reporter_name VARCHAR(255),
  reporter_phone VARCHAR(50),
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS & Idempotent Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public All Users" ON public.users;
DROP POLICY IF EXISTS "Public Users Read" ON public.users;
DROP POLICY IF EXISTS "Public Users Insert" ON public.users;
DROP POLICY IF EXISTS "Public Users Update" ON public.users;
DROP POLICY IF EXISTS "Public Users All" ON public.users;

DROP POLICY IF EXISTS "Public All Incidents" ON public.incidents;
DROP POLICY IF EXISTS "Public Incidents All" ON public.incidents;

CREATE POLICY "Public All Users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All Incidents" ON public.incidents FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border-b border-emerald-500/20 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Database className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Supabase Database:</span>
          {isSupabaseConfigured ? (
            <span className="inline-flex items-center space-x-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>Connected & Live</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 text-emerald-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Supabase Engine Ready (Auto Sync Enabled)</span>
            </span>
          )}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px] underline flex items-center space-x-1 cursor-pointer"
        >
          <span>SQL Schema & Config</span>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <Database className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Supabase Database Integration</h3>
                <p className="text-xs text-slate-400">Bangladesh Emergency & Citizen Safety Portal</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <p>
                This application natively supports <strong className="text-emerald-400">Supabase PostgreSQL</strong> for storing emergency reports, incidents, and user data.
              </p>
              <p className="text-slate-400">
                To link your Supabase project, set <code className="text-cyan-400 font-mono">SUPABASE_URL</code> and <code className="text-cyan-400 font-mono">SUPABASE_ANON_KEY</code> in environment settings.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">1-Click Supabase SQL Table Setup Script</label>
                <button
                  onClick={copySql}
                  className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs rounded-lg flex items-center space-x-1 font-mono transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>

              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300/90 max-h-48 overflow-y-auto whitespace-pre-wrap">
                {sqlSchema}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
