import mongoose, { Document, Schema } from 'mongoose';

export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface IClaim extends Document {
  caseId: mongoose.Types.ObjectId; // Reference to Case
  clerkUserId?: string; // Clerk user ID if submitted by authenticated user
  relatedFoundCaseId?: mongoose.Types.ObjectId; // Reference to the FOUND case if this claim originated from an email notification
  claimantInfo: {
    name: string;
    email: string;
    phone?: string;
    address: {
      province?: string;
      district?: string;
      municipality?: string;
      ward?: string;
      fullAddress?: string;
    };
  };
  evidence: {
    description: string; // Required description proving ownership
    images?: string[]; // Optional evidence images
  };
  status: ClaimStatus;
  reviewedBy?: mongoose.Types.ObjectId; // Reference to User model (officer)
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClaimSchema = new Schema<IClaim>({
  caseId: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
    required: true,
    index: true
  },
  clerkUserId: {
    type: String,
    required: false,
    index: true // Index for faster lookups by user
  },
  relatedFoundCaseId: {
    type: Schema.Types.ObjectId,
    ref: 'Case',
    required: false,
    index: true // Index for linking found and lost cases
  },
  claimantInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      province: String,
      district: String,
      municipality: String,
      ward: String,
      fullAddress: String
    }
  },
  evidence: {
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 2000
    },
    images: [String] // Optional evidence images
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String
}, {
  timestamps: true
});

// Create indexes for better performance
ClaimSchema.index({ caseId: 1, createdAt: -1 }); // For fetching claims by case
ClaimSchema.index({ 'claimantInfo.email': 1, caseId: 1 }); // For duplicate prevention by email
ClaimSchema.index({ clerkUserId: 1, caseId: 1 }); // For duplicate prevention by clerk user
ClaimSchema.index({ status: 1, createdAt: -1 }); // For filtering by status

export default mongoose.models.Claim || mongoose.model<IClaim>('Claim', ClaimSchema);
