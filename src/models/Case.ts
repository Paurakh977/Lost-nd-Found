import mongoose, { Document, Schema } from 'mongoose';

export type CaseType = 'lost' | 'found' | 'verification';
export type CaseStatus = 'pending' | 'active' | 'resolved' ;
export type UrgencyLevel = 'low' | 'medium' | 'high' | null;

export interface ICase extends Document {
  title: string;
  description: string;
  type: CaseType;
  status: CaseStatus;
  urgencyLevel: UrgencyLevel;
  reportedTime: Date; // Time when the incident occurred (lost/found)
  // Note: createdAt timestamp is used for submission time
  location: {
    type: string;
    coordinates?: [number, number]; // Optional coordinates
    address: string; // Required address
    details?: string;
  };
  itemDetails: {
    detailedDescription: string; // Required detailed description of the item
    category?: string;
    brand?: string;
    model?: string;
    color?: string;
    serialNumber?: string;
    identifyingFeatures?: string;
    estimatedValue?: number;
  };
  images: string[];
  reportedBy: {
    clerkId: string; // Clerk user ID
    name: string;
  };
  assignedOfficer?: mongoose.Types.ObjectId; // Reference to User model (officer)
  resolution?: {
    resolvedAt: Date;
    resolvedBy: mongoose.Types.ObjectId; // Reference to User model (officer)
    outcome: string;
    notes?: string;
    itemAssignedTo?: { // Person who received the found item or whose lost item was found
      clerkId?: string; // If assigned to a Clerk user
      name: string;
      contactInfo?: string;
    };
    foundBy?: { // Person who found the item (for lost items that were found)
      clerkId?: string; // If found by a Clerk user
      name: string;
      contactInfo?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema = new Schema<ICase>({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 20,
    maxlength: 1500
  },
  type: {
    type: String,
    required: true,
    enum: ['lost', 'found', 'verification']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'active', 'resolved'],
    default: 'pending'
  },
  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', null],
    default: null
  },
  reportedTime: {
    type: Date,
    required: true,
    description: 'The date and time when the item was lost or found'
  },
  // Note: Using timestamps:true creates createdAt field that serves as submission time
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: false, // Making coordinates optional
      validate: {
        validator: function(v: number[]) {
          // Only validate if coordinates are provided
          return !v || v.length === 2;
        },
        message: 'Coordinates must be [longitude, latitude]'
      }
    },
    address: {
      type: String,
      required: true // Address is always required
    },
    details: String
  },
  itemDetails: {
    detailedDescription: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 2000
    },
    category: String,
    brand: String,
    model: String,
    color: String,
    serialNumber: String,
    identifyingFeatures: String,
    estimatedValue: Number
  },
  images: {
    type: [String],
    validate: {
      validator: function(this: ICase, v: string[]) {
        // At least one image required for 'found' type cases only
        // For 'lost' type cases, images are optional
        return this.type !== 'found' || (v && v.length > 0);
      },
      message: 'At least one image is required for found items'
    }
  },
  reportedBy: {
    clerkId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  assignedOfficer: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: {
    resolvedAt: Date,
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    outcome: String,
    notes: String,
    itemAssignedTo: {
      clerkId: String,
      name: {
        type: String,
        required: function() { return !!this.resolution?.itemAssignedTo; }
      },
      contactInfo: String
    },
    foundBy: {
      clerkId: String,
      name: {
        type: String,
        required: function() { return !!this.resolution?.foundBy; }
      },
      contactInfo: String
    }
  }
}, {
  timestamps: true
});

// Create indexes for better performance
CaseSchema.index({ status: 1, urgencyLevel: 1 });
CaseSchema.index({ 'location.coordinates': '2dsphere' });
CaseSchema.index({ type: 1, status: 1, createdAt: -1 });
CaseSchema.index({ 'reportedBy.clerkId': 1 });
CaseSchema.index({ assignedOfficer: 1 });

export default mongoose.models.Case || mongoose.model<ICase>('Case', CaseSchema);