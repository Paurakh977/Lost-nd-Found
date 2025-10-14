import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getJWTFromRequest, verifyJWT } from '../../../../lib/jwt';
import connectDB from '../../../../lib/mongodb';
import Claim from '../../../../models/Claim';
import User from '../../../../models/User';

/**
 * GET /api/claims/user-claims
 * 
 * Fetch all claims submitted by the authenticated user
 * Supports both Clerk and JWT authentication
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Resolve identity from JWT or Clerk
    let userId: string | undefined;
    let userEmail: string | undefined;
    let userType: 'clerk' | 'jwt' = 'clerk';

    // Step 1: Check for JWT token first
    const token = getJWTFromRequest(req);
    if (token) {
      console.log('[user-claims] JWT token found, verifying...');
      const payload = await verifyJWT(token);
      if (payload) {
        userId = payload.userId;
        userEmail = payload.email;
        userType = 'jwt';
        console.log('[user-claims] JWT verified:', { userId, userEmail });
        
        // Fetch full user data from database for JWT users
        try {
          const user = await User.findById(payload.userId).select('email');
          if (user && user.isActive) {
            userEmail = user.email;
          }
        } catch (error) {
          console.error('[user-claims] Error fetching JWT user from DB:', error);
        }
      } else {
        console.log('[user-claims] JWT token invalid or expired');
      }
    } else {
      console.log('[user-claims] No JWT token found');
    }

    // Step 2: Fallback to Clerk session (only if JWT check failed)
    if (!userId) {
      console.log('[user-claims] Falling back to Clerk authentication...');
      try {
        const { userId: clerkUserId } = await auth();
        if (clerkUserId) {
          console.log('[user-claims] Clerk userId found:', clerkUserId);
          const user = await currentUser();
          userId = user?.id;
          userEmail = user?.emailAddresses[0]?.emailAddress || '';
          userType = 'clerk';
          console.log('[user-claims] Clerk user authenticated:', { userId, userEmail });
        } else {
          console.log('[user-claims] No Clerk userId found');
        }
      } catch (clerkError) {
        console.error('[user-claims] Clerk authentication error:', clerkError);
      }
    }

    // Step 3: Check if we have a valid user
    if (!userId && !userEmail) {
      console.error('[user-claims] Authentication failed - no valid user found');
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized - No valid authentication found' 
      }, { status: 401 });
    }

    // Step 4: Build query to fetch claims by clerkUserId or email
    const query: any = {
      $or: []
    };

    if (userId) {
      query.$or.push({ clerkUserId: userId });
    }

    if (userEmail) {
      query.$or.push({ 'claimantInfo.email': userEmail.toLowerCase() });
    }

    // If no valid query conditions, return empty
    if (query.$or.length === 0) {
      return NextResponse.json({
        success: true,
        claims: [],
        stats: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0
        }
      });
    }

    // Step 5: Fetch claims and populate case information
    const claims = await Claim.find(query)
      .populate({
        path: 'caseId',
        select: 'title type status images location createdAt'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Step 6: Calculate statistics
    const stats = claims.reduce(
      (acc, claim: any) => {
        acc.total++;
        if (claim.status === 'pending') acc.pending++;
        if (claim.status === 'approved') acc.approved++;
        if (claim.status === 'rejected') acc.rejected++;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0 }
    );

    console.log(`[user-claims] Fetched ${claims.length} claims for user ${userId || userEmail}`);

    return NextResponse.json({
      success: true,
      claims,
      stats,
      userType
    });

  } catch (error) {
    console.error('[user-claims] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch user claims' 
      },
      { status: 500 }
    );
  }
}
