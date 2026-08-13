import bcrypt from 'bcryptjs';
import { dbStore } from '../db/store';

export async function seedInitialDatabase() {
  const existingUsers = await dbStore.getUsers();

  if (existingUsers.length > 0) {
    console.log('Database already populated. Syncing users to Supabase if connected...');
    for (const u of existingUsers) {
      await dbStore.syncUserToSupabase(u);
    }
    return;
  }

  console.log('Seeding initial database with demo records...');

  const passwordHash = await bcrypt.hash('Admin@123456', 10);
  const citizenPasswordHash = await bcrypt.hash('Citizen@123456', 10);

  // Seed Users
  const adminUser = await dbStore.createUser({
    name: 'Chief Inspector Admin',
    email: 'admin@safecity.ai',
    password: passwordHash,
    phone: '+1 (555) 019-2831',
    role: 'ADMIN',
    isActive: true,
  });

  const citizenUser = await dbStore.createUser({
    name: 'John Citizen',
    email: 'citizen@safecity.ai',
    password: citizenPasswordHash,
    phone: '+1 (555) 014-9921',
    role: 'CITIZEN',
    isActive: true,
  });

  const citizenUser2 = await dbStore.createUser({
    name: 'Sarah Connor',
    email: 'sarah@safecity.ai',
    password: citizenPasswordHash,
    phone: '+1 (555) 018-3329',
    role: 'CITIZEN',
    isActive: true,
  });

  // Seed Emergency Services
  await dbStore.createEmergencyService({
    name: 'Metropolitan Police Central Station',
    type: 'POLICE',
    address: '100 Public Safety Boulevard, District 1',
    phone: '911 / (555) 010-9000',
    latitude: 23.8103,
    longitude: 90.4125,
    available24x7: true,
  });

  await dbStore.createEmergencyService({
    name: 'Central Municipal Fire & Rescue Headquarters',
    type: 'FIRE',
    address: '45 Emergency Way, District 2',
    phone: '911 / (555) 010-9111',
    latitude: 23.8185,
    longitude: 90.419,
    available24x7: true,
  });

  await dbStore.createEmergencyService({
    name: 'City General Trauma & Medical Center',
    type: 'HOSPITAL',
    address: '88 Healthcare Avenue',
    phone: '(555) 010-9222',
    latitude: 23.805,
    longitude: 90.405,
    available24x7: true,
  });

  await dbStore.createEmergencyService({
    name: 'Rapid Response Ambulance Corps',
    type: 'AMBULANCE',
    address: '12 Medical Plaza',
    phone: '(555) 010-9333',
    latitude: 23.815,
    longitude: 90.425,
    available24x7: true,
  });

  // Seed Realistic Incidents
  await dbStore.createIncident({
    title: 'Severe Structural Fire in Commercial Building',
    description:
      'Heavy black smoke and visible flames emanating from the second floor of a commercial building. Electrical sparks observed near main breaker panel.',
    category: 'Fire',
    locationName: 'North Market Commercial Area, Sector 4',
    latitude: 23.814,
    longitude: 90.418,
    imageUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80',
    isAnonymous: false,
    reporter: {
      _id: citizenUser._id,
      name: citizenUser.name,
      email: citizenUser.email,
      phone: citizenUser.phone,
    },
    reporterId: citizenUser._id,
    status: 'IN_PROGRESS',
    riskLevel: 'CRITICAL',
    urgencyLevel: 'IMMEDIATE',
    aiClassification: 'Fire',
    aiSummary: 'Critical active fire in multi-story commercial area with high risk of structural propagation.',
    aiRecommendation: 'Dispatch Fire Engine Squads 3 & 4 immediately. Evacuate adjacent structures.',
    aiConfidenceScore: 0.96,
    verifiedByAdmin: true,
    adminNotes: 'Fire department units dispatched. Perimeter secured by police.',
  });

  await dbStore.createIncident({
    title: 'Two-Vehicle Traffic Collision on Main Expressway',
    description:
      'Collision between a sedan and a delivery truck blocking two northbound lanes. Fuel spill detected on asphalt. Minor injuries reported.',
    category: 'Accident',
    locationName: 'Expressway Overpass Km 14',
    latitude: 23.822,
    longitude: 90.425,
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    isAnonymous: false,
    reporter: {
      _id: citizenUser2._id,
      name: citizenUser2.name,
      email: citizenUser2.email,
      phone: citizenUser2.phone,
    },
    reporterId: citizenUser2._id,
    status: 'VERIFIED',
    riskLevel: 'HIGH',
    urgencyLevel: 'HIGH',
    aiClassification: 'Accident',
    aiSummary: 'Multi-vehicle crash causing major traffic bottleneck with potential fuel hazard.',
    aiRecommendation: 'Request Traffic Police unit for lane diversion and Hazmat cleanup crew.',
    aiConfidenceScore: 0.91,
    verifiedByAdmin: true,
    adminNotes: 'Traffic police notified. Tow truck en route.',
  });

  await dbStore.createIncident({
    title: 'Unattended Hazardous Pothole and Broken Drainage Cover',
    description:
      'Deep collapsed sewer hole open on pedestrian walkway near primary school gate. Hazardous for children during rush hours.',
    category: 'Road Hazard',
    locationName: 'School Road, District 3',
    latitude: 23.801,
    longitude: 90.402,
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    isAnonymous: true,
    reporter: {
      _id: citizenUser._id,
      name: 'Anonymous Citizen',
    },
    reporterId: citizenUser._id,
    status: 'UNDER_REVIEW',
    riskLevel: 'MEDIUM',
    urgencyLevel: 'MEDIUM',
    aiClassification: 'Infrastructure Problem',
    aiSummary: 'Public walkway hazard posing physical injury risk to school children.',
    aiRecommendation: 'Notify Public Works Department to place safety barrier and schedule urgent repair.',
    aiConfidenceScore: 0.88,
    verifiedByAdmin: false,
    adminNotes: 'Assigned to Municipal Public Works.',
  });

  await dbStore.createIncident({
    title: 'Report of Suspicious Loitering Near ATM Kiosk',
    description:
      'Two masked individuals standing near automated teller machine late at night tampering with card reader slot.',
    category: 'Suspicious Activity',
    locationName: 'Central Avenue Plaza ATM',
    latitude: 23.809,
    longitude: 90.41,
    imageUrl: '',
    isAnonymous: false,
    reporter: {
      _id: citizenUser._id,
      name: citizenUser.name,
      email: citizenUser.email,
      phone: citizenUser.phone,
    },
    reporterId: citizenUser._id,
    status: 'RESOLVED',
    riskLevel: 'HIGH',
    urgencyLevel: 'HIGH',
    aiClassification: 'Suspicious Activity',
    aiSummary: 'Potential ATM card skimming or robbery setup in progress.',
    aiRecommendation: 'Dispatch nearby night patrol cruiser for immediate identity verification.',
    aiConfidenceScore: 0.89,
    verifiedByAdmin: true,
    adminNotes: 'Patrol officer inspected site. Tampering device seized.',
  });

  // Seed Initial Notifications
  await dbStore.createNotification({
    userId: citizenUser._id,
    title: 'Report Verified: Structural Fire',
    message: 'Your fire report at North Market has been verified and emergency teams are on site.',
    type: 'VERIFICATION',
  });

  await dbStore.createNotification({
    userId: 'ADMIN_ALL',
    title: 'CRITICAL ALERT: Fire Report',
    message: 'New CRITICAL risk incident submitted by citizen.',
    type: 'NEW_REPORT',
  });

  console.log('Database seeding complete!');
}
