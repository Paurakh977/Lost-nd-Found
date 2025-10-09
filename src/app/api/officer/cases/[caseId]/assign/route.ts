import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/mongodb';
import Case from '../../../../../../models/Case';
import User from '../../../../../../models/User';
import { getJWTFromRequest, verifyJWT } from '../../../../../../lib/jwt';
import { isOfficer } from '../../../../../../lib/query-utils';
import mongoose from 'mongoose';

/**
 * POST /api/officer/cases/[caseId]/assign
 * 
 * Assigns an unassigned case to the authenticated officer
 * Uses atomic operation to prevent race conditions (two officers assigning the same case)
 * 
 * Only allows assignment if the case is currently unassigned (assignedOfficer is null/undefined)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
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
    
    // Await params as required in Next.js 15
    const { caseId } = await params;
    
    // Validate caseId format
    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid case ID' },
        { status: 400 }
      );
    }
    
    // Use findOneAndUpdate with atomic operation to prevent race conditions
    // This ensures only unassigned cases can be assigned
    const updatedCase = await Case.findOneAndUpdate(
      {
        _id: caseId,
        $or: [
          { assignedOfficer: null },
          { assignedOfficer: { $exists: false } }
        ]
      },
      {
        $set: {
          assignedOfficer: payload.userId,
          status: 'active', // Automatically set status to active when assigned
          updatedAt: new Date()
        }
      },
      {
        new: true, // Return updated document
        runValidators: true
      }
    )
      .populate('assignedOfficer', 'firstName lastName email')
      .lean();
    
    // Check if case was found and updated
    if (!updatedCase) {
      // Case either doesn't exist or is already assigned
      const existingCase = await Case.findById(caseId).lean();
      
      if (!existingCase) {
        return NextResponse.json(
          { success: false, error: 'Case not found' },
          { status: 404 }
        );
      }
      
      if (existingCase.assignedOfficer) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'This case has already been assigned to another officer',
            conflictType: 'already_assigned'
          },
          { status: 409 } // Conflict
        );
      }
      
      // Unexpected error
      return NextResponse.json(
        { success: false, error: 'Failed to assign case' },
        { status: 500 }
      );
    }
    
    console.log(`[Assign Case] Case ${caseId} assigned to officer ${officerUser.email}`);
    
    return NextResponse.json({
      success: true,
      message: 'Case successfully assigned to you',
      case: updatedCase,
    });
    
  } catch (error) {
    console.error('[Assign Case] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to assign case' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/officer/cases/[caseId]/assign
 * 
 * Unassigns a case from the authenticated officer
 * Only the officer who is currently assigned can unassign themselves
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
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
    const officerUser = await User.findById(payload.userId);
    if (!officerUser || !officerUser.isActive) {
      return NextResponse.json(
        { success: false, error: 'Officer account is inactive' },
        { status: 403 }
      );
    }
    
    // Await params as required in Next.js 15
    const { caseId } = await params;
    
    // Validate caseId format
    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid case ID' },
        { status: 400 }
      );
    }
    
    // Use findOneAndUpdate to unassign only if the officer is currently assigned
    const updatedCase = await Case.findOneAndUpdate(
      {
        _id: caseId,
        assignedOfficer: payload.userId
      },
      {
        $unset: { assignedOfficer: 1 },
        $set: { 
          status: 'pending',
          updatedAt: new Date()
        }
      },
      {
        new: true,
        runValidators: true
      }
    ).lean();
    
    if (!updatedCase) {
      return NextResponse.json(
        { success: false, error: 'Case not found or not assigned to you' },
        { status: 404 }
      );
    }
    
    console.log(`[Unassign Case] Case ${caseId} unassigned from officer ${officerUser.email}`);
    
    return NextResponse.json({
      success: true,
      message: 'Case successfully unassigned',
      case: updatedCase,
    });
    
  } catch (error) {
    console.error('[Unassign Case] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unassign case' },
      { status: 500 }
    );
  }
}
