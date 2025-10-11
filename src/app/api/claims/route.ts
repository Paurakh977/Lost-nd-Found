import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Claim from '../../../models/Claim';
import Case from '../../../models/Case';
import mongoose from 'mongoose';

/**
 * POST /api/claims
 * 
 * Create a new claim for a case
 * 
 * Body: {
 *   caseId: string,
 *   claimantInfo: { name, email, phone?, address? },
 *   evidence: { description, images? },
 *   officerId?: string  // Optional, for assigning/reassigning officer
 * }
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { caseId, claimantInfo, evidence, officerId, clerkUserId } = body || {};

    // Validate caseId
    if (!caseId || !mongoose.Types.ObjectId.isValid(caseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid case ID' },
        { status: 400 }
      );
    }

    // Validate claimant info
    if (!claimantInfo || !claimantInfo.name || !claimantInfo.email) {
      return NextResponse.json(
        { success: false, error: 'Claimant name and email are required' },
        { status: 400 }
      );
    }

    // Validate evidence
    if (!evidence || !evidence.description || evidence.description.trim().length < 20) {
      return NextResponse.json(
        { success: false, error: 'Evidence description is required and must be at least 20 characters' },
        { status: 400 }
      );
    }

    // Check if case exists
    const caseItem = await Case.findById(caseId);
    if (!caseItem) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    // Check if case is resolved
    if (caseItem.status === 'resolved') {
      return NextResponse.json(
        { success: false, error: 'Cannot claim a resolved case' },
        { status: 400 }
      );
    }

    // Only allow claims for 'lost' or 'verification' type cases
    if (caseItem.type === 'found') {
      return NextResponse.json(
        { success: false, error: 'Cannot claim a found item case. Please contact the reporter directly.' },
        { status: 400 }
      );
    }

    // Check if this email or clerkUserId has already claimed this case
    const duplicateQuery: any = {
      caseId: new mongoose.Types.ObjectId(caseId),
      $or: [
        { 'claimantInfo.email': claimantInfo.email.trim().toLowerCase() }
      ]
    };
    
    // Also check by clerkUserId if provided
    if (clerkUserId) {
      duplicateQuery.$or.push({ clerkUserId: clerkUserId });
    }

    const existingClaim = await Claim.findOne(duplicateQuery);

    if (existingClaim) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'You have already submitted a claim for this item',
          existingClaimId: existingClaim._id,
          existingClaimStatus: existingClaim.status
        },
        { status: 409 }
      );
    }

    // Create the claim
    const claim = new Claim({
      caseId: new mongoose.Types.ObjectId(caseId),
      clerkUserId: clerkUserId || undefined,
      claimantInfo: {
        name: claimantInfo.name.trim(),
        email: claimantInfo.email.trim().toLowerCase(),
        phone: claimantInfo.phone?.trim() || undefined,
        address: {
          province: claimantInfo.address?.province || undefined,
          district: claimantInfo.address?.district || undefined,
          municipality: claimantInfo.address?.municipality || undefined,
          ward: claimantInfo.address?.ward || undefined,
          fullAddress: claimantInfo.address?.fullAddress || undefined
        }
      },
      evidence: {
        description: evidence.description.trim(),
        images: evidence.images || []
      },
      status: 'pending'
    });

    await claim.save();

    // Update case type to 'verification' if it's the first claim (type is still 'lost')
    // Also assign officer if provided and case is pending
    const updateData: any = {};
    
    if (caseItem.type === 'lost') {
      updateData.type = 'verification';
    }

    if (caseItem.status === 'pending' && officerId && mongoose.Types.ObjectId.isValid(officerId)) {
      updateData.status = 'active';
      updateData.assignedOfficer = new mongoose.Types.ObjectId(officerId);
    }

    if (Object.keys(updateData).length > 0) {
      await Case.findByIdAndUpdate(caseId, {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      });
    }

    console.log(`[Claims API] New claim created: ${claim._id} for case ${caseId} by ${claimantInfo.email}`);

    return NextResponse.json({
      success: true,
      message: 'Claim submitted successfully',
      claim: {
        id: claim._id,
        caseId: claim.caseId,
        status: claim.status,
        createdAt: claim.createdAt
      }
    });

  } catch (error) {
    console.error('[Claims API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit claim' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/claims?email=xxx&caseId=xxx
 * 
 * Check if a user has already claimed a specific case
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const caseId = searchParams.get('caseId');
    const clerkUserId = searchParams.get('clerkUserId');

    if ((!email && !clerkUserId) || !caseId) {
      return NextResponse.json(
        { success: false, error: 'Email or clerkUserId and caseId are required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid case ID' },
        { status: 400 }
      );
    }

    // Build query to check by email OR clerkUserId
    const query: any = {
      caseId: new mongoose.Types.ObjectId(caseId),
      $or: []
    };
    
    if (email) {
      query.$or.push({ 'claimantInfo.email': email.trim().toLowerCase() });
    }
    
    if (clerkUserId) {
      query.$or.push({ clerkUserId: clerkUserId });
    }

    const claim = await Claim.findOne(query).select('_id status createdAt');

    if (!claim) {
      return NextResponse.json({
        success: true,
        hasClaimed: false
      });
    }

    return NextResponse.json({
      success: true,
      hasClaimed: true,
      claim: {
        id: claim._id,
        status: claim.status,
        submittedAt: claim.createdAt
      }
    });

  } catch (error) {
    console.error('[Claims API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check claim status' },
      { status: 500 }
    );
  }
}
