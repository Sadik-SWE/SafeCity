import { createClient } from '@supabase/supabase-js';

// Read Supabase credentials from client environment variables
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  '';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder') &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'your-anon-key' &&
  !supabaseAnonKey.includes('placeholder')
);

// Initialize Supabase Client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Normalizes incident database records into a clean, unified camelCase object
 * compatible with all frontend UI components and maps.
 */
export function normalizeIncident(row) {
  if (!row) return null;

  // Extract coordinates and location name
  let locationName = row.locationName || row.location_name || '';
  let latitude = row.latitude !== undefined ? Number(row.latitude) : 23.8103;
  let longitude = row.longitude !== undefined ? Number(row.longitude) : 90.4125;

  if (row.location && typeof row.location === 'object') {
    locationName = row.location.name || row.location.address || locationName;
    if (row.location.latitude) latitude = Number(row.location.latitude);
    if (row.location.longitude) longitude = Number(row.location.longitude);
  }

  // Extract reporter
  let reporter = row.reporter;
  if (!reporter || typeof reporter !== 'object') {
    reporter = {
      _id: row.reporter_id || row.reporterId || 'anon',
      name: row.reporter_name || row.reporterName || (row.is_anonymous ? 'Anonymous Citizen' : 'Citizen'),
      phone: row.reporter_phone || row.reporterPhone || '',
      email: row.reporter_email || row.reporterEmail || '',
    };
  }

  return {
    _id: row.id || row._id,
    id: row.id || row._id,
    title: row.title || 'Untitled Emergency Incident',
    description: row.description || '',
    category: row.category || 'Other',
    status: row.status || 'PENDING',
    riskLevel: (row.risk_level || row.riskLevel || 'MEDIUM').toUpperCase(),
    urgencyLevel: (row.urgency_level || row.urgencyLevel || 'MEDIUM').toUpperCase(),
    locationName: locationName || 'Bangladesh',
    latitude: isNaN(latitude) ? 23.8103 : latitude,
    longitude: isNaN(longitude) ? 90.4125 : longitude,
    imageUrl: row.image_url || row.imageUrl || '',
    isAnonymous: Boolean(row.is_anonymous !== undefined ? row.is_anonymous : row.isAnonymous),
    reporter,
    reporterId: row.reporter_id || row.reporterId || reporter?._id,
    verifiedByAdmin: Boolean(row.verified_by_admin !== undefined ? row.verified_by_admin : row.verifiedByAdmin),
    adminNotes: row.admin_notes || row.adminNotes || '',
    aiSummary: row.ai_summary || row.aiSummary || '',
    aiRecommendation: row.ai_recommendation || row.aiRecommendation || '',
    aiClassification: row.ai_classification || row.aiClassification || row.category,
    aiConfidenceScore: row.ai_confidence_score !== undefined ? Number(row.ai_confidence_score) : (row.aiConfidenceScore || 0.9),
    aiAnalysis: row.ai_analysis || row.aiAnalysis || null,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

/**
 * Custom event broadcaster for in-app real-time event distribution
 */
export function broadcastIncidentEvent(eventType, incident) {
  try {
    const normalized = normalizeIncident(incident);
    const customEvent = new CustomEvent('emergency_incident_update', {
      detail: {
        eventType, // 'INSERT' | 'UPDATE' | 'DELETE'
        incident: normalized,
        timestamp: new Date().toISOString(),
      },
    });
    window.dispatchEvent(customEvent);
  } catch (err) {
    console.debug('Local event dispatch info:', err);
  }
}

/**
 * REAL-TIME SUBSCRIPTION:
 * Listens for live emergency incident updates from Supabase Realtime
 * and in-app broadcaster, ensuring real-time UI synchronization.
 *
 * @param {Function} callback - Function called with { eventType, incident, oldIncident, raw }
 * @returns {Function} unsubscribe - Function to stop listening and cleanup channels
 */
export function subscribeToIncidents(callback) {
  if (typeof callback !== 'function') return () => {};

  let supabaseChannel = null;

  // 1. Subscribe to Supabase Postgres Changes if configured
  if (supabase) {
    try {
      supabaseChannel = supabase
        .channel('emergency-incidents-realtime-' + Math.random().toString(36).substring(2, 9))
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'incidents' },
          (payload) => {
            const eventType = payload.eventType; // 'INSERT' | 'UPDATE' | 'DELETE'
            const incident = payload.new ? normalizeIncident(payload.new) : null;
            const oldIncident = payload.old ? normalizeIncident(payload.old) : null;

            callback({
              eventType,
              incident: incident || oldIncident,
              oldIncident,
              raw: payload,
              source: 'supabase',
            });
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('⚡ Supabase Real-time: Subscribed to live incident stream');
          }
        });
    } catch (err) {
      console.warn('Supabase Realtime subscription warning:', err);
    }
  }

  // 2. Local in-app event listener for unified immediate updates
  const handleLocalEvent = (e) => {
    if (e.detail) {
      callback({
        eventType: e.detail.eventType,
        incident: e.detail.incident,
        raw: e.detail,
        source: 'local',
      });
    }
  };

  window.addEventListener('emergency_incident_update', handleLocalEvent);

  // Return cleanup function
  return () => {
    window.removeEventListener('emergency_incident_update', handleLocalEvent);
    if (supabaseChannel && supabase) {
      try {
        supabase.removeChannel(supabaseChannel);
      } catch (err) {
        console.debug('Error removing channel:', err);
      }
    }
  };
}

