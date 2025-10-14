import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Claim from '../../../../../models/Claim';
import mongoose from 'mongoose';

/**
 * GET /api/cases/[caseId]/claims
 * 
 * Fetch all claims for a specific case
 * This is typically used by officers to review all claimants
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    await connectDB();

    const { caseId } = await params;

    // Validate caseId
    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid case ID' },
        { status: 400 }
      );
    }

    // Fetch all claims for this case, sorted by creation date
    const claims = await Claim.find({
      caseId: new mongoose.Types.ObjectId(caseId)
    })
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`[Claims API] Fetched ${claims.length} claims for case ${caseId}`);

    return NextResponse.json({
      success: true,
      claims: claims.map(claim => ({
        id: claim._id,
        caseId: claim.caseId,
        claimantInfo: claim.claimantInfo,
        evidence: claim.evidence,
        status: claim.status,
        reviewedBy: claim.reviewedBy,
        reviewedAt: claim.reviewedAt,
        reviewNotes: claim.reviewNotes,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt
      })),
      count: claims.length
    });

  } catch (error) {
    console.error('[Claims API] Error fetching claims:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}
