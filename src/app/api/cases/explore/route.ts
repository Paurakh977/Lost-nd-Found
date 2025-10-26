import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Case from '../../../../models/Case';

/**
 * GET /api/cases/explore
 * 
 * Fetches all cases except resolved ones with filters and pagination
 * Query params:
 * - page: page number (default: 1)
 * - limit: items per page (default: 12)
 * - status: filter by status (active, pending, verification)
 * - type: filter by type (lost, found)
 * - startDate: filter by date range start
 * - endDate: filter by date range end
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status'); // active, pending, verification
    const type = searchParams.get('type'); // lost, found
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query - exclude resolved cases
    const query: any = {
      status: { $ne: 'resolved' }
    };

    // Status filter
    if (status) {
      if (status === 'verification') {
        query.type = 'verification';
      } else {
        query.status = status;
      }
    }

    // Type filter (lost or found)
    if (type && type !== 'verification') {
      query.type = type;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Fetch cases with pagination
    const [cases, totalCount] = await Promise.all([
      Case.find(query)
        .populate('assignedOfficer', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Case.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      cases,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasMore: page < totalPages
      }
    });

  } catch (error) {
    console.error('[Explore Cases] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cases' },
      { status: 500 }
    );
  }
}
