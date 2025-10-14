import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import connectDB from '../../../../lib/mongodb';
import Case from '../../../../models/Case';
import User from '../../../../models/User';

interface EmailTemplateData {
  logo_url: string;
  item_type: string;
  item_image_url: string;
  item_title: string;
  item_description: string;
  reporter_name: string;
  location: string;
  reported_time: string;
  reporter_email: string;
  case_detail_url: string;
}

function generateEmailHTML(data: EmailTemplateData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GOTUS - Item Match Found</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.08);">
    <!-- Header -->
    <div style="padding: 44px 32px 28px; text-align: center; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); position: relative;">
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent 0%, #3b82f6 50%, transparent 100%); opacity: 0.7;"></div>
      <div style="display: inline-flex; align-items: center; gap: 16px; margin-bottom: 20px;">
        <img style="width: 44px; height: 44px; border-radius: 12px; box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);" src="${data.logo_url}" alt="GOTUS Logo">
        <div>
          <h1 style="margin: 0; font-size: 30px; font-weight: 800; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.9px;">GOTUS</h1>
          <p style="margin: 3px 0 0 0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px;">Unclaimed Items Tracker</p>
        </div>
      </div>
    </div>
    
    <!-- Success Alert -->
    <div style="margin: 0 24px 24px; position: relative; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 20px; padding: 20px 24px; text-align: center; position: relative; overflow: hidden;">
        <div style="position: relative; z-index: 1;">
          <h2 style="margin: 0 0 4px 0; font-size: 18px; font-weight: bold; color: white; letter-spacing: -0.3px;">Perfect Match!</h2>
          <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">A similar ${data.item_type} like yours has been reported</p>
        </div>
      </div>
    </div>
    
    <!-- Item Card -->
    <div style="margin: 0 16px 24px; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #f1f5f9; position: relative;">
      <div style="position: absolute; inset: 0; border-radius: 24px; padding: 1px; background: linear-gradient(135deg, #e879f9, #06b6d4, #10b981); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask-composite: exclude; opacity: 0.3;"></div>
      
      <!-- Item Image -->
      <div style="position: relative; width: 100%; height: 180px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); overflow: hidden;">
        <img style="width: 100%; height: 100%; object-fit: cover; border: none;" src="${data.item_image_url}" alt="${data.item_type}">
        <div style="position: absolute; top: 12px; right: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35);">Found</div>
      </div>
      
      <!-- Item Details -->
      <div style="padding: 20px 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 8px;">
          <h3 style="margin: 0; font-size: 18px; font-weight: bold; color: #0f172a; line-height: 1.3; letter-spacing: -0.4px; flex: 1; min-width: 0; word-break: break-word;">${data.item_title}</h3>
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #92400e; padding: 4px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #fed7aa; flex-shrink: 0;">${data.item_type}</div>
        </div>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 18px 0; font-weight: 400; word-wrap: break-word;">${data.item_description}</p>
        
        <!-- Meta Grid -->
        <div style="padding: 16px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <div style="margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <div style="width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #06b6d4; flex-shrink: 0;">👤</div>
              <span style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Found By</span>
            </div>
            <p style="margin: 0 0 0 28px; font-size: 14px; color: #1e293b; font-weight: 600; word-break: break-word; line-height: 1.3;">${data.reporter_name}</p>
          </div>
          <div style="margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <div style="width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #e879f9; flex-shrink: 0;">🗺️</div>
              <span style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Location</span>
            </div>
            <p style="margin: 0 0 0 28px; font-size: 14px; color: #1e293b; font-weight: 600; word-break: break-word; line-height: 1.3;">${data.location}</p>
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <div style="width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #10b981; flex-shrink: 0;">🕐</div>
              <span style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Reported</span>
            </div>
            <p style="margin: 0 0 0 28px; font-size: 14px; color: #1e293b; font-weight: 600; word-break: break-word; line-height: 1.3;">${data.reported_time}</p>
          </div>
        </div>
        
        <!-- Contact Card -->
        <div style="background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); border-radius: 16px; padding: 16px; border: 1px solid #c4b5fd;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #8b5cf6; flex-shrink: 0;">✉️</div>
            <span style="font-size: 11px; color: #6d28d9; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Contact</span>
          </div>
          <a style="color: #7c3aed; text-decoration: none; font-size: 14px; font-weight: 600; display: block; word-break: break-all; line-height: 1.4; margin-left: 28px;" href="mailto:${data.reporter_email}">${data.reporter_email}</a>
        </div>
      </div>
    </div>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 0 24px 36px;">
      <a style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 18px; font-weight: bold; font-size: 15px; letter-spacing: -0.2px; box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);" href="${data.case_detail_url}">View Complete Details ↗</a>
    </div>
    
    <!-- Next Steps -->
    <div style="margin: 0 24px 32px; background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%); border-radius: 20px; padding: 24px; border: 1px solid #fed7aa; position: relative; overflow: hidden;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h4 style="margin: 0; font-size: 17px; font-weight: bold; color: #92400e; letter-spacing: -0.3px;">Next Steps</h4>
      </div>
      <div style="display: grid; gap: 16px;">
        <div style="display: table; width: 100%;">
          <div style="display: table-cell; vertical-align: top; width: 40px; padding-right: 12px;">
            <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; color: white; font-weight: bold; font-size: 14px; text-align: center; line-height: 28px;">1</div>
          </div>
          <div style="display: table-cell; vertical-align: top;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px;">✉️</span>
              <p style="margin: 0; font-size: 14px; color: #78350f; font-weight: 600; line-height: 28px;">Email the Finder Directly</p>
            </div>
          </div>
        </div>
        <div style="display: table; width: 100%;">
          <div style="display: table-cell; vertical-align: top; width: 40px; padding-right: 12px;">
            <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #06b6d4, #0891b2); border-radius: 50%; color: white; font-weight: bold; font-size: 14px; text-align: center; line-height: 28px;">2</div>
          </div>
          <div style="display: table-cell; vertical-align: top;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px;">🔍</span>
              <p style="margin: 0; font-size: 14px; color: #78350f; font-weight: 600; line-height: 28px;">Verify it's your item Through GOTUS</p>
            </div>
          </div>
        </div>
        <div style="display: table; width: 100%;">
          <div style="display: table-cell; vertical-align: top; width: 40px; padding-right: 12px;">
            <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #e879f9, #c084fc); border-radius: 50%; color: white; font-weight: bold; font-size: 14px; text-align: center; line-height: 28px;">3</div>
          </div>
          <div style="display: table-cell; vertical-align: top;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px;">🤝</span>
              <p style="margin: 0; font-size: 14px; color: #78350f; font-weight: 600; line-height: 28px;">Let Us Arrange Pickup Safely with our Official Officers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 28px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
      <div style="margin-bottom: 18px;">
        <p style="color: #64748b; font-size: 14px; margin: 0 0 8px 0; font-weight: 500;">Questions? We're here to help</p>
        <a style="color: #3b82f6; text-decoration: none; font-size: 15px; font-weight: bold;" href="mailto:support@gotus.com">support@gotus.com</a>
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 18px;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 10px 0; font-weight: 500;">&copy; 2025 GOTUS - Global Online Tracking for Unclaimed Stuff</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ids: string[] = body?.ids || [];
    const foundCaseId: string | undefined = body?.foundCaseId; // ID of the FOUND case that triggered these notifications
    const finder: { id?: string; name?: string; email?: string } | undefined = body?.finder;
    
    console.log('[notify-unresolved] 🔍 RECEIVED:', {
      idsCount: ids.length,
      ids,
      foundCaseId,
      finderName: finder?.name,
      finderEmail: finder?.email ? `${finder.email.substring(0, 3)}***` : 'none'
    });

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids must be a non-empty array' },
        { status: 400 }
      );
    }

    // SMTP Configuration
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!smtpUser || !smtpPass) {
      console.error('[notify-unresolved] Missing SMTP configuration');
      return NextResponse.json(
        { error: 'Email service not configured. Please set SMTP_USER and SMTP_PASS environment variables.' },
        { status: 500 }
      );
    }

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Verify SMTP connection
    try {
      await transporter.verify();
      console.log('[notify-unresolved] SMTP connection verified');
    } catch (verifyError) {
      console.error('[notify-unresolved] SMTP verification failed:', verifyError);
      return NextResponse.json(
        { error: 'Failed to connect to email server' },
        { status: 500 }
      );
    }

    await connectDB();

    // Connection debug info
    const connectionInfo = {
      dbName: mongoose.connection.db?.databaseName,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      readyState: mongoose.connection.readyState,
      collections: await mongoose.connection.db?.listCollections().toArray()
    };
    
    console.log('[notify-unresolved] 🔥 CONNECTION DEBUG:', JSON.stringify(connectionInfo, null, 2));

    const strIds = ids.map((x: any) => String(x)).filter(Boolean);
    console.log('[notify-unresolved] incoming ids:', strIds);

    const validObjectIds = strIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    console.log('[notify-unresolved] valid ObjectIds count:', validObjectIds.length);
    console.log('[notify-unresolved] valid ObjectIds:', validObjectIds.map(id => id.toString()));

    if (validObjectIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No valid MongoDB IDs provided',
        processed: 0,
        sent: 0,
        failed: 0,
        invalidIds: strIds,
        debug: connectionInfo
      });
    }

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const collectionsList = await db.listCollections().toArray();
    console.log('[notify-unresolved] 🔥 Available collections:', collectionsList.map(c => c.name));

    let casesCollection = db.collection('cases');
    let totalDocsInCases = await casesCollection.countDocuments();
    console.log('[notify-unresolved] 🔥 Total documents in "cases" collection:', totalDocsInCases);

    try {
      const CasesCollection = db.collection('Cases');
      const totalDocsInCases2 = await CasesCollection.countDocuments();
      console.log('[notify-unresolved] 🔥 Total documents in "Cases" collection:', totalDocsInCases2);
      
      if (totalDocsInCases2 > totalDocsInCases) {
        casesCollection = CasesCollection;
        totalDocsInCases = totalDocsInCases2;
      }
    } catch (e) {
      console.log('[notify-unresolved] "Cases" collection does not exist');
    }

    const specificDoc = await casesCollection.findOne({
      _id: validObjectIds[0]
    });
    
    console.log('[notify-unresolved] 🔥 Specific document search result:', 
      specificDoc ? JSON.stringify(specificDoc, null, 2) : 'NOT FOUND');

    const unresolvedCases = await casesCollection
      .find({
        _id: { $in: validObjectIds },
        status: { $ne: 'resolved' }
      })
      .sort({ createdAt: -1 })
      .toArray();

    console.log('[notify-unresolved] unresolved cases found:', unresolvedCases?.length);

    if (!unresolvedCases || unresolvedCases.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No unresolved cases found for the provided IDs',
        processed: validObjectIds.length,
        sent: 0,
        failed: 0,
        debug: {
          ...connectionInfo,
          totalDocsInCollection: totalDocsInCases,
          specificDocumentFound: !!specificDoc,
          specificDocumentId: specificDoc?._id?.toString(),
          specificDocumentStatus: specificDoc?.status
        }
      });
    }

    // If no foundCaseId was provided but we have finder info, try to find their most recent FOUND case
    let actualFoundCaseId = foundCaseId;
    if (!actualFoundCaseId && finder?.id) {
      try {
        // Find the most recent FOUND case created by this finder
        const recentFoundCase = await casesCollection
          .findOne(
            {
              'reportedBy.clerkId': finder.id,
              type: 'found',
              status: { $ne: 'resolved' }
            },
            { sort: { createdAt: -1 } }
          );
        
        if (recentFoundCase) {
          actualFoundCaseId = String(recentFoundCase._id);
          console.log(`[notify-unresolved] 🔍 Found recent FOUND case by finder ${finder.name}: ${actualFoundCaseId}`);
        }
      } catch (err) {
        console.error('[notify-unresolved] Error finding recent FOUND case:', err);
      }
    }
    
    // Send emails
    const emailResults = {
      sent: 0,
      failed: 0,
      errors: [] as any[]
    };

    for (const caseDoc of unresolvedCases) {
      try {
        const caseId = String(caseDoc._id);
        const itemType = caseDoc.type || 'lost';
        const title = caseDoc.title || 'Untitled Item';
        const description = caseDoc.description || 'No description provided';

        // Determine reporter info (lost reporter)
        let lostReporterName = caseDoc.reportedBy?.name || 'Anonymous';
        let lostReporterEmail = caseDoc.reportedBy?.email || '';

        // Only attempt DB lookup if the clerkId looks like an ObjectId
        const possibleId = caseDoc.reportedBy?.clerkId;
        if (possibleId && mongoose.Types.ObjectId.isValid(String(possibleId))) {
          try {
            const user = await User.findById(possibleId).select('-password');
            if (user && user.isActive) {
              lostReporterName = `${user.firstName} ${user.lastName}`.trim() || user.email;
              lostReporterEmail = user.email;
            }
          } catch (error) {
            console.error(`Error fetching user data for case ${caseId}:`, error);
            // Fallback to case data
          }
        }

        // Finder info comes from the agent proxy (institutional or clerk finder)
        const finderName = finder?.name || 'A GOTUS user';
        const finderEmail = finder?.email || '';

        const locationAddress = caseDoc.location?.address || 'Unknown location';
        const locationDetails = caseDoc.location?.details || '';
        const fullLocation = locationDetails 
          ? `${locationAddress} - ${locationDetails}`
          : locationAddress;

        const reportedTime = caseDoc.reportedTime 
          ? new Date(caseDoc.reportedTime).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'Unknown';

        let itemImageUrl = `${appUrl}/placeholder-item.png`;
        if (caseDoc.images && caseDoc.images.length > 0) {
          const imagePath = caseDoc.images[0];
          if (imagePath.startsWith('http')) {
            itemImageUrl = imagePath;
          } else if (imagePath.startsWith('/')) {
            itemImageUrl = `${appUrl}${imagePath}`;
          } else {
            itemImageUrl = `${appUrl}/uploads/${imagePath}`;
          }
        }
        // Include foundCaseId in URL if available, so claim submissions can link cases
        const caseDetailUrl = actualFoundCaseId 
          ? `${appUrl}/cases/${caseId}?foundCaseId=${actualFoundCaseId}`
          : `${appUrl}/cases/${caseId}`;
        
        console.log(`[notify-unresolved] Email URL for case ${caseId}: ${caseDetailUrl}`);
        const envLogo = process.env.NEXT_PUBLIC_LOGO_URL || process.env.LOGO_URL;
        const logoUrl = envLogo || `${appUrl}/Logo.png`;

        if (!lostReporterEmail) {
          console.warn(`[notify-unresolved] No email for case ${caseId}, skipping`);
          emailResults.failed++;
          emailResults.errors.push({
            caseId,
            error: 'No reporter email address'
          });
          continue;
        }

        const emailData: EmailTemplateData = {
          logo_url: logoUrl,
          item_type: itemType,
          item_image_url: itemImageUrl,
          item_title: title,
          item_description: description,
          reporter_name: finderName, // Found By: use finder
          location: fullLocation,
          reported_time: reportedTime,
          reporter_email: finderEmail || lostReporterEmail, // Contact: prefer finder email, fallback to lost reporter
          case_detail_url: caseDetailUrl
        };

        const htmlContent = generateEmailHTML(emailData);

        const mailOptions = {
          from: `"GOTUS - Unclaimed Items Tracker" <${smtpFrom}>`,
          to: lostReporterEmail, // Email the lost reporter
          subject: `📢 Perfect Match! A ${itemType} similar to yours has been found`,
          html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
        console.log(`[notify-unresolved] Email sent successfully to ${lostReporterEmail} for case ${caseId}`);
        emailResults.sent++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (emailError: any) {
        console.error(`[notify-unresolved] Error sending email for case ${caseDoc._id}:`, emailError);
        emailResults.failed++;
        emailResults.errors.push({
          caseId: String(caseDoc._id),
          error: emailError.message || 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Email notification process completed',
      processed: unresolvedCases.length,
      sent: emailResults.sent,
      failed: emailResults.failed,
      errors: emailResults.errors.length > 0 ? emailResults.errors : undefined,
      cases: unresolvedCases.map((c: any) => ({
        id: String(c._id),
        title: c.title,
        type: c.type,
        status: c.status,
        reporterEmail: c.reportedBy?.email
      }))
    });

  } catch (error: any) {
    console.error('[notify-unresolved] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process unresolved cases',
        details: error.message 
      },
      { status: 500 }
    );
  }
}