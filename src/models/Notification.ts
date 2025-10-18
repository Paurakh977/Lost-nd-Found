import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType = 
  | 'case_assigned' 
  | 'verification_required' 
  | 'new_claim' 
  | 'case_resolved'
  | 'new_message';

export interface INotification extends Document {
  officerId: mongoose.Types.ObjectId; // Reference to User model (officer)
  type: NotificationType;
  message: string;
  caseId?: mongoose.Types.ObjectId; // Reference to Case
  claimId?: mongoose.Types.ObjectId; // Reference to Claim
  read: boolean;
  metadata?: {
    caseTitle?: string;
    caseType?: string;
    claimantName?: string;
    claimantEmail?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  officerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['case_assigned', 'verification_required', 'new_claim', 'case_resolved'],
    index: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  caseId: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
    required: false,
    index: true
  },
  claimId: {
    type: Schema.Types.ObjectId,
    ref: 'Claim',
    required: false,
    index: true
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    required: false
  }
}, {
  timestamps: true
});

// Create compound indexes for better performance
// Primary query pattern: get unread notifications for an officer, sorted by newest first
NotificationSchema.index({ officerId: 1, read: 1, createdAt: -1 });

// For querying all notifications for an officer sorted by date
NotificationSchema.index({ officerId: 1, createdAt: -1 });

// For querying notifications by case
NotificationSchema.index({ caseId: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
