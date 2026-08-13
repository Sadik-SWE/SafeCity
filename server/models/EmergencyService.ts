import mongoose, { Schema } from 'mongoose';

const emergencyServiceSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['POLICE', 'FIRE', 'HOSPITAL', 'AMBULANCE', 'DISASTER_RESPONSE'], required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    available24x7: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const EmergencyServiceModel =
  mongoose.models.EmergencyService || mongoose.model('EmergencyService', emergencyServiceSchema);
