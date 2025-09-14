# Loss and Found System - Model Relationships

## Overview

This document outlines the simplified model structure for the Loss and Found system. The system is designed to handle lost and found items, verification requests, and the management of these cases by officers.

## Models

### Core Models

1. **Case**
   - The central model representing lost items, found items, or verification requests
   - Contains all details about the item, location, timestamps, and status
   - Links to Clerk users via clerkId and officers via User model reference

2. **User** (existing model)
   - Represents JWT-authenticated users (officers, administrators, institutional users)
   - Managed through the admin interface

## Relationships Diagram

```
┌─────────────────┐     reports     ┌─────────────┐
│  Clerk User     │─────────────────▶│    Case     │
│ (via Clerk API) │                  │             │
└─────────────────┘                  │             │
                                     │             │
┌─────────────────┐     manages      │             │
│      User       │─────────────────▶│             │
│  (JWT Auth)     │                  └─────────────┘
└─────────────────┘                        
```

## Key Relationships

### User-Case Relationships

1. **Clerk User → Case**
   - Clerk users can report lost items, found items, or request verification
   - The `reportedBy` field in the Case model stores the Clerk user's ID and name
   - No direct MongoDB relationship, as Clerk users are managed through Clerk API

2. **Officer (User) → Case**
   - Officers are assigned to cases through the `assignedOfficer` field
   - Officers can update case status and resolve cases
   - Direct MongoDB reference relationship using ObjectId

## Data Flow

1. **Case Creation**
   - User reports a lost/found item or requests verification
   - Case is created with status "pending"

2. **Case Assignment**
   - Officer is assigned to the case
   - Case status changes to "active"

3. **Case Resolution**
   - Officer resolves the case
   - Case status changes to "resolved" or "closed"
   - Resolution details are added to the case

## Implementation Notes

1. **Indexing Strategy**
   - The Case model has appropriate indexes for common query patterns
   - Compound indexes are used for frequently filtered fields

2. **Validation**
   - Schema-level validation ensures data integrity
   - Custom validators enforce business rules (e.g., images required for found items)

3. **Performance Considerations**
   - Geospatial indexing for location-based queries
   - Selective population of references to avoid large documents