import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Case from '../../../../models/Case';
import User from '../../../../models/User';
import { getJWTFromRequest, verifyJWT } from '../../../../lib/jwt';
import { 
  isOfficer, 
  buildCaseQueryFilters, 
  getPaginationParams, 
  getSortParams,
  buildPaginationMeta 
} from '../../../../lib/query-utils';

/**
 * GET /api/officer/unassigned-cases
 * 
 * Returns unassigned cases (assignedOfficer = null/undefined)
 * Supports:
 * - Filtering by type, status, urgencyLevel
 * - Server-side search across multiple fields
 * - Pagination
 * - Sorting
 * 
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 * - type: 'all' | 'lost' | 'found' | 'verification'
 * - status: 'all' | 'pending' | 'active' | 'resolved'
 * - urgencyLevel: 'all' | 'low' | 'medium' | 'high'
 * - search: string (searches across title, description, location, item details, reporter name)
 * - sortBy: 'createdAt' | 'urgencyLevel' | 'reportedTime' (default: 'createdAt')
 * - sortOrder: 'asc' | 'desc' (default: 'desc')
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate and verify officer role
    const token = getJWTFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const payload = await verifyJWT(token);
    if (!payload || !isOfficer(payload.role)) {
      return NextResponse.json(
        { success: false, error: 'Officer access required' },
        { status: 403 }
      );
    }
    
    // Verify officer user is still active
    const officerUser = await User.findById(payload.userId);
    if (!officerUser || !officerUser.isActive) {
      return NextResponse.json(
        { success: false, error: 'Officer account is inactive' },
        { status: 403 }
      );
    }
    
    // Build query
    const { searchParams } = new URL(request.url);
    const baseFilters = buildCaseQueryFilters(searchParams);
    
    // Add unassigned filter (assignedOfficer is null or undefined)
    const query = {
      ...baseFilters,
      $or: [
        { assignedOfficer: null },
        { assignedOfficer: { $exists: false } }
      ]
    };
    
    // Merge $or conditions if search is also present
    if (baseFilters.$or) {
      // Need to combine both $or conditions using $and
      const searchOr = baseFilters.$or;
      delete baseFilters.$or;
      query.$and = [
        { $or: searchOr },
        { 
          $or: [
            { assignedOfficer: null },
            { assignedOfficer: { $exists: false } }
          ]
        }
      ];
      delete query.$or;
    }
    
    // Get pagination and sort params
    const { page, limit, skip } = getPaginationParams(searchParams);
    const sort = getSortParams(searchParams);
    
    // Execute query
    const [cases, total] = await Promise.all([
      Case.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('assignedOfficer', 'firstName lastName email')
        .lean(),
      Case.countDocuments(query)
    ]);
    
    // Build pagination metadata
    const pagination = buildPaginationMeta(page, limit, total);
    
    console.log(`[Unassigned Cases] Found ${total} unassigned cases, returning page ${page} (${cases.length} items)`);
    
    return NextResponse.json({
      success: true,
      cases,
      pagination,
    });
    
  } catch (error) {
    console.error('[Unassigned Cases] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch unassigned cases' },
      { status: 500 }
    );
  }
}
