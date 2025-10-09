import { FilterQuery } from 'mongoose';
import { ICase } from '../models/Case';

/**
 * Build MongoDB query filters from request parameters
 */
export function buildCaseQueryFilters(searchParams: URLSearchParams): FilterQuery<ICase> {
  const query: FilterQuery<ICase> = {};
  
  // Type filter
  const type = searchParams.get('type');
  if (type && type !== 'all' && ['lost', 'found', 'verification'].includes(type)) {
    query.type = type;
  }
  
  // Status filter
  const status = searchParams.get('status');
  if (status && status !== 'all' && ['pending', 'active', 'resolved'].includes(status)) {
    query.status = status;
  }
  
  // Urgency level filter
  const urgencyLevel = searchParams.get('urgencyLevel');
  if (urgencyLevel && urgencyLevel !== 'all' && ['low', 'medium', 'high'].includes(urgencyLevel)) {
    query.urgencyLevel = urgencyLevel;
  }
  
  // Search filter (search across multiple fields)
  const search = searchParams.get('search');
  if (search && search.trim()) {
    const searchRegex = { $regex: search.trim(), $options: 'i' };
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { 'location.address': searchRegex },
      { 'itemDetails.detailedDescription': searchRegex },
      { 'itemDetails.brand': searchRegex },
      { 'itemDetails.model': searchRegex },
      { 'itemDetails.category': searchRegex },
      { 'reportedBy.name': searchRegex },
    ];
  }
  
  return query;
}

/**
 * Get pagination parameters from request
 */
export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

/**
 * Get sort parameters from request
 */
export function getSortParams(searchParams: URLSearchParams) {
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  
  // Validate sortBy field
  const validSortFields = ['createdAt', 'updatedAt', 'reportedTime', 'urgencyLevel', 'status'];
  const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  
  // Build sort object
  const sort: Record<string, 1 | -1> = {};
  sort[field] = sortOrder === 'asc' ? 1 : -1;
  
  // Secondary sort by createdAt if primary sort is not createdAt
  if (field !== 'createdAt') {
    sort.createdAt = -1;
  }
  
  return sort;
}

/**
 * Build pagination metadata
 */
export function buildPaginationMeta(page: number, limit: number, total: number) {
  const pages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    pages,
    hasNextPage: page < pages,
    hasPrevPage: page > 1,
  };
}

/**
 * Validate that user is an authenticated officer
 */
export function isOfficer(role?: string): boolean {
  return role === 'officer';
}

/**
 * Validate that user is an officer or admin
 */
export function isOfficerOrAdmin(role?: string): boolean {
  return role === 'officer' || role === 'admin';
}
