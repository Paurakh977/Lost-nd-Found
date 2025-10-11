import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/mongodb';
import Case from '../../../../../../models/Case';
import User from '../../../../../../models/User';
import { getJWTFromRequest, verifyJWT } from '../../../../../../lib/jwt';
import {
  isOfficer,
  buildCaseQueryFilters,
  getPaginationParams,
  getSortParams,
  buildPaginationMeta,
} from '../../../../../../lib/query-utils';

/**
 * GET /api/officer/cases/my/verification
 * Returns verification cases assigned to the authenticated officer
 * Supports server-side search, pagination, and sorting
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = getJWTFromRequest(request);
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || !isOfficer(payload.role)) {
      return NextResponse.json({ success: false, error: 'Officer access required' }, { status: 403 });
    }

    const officerUser = await User.findById(payload.userId);
    if (!officerUser || !officerUser.isActive) {
      return NextResponse.json({ success: false, error: 'Officer account is inactive' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const baseFilters: any = buildCaseQueryFilters(searchParams);

    // Constrain to this officer and verification type
    const assignedFilter = { 
      assignedOfficer: payload.userId, 
      type: 'verification' 
    };

    let query: any = { ...baseFilters, ...assignedFilter };

    // If baseFilters has $or (search), combine with assignedFilter using $and
    if (baseFilters.$or) {
      const searchOr = baseFilters.$or;
      delete baseFilters.$or;
      query = {
        ...baseFilters,
        $and: [
          { $or: searchOr },
          assignedFilter,
        ],
      };
    }

    const { page, limit, skip } = getPaginationParams(searchParams);
    const sort = getSortParams(searchParams);

    // Execute query
    const [cases, total] = await Promise.all([
      Case.find(query)
        .populate('assignedOfficer', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Case.countDocuments(query)
    ]);

    const pagination = buildPaginationMeta(page, limit, total);

    return NextResponse.json({
      success: true,
      cases,
      pagination,
    });
  } catch (error) {
    console.error('[My Verification Cases] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch verification cases' }, { status: 500 });
  }
}
