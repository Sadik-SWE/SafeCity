export type UserRole = 'CITIZEN' | 'ADMIN';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type IncidentCategory =
  | 'Crime'
  | 'Accident'
  | 'Fire'
  | 'Medical Emergency'
  | 'Natural Disaster'
  | 'Suspicious Activity'
  | 'Road Hazard'
  | 'Infrastructure Problem'
  | 'Theft'
  | 'Violence'
  | 'Other';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'IMMEDIATE';
export type IncidentStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED';

export interface AIAnalysis {
  incidentType: IncidentCategory;
  riskLevel: RiskLevel;
  urgencyLevel: UrgencyLevel;
  confidenceScore: number;
  shortSummary: string;
  recommendedAction: string;
  analyzedAt: string;
}

export interface Incident {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  category: IncidentCategory;
  locationName: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  isAnonymous?: boolean;
  reporter?: {
    _id?: string;
    id?: string;
    name: string;
    email?: string;
    phone?: string;
  };
  reporterId?: string;
  status: IncidentStatus;
  riskLevel: RiskLevel;
  urgencyLevel: UrgencyLevel;
  aiClassification?: string;
  aiSummary?: string;
  aiRecommendation?: string;
  aiConfidenceScore?: number;
  aiAnalysis?: AIAnalysis;
  verifiedByAdmin?: boolean;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | 'INCIDENT_UPDATE'
  | 'NEW_INCIDENT'
  | 'SYSTEM'
  | 'SECURITY'
  | 'STATUS_CHANGE'
  | 'VERIFICATION'
  | 'NEW_REPORT';

export interface NotificationItem {
  _id?: string;
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  incidentId?: string;
  isRead: boolean;
  createdAt: string;
}

export type EmergencyServiceType =
  | 'POLICE'
  | 'FIRE_BRIGADE'
  | 'FIRE'
  | 'HOSPITAL'
  | 'AMBULANCE'
  | 'DISASTER_MANAGEMENT';

export interface EmergencyService {
  _id?: string;
  id?: string;
  name: string;
  type: EmergencyServiceType;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  available24x7: boolean;
  createdAt: string;
}

export interface AnalyticsOverview {
  totalReports: number;
  pendingReports: number;
  verifiedReports: number;
  criticalReports: number;
  highRiskReports: number;
  resolvedReports: number;
  todayReports: number;
  weekReports: number;
  categoryStats: { name: string; value: number }[];
  riskStats: { name: string; value: number }[];
  statusStats: { name: string; value: number }[];
  trendStats: { date: string; reports: number; resolved: number }[];
}
