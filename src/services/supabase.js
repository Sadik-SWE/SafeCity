import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your-anon-key'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Sync user profile to Supabase users table
 */
export async function createSupabaseUser(userData) {
  if (!supabase) return null;
  try {
    const payload = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role || 'CITIZEN',
      is_active: userData.isActive !== undefined ? userData.isActive : true,
    };
    const { data, error } = await supabase
      .from('users')
      .upsert([payload], { onConflict: 'email' })
      .select();
    if (error) {
      console.warn('Supabase user sync error:', error.message);
      return null;
    }
    return data?.[0];
  } catch (err) {
    console.warn('Supabase user sync failed:', err);
    return null;
  }
}

/**
 * Fetch all incidents from Supabase if configured
 */
export async function fetchSupabaseIncidents() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase fetch failed, fallback to local API:', err);
    return null;
  }
}

/**
 * Create a new incident in Supabase with correct column mappings
 */
export async function createSupabaseIncident(incidentData) {
  if (!supabase) return null;
  try {
    const payload = {
      title: incidentData.title,
      description: incidentData.description,
      category: incidentData.category,
      status: incidentData.status || 'PENDING',
      risk_level: incidentData.riskLevel || 'MEDIUM',
      location: {
        name: incidentData.locationName || 'Unknown',
        latitude: incidentData.latitude,
        longitude: incidentData.longitude,
      },
      reporter_name: incidentData.reporter?.name || 'Anonymous Citizen',
      reporter_phone: incidentData.reporter?.phone || '',
      is_anonymous: Boolean(incidentData.isAnonymous),
    };
    const { data, error } = await supabase
      .from('incidents')
      .insert([payload])
      .select();
    if (error) {
      console.warn('Supabase insert error:', error.message);
      return null;
    }
    return data?.[0];
  } catch (err) {
    console.warn('Supabase insert failed:', err);
    return null;
  }
}

export async function deleteSupabaseIncident(id, title) {
  if (!supabase) return null;
  try {
    const filter = title ? `id.eq.${id},title.eq.${title}` : `id.eq.${id}`;
    const { data, error } = await supabase
      .from('incidents')
      .delete()
      .or(filter);
    if (error) console.warn('Supabase delete error:', error.message);
    return data;
  } catch (err) {
    console.warn('Supabase delete failed:', err);
    return null;
  }
}

/**
 * Fetch authentic Bangladesh emergency hotlines
 */
export async function fetchSupabaseEmergencyServices() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('emergency_services')
      .select('*');
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase emergency services fetch failed:', err);
    return null;
  }
}
