import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/mongodb';
import Case from '../../../../../../models/Case';
import Claim from '../../../../../../models/Claim';
import User from '../../../../../../models/User';
import { getJWTFromRequest, verifyJWT } from '../../../../../../lib/jwt';
import { isOfficer } from '../../../../../../lib/query-utils';
const nodemailer = require('nodemailer');

/**
 * POST /api/officer/cases/[caseId]/verify
 * Body: { 
 *   claimId: string,  // ID of the claim to approve/reject
 *   outcome: string, 
 *   notes?: string, 
 *   isVerified: boolean,
 *   assignType?: 'itemAssignedTo' | 'foundBy', 
 *   assignee?: { clerkId?: string, name: string, contactInfo?: string } 
 * }
 * Only the currently assigned officer can verify. 
 * If isVerified=true, approves the claim and resolves the case.
 * If isVerified=false, rejects the claim but keeps case open for other claims.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    await connectDB();

    const token = getJWTFromRequest(request);
    if (!token) return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload || !isOfficer(payload.role)) return NextResponse.json({ success: false, error: 'Officer access required' }, { status: 403 });

    const officerUser = await User.findById(payload.userId);
    if (!officerUser || !officerUser.isActive) return NextResponse.json({ success: false, error: 'Officer account is inactive' }, { status: 403 });

    // Await params as required in Next.js 15
    const { caseId } = await params;
    const body = await request.json();
    const { claimId, outcome, notes, isVerified, assignType, assignee } = body || {};

    if (!claimId) {
      return NextResponse.json({ success: false, error: 'Claim ID is required' }, { status: 400 });
    }

    if (!outcome || typeof outcome !== 'string' || outcome.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Outcome is required' }, { status: 400 });
    }

    if (typeof isVerified !== 'boolean') {
      return NextResponse.json({ success: false, error: 'isVerified must be a boolean' }, { status: 400 });
    }

    // Find case and ensure this officer is assigned and it's a verification case
    const current: any = await Case.findOne({ _id: caseId }).lean();
    if (!current) return NextResponse.json({ success: false, error: 'Case not found' }, { status: 404 });

    if (!current.assignedOfficer || String(current.assignedOfficer) !== String(payload.userId)) {
      return NextResponse.json({ success: false, error: 'You are not assigned to this case' }, { status: 403 });
    }

    if (current.type !== 'verification') {
      return NextResponse.json({ success: false, error: 'This case is not a verification case' }, { status: 400 });
    }

    if (current.status === 'resolved') {
      return NextResponse.json({ success: false, error: 'Case is already resolved' }, { status: 400 });
    }

    // Find and verify the claim
    const claim: any = await Claim.findById(claimId).lean();
    if (!claim) {
      return NextResponse.json({ success: false, error: 'Claim not found' }, { status: 404 });
    }

    if (String(claim.caseId) !== String(caseId)) {
      return NextResponse.json({ success: false, error: 'Claim does not belong to this case' }, { status: 400 });
    }

    if (claim.status !== 'pending') {
      return NextResponse.json({ success: false, error: 'Claim has already been reviewed' }, { status: 400 });
    }

    // Update the claim status
    const claimUpdate: any = {
      status: isVerified ? 'approved' : 'rejected',
      reviewedBy: payload.userId,
      reviewedAt: new Date(),
      reviewNotes: notes?.trim() || undefined
    };

    await Claim.findByIdAndUpdate(claimId, { $set: claimUpdate });

    let updatedCase;

    // If claim is approved, resolve the case
    if (isVerified) {
      // Get finder information from the linked FOUND case if available
      let finderInfo: any = null;
      let foundCaseToResolve: any = null;
      
      // First priority: Check if the claim has a relatedFoundCaseId
      if (claim.relatedFoundCaseId) {
        try {
          foundCaseToResolve = await Case.findById(claim.relatedFoundCaseId).lean();
          if (foundCaseToResolve) {
            finderInfo = {
              clerkId: foundCaseToResolve.reportedBy.clerkId,
              name: foundCaseToResolve.reportedBy.name,
              contactInfo: foundCaseToResolve.reportedBy.email
            };
            console.log('[Verify Case] Found case linked:', {
              foundCaseId: claim.relatedFoundCaseId,
              finderName: finderInfo.name
            });
          }
        } catch (err) {
          console.error('[Verify Case] Error fetching related found case:', err);
        }
      }
      
      // Fallback: use existing resolution.foundBy or reportedBy
      if (!finderInfo) {
        if (current.resolution?.foundBy) {
          finderInfo = current.resolution.foundBy;
        } else if (current.type === 'found' || (current.type === 'verification' && current.reportedBy)) {
          finderInfo = {
            clerkId: current.reportedBy.clerkId,
            name: current.reportedBy.name,
            contactInfo: current.reportedBy.email
          };
        }
      }

      // Build resolution object
      const resolution: any = {
        resolvedAt: new Date(),
        resolvedBy: payload.userId,
        outcome: outcome.trim(),
        notes: notes?.trim() || undefined
      };

      // Add assignment info if provided (who gets the item)
      if (assignType && assignee && assignee.name) {
        resolution[assignType] = {
          clerkId: assignee.clerkId || claim.clerkUserId || undefined,
          name: assignee.name.trim(),
          contactInfo: assignee.contactInfo?.trim() || undefined
        };
      } else if (isVerified) {
        // Default: assign to the claimant
        resolution.itemAssignedTo = {
          clerkId: claim.clerkUserId || undefined,
          name: claim.claimantInfo.name,
          contactInfo: claim.claimantInfo.email
        };
      }
      
      // Set foundBy if we have finder info
      if (finderInfo) {
        resolution.foundBy = finderInfo;
      }
      
      console.log('[Verify Case] Resolution object being saved:', JSON.stringify({
        resolvedAt: resolution.resolvedAt,
        resolvedBy: resolution.resolvedBy,
        outcome: resolution.outcome,
        itemAssignedTo: resolution.itemAssignedTo,
        foundBy: resolution.foundBy
      }, null, 2));

      // Update the LOST case to resolved and link to FOUND case
      const lostCaseUpdate: any = {
        status: 'resolved',
        resolution,
        updatedAt: new Date()
      };
      
      // Link to the found case if we have one
      if (foundCaseToResolve) {
        lostCaseUpdate.linkedCaseId = foundCaseToResolve._id;
      }
      
      updatedCase = await Case.findByIdAndUpdate(
        caseId,
        { $set: lostCaseUpdate },
        { new: true, runValidators: true }
      )
        .populate('assignedOfficer', 'firstName lastName email')
        .lean();
      
      // Manually populate resolvedBy since nested populate doesn't work with lean()
      if (updatedCase && updatedCase.resolution && updatedCase.resolution.resolvedBy) {
        const resolvedByOfficer = await User.findById(updatedCase.resolution.resolvedBy).select('firstName lastName email').lean();
        if (resolvedByOfficer) {
          updatedCase.resolution.resolvedBy = resolvedByOfficer as any;
        }
      }
      
      // If we found a linked FOUND case, resolve it too
      if (foundCaseToResolve && foundCaseToResolve.status !== 'resolved') {
        const foundCaseResolution = {
          resolvedAt: new Date(),
          resolvedBy: payload.userId,
          outcome: 'Item successfully returned to owner',
          notes: `Matched with lost item case ${caseId}`,
          itemAssignedTo: {
            clerkId: claim.clerkUserId || undefined,
            name: claim.claimantInfo.name,
            contactInfo: claim.claimantInfo.email
          },
          foundBy: finderInfo
        };
        
        await Case.findByIdAndUpdate(
          foundCaseToResolve._id,
          {
            $set: {
              status: 'resolved',
              resolution: foundCaseResolution,
              linkedCaseId: caseId, // Link back to the LOST case
              updatedAt: new Date()
            }
          }
        );
        
        console.log('[Verify Case] Linked FOUND case also resolved:', {
          foundCaseId: foundCaseToResolve._id,
          lostCaseId: caseId
        });
      }
    } else {
      // Claim rejected - keep case open for other claims
      updatedCase = await Case.findByIdAndUpdate(
        caseId,
        {
          $set: {
            updatedAt: new Date()
          }
        },
        { new: true }
      )
        .populate('assignedOfficer', 'firstName lastName email')
        .lean();
    }

    console.log(`[Verify Case] Claim ${claimId} ${isVerified ? 'approved' : 'rejected'} by officer ${officerUser.email}`);
    if (isVerified) {
      console.log(`[Verify Case] Case ${caseId} resolved with status:`, updatedCase?.status);
      console.log('[Verify Case] Final resolution in DB:', JSON.stringify(updatedCase?.resolution, null, 2));
    }

    // Send email notification to claimant
    await sendClaimDecisionEmail({
      claimantEmail: claim.claimantInfo.email,
      claimantName: claim.claimantInfo.name,
      decision: isVerified ? 'approved' : 'rejected',
      caseTitle: current.title,
      caseId: caseId,
      officerName: `${officerUser.firstName} ${officerUser.lastName}`,
      officerEmail: officerUser.email,
      reviewNotes: notes
    });

    return NextResponse.json({
      success: true,
      message: `Claim ${isVerified ? 'approved' : 'rejected'} successfully${isVerified ? '. Case has been resolved.' : '. Case remains open for other claims.'}`,
      case: updatedCase,
      claim: {
        id: claimId,
        status: isVerified ? 'approved' : 'rejected'
      }
    });
  } catch (error) {
    console.error('[Verify Case] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to verify case' }, { status: 500 });
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

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
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
  <title>GOTUS - Claim ${statusText}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f1f5f9;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="padding: 40px 30px 25px; text-align: center; background: #ffffff;">
      <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #3b82f6;">GOTUS</h1>
      <p style="margin: 5px 0 0 0; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Unclaimed Items Tracker</p>
    </div>
    
    <div style="margin: 24px; background: ${statusColor}; border-radius: 16px; padding: 24px; text-align: center;">
      <div style="font-size: 40px; margin-bottom: 10px;">${emoji}</div>
      <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: bold; color: white;">Claim ${statusText}</h2>
      <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">Your verification request has been reviewed</p>
    </div>
    
    <div style="padding: 0 24px 30px;">
      <p style="font-size: 15px; color: #1e293b; line-height: 1.6; margin: 0 0 20px 0;">
        Dear <strong>${data.claimantName}</strong>,
      </p>
      
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
        Your claim for "<strong>${data.caseTitle}</strong>" has been <strong style="color: ${statusColor};">${statusText.toLowerCase()}</strong> by our officer.
      </p>
      
      ${data.reviewNotes ? `
      <div style="background: #f8fafc; border-left: 4px solid ${statusColor}; border-radius: 8px; padding: 15px; margin: 0 0 20px 0;">
        <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">Officer's Notes</p>
        <p style="margin: 0; font-size: 13px; color: #1e293b; line-height: 1.5;">${data.reviewNotes}</p>
      </div>
      ` : ''}
      
      ${isApproved ? `
      <div style="background: #d1fae5; border-radius: 14px; padding: 18px; margin: 0 0 20px 0; border: 1px solid #86efac;">
        <h3 style="margin: 0 0 10px 0; font-size: 15px; font-weight: bold; color: #065f46;">✨ Next Steps</h3>
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #047857; line-height: 1.5;">
          Contact the officer to arrange item pickup:
        </p>
        <div style="background: white; border-radius: 10px; padding: 14px;">
          <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; font-weight: 600;">Reviewing Officer</p>
          <p style="margin: 0 0 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${data.officerName}</p>
          <a style="color: #3b82f6; text-decoration: none; font-size: 13px; font-weight: 500;" href="mailto:${data.officerEmail}">${data.officerEmail}</a>
        </div>
      </div>
      ` : `
      <div style="background: #fee2e2; border-radius: 14px; padding: 18px; margin: 0 0 20px 0; border: 1px solid #fca5a5;">
        <h3 style="margin: 0 0 10px 0; font-size: 15px; font-weight: bold; color: #7f1d1d;">What This Means</h3>
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #991b1b; line-height: 1.5;">
          The evidence provided was insufficient to verify ownership.
        </p>
        <p style="margin: 0; font-size: 13px; color: #991b1b; line-height: 1.5;">
          If you have additional evidence, contact the officer directly.
        </p>
        <div style="background: white; border-radius: 10px; padding: 14px; margin-top: 14px;">
          <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; font-weight: 600;">Reviewing Officer</p>
          <p style="margin: 0 0 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${data.officerName}</p>
          <a style="color: #3b82f6; text-decoration: none; font-size: 13px; font-weight: 500;" href="mailto:${data.officerEmail}">${data.officerEmail}</a>
        </div>
      </div>
      `}
      
      <div style="text-align: center; margin-top: 30px;">
        <a style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 13px;" href="${appUrl}/cases/${data.caseId}">View Case Details</a>
      </div>
    </div>
    
    <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #64748b; font-size: 13px; margin: 0 0 6px 0;">Questions? Email us</p>
      <a style="color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: bold;" href="mailto:support@gotus.com">support@gotus.com</a>
      <p style="color: #94a3b8; font-size: 11px; margin: 14px 0 0 0;">&copy; 2025 GOTUS</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    await transporter.sendMail({
      from: `"GOTUS" <${smtpFrom}>`,
      to: data.claimantEmail,
      subject: `${emoji} Your claim for "${data.caseTitle}" has been ${statusText.toLowerCase()}`,
      html: htmlContent,
    });

    console.log(`[Claim Email] Sent ${data.decision} notification to ${data.claimantEmail}`);
  } catch (error) {
    console.error('[Claim Email] Failed to send email:', error);
  }
}
