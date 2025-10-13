import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Case from '../../../../models/Case';

/**
 * GET /api/cases/[caseId]
 * Returns a single case by id for public viewing (no authentication required)
 * Used for email links and public case viewing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    await connectDB();

    const { caseId } = await params;
    
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(caseId)) {
      return NextResponse.json({ success: false, error: 'Invalid case ID format' }, { status: 400 });
    }

    const caseDoc = await Case.findById(caseId)
      .populate('assignedOfficer', 'firstName lastName email')
      .lean();

    if (!caseDoc) {
      return NextResponse.json({ success: false, error: 'Case not found' }, { status: 404 });
    }
    
    // Manually populate resolvedBy since nested populate doesn't work with lean()
    if (caseDoc.resolution && caseDoc.resolution.resolvedBy) {
      try {
        const User = (await import('../../../../models/User')).default;
        const resolvedByOfficer = await User.findById(caseDoc.resolution.resolvedBy)
          .select('firstName lastName email')
          .lean();
        if (resolvedByOfficer) {
          caseDoc.resolution.resolvedBy = resolvedByOfficer as any;
        }
      } catch (err) {
        console.error('[Public Case Detail] Error populating resolvedBy:', err);
      }
    }

    return NextResponse.json({ success: true, case: caseDoc });
  } catch (error) {
    console.error('[Public Case Detail] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch case' }, { status: 500 });
  }
}
