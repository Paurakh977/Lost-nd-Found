import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/mongodb';
import Notification from '../../../../../../models/Notification';
import { getJWTFromRequest, verifyJWT } from '../../../../../../lib/jwt';
import { isOfficer } from '../../../../../../lib/query-utils';
import mongoose from 'mongoose';

/**
 * PATCH /api/officer/notifications/[id]/mark-read
 * 
 * Marks a single notification as read for the authenticated officer
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Await params as required in Next.js 15
    const { id } = await params;

    // Validate notification ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid notification ID' },
        { status: 400 }
      );
    }

    // Update notification - only if it belongs to this officer
    const notification = await Notification.findOneAndUpdate(
      {
        _id: id,
        officerId: payload.userId
      },
      {
        $set: { read: true, updatedAt: new Date() }
      },
      { new: true }
    ).lean();

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found or access denied' },
        { status: 404 }
      );
    }

    // Get updated unread count
    const unreadCount = await Notification.countDocuments({
      officerId: payload.userId,
      read: false
    });

    console.log(`[Notifications] Marked notification ${id} as read for officer ${payload.userId}`);

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
      notification,
      unreadCount
    });

  } catch (error) {
    console.error('[Notifications] Error marking as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
