import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Notification from '../../../../../models/Notification';
import { getJWTFromRequest, verifyJWT } from '../../../../../lib/jwt';
import { isOfficer } from '../../../../../lib/query-utils';

/**
 * PATCH /api/officer/notifications/mark-all-read
 * 
 * Marks all unread notifications as read for the authenticated officer
 */
export async function PATCH(request: NextRequest) {
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

    // Update all unread notifications for this officer
    const result = await Notification.updateMany(
      {
        officerId: payload.userId,
        read: false
      },
      {
        $set: { read: true, updatedAt: new Date() }
      }
    );

    console.log(`[Notifications] Marked ${result.modifiedCount} notifications as read for officer ${payload.userId}`);

    return NextResponse.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      count: result.modifiedCount,
      unreadCount: 0
    });

  } catch (error) {
    console.error('[Notifications] Error marking all as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}
