import { fetchSupabaseIncidents, createSupabaseIncident, fetchSupabaseEmergencyServices, createSupabaseUser, deleteSupabaseIncident } from './supabase.js';

const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('safecity_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: async (body) => {
    const res = await request('/auth/register', { method: 'POST', body: JSON.stringify(body) });
    if (res.success && res.user) {
      createSupabaseUser(res.user).catch((e) => console.log('Supabase sync notice:', e));
    }
    return res;
  },
  login: async (body) => {
    const res = await request('/auth/login', { method: 'POST', body: JSON.stringify(body) });
    if (res.success && res.user) {
      createSupabaseUser(res.user).catch((e) => console.log('Supabase sync notice:', e));
    }
    return res;
  },
  getMe: () => request('/auth/me'),
  updateProfile: async (body) => {
    const res = await request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) });
    if (res.success && res.user) {
      createSupabaseUser(res.user).catch((e) => console.log('Supabase sync notice:', e));
    }
    return res;
  },
  changePassword: (body) => request('/auth/change-password', { method: 'PUT', body: JSON.stringify(body) }),

  // Incidents (with Supabase fallback or primary read)
  getIncidents: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.status) query.append('status', params.status);
    if (params.riskLevel) query.append('riskLevel', params.riskLevel);
    if (params.search) query.append('search', params.search);
    if (params.myReportsOnly) query.append('myReportsOnly', 'true');
    
    // Attempt local API first
    try {
      const res = await request(`/incidents?${query.toString()}`);
      return res;
    } catch (err) {
      // Fallback to Supabase
      const supabaseData = await fetchSupabaseIncidents();
      if (supabaseData) {
        return { success: true, count: supabaseData.length, incidents: supabaseData };
      }
      throw err;
    }
  },

  getIncidentById: (id) => request(`/incidents/${id}`),
  createIncident: async (body) => {
    const res = await request('/incidents', { method: 'POST', body: JSON.stringify(body) });
    // Also try syncing to Supabase in background
    createSupabaseIncident(body).catch((e) => console.log('Supabase sync notice:', e));
    return res;
  },
  updateIncident: (id, body) => request(`/incidents/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteIncident: async (id, title) => {
    try {
      const res = await request(`/admin/incidents/${id}`, { method: 'DELETE' });
      if (title) deleteSupabaseIncident(id, title).catch(e => console.log('Supabase sync notice:', e));
      return res;
    } catch (adminErr) {
      try {
        const resUser = await request(`/incidents/${id}`, { method: 'DELETE' });
        if (title) deleteSupabaseIncident(id, title).catch(e => console.log('Supabase sync notice:', e));
        return resUser;
      } catch (userErr) {
        if (title) await deleteSupabaseIncident(id, title);
        throw adminErr;
      }
    }
  },

  // Admin
  updateIncidentStatus: (id, body) =>
    request(`/admin/incidents/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),

  verifyIncident: (id, body) =>
    request(`/admin/incidents/${id}/verify`, { method: 'PUT', body: JSON.stringify(body) }),

  getUsers: () => request('/admin/users'),
  getAdminUsers: () => request('/admin/users'),
  toggleUserActive: (id) => request(`/admin/users/${id}/active`, { method: 'PUT' }),
  updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  updateUserStatus: async (id, body) => {
    if (body.isActive !== undefined) {
      await request(`/admin/users/${id}/active`, { method: 'PUT' });
    }
    if (body.role !== undefined) {
      await request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role: body.role }) });
    }
    return { success: true, message: 'User status updated successfully' };
  },

  // Analytics
  getAnalyticsOverview: () => request('/analytics/overview'),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),

  // Emergency Services (with Supabase sync)
  getEmergencyServices: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.type) query.append('type', params.type);
    if (params.search) query.append('search', params.search);
    try {
      return await request(`/emergency-services?${query.toString()}`);
    } catch (err) {
      const supa = await fetchSupabaseEmergencyServices();
      if (supa) {
        return { success: true, count: supa.length, services: supa };
      }
      throw err;
    }
  },
  createEmergencyService: (body) => request('/emergency-services', { method: 'POST', body: JSON.stringify(body) }),
  updateEmergencyService: (id, body) => request(`/emergency-services/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteEmergencyService: (id) => request(`/emergency-services/${id}`, { method: 'DELETE' }),

  // AI Analysis
  analyzeIncidentAI: (body) =>
    request('/ai/analyze-incident', { method: 'POST', body: JSON.stringify(body) }),
};
