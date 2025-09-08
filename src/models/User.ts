import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'admin' | 'officer' | 'institutional';

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  // Additional fields for different user types
  department?: string; // For officers
  institutionName?: string; // For institutional users
  permissions?: string[]; // For role-based permissions
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'officer', 'institutional'],
    default: 'officer',
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: function(this: IUser) {
      return this.role !== 'admin'; // Admin doesn't need createdBy
    },
  },
  lastLogin: {
    type: Date,
  },
  // Additional fields
  department: {
    type: String,
    required: function(this: IUser) {
      return this.role === 'officer';
    },
  },
  institutionName: {
    type: String,
    required: function(this: IUser) {
      return this.role === 'institutional';
    },
  },
  permissions: [{
    type: String,
  }],
}, {
  timestamps: true,
});

// Indexes for better performance (email already indexed by unique: true)
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
