# Loss and Found System - Model Implementation Guide

## Introduction

This guide provides detailed instructions for implementing and using the models in the Loss and Found system. It covers best practices, common patterns, and examples for each model.

## Model Structure Overview

The system consists of two main models:

1. **Case** - Core model for lost/found items and verification requests
2. **User** - Existing model for officers and administrators

## Implementation Guidelines

### Case Model

#### Creating a New Case

```typescript
import Case from '@/models/Case';

// Example: Creating a new lost item case
const newCase = new Case({
  title: 'Lost iPhone 13 Pro',
  description: 'Lost my iPhone 13 Pro in blue color at Central Park',
  type: 'lost',
  reportedTime: new Date('2023-06-15T14:30:00'),
  location: {
    coordinates: [-73.965355, 40.782865], // [longitude, latitude]
    address: 'Central Park, New York, NY',
    details: 'Near the boathouse'
  },
  itemDetails: {
    category: 'Electronics',
    brand: 'Apple',
    model: 'iPhone 13 Pro',
    color: 'Blue',
    serialNumber: 'IMEI: 123456789012345',
    identifyingFeatures: 'Blue case with a picture of a cat'
  },
  images: ['https://storage.example.com/images/case123-1.jpg'],
  reportedBy: {
    clerkId: 'clerk_user_123',
    name: 'John Doe'
  },
  urgencyLevel: 'medium'
});

await newCase.save();
```

#### Updating Case Status

```typescript
// Assigning a case to an officer
const caseId = '60d21b4667d0d8992e610c85';
const officerId = '60d21b4667d0d8992e610c86';

const updatedCase = await Case.findByIdAndUpdate(
  caseId,
  {
    $set: {
      status: 'active',
      assignedOfficer: officerId
    }
  },
  { new: true }
);
```

#### Finding Cases

```typescript
// Find all pending cases with high urgency
const urgentPendingCases = await Case.find({
  status: 'pending',
  urgencyLevel: 'high'
}).sort({ createdAt: -1 });

// Find cases near a location (within 5km)
const nearbyLostItems = await Case.find({
  type: 'lost',
  'location.coordinates': {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [-73.965355, 40.782865] // [longitude, latitude]
      },
      $maxDistance: 5000 // 5km in meters
    }
  }
});

// Find cases reported by a specific user
const userCases = await Case.find({
  'reportedBy.clerkId': 'clerk_user_123'
}).sort({ createdAt: -1 });
```

#### Resolving a Case

```typescript
// Resolving a case
const caseId = '60d21b4667d0d8992e610c85';
const officerId = '60d21b4667d0d8992e610c86';

const resolvedCase = await Case.findByIdAndUpdate(
  caseId,
  {
    $set: {
      status: 'resolved',
      resolution: {
        resolvedAt: new Date(),
        resolvedBy: officerId,
        outcome: 'Item returned to owner',
        notes: 'Owner provided proof of purchase and identified unique markings'
      }
    }
  },
  { new: true }
);
```

## Best Practices

### Validation

The Case model includes built-in validation, but you should add additional validation in your API routes:

```typescript
// Example: Validating a new case
function validateCase(caseData) {
  const errors = {};
  
  if (!caseData.title || caseData.title.length < 5) {
    errors.title = 'Title must be at least 5 characters';
  }
  
  if (!caseData.description || caseData.description.length < 20) {
    errors.description = 'Description must be at least 20 characters';
  }
  
  if (caseData.type === 'found' && (!caseData.images || caseData.images.length === 0)) {
    errors.images = 'At least one image is required for found items';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
}
```

### Working with Clerk Users

Since Clerk user data is not stored in MongoDB, you'll need to fetch user information from the Clerk API when needed:

```typescript
// Example: Getting Clerk user information for a case
async function getCaseWithUserDetails(caseId) {
  // Get the case from MongoDB
  const caseData = await Case.findById(caseId).populate('assignedOfficer');
  
  if (!caseData) {
    throw new Error('Case not found');
  }
  
  // If the case was reported by a Clerk user, fetch their details
  if (caseData.reportedBy && caseData.reportedBy.clerkId) {
    try {
      // Use Clerk SDK or API to get user details
      const clerkUser = await clerk.users.getUser(caseData.reportedBy.clerkId);
      
      // Enhance the case data with additional user information if needed
      caseData.reportedBy.email = clerkUser.emailAddresses[0]?.emailAddress;
      caseData.reportedBy.profileImageUrl = clerkUser.profileImageUrl;
      
    } catch (error) {
      console.error('Error fetching Clerk user:', error);
      // Continue without the additional user details
    }
  }
  
  return caseData;
}
```

### Indexing

The Case model includes appropriate indexes, but you may need to add additional indexes based on your specific query patterns:

```typescript
// Example: Adding a compound index for common queries
CaseSchema.index({ type: 1, status: 1, urgencyLevel: 1 });
```

## Conclusion

This guide provides a foundation for implementing and using the models in the Loss and Found system. Follow these patterns and best practices to ensure a robust and maintainable application.