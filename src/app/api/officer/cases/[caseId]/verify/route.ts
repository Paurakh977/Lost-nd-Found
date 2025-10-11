import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/mongodb';
import Case from '../../../../../../models/Case';
import User from '../../../../../../models/User';
import { getJWTFromRequest, verifyJWT } from '../../../../../../lib/jwt';
import { isOfficer } from '../../../../../../lib/query-utils';

/**
 * POST /api/officer/cases/[caseId]/verify
 * Body: { 
 *   outcome: string, 
 *   notes?: string, 
 *   isVerified: boolean,
 *   assignType?: 'itemAssignedTo' | 'foundBy', 
 *   assignee?: { clerkId?: string, name: string, contactInfo?: string } 
 * }
 * Only the currently assigned officer can verify. Sets status='resolved' and updates resolution.
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
    const { outcome, notes, isVerified, assignType, assignee } = body || {};

    if (!outcome || typeof outcome !== 'string' || outcome.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Outcome is required' }, { status: 400 });
    }

    if (typeof isVerified !== 'boolean') {
      return NextResponse.json({ success: false, error: 'isVerified must be a boolean' }, { status: 400 });
    }

    // Find case and ensure this officer is assigned and it's a verification case
    const current: any = await Case.findOne({ _id: caseId }).lean();
    if (!current) return NextResponse.json({ success: false, error: 'Case not found' }, { status: 404 });

    if (!current.assignedOfficer || String(current.assignedOfficer) !== String(payload.userId)) {
      return NextResponse.json({ success: false, error: 'You are not assigned to this case' }, { status: 403 });
    }

    if (current.type !== 'verification') {
      return NextResponse.json({ success: false, error: 'This case is not a verification case' }, { status: 400 });
    }

    if (current.status === 'resolved') {
      return NextResponse.json({ success: false, error: 'Case is already resolved' }, { status: 400 });
    }

    // Build resolution object
    const resolution: any = {
      resolvedAt: new Date(),
      resolvedBy: payload.userId,
      outcome: outcome.trim(),
      notes: notes?.trim() || undefined,
      isVerified
    };

    // Add assignment info if provided
    if (assignType && assignee && assignee.name) {
      resolution[assignType] = {
        clerkId: assignee.clerkId || undefined,
        name: assignee.name.trim(),
        contactInfo: assignee.contactInfo?.trim() || undefined
      };
    }

    // Update case
    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      {
        $set: {
          status: 'resolved',
          resolution,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    )
      .populate('assignedOfficer', 'firstName lastName email')
      .populate('resolution.resolvedBy', 'firstName lastName email')
      .lean();

    console.log(`[Verify Case] Case ${caseId} verified by officer ${officerUser.email}, verified: ${isVerified}`);

    return NextResponse.json({
      success: true,
      message: `Case ${isVerified ? 'verified' : 'rejected'} successfully`,
      case: updatedCase,
    });
  } catch (error) {
    console.error('[Verify Case] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to verify case' }, { status: 500 });
  }
}
