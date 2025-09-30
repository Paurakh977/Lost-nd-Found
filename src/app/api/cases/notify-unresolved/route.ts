import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '../../../../lib/mongodb';
import Case from '../../../../models/Case';

const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';

interface EmailParams {
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
  email: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ids: string[] = body?.ids || [];

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids must be a non-empty array' },
        { status: 400 }
      );
    }

    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!serviceId || !templateId || !publicKey || !privateKey) {
      console.error('[notify-unresolved] Missing EmailJS configuration');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    await connectDB();

    // 🔥 CRITICAL DEBUG INFO 🔥
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

    // Try native MongoDB collection
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    // 🔥 CHECK WHAT COLLECTIONS EXIST 🔥
    const collectionsList = await db.listCollections().toArray();
    console.log('[notify-unresolved] 🔥 Available collections:', collectionsList.map(c => c.name));

    // Try both 'cases' and 'Cases' collection names
    let casesCollection = db.collection('cases');
    let totalDocsInCases = await casesCollection.countDocuments();
    console.log('[notify-unresolved] 🔥 Total documents in "cases" collection:', totalDocsInCases);

    // Also try 'Cases' with capital C
    try {
      const CasesCollection = db.collection('Cases');
      const totalDocsInCases2 = await CasesCollection.countDocuments();
      console.log('[notify-unresolved] 🔥 Total documents in "Cases" collection:', totalDocsInCases2);
      
      // Use whichever has more documents
      if (totalDocsInCases2 > totalDocsInCases) {
        casesCollection = CasesCollection;
        totalDocsInCases = totalDocsInCases2;
      }
    } catch (e) {
      console.log('[notify-unresolved] "Cases" collection does not exist');
    }

    // 🔥 TRY TO FIND THE SPECIFIC DOCUMENT 🔥
    const specificDoc = await casesCollection.findOne({
      _id: validObjectIds[0]
    });
    
    console.log('[notify-unresolved] 🔥 Specific document search result:', 
      specificDoc ? JSON.stringify(specificDoc, null, 2) : 'NOT FOUND');

    // Query unresolved cases
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
        const reporterName = caseDoc.reportedBy?.name || 'Anonymous';
        const reporterEmail = caseDoc.reportedBy?.email || '';
        
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
        
        const caseDetailUrl = `${appUrl}/cases/${caseId}`;
        const logoUrl = `${appUrl}/Logo.png`;

        if (!reporterEmail) {
          console.warn(`[notify-unresolved] No email for case ${caseId}, skipping`);
          emailResults.failed++;
          emailResults.errors.push({
            caseId,
            error: 'No reporter email address'
          });
          continue;
        }

        const emailParams: EmailParams = {
          logo_url: logoUrl,
          item_type: itemType,
          item_image_url: itemImageUrl,
          item_title: title,
          item_description: description,
          reporter_name: reporterName,
          location: fullLocation,
          reported_time: reportedTime,
          reporter_email: reporterEmail,
          case_detail_url: caseDetailUrl,
          email: reporterEmail
        };

        const emailResponse = await fetch(EMAILJS_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            accessToken: privateKey,
            template_params: emailParams
          })
        });

        if (emailResponse.ok) {
          console.log(`[notify-unresolved] Email sent for case ${caseId}`);
          emailResults.sent++;
        } else {
          const errorText = await emailResponse.text();
          console.error(`[notify-unresolved] Email failed for case ${caseId}:`, errorText);
          emailResults.failed++;
          emailResults.errors.push({
            caseId,
            error: errorText
          });
        }

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