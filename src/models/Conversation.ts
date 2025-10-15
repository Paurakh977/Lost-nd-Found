import mongoose, { Document, Schema } from 'mongoose';

export interface IParticipant {
  userId: string;                 // clerkId or JWT user _id
  userType: 'clerk' | 'jwt';
  role: 'user' | 'officer';
}

export interface IConversation extends Document {
  participants: [IParticipant, IParticipant];
  caseId?: mongoose.Types.ObjectId;
  lastMessage?: {
    content: string;
    sentAt: Date;
    senderId: string;
  };
  unreadCount: Map<string, number>; // key: userId, value: count
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>({
  userId: { type: String, required: true },
  userType: { type: String, enum: ['clerk', 'jwt'], required: true },
  role: { type: String, enum: ['user', 'officer'], required: true },
}, { _id: false });

const ConversationSchema = new Schema<IConversation>({
  participants: {
    type: [ParticipantSchema],
    validate: {
      validator: (arr: IParticipant[]) => Array.isArray(arr) && arr.length === 2,
      message: 'Conversation must have exactly 2 participants'
    },
    required: true
  },
  caseId: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
    required: false,
    index: true
  },
  lastMessage: {
    content: { type: String },
    sentAt: { type: Date },
    senderId: { type: String }
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true });

// Indexes
ConversationSchema.index({ 'participants.userId': 1 });
ConversationSchema.index({ updatedAt: -1 });

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
