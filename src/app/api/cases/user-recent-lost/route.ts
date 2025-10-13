import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Case from '../../../../models/Case';
import mongoose from 'mongoose';

/**
 * GET /api/cases/user-recent-lost?userId=xxx
 * 
 * Fetches the most recent LOST or VERIFICATION case created by the user that is not resolved
 * Used to link FOUND cases back to the user's lost item when claiming from search results
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    console.log('[user-recent-lost] Fetching most recent lost case for user:', userId);

    // Find the most recent LOST or VERIFICATION case by this user that is not resolved
    const recentLostCase = await Case.findOne({
      'reportedBy.clerkId': userId,
      type: { $in: ['lost', 'verification'] },
      status: { $ne: 'resolved' }
    })
      .sort({ createdAt: -1 })
      .select('_id title type status createdAt')
      .lean();

    if (!recentLostCase) {
      console.log('[user-recent-lost] No unresolved lost/verification case found for user');
      return NextResponse.json({
        success: true,
        caseId: null,
        message: 'No recent unresolved lost case found'
      });
    }

    console.log('[user-recent-lost] Found case:', {
      caseId: recentLostCase._id,
      title: recentLostCase.title,
      type: recentLostCase.type,
      status: recentLostCase.status
    });

    return NextResponse.json({
      success: true,
      caseId: String(recentLostCase._id),
      caseTitle: recentLostCase.title,
      caseType: recentLostCase.type,
      caseStatus: recentLostCase.status,
      createdAt: recentLostCase.createdAt
    });

  } catch (error) {
    console.error('[user-recent-lost] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recent lost case' },
      { status: 500 }
    );
  }
}
