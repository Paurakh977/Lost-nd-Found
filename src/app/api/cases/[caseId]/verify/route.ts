import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Case from '../../../../../models/Case';
import Claim from '../../../../../models/Claim';
import User from '../../../../../models/User';
import mongoose from 'mongoose';

/**
 * POST /api/cases/[caseId]/verify
 * 
 * Handles verification requests for cases (creates a claim in the Claims collection):
 * - Creates a new Claim document with claimant info and evidence
 * - If first claim for a 'lost' case, changes type to 'verification'
 * - If case is pending, assigns to selected officer and makes it active
 * 
 * Body: { 
 *   officerId: string,
 *   claimEvidence: { description, images?, claimantInfo: { name, email, phone?, address? } }
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    await connectDB();

    const { caseId } = await params;
    const body = await request.json();
    const { officerId, claimEvidence, clerkUserId, relatedFoundCaseId } = body || {};

    console.log('[Verify Case] Request received:', {
      caseId,
      hasOfficerId: !!officerId,
      hasClaimEvidence: !!claimEvidence,
      clerkUserId: clerkUserId || 'MISSING',
      relatedFoundCaseId: relatedFoundCaseId || 'none',
      claimantEmail: claimEvidence?.claimantInfo?.email
    });
    
    console.log('[Verify Case] 🔍 CRITICAL - relatedFoundCaseId check:', {
      received: relatedFoundCaseId,
      isValid: relatedFoundCaseId && mongoose.Types.ObjectId.isValid(relatedFoundCaseId),
      willBeLinked: !!(relatedFoundCaseId && mongoose.Types.ObjectId.isValid(relatedFoundCaseId))
    });

    // Validate clerkUserId (REQUIRED)
    if (!clerkUserId || typeof clerkUserId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'User authentication required. Please sign in to claim this item.' },
        { status: 401 }
      );
    }

    // Validate caseId format
    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid case ID' },
        { status: 400 }
      );
    }

    // Validate officerId format (if provided)
    if (officerId && !mongoose.Types.ObjectId.isValid(officerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid officer ID' },
        { status: 400 }
      );
    }

    // Validate claim evidence (required)
    if (!claimEvidence) {
      return NextResponse.json(
        { success: false, error: 'Claim evidence is required' },
        { status: 400 }
      );
    }
    
    if (!claimEvidence.description || typeof claimEvidence.description !== 'string' || claimEvidence.description.trim().length < 20) {
      return NextResponse.json(
        { success: false, error: 'Claim description is required and must be at least 20 characters' },
        { status: 400 }
      );
    }
    
    if (!claimEvidence.claimantInfo || !claimEvidence.claimantInfo.name || !claimEvidence.claimantInfo.email) {
      return NextResponse.json(
        { success: false, error: 'Claimant name and email are required' },
        { status: 400 }
      );
    }
    
    if (!claimEvidence.claimantInfo.phone || !claimEvidence.claimantInfo.phone.trim()) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Verify officer exists and is active (if officer was selected)
    let officer = null;
    if (officerId) {
      officer = await User.findById(officerId).select('-password');
      if (!officer || !officer.isActive || officer.role !== 'officer') {
        return NextResponse.json(
          { success: false, error: 'Officer not found or inactive' },
          { status: 404 }
        );
      }
    }

    // Find the case
    const currentCase = await Case.findById(caseId);
    if (!currentCase) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    // Check if case is already resolved
    if (currentCase.status === 'resolved') {
      return NextResponse.json(
        { success: false, error: 'Cannot verify a resolved case' },
        { status: 400 }
      );
    }

    // Allow multiple claims even if already verification type
    // (removed the check that prevented multiple claims)

    // Only allow verification for 'lost' or 'verification' type cases
    if (currentCase.type !== 'lost' && currentCase.type !== 'verification') {
      return NextResponse.json(
        { success: false, error: 'Only lost items can be claimed for verification' },
        { status: 400 }
      );
    }

    // Check if this user has already claimed this case (by clerkUserId - REQUIRED)
    const existingClaim = await Claim.findOne({
      caseId: new mongoose.Types.ObjectId(caseId),
      clerkUserId: clerkUserId
    });

    if (existingClaim) {
      console.log('[Verify Case] Duplicate claim attempt blocked:', {
        clerkUserId,
        existingClaimId: existingClaim._id,
        existingClaimStatus: existingClaim.status
      });
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

    // Create a new Claim document
    let newClaim = null;
      const claimantAddress: any = {};
      if (claimEvidence.claimantInfo.address) {
        if (claimEvidence.claimantInfo.address.province) claimantAddress.province = claimEvidence.claimantInfo.address.province;
        if (claimEvidence.claimantInfo.address.district) claimantAddress.district = claimEvidence.claimantInfo.address.district;
        if (claimEvidence.claimantInfo.address.municipality) claimantAddress.municipality = claimEvidence.claimantInfo.address.municipality;
        if (claimEvidence.claimantInfo.address.ward) claimantAddress.ward = claimEvidence.claimantInfo.address.ward;
        if (claimEvidence.claimantInfo.address.fullAddress) claimantAddress.fullAddress = claimEvidence.claimantInfo.address.fullAddress;
      }
      
      const claimantInfo: any = {
        name: claimEvidence.claimantInfo.name.trim(),
        email: claimEvidence.claimantInfo.email.trim(),
        phone: claimEvidence.claimantInfo.phone.trim(),
        address: claimantAddress
      };
      
      newClaim = new Claim({
        caseId: new mongoose.Types.ObjectId(caseId),
        clerkUserId: clerkUserId, // REQUIRED - always set
        relatedFoundCaseId: relatedFoundCaseId && mongoose.Types.ObjectId.isValid(relatedFoundCaseId) 
          ? new mongoose.Types.ObjectId(relatedFoundCaseId) 
          : undefined,
        claimantInfo: claimantInfo,
        evidence: {
          description: claimEvidence.description.trim(),
          images: claimEvidence.images || []
        },
        status: 'pending'
      });
      
      await newClaim.save();
      console.log('[Verify Case] New claim created:', {
        claimId: newClaim._id,
        caseId: caseId,
        clerkUserId: clerkUserId,
        claimantEmail: claimantInfo.email,
        hasOfficer: !!officerId
      });

    let updatedCase;

    // Update case type to 'verification' if it's currently 'lost'
    // Assign officer if case is pending
    const caseUpdateData: any = {
      updatedAt: new Date()
    };

    if (currentCase.type === 'lost') {
      caseUpdateData.type = 'verification';
    }

    // Only assign officer and change status if officer was selected
    if (officerId && currentCase.status === 'pending' && !currentCase.assignedOfficer) {
      caseUpdateData.status = 'active';
      caseUpdateData.assignedOfficer = officerId;
    }

    await Case.updateOne(
      { _id: caseId },
      { $set: caseUpdateData }
    );
    
    updatedCase = await Case.findById(caseId).populate('assignedOfficer', 'firstName lastName email');

    if (officer) {
      console.log(`[Verify Case] Case ${caseId} set to verification with officer ${officer.email}`);
    } else {
      console.log(`[Verify Case] Case ${caseId} set to verification - unassigned (available for officers to take)`);
    }
    console.log('[Verify Case] New claim ID:', newClaim._id);

    return NextResponse.json({
      success: true,
      message: 'Verification request submitted successfully',
      case: updatedCase,
      claim: newClaim ? {
        id: newClaim._id,
        status: newClaim.status,
        createdAt: newClaim.createdAt
      } : null
    });

  } catch (error) {
    console.error('[Verify Case] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit verification request' },
      { status: 500 }
    );
  }
}
