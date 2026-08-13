-- ============================================================
-- BANGLADESH EMERGENCY & CITIZEN SAFETY PORTAL - SUPABASE SCHEMA
-- ============================================================

-- Ensure extension for UUID generation is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'CITIZEN', -- 'CITIZEN' or 'ADMIN'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Incidents Table
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'FIRE', 'CRIME', 'ACCIDENT', 'MEDICAL', 'FLOOD', 'INFRASTRUCTURE', 'OTHER'
  status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'
  risk_level VARCHAR(20) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  location JSONB NOT NULL, -- { "address": "...", "coordinates": [lat, lng], "division": "..." }
  reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reporter_name VARCHAR(255),
  reporter_phone VARCHAR(50),
  is_anonymous BOOLEAN DEFAULT FALSE,
  media_urls TEXT[] DEFAULT '{}',
  upvotes INTEGER DEFAULT 0,
  upvoted_users TEXT[] DEFAULT '{}',
  ai_analysis JSONB, -- { "summary": "...", "urgency": "...", "recommendedAction": "..." }
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Incident Comments / Updates Table
CREATE TABLE IF NOT EXISTS public.incident_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_name VARCHAR(255) NOT NULL,
  user_role VARCHAR(20) DEFAULT 'CITIZEN',
  comment TEXT NOT NULL,
  status_change VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Emergency Hotline & Services Table (Bangladesh Valid Data)
CREATE TABLE IF NOT EXISTS public.emergency_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'NATIONAL', 'POLICE', 'FIRE', 'AMBULANCE', 'WOMEN_CHILDREN', 'DISASTER'
  phone VARCHAR(50) NOT NULL,
  alt_phone VARCHAR(50),
  address TEXT NOT NULL,
  division VARCHAR(50) DEFAULT 'Dhaka',
  district VARCHAR(50) DEFAULT 'Dhaka',
  is_verified BOOLEAN DEFAULT TRUE,
  location JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Setup
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to prevent "policy already exists" errors when re-running script
DROP POLICY IF EXISTS "Public All Users" ON public.users;
DROP POLICY IF EXISTS "Public Read Users" ON public.users;
DROP POLICY IF EXISTS "Anon Insert Users" ON public.users;
DROP POLICY IF EXISTS "Anon Update Users" ON public.users;
DROP POLICY IF EXISTS "Anon Upsert Users" ON public.users;
DROP POLICY IF EXISTS "Public Users Read" ON public.users;
DROP POLICY IF EXISTS "Public Users Insert" ON public.users;
DROP POLICY IF EXISTS "Public Users Update" ON public.users;
DROP POLICY IF EXISTS "Public Users All" ON public.users;

DROP POLICY IF EXISTS "Public All Incidents" ON public.incidents;
DROP POLICY IF EXISTS "Public Read Incidents" ON public.incidents;
DROP POLICY IF EXISTS "Anon Write Incidents" ON public.incidents;
DROP POLICY IF EXISTS "Anon Update Incidents" ON public.incidents;
DROP POLICY IF EXISTS "Public Incidents All" ON public.incidents;

DROP POLICY IF EXISTS "Public All Incident Updates" ON public.incident_updates;
DROP POLICY IF EXISTS "Public Read Incident Updates" ON public.incident_updates;

DROP POLICY IF EXISTS "Public All Emergency Services" ON public.emergency_services;
DROP POLICY IF EXISTS "Public Read Emergency Services" ON public.emergency_services;

-- Create unified, error-free policies
CREATE POLICY "Public All Users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All Incidents" ON public.incidents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All Incident Updates" ON public.incident_updates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public All Emergency Services" ON public.emergency_services FOR ALL USING (true) WITH CHECK (true);

-- Grant privileges to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

