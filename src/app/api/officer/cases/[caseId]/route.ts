import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Case from '../../../../../models/Case';
import User from '../../../../../models/User';
import { getJWTFromRequest, verifyJWT } from '../../../../../lib/jwt';
import { isOfficer } from '../../../../../lib/query-utils';

/**
 * GET /api/officer/cases/[caseId]
 * Returns a single case by id with populated assignedOfficer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
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

    const { caseId } = params;
    const caseDoc = await Case.findById(caseId)
      .populate('assignedOfficer', 'firstName lastName email')
      .lean();

    if (!caseDoc) {
      return NextResponse.json({ success: false, error: 'Case not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, case: caseDoc });
  } catch (error) {
    console.error('[Case Detail] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch case' }, { status: 500 });
  }
}


