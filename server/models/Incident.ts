import mongoose, { Schema } from 'mongoose';

const incidentSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
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
      ],
      required: true,
    },
    locationName: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    imageUrl: { type: String, default: '' },
    isAnonymous: { type: Boolean, default: false },
    reporter: {
      _id: { type: String },
      name: { type: String },
      email: { type: String },
      phone: { type: String },
    },
    reporterId: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'],
      default: 'PENDING',
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    urgencyLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'IMMEDIATE'],
      default: 'MEDIUM',
    },
    aiClassification: { type: String },
    aiSummary: { type: String },
    aiRecommendation: { type: String },
    aiConfidenceScore: { type: Number, default: 0.85 },
    verifiedByAdmin: { type: Boolean, default: false },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const IncidentModel = mongoose.models.Incident || mongoose.model('Incident', incidentSchema);
