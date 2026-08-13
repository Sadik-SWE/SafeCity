import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { supabaseServer, isSupabaseConfigured } from '../services/supabase.js';
import { User, Incident, NotificationItem, EmergencyService } from '../../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: User[];
  incidents: Incident[];
  notifications: NotificationItem[];
  emergencyServices: EmergencyService[];
}

class Store {
  private isMongoConnected = false;
  private memoryDb: DatabaseSchema = {
    users: [],
    incidents: [],
    notifications: [],
    emergencyServices: [],
  };

  constructor() {
    this.ensureDataDir();
    this.loadFromFile();
    if (supabaseServer) {
      console.log('Supabase server client connected for database persistence.');
    }
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (e) {
        console.error('Failed to create data directory:', e);
      }
    }
  }

  private loadFromFile() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.memoryDb = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading local db file, initializing fresh:', err);
      }
    }
  }

  public saveToFile() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.memoryDb, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving to local db file:', err);
    }
  }

  public async connectMongo(): Promise<boolean> {
    const uri = process.env.MONGODB_URI;
    if (uri && uri.startsWith('mongodb')) {
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
        this.isMongoConnected = true;
        console.log('MongoDB connected successfully via MONGODB_URI.');
        return true;
      } catch (err) {
        console.warn('MongoDB connection failed, falling back to local persistent DB engine:', err);
      }
    }
    console.log('Running with local persistent JSON database store.');
    return false;
  }

  // --- Users CRUD ---
  public async getUsers(): Promise<User[]> {
    return [...this.memoryDb.users];
  }

  public async getUserById(id: string): Promise<User | null> {
    if (!id) return null;
    let found = this.memoryDb.users.find(u => String(u._id) === String(id) || String(u.id) === String(id));
    if (!found) {
      found = this.memoryDb.users.find(u =>
        (u._id && (String(u._id).includes(id) || String(id).includes(String(u._id)))) ||
        (u.id && (String(u.id).includes(id) || String(id).includes(String(u.id))))
      );
    }
    return found || null;
  }

  public async deleteUser(id: string): Promise<boolean> {
    if (!id) return false;
    let index = this.memoryDb.users.findIndex(u => String(u._id) === String(id) || String(u.id) === String(id));
    if (index === -1) {
      index = this.memoryDb.users.findIndex(u =>
        (u._id && (String(u._id).includes(id) || String(id).includes(String(u._id)))) ||
        (u.id && (String(u.id).includes(id) || String(id).includes(String(u.id))))
      );
    }
    if (index === -1) return false;
    this.memoryDb.users.splice(index, 1);
    this.saveToFile();
    return true;
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    return (
      this.memoryDb.users.find(
        u => u.email.toLowerCase() === email.toLowerCase()
      ) || null
    );
  }

  public async syncUserToSupabase(user: User): Promise<boolean> {
    if (!supabaseServer) return false;
    try {
      const payload: any = {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role || 'CITIZEN',
        is_active: user.isActive !== undefined ? user.isActive : true,
      };
      if (user.password) {
        payload.password_hash = user.password;
      }
      const { error } = await supabaseServer
        .from('users')
        .upsert(payload, { onConflict: 'email' });

      if (error) {
        console.debug(`Supabase user sync notice for ${user.email}:`, error.message);
        return false;
      }
      console.log(`Successfully synced user ${user.email} to Supabase users table.`);
      return true;
    } catch (err: any) {
      console.debug(`Supabase user sync notice for ${user.email}:`, err.message || err);
      return false;
    }
  }

  public async createUser(userData: Partial<User>): Promise<User> {
    const _id = 'usr_' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    const newUser: User = {
      _id,
      id: _id,
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      role: userData.role || 'CITIZEN',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdAt: now,
      updatedAt: now,
      ...userData,
    } as User;

    this.memoryDb.users.push(newUser);
    this.saveToFile();

    await this.syncUserToSupabase(newUser);

    return newUser;
  }

  public async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const index = this.memoryDb.users.findIndex(u => u._id === id || u.id === id);
    if (index === -1) return null;
    const updated = {
      ...this.memoryDb.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.memoryDb.users[index] = updated;
    this.saveToFile();

    await this.syncUserToSupabase(updated);

    return updated;
  }

  // --- Incidents CRUD ---
  public async getIncidents(): Promise<Incident[]> {
    return [...this.memoryDb.incidents].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async getIncidentById(id: string): Promise<Incident | null> {
    if (!id) return null;
    let found = this.memoryDb.incidents.find(i => String(i._id) === String(id) || String(i.id) === String(id));
    if (!found) {
      found = this.memoryDb.incidents.find(i =>
        (i._id && (String(i._id).includes(id) || String(id).includes(String(i._id)))) ||
        (i.id && (String(i.id).includes(id) || String(id).includes(String(i.id))))
      );
    }
    return found || null;
  }

  public async createIncident(incidentData: Partial<Incident>): Promise<Incident> {
    const _id = 'inc_' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    const newIncident: Incident = {
      _id,
      id: _id,
      title: incidentData.title || 'Untitled Incident',
      description: incidentData.description || '',
      category: incidentData.category || 'Other',
      locationName: incidentData.locationName || 'Unknown Location',
      latitude: incidentData.latitude || 23.8103,
      longitude: incidentData.longitude || 90.4125,
      imageUrl: incidentData.imageUrl || '',
      isAnonymous: Boolean(incidentData.isAnonymous),
      reporter: incidentData.reporter,
      reporterId: incidentData.reporterId,
      status: incidentData.status || 'PENDING',
      riskLevel: incidentData.riskLevel || 'MEDIUM',
      urgencyLevel: incidentData.urgencyLevel || 'MEDIUM',
      aiClassification: incidentData.aiClassification,
      aiSummary: incidentData.aiSummary,
      aiRecommendation: incidentData.aiRecommendation,
      aiConfidenceScore: incidentData.aiConfidenceScore,
      aiAnalysis: incidentData.aiAnalysis,
      verifiedByAdmin: incidentData.verifiedByAdmin || false,
      adminNotes: incidentData.adminNotes || '',
      createdAt: now,
      updatedAt: now,
    };

    this.memoryDb.incidents.unshift(newIncident);
    this.saveToFile();

    if (supabaseServer) {
      try {
        await supabaseServer
          .from('incidents')
          .insert([{
            title: newIncident.title,
            description: newIncident.description,
            category: newIncident.category,
            status: newIncident.status,
            risk_level: newIncident.riskLevel,
            location: {
              name: newIncident.locationName,
              latitude: newIncident.latitude,
              longitude: newIncident.longitude,
            },
            reporter_name: newIncident.reporter?.name || 'Anonymous',
            reporter_phone: newIncident.reporter?.phone || '',
            is_anonymous: Boolean(newIncident.isAnonymous),
          }]);
        console.log(`Incident "${newIncident.title}" synced to Supabase database.`);
      } catch (err) {
        console.warn('Failed to sync incident to Supabase:', err);
      }
    }

    return newIncident;
  }

  public async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident | null> {
    let index = this.memoryDb.incidents.findIndex(i => String(i._id) === String(id) || String(i.id) === String(id));
    if (index === -1) {
      index = this.memoryDb.incidents.findIndex(i =>
        (i._id && (String(i._id).includes(id) || String(id).includes(String(i._id)))) ||
        (i.id && (String(i.id).includes(id) || String(id).includes(String(i.id))))
      );
    }
    if (index === -1) return null;
    const updated = {
      ...this.memoryDb.incidents[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.memoryDb.incidents[index] = updated;
    this.saveToFile();

    if (supabaseServer) {
      try {
        await supabaseServer
          .from('incidents')
          .update({
            title: updated.title,
            description: updated.description,
            category: updated.category,
            status: updated.status,
            risk_level: updated.riskLevel,
          })
          .or(`id.eq.${updated.id},title.eq.${updated.title}`);
        console.log(`Incident "${updated.title}" updated in Supabase database.`);
      } catch (err) {
        console.warn('Failed to update incident in Supabase:', err);
      }
    }

    return updated;
  }

  public async deleteIncident(id: string): Promise<boolean> {
    let index = this.memoryDb.incidents.findIndex(
      i => String(i._id) === String(id) || String(i.id) === String(id)
    );
    if (index === -1) {
      index = this.memoryDb.incidents.findIndex(
        i =>
          (i._id && id && (String(i._id).includes(id) || String(id).includes(String(i._id)))) ||
          (i.id && id && (String(i.id).includes(id) || String(id).includes(String(i.id))))
      );
    }
    if (index === -1) return false;
    const removed = this.memoryDb.incidents.splice(index, 1)[0];
    this.saveToFile();

    if (supabaseServer && removed) {
      try {
        await supabaseServer
          .from('incidents')
          .delete()
          .or(`id.eq.${removed.id},title.eq.${removed.title}`);
        console.log(`Incident "${removed.title}" deleted from Supabase database.`);
      } catch (err) {
        console.warn('Failed to delete incident from Supabase:', err);
      }
    }

    return true;
  }

  // --- Notifications CRUD ---
  public async getNotifications(userId: string): Promise<NotificationItem[]> {
    return this.memoryDb.notifications
      .filter(n => n.userId === userId || n.userId === 'ALL' || n.userId === 'ADMIN_ALL')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async createNotification(data: Partial<NotificationItem>): Promise<NotificationItem> {
    const _id = 'notif_' + Math.random().toString(36).substr(2, 9);
    const newNotif: NotificationItem = {
      _id,
      id: _id,
      userId: data.userId || 'ALL',
      title: data.title || 'System Alert',
      message: data.message || '',
      type: data.type || 'SYSTEM',
      incidentId: data.incidentId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.memoryDb.notifications.unshift(newNotif);
    this.saveToFile();
    return newNotif;
  }

  public async markNotificationRead(id: string, userId: string): Promise<boolean> {
    const notif = this.memoryDb.notifications.find(
      n => (n._id === id || n.id === id) && (n.userId === userId || n.userId === 'ALL' || n.userId === 'ADMIN_ALL')
    );
    if (!notif) return false;
    notif.isRead = true;
    this.saveToFile();
    return true;
  }

  public async markAllNotificationsRead(userId: string): Promise<boolean> {
    this.memoryDb.notifications.forEach(n => {
      if (n.userId === userId || n.userId === 'ALL' || n.userId === 'ADMIN_ALL') {
        n.isRead = true;
      }
    });
    this.saveToFile();
    return true;
  }

  // --- Emergency Services CRUD ---
  public async getEmergencyServices(): Promise<EmergencyService[]> {
    return [...this.memoryDb.emergencyServices];
  }

  public async createEmergencyService(serviceData: Partial<EmergencyService>): Promise<EmergencyService> {
    const _id = 'es_' + Math.random().toString(36).substr(2, 9);
    const service: EmergencyService = {
      _id,
      id: _id,
      name: serviceData.name || 'Emergency Center',
      type: serviceData.type || 'POLICE',
      address: serviceData.address || 'Central City',
      phone: serviceData.phone || '911',
      latitude: serviceData.latitude || 23.8103,
      longitude: serviceData.longitude || 90.4125,
      available24x7: serviceData.available24x7 !== undefined ? serviceData.available24x7 : true,
      createdAt: new Date().toISOString(),
    };
    this.memoryDb.emergencyServices.push(service);
    this.saveToFile();
    return service;
  }

  public async updateEmergencyService(id: string, updates: Partial<EmergencyService>): Promise<EmergencyService | null> {
    const index = this.memoryDb.emergencyServices.findIndex(e => e._id === id || e.id === id);
    if (index === -1) return null;
    const updated = {
      ...this.memoryDb.emergencyServices[index],
      ...updates,
    };
    this.memoryDb.emergencyServices[index] = updated;
    this.saveToFile();
    return updated;
  }

  public async deleteEmergencyService(id: string): Promise<boolean> {
    const index = this.memoryDb.emergencyServices.findIndex(e => e._id === id || e.id === id);
    if (index === -1) return false;
    this.memoryDb.emergencyServices.splice(index, 1);
    this.saveToFile();
    return true;
  }

  public clearAll() {
    this.memoryDb = {
      users: [],
      incidents: [],
      notifications: [],
      emergencyServices: [],
    };
    this.saveToFile();
  }
}

export const dbStore = new Store();
