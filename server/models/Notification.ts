import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['STATUS_CHANGE', 'NEW_REPORT', 'VERIFICATION', 'SYSTEM'], default: 'SYSTEM' },
    incidentId: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
