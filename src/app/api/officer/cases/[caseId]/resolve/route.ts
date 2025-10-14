import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/mongodb';
import Case from '../../../../../../models/Case';
import User from '../../../../../../models/User';
import { getJWTFromRequest, verifyJWT } from '../../../../../../lib/jwt';
import { isOfficer } from '../../../../../../lib/query-utils';

/**
 * POST /api/officer/cases/[caseId]/resolve
 * Body: { outcome: string, notes?: string, assignType?: 'itemAssignedTo' | 'foundBy', assignee?: { clerkId?: string, name: string, contactInfo?: string } }
 * Only the currently assigned officer can resolve. Sets status='resolved'.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    await connectDB();

    const token = getJWTFromRequest(request);
    if (!token) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || !isOfficer(payload.role)) return NextResponse.json({ success: false, error: 'Officer access required' }, { status: 403 });

    const officerUser = await User.findById(payload.userId);
    if (!officerUser || !officerUser.isActive) return NextResponse.json({ success: false, error: 'Officer account is inactive' }, { status: 403 });

    // Await params as required in Next.js 15
    const { caseId } = await params;
    const body = await request.json();
    const { outcome, notes, assignType, assignee } = body || {};

    if (!outcome || typeof outcome !== 'string' || outcome.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Outcome is required' }, { status: 400 });
    }

    // Find case and ensure this officer is assigned
    const current: any = await Case.findOne({ _id: caseId }).lean();
    if (!current) return NextResponse.json({ success: false, error: 'Case not found' }, { status: 404 });

    if (!current.assignedOfficer || String(current.assignedOfficer) !== String(payload.userId)) {
      return NextResponse.json({ success: false, error: 'You are not assigned to this case' }, { status: 403 });
    }

    const resolution: any = {
      resolvedAt: new Date(),
      resolvedBy: payload.userId,
      outcome,
    };
    if (notes) resolution.notes = notes;
    if (assignType && assignee && assignee.name) {
      if (assignType === 'itemAssignedTo') {
        resolution.itemAssignedTo = {
          clerkId: assignee.clerkId,
          name: assignee.name,
          contactInfo: assignee.contactInfo,
        };
      } else if (assignType === 'foundBy') {
        resolution.foundBy = {
          clerkId: assignee.clerkId,
          name: assignee.name,
          contactInfo: assignee.contactInfo,
        };
      }
    }

    const updated = await Case.findOneAndUpdate(
      { _id: caseId, assignedOfficer: payload.userId },
      { $set: { status: 'resolved', resolution } },
      { new: true }
    ).populate('assignedOfficer', 'firstName lastName email');

    if (!updated) return NextResponse.json({ success: false, error: 'Failed to resolve case' }, { status: 500 });

    return NextResponse.json({ success: true, case: updated });
  } catch (error) {
    console.error('[Resolve Case] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to resolve case' }, { status: 500 });
  }
}


