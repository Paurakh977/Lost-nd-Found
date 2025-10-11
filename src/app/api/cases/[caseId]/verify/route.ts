import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Case from '../../../../../models/Case';
import User from '../../../../../models/User';
import mongoose from 'mongoose';

/**
 * POST /api/cases/[caseId]/verify
 * 
 * Handles verification requests for cases:
 * - Case 1: If case is already active and assigned to an officer, change type to 'verification'
 * - Case 2: If case is pending, assign to selected officer and set type to 'verification'
 * 
 * Body: { officerId: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    await connectDB();

    const { caseId } = await params;
    const body = await request.json();
    const { officerId, claimEvidence } = body || {};

    // Validate caseId format
    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid case ID' },
        { status: 400 }
      );
    }

    // Validate officerId format
    if (!mongoose.Types.ObjectId.isValid(officerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid officer ID' },
        { status: 400 }
      );
    }

    // Validate claim evidence if provided
    if (claimEvidence) {
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
    }

    // Verify officer exists and is active
    const officer = await User.findById(officerId).select('-password');
    if (!officer || !officer.isActive || officer.role !== 'officer') {
      return NextResponse.json(
        { success: false, error: 'Officer not found or inactive' },
        { status: 404 }
      );
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

    // Check if case is already verification type
    if (currentCase.type === 'verification') {
      return NextResponse.json(
        { success: false, error: 'Case is already in verification status' },
        { status: 400 }
      );
    }

    // Only allow verification for 'lost' type cases
    if (currentCase.type !== 'lost') {
      return NextResponse.json(
        { success: false, error: 'Only lost items can be claimed for verification' },
        { status: 400 }
      );
    }

    let updatedCase;

    // Prepare update object
    const updateData: any = {
      type: 'verification',
      updatedAt: new Date()
    };

    // Add claim evidence if provided
    if (claimEvidence) {
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
        address: claimantAddress
      };
      if (claimEvidence.claimantInfo.phone?.trim()) {
        claimantInfo.phone = claimEvidence.claimantInfo.phone.trim();
      }
      
      updateData.claimEvidence = {
        description: claimEvidence.description.trim(),
        images: claimEvidence.images || [],
        claimantInfo: claimantInfo,
        submittedAt: new Date()
      };
      console.log('[Verify Case] Claim evidence added to update:', JSON.stringify(updateData.claimEvidence, null, 2));
    }

    if (currentCase.status === 'active' && currentCase.assignedOfficer) {
      // Case 1: Already assigned to an officer, just change type to verification
      currentCase.type = 'verification';
      if (updateData.claimEvidence) {
        currentCase.claimEvidence = updateData.claimEvidence;
      }
      // Use update instead of save to bypass validation
      await Case.updateOne(
        { _id: caseId },
        { 
          $set: { 
            type: 'verification',
            claimEvidence: updateData.claimEvidence,
            updatedAt: new Date()
          } 
        }
      );
      updatedCase = await Case.findById(caseId).populate('assignedOfficer', 'firstName lastName email');
    } else if (currentCase.status === 'pending' && !currentCase.assignedOfficer) {
      // Case 2: Pending case, assign to selected officer and set type to verification
      await Case.updateOne(
        { _id: caseId },
        { 
          $set: { 
            type: 'verification',
            status: 'active',
            assignedOfficer: officerId,
            claimEvidence: updateData.claimEvidence,
            updatedAt: new Date()
          } 
        }
      );
      updatedCase = await Case.findById(caseId).populate('assignedOfficer', 'firstName lastName email');
    } else {
      return NextResponse.json(
        { success: false, error: 'Case is not in a state that allows verification' },
        { status: 400 }
      );
    }

    console.log(`[Verify Case] Case ${caseId} set to verification with officer ${officer.email}`);
    console.log('[Verify Case] Updated case claimEvidence:', JSON.stringify(updatedCase?.claimEvidence, null, 2));
    
    // Verify the update by fetching the case again
    const verifyCase = await Case.findById(caseId).select('claimEvidence type status').lean();
    console.log('[Verify Case] Re-fetched case from DB:', JSON.stringify(verifyCase, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Verification request submitted successfully',
      case: updatedCase,
    });

  } catch (error) {
    console.error('[Verify Case] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit verification request' },
      { status: 500 }
    );
  }
}
