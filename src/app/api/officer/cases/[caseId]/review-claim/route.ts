import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../../lib/mongodb';
import Case from '../../../../../../../models/Case';
import Claim from '../../../../../../../models/Claim';
import User from '../../../../../../../models/User';
import { getJWTFromRequest, verifyJWT } from '../../../../../../../lib/jwt';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';

/**
 * POST /api/officer/cases/[caseId]/review-claim
 * 
 * Allows an officer to approve or reject a claim for a verification case
 * 
 * Body: {
 *   claimId: string,
 *   decision: 'approved' | 'rejected',
 *   reviewNotes?: string
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    await connectDB();

    // Authenticate officer (JWT only - officers don't use Clerk)
    const token = getJWTFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload || payload.role !== 'officer') {
      return NextResponse.json(
        { success: false, error: 'Officer access required' },
        { status: 403 }
      );
    }

    const officer = await User.findById(payload.userId).select('-password');
    if (!officer || !officer.isActive) {
      return NextResponse.json(
        { success: false, error: 'Officer account not found or inactive' },
        { status: 403 }
      );
    }

    const { caseId } = await params;
    const body = await request.json();
    const { claimId, decision, reviewNotes } = body;

    // Validate inputs
    if (!claimId || !decision) {
      return NextResponse.json(
        { success: false, error: 'claimId and decision are required' },
        { status: 400 }
      );
    }

    if (decision !== 'approved' && decision !== 'rejected') {
      return NextResponse.json(
        { success: false, error: 'decision must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(caseId) || !mongoose.Types.ObjectId.isValid(claimId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    // Find the case
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    // Find the claim
    const claim = await Claim.findById(claimId);
    if (!claim) {
      return NextResponse.json(
        { success: false, error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Verify claim belongs to this case
    if (claim.caseId.toString() !== caseId) {
      return NextResponse.json(
        { success: false, error: 'Claim does not belong to this case' },
        { status: 400 }
      );
    }

    // Check if claim is already reviewed
    if (claim.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Claim has already been ${claim.status}` },
        { status: 400 }
      );
    }

    console.log('[Review Claim] Processing:', {
      caseId,
      claimId,
      decision,
      officerId: officer._id,
      officerEmail: officer.email
    });

    // Update claim status
    claim.status = decision;
    claim.reviewedBy = officer._id;
    claim.reviewedAt = new Date();
    if (reviewNotes) {
      claim.reviewNotes = reviewNotes;
    }
    await claim.save();

    // If approved, resolve the case
    if (decision === 'approved') {
      // Get the finder information from case.resolution.foundBy (for found items) or reportedBy (for verification cases)
      let finderInfo: any = null;
      
      // For cases that started as 'found', resolution.foundBy is already set
      if (caseDoc.resolution?.foundBy) {
        finderInfo = caseDoc.resolution.foundBy;
      }
      // For cases that started as 'lost' and became 'verification', we need to find the original finder
      // The finder info should be in the email notification data, but we'll use case.reportedBy as fallback
      else if (caseDoc.type === 'found') {
        finderInfo = {
          clerkId: caseDoc.reportedBy.clerkId,
          name: caseDoc.reportedBy.name,
          contactInfo: caseDoc.reportedBy.email
        };
      }

      // Mark case as resolved
      caseDoc.status = 'resolved';
      caseDoc.resolution = {
        resolvedAt: new Date(),
        resolvedBy: officer._id,
        outcome: 'Item claimed and verified',
        notes: reviewNotes || 'Claim approved by officer',
        itemAssignedTo: {
          clerkId: claim.clerkUserId,
          name: claim.claimantInfo.name,
          contactInfo: claim.claimantInfo.email
        },
        foundBy: finderInfo
      };

      await caseDoc.save();
      console.log('[Review Claim] Case resolved:', { caseId, claimId, resolution: caseDoc.resolution });
    } else {
      // If rejected, just update the case to note that a claim was rejected
      console.log('[Review Claim] Claim rejected:', { caseId, claimId });
    }

    // Send email notification to claimant
    await sendClaimDecisionEmail({
      claimantEmail: claim.claimantInfo.email,
      claimantName: claim.claimantInfo.name,
      decision,
      caseTitle: caseDoc.title,
      caseId: caseId,
      officerName: `${officer.firstName} ${officer.lastName}`,
      officerEmail: officer.email,
      reviewNotes
    });

    return NextResponse.json({
      success: true,
      message: `Claim ${decision} successfully`,
      claim: {
        id: claim._id,
        status: claim.status,
        reviewedAt: claim.reviewedAt,
        reviewNotes: claim.reviewNotes
      },
      case: decision === 'approved' ? {
        id: caseDoc._id,
        status: caseDoc.status,
        resolution: caseDoc.resolution
      } : undefined
    });

  } catch (error) {
    console.error('[Review Claim] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process claim review' },
      { status: 500 }
    );
  }
}

/**
 * Send email notification about claim decision
 */
