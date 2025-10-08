import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getJWTFromRequest, verifyJWT } from '../../../../lib/jwt';
import connectDB from '../../../../lib/mongodb';
import Case from '../../../../models/Case';
import User from '../../../../models/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Resolve identity from custom JWT first (admins/officers/institutional)
    let userId: string | undefined;
    let userName: string | undefined;
    let userEmail: string | undefined;
    let userRole: string | undefined;
    let userType: 'clerk' | 'jwt' = 'clerk';

    // Step 1: Check for JWT token (our own server, no rate limits)
    const token = getJWTFromRequest(req);
    if (token) {
      console.log('[user-cases] JWT token found, verifying...');
      const payload = await verifyJWT(token);
      if (payload) {
        userId = payload.userId;
        userName = `${payload.firstName} ${payload.lastName}`.trim();
        userEmail = payload.email;
        userRole = payload.role;
        userType = 'jwt';
        console.log('[user-cases] JWT verified:', { userId, userRole });
        
        // Fetch full user data from database for JWT users
        try {
          const user = await User.findById(payload.userId).select('-password');
          if (user && user.isActive) {
            userName = `${user.firstName} ${user.lastName}`.trim() || user.email;
            userEmail = user.email;
            userRole = user.role;
          }
        } catch (error) {
          console.error('[user-cases] Error fetching JWT user from DB:', error);
        }
      } else {
        console.log('[user-cases] JWT token invalid or expired');
      }
    } else {
      console.log('[user-cases] No JWT token found');
    }

    // Step 2: Fallback to Clerk session (only if JWT check failed)
    if (!userId) {
      console.log('[user-cases] Falling back to Clerk authentication...');
      try {
        const { userId: clerkUserId } = await auth();
        if (clerkUserId) {
          console.log('[user-cases] Clerk userId found:', clerkUserId);
          const user = await currentUser();
          userId = user?.id;
          userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'User';
          userEmail = user?.emailAddresses[0]?.emailAddress || '';
          userType = 'clerk';
          console.log('[user-cases] Clerk user authenticated:', { userId, userName, userEmail });
        } else {
          console.log('[user-cases] No Clerk userId found');
        }
      } catch (clerkError) {
        console.error('[user-cases] Clerk authentication error:', clerkError);
      }
    }

    // Step 3: Check if we have a valid user
    if (!userId) {
      console.error('[user-cases] Authentication failed - no valid user found');
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - No valid authentication found' 
      }, { status: 401 });
    }

    // Check if requesting another user's profile (optional userId query param)
    const targetUserId = req.nextUrl.searchParams.get('userId') || userId;

    // Fetch cases for the user
    const cases = await Case.find({ 'reportedBy.clerkId': targetUserId })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate statistics
    const stats = cases.reduce(
      (acc, caseItem: any) => {
        acc.total++;
        if (caseItem.status === 'pending') acc.pending++;
        if (caseItem.status === 'active') acc.active++;
        if (caseItem.status === 'resolved') acc.resolved++;
        if (caseItem.type === 'lost') acc.lost++;
        if (caseItem.type === 'found') acc.found++;
        return acc;
      },
      { total: 0, pending: 0, active: 0, resolved: 0, lost: 0, found: 0 }
    );

    console.log(`[user-cases] Fetched ${cases.length} cases for user ${targetUserId}`);

    return NextResponse.json({
      success: true,
      cases,
      stats,
      user: {
        id: userId,
        name: userName,
        email: userEmail,
        role: userRole,
        type: userType,
      },
    });
  } catch (error) {
    console.error('[user-cases] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch user cases' 
      },
      { status: 500 }
    );
  }
}