/**
 * Fetch all incidents from Supabase table with optional filtering
 */
export async function fetchSupabaseIncidents(filters = {}) {
  if (!supabase) return null;
  try {
    let query = supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.category && filters.category !== 'ALL') {
      query = query.eq('category', filters.category);
    }
    if (filters.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status);
    }
    if (filters.riskLevel && filters.riskLevel !== 'ALL') {
      query = query.ilike('risk_level', filters.riskLevel);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(normalizeIncident);
  } catch (err) {
    console.warn('Supabase incident fetch error:', err.message || err);
    return null;
  }
}

/**
 * Fetch a single incident by ID from Supabase
 */
export async function getSupabaseIncidentById(id) {
  if (!supabase || !id) return null;
  try {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return normalizeIncident(data);
  } catch (err) {
    console.warn('Supabase get incident by id error:', err.message || err);
    return null;
  }
}

/**
 * Create a new incident in Supabase with normalized columns
 */
export async function createSupabaseIncident(incidentData) {
  if (!supabase) return null;
  try {
    const lat = incidentData.latitude ? Number(incidentData.latitude) : 23.8103;
    const lng = incidentData.longitude ? Number(incidentData.longitude) : 90.4125;

    const payload = {
      title: incidentData.title,
      description: incidentData.description,
      category: incidentData.category || 'Other',
      status: incidentData.status || 'PENDING',
      risk_level: incidentData.riskLevel || 'MEDIUM',
      urgency_level: incidentData.urgencyLevel || 'MEDIUM',
      location: {
        name: incidentData.locationName || 'Bangladesh',
        latitude: lat,
        longitude: lng,
      },
      location_name: incidentData.locationName || 'Bangladesh',
      latitude: lat,
      longitude: lng,
      image_url: incidentData.imageUrl || '',
      reporter_name: incidentData.reporter?.name || incidentData.reporterName || 'Anonymous Citizen',
      reporter_phone: incidentData.reporter?.phone || incidentData.reporterPhone || '',
      reporter_id: incidentData.reporter?._id || incidentData.reporterId || null,
      is_anonymous: Boolean(incidentData.isAnonymous),
      ai_summary: incidentData.aiSummary || '',
      ai_recommendation: incidentData.aiRecommendation || '',
      ai_confidence_score: incidentData.aiConfidenceScore || 0.9,
      ai_classification: incidentData.aiClassification || incidentData.category,
      verified_by_admin: false,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('incidents')
      .insert([payload])
      .select();

    if (error) {
      console.warn('Supabase incident insert notice:', error.message);
      return null;
    }

    const saved = normalizeIncident(data?.[0]);
    if (saved) {
      broadcastIncidentEvent('INSERT', saved);
    }
    return saved;
  } catch (err) {
    console.warn('Supabase insert failed:', err);
    return null;
  }
}

/**
 * Update an existing incident in Supabase
 */
export async function updateSupabaseIncident(id, updates) {
  if (!supabase || !id) return null;
  try {
    const payload = {
      updated_at: new Date().toISOString(),
    };

    if (updates.status) payload.status = updates.status;
    if (updates.adminNotes !== undefined) payload.admin_notes = updates.adminNotes;
    if (updates.verifiedByAdmin !== undefined) payload.verified_by_admin = updates.verifiedByAdmin;
    if (updates.title) payload.title = updates.title;
    if (updates.description) payload.description = updates.description;
    if (updates.category) payload.category = updates.category;
    if (updates.riskLevel) payload.risk_level = updates.riskLevel;

    const { data, error } = await supabase
      .from('incidents')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) {
      console.warn('Supabase update notice:', error.message);
      return null;
    }

    const updated = normalizeIncident(data?.[0]);
    if (updated) {
      broadcastIncidentEvent('UPDATE', updated);
    }
    return updated;
  } catch (err) {
    console.warn('Supabase update failed:', err);
    return null;
  }
}

/**
 * Delete an incident in Supabase
 */
export async function deleteSupabaseIncident(id, title) {
  if (!supabase) return null;
  try {
    let query = supabase.from('incidents').delete();
    if (id && title) {
      query = query.or(`id.eq.${id},title.eq.${title}`);
    } else if (id) {
      query = query.eq('id', id);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase delete notice:', error.message);
    }

    broadcastIncidentEvent('DELETE', { _id: id, id, title });
    return data;
  } catch (err) {
    console.warn('Supabase delete failed:', err);
    return null;
  }
}

/**
 * Sync user profile to Supabase users table
 */
export async function createSupabaseUser(userData) {
  if (!supabase || !userData) return null;
  try {
    const payload = {
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      role: userData.role || 'CITIZEN',
      is_active: userData.isActive !== undefined ? userData.isActive : true,
      updated_at: new Date().toISOString(),
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
 * Fetch verified Bangladesh emergency hotlines
 */
export async function fetchSupabaseEmergencyServices(type = 'ALL') {
  if (!supabase) return null;
  try {
    let query = supabase.from('emergency_services').select('*');
    if (type && type !== 'ALL') {
      query = query.eq('type', type);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase emergency services fetch failed:', err);
    return null;
  }
}

/**
 * Get the current Supabase connection health and info
 */
export function getSupabaseStatus() {
  return {
    isConfigured: isSupabaseConfigured,
    url: supabaseUrl ? supabaseUrl.replace(/(https?:\/\/)([^.]+)(.+)/, '$1$2***$3') : 'Not Configured',
    clientReady: Boolean(supabase),
  };
}