async function sendClaimDecisionEmail(data: {
  claimantEmail: string;
  claimantName: string;
  decision: 'approved' | 'rejected';
  caseTitle: string;
  caseId: string;
  officerName: string;
  officerEmail: string;
  reviewNotes?: string;
}) {
  try {
    // SMTP Configuration
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!smtpUser || !smtpPass) {
      console.error('[Claim Email] Missing SMTP configuration');
      return;
    }

    const transporter = nodemailer.createTransporter({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const isApproved = data.decision === 'approved';
    const statusColor = isApproved ? '#10b981' : '#ef4444';
    const statusText = isApproved ? 'APPROVED' : 'REJECTED';
    const emoji = isApproved ? '✅' : '❌';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GOTUS - Claim ${statusText}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.08);">
    <!-- Header -->
    <div style="padding: 44px 32px 28px; text-align: center; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);">
      <h1 style="margin: 0; font-size: 30px; font-weight: 800; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.9px;">GOTUS</h1>
      <p style="margin: 3px 0 0 0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px;">Unclaimed Items Tracker</p>
    </div>
    
    <!-- Status Alert -->
    <div style="margin: 24px; background: ${statusColor}; border-radius: 20px; padding: 24px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 12px;">${emoji}</div>
      <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: bold; color: white;">Claim ${statusText}</h2>
      <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">Your verification request has been reviewed</p>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 0 24px 32px;">
      <p style="font-size: 16px; color: #1e293b; line-height: 1.6; margin: 0 0 24px 0;">
        Dear <strong>${data.claimantName}</strong>,
      </p>
      
      <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
        Your claim for the item "<strong>${data.caseTitle}</strong>" has been <strong style="color: ${statusColor};">${statusText.toLowerCase()}</strong> by our verification officer.
      </p>
      
      ${data.reviewNotes ? `
      <div style="background: #f8fafc; border-left: 4px solid ${statusColor}; border-radius: 8px; padding: 16px; margin: 0 0 24px 0;">
        <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">Officer's Notes</p>
        <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.5;">${data.reviewNotes}</p>
      </div>
      ` : ''}
      
      ${isApproved ? `
      <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 16px; padding: 20px; margin: 0 0 24px 0; border: 1px solid #86efac;">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: bold; color: #065f46;">✨ Next Steps</h3>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #047857; line-height: 1.5;">
          Please contact the officer below to arrange for item pickup:
        </p>
        <div style="background: white; border-radius: 12px; padding: 16px;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; font-weight: 600;">Reviewing Officer</p>
          <p style="margin: 0 0 8px 0; font-size: 15px; color: #0f172a; font-weight: 600;">${data.officerName}</p>
          <a style="color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: 500;" href="mailto:${data.officerEmail}">${data.officerEmail}</a>
        </div>
      </div>
      ` : `
      <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-radius: 16px; padding: 20px; margin: 0 0 24px 0; border: 1px solid #fca5a5;">
        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: bold; color: #7f1d1d;">What This Means</h3>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #991b1b; line-height: 1.5;">
          After careful review, the officer determined that the evidence provided was insufficient to verify ownership of this item.
        </p>
        <p style="margin: 0; font-size: 14px; color: #991b1b; line-height: 1.5;">
          If you believe this decision was made in error or have additional evidence, please contact the officer directly.
        </p>
        <div style="background: white; border-radius: 12px; padding: 16px; margin-top: 16px;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; font-weight: 600;">Reviewing Officer</p>
          <p style="margin: 0 0 8px 0; font-size: 15px; color: #0f172a; font-weight: 600;">${data.officerName}</p>
          <a style="color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: 500;" href="mailto:${data.officerEmail}">${data.officerEmail}</a>
        </div>
      </div>
      `}
      
      <div style="text-align: center; margin-top: 32px;">
        <a style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 14px;" href="${appUrl}/cases/${data.caseId}">View Case Details</a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0;">Questions? We're here to help</p>
      <a style="color: #3b82f6; text-decoration: none; font-size: 15px; font-weight: bold;" href="mailto:support@gotus.com">support@gotus.com</a>
      <p style="color: #94a3b8; font-size: 12px; margin: 16px 0 0 0;">&copy; 2025 GOTUS - Global Online Tracking for Unclaimed Stuff</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    await transporter.sendMail({
      from: `"GOTUS - Unclaimed Items Tracker" <${smtpFrom}>`,
      to: data.claimantEmail,
      subject: `${emoji} Your claim for "${data.caseTitle}" has been ${statusText.toLowerCase()}`,
      html: htmlContent,
    });

    console.log(`[Claim Email] Sent ${data.decision} notification to ${data.claimantEmail}`);
  } catch (error) {
    console.error('[Claim Email] Failed to send email:', error);
    // Don't throw - email failure shouldn't fail the whole operation
  }
}
