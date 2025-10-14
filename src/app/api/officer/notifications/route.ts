import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Notification from '../../../../models/Notification';
import Case from '../../../../models/Case';
import { getJWTFromRequest, verifyJWT } from '../../../../lib/jwt';
import { isOfficer } from '../../../../lib/query-utils';

/**
 * GET /api/officer/notifications
 * 
 * Fetches notifications for the authenticated officer
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 50)
 * - unreadOnly: boolean (default: false)
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

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { officerId: payload.userId };
    if (unreadOnly) {
      query.read = false;
    }

    // Fetch notifications with pagination
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ officerId: payload.userId, read: false })
    ]);

    // Populate case details for each notification
    const notificationsWithDetails = await Promise.all(
      notifications.map(async (notification: any) => {
        if (notification.caseId) {
          try {
            const caseData = await Case.findById(notification.caseId)
              .select('title type status')
              .lean();
            
            return {
              ...notification,
              case: caseData ? {
                _id: caseData._id,
                title: caseData.title,
                type: caseData.type,
                status: caseData.status
              } : null
            };
          } catch (err) {
            console.error('[Notifications] Error populating case:', err);
            return notification;
          }
        }
        return notification;
      })
    );

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    };

    return NextResponse.json({
      success: true,
      notifications: notificationsWithDetails,
      unreadCount,
      pagination
    });

  } catch (error) {
    console.error('[Notifications] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
