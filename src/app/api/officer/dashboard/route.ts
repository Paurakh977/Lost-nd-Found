import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Case from '../../../../models/Case';
import User from '../../../../models/User';
import { getJWTFromRequest, verifyJWT } from '../../../../lib/jwt';
import { isOfficer } from '../../../../lib/query-utils';

/**
 * GET /api/officer/dashboard
 * 
 * Returns dashboard statistics for the authenticated officer
 * Includes:
 * - Total cases assigned to officer
 * - Active cases count
 * - Resolved cases count
 * - Pending verifications count
 * - Lost reports count
 * - Found reports count
 * - Today's reports count
 * - Weekly growth percentage
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
    
    // Verify officer user is still active
    const officerUser = await User.findById(payload.userId).select('-password');
    if (!officerUser || !officerUser.isActive) {
      return NextResponse.json(
        { success: false, error: 'Officer account is inactive' },
        { status: 403 }
      );
    }
    
    // Get all cases assigned to this officer
    const officerCases = await Case.find({ assignedOfficer: payload.userId }).lean();
    
    // Calculate statistics
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgoStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgoStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const stats = {
      totalCases: officerCases.length,
      activeCases: officerCases.filter((c: any) => c.status === 'active').length,
      resolvedCases: officerCases.filter((c: any) => c.status === 'resolved').length,
      pendingVerifications: officerCases.filter((c: any) => c.type === 'verification' && c.status !== 'resolved').length,
      lostReports: officerCases.filter((c: any) => c.type === 'lost').length,
      foundReports: officerCases.filter((c: any) => c.type === 'found').length,
      todayReports: officerCases.filter((c: any) => {
        const createdAt = new Date(c.createdAt);
        return createdAt >= todayStart;
      }).length,
      weeklyGrowth: 0, // Will calculate below
    };
    
    // Calculate weekly growth (cases this week vs last week)
    const thisWeekCases = officerCases.filter((c: any) => {
      const createdAt = new Date(c.createdAt);
      return createdAt >= weekAgoStart;
    }).length;
    
    const lastWeekCases = officerCases.filter((c: any) => {
      const createdAt = new Date(c.createdAt);
      return createdAt >= twoWeeksAgoStart && createdAt < weekAgoStart;
    }).length;
    
    if (lastWeekCases > 0) {
      stats.weeklyGrowth = Math.round(((thisWeekCases - lastWeekCases) / lastWeekCases) * 100);
    } else if (thisWeekCases > 0) {
      stats.weeklyGrowth = 100; // If no cases last week but some this week, 100% growth
    }
    
    // Build officer info
    const officer = {
      id: officerUser._id.toString(),
      firstName: officerUser.firstName,
      lastName: officerUser.lastName,
      email: officerUser.email,
      department: officerUser.department,
      role: 'officer' as const,
    };
    
    console.log(`[Officer Dashboard] Stats generated for ${officer.email}:`, stats);
    
    return NextResponse.json({
      success: true,
      officer,
      stats,
    });
    
  } catch (error) {
    console.error('[Officer Dashboard] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
