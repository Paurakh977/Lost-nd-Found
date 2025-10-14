import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getJWTFromRequest, verifyJWT } from '../../../../lib/jwt';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import mongoose from 'mongoose';
import Case from '../../../../models/Case';

const AGENT_URL = process.env.AGENT_SERVER_URL || process.env.NEXT_PUBLIC_AGENT_SERVER_URL || 'http://localhost:8000';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mime_type, data, attachments, session_id } = body || {};

    // Resolve identity from custom JWT first (admins/officers/institutional)
    let clerk_id: string | undefined;
    let clerk_name: string | undefined;
    let auth_token: string | undefined;
    let clerk_email: string | undefined;
    let user_type: 'clerk' | 'jwt' = 'clerk';

    const token = getJWTFromRequest(req);
    if (token) {
      const payload = await verifyJWT(token);
      if (payload) {
        auth_token = token;
        clerk_id = payload.userId;
        user_type = 'jwt';
        
        // Fetch full user data from database for JWT users
        try {
          await connectDB();
          const user = await User.findById(payload.userId).select('-password');
          if (user && user.isActive) {
            clerk_name = `${user.firstName} ${user.lastName}`.trim() || user.email;
            clerk_email = user.email;
          } else {
            // Fallback to JWT payload data
            const first = (payload as any).firstName || '';
            const last = (payload as any).lastName || '';
            clerk_name = `${first} ${last}`.trim() || payload.email || 'User';
            clerk_email = payload.email;
          }
        } catch (error) {
          console.error('Error fetching JWT user data:', error);
          // Fallback to JWT payload data
          const first = (payload as any).firstName || '';
          const last = (payload as any).lastName || '';
          clerk_name = `${first} ${last}`.trim() || payload.email || 'User';
          clerk_email = payload.email;
        }
      }
    }

    // Fallback to Clerk session (public Clerk users)
    if (!clerk_id) {
      const { userId } = await auth();
      if (userId) {
        const user = await currentUser();
        clerk_id = user?.id;
        clerk_name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'User';
        clerk_email = user?.emailAddresses[0]?.emailAddress || 'User';
        user_type = 'clerk';
      }
    }

    if (!clerk_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const forwardBody = {
      mime_type,
      data,
      attachments,
      clerk_id,
      clerk_name,
      clerk_email,
      auth_token,
      session_id,
    };

    // Debug logging for user type detection
    console.log('[agent/send] User authentication details:', {
      user_type,
      clerk_id,
      clerk_name,
      clerk_email: clerk_email ? `${clerk_email.substring(0, 3)}***` : 'none',
      has_auth_token: !!auth_token,
      session_id
    });

    // Debug: log outbound request (without large payloads)
    console.log('[agent/send] outbound', {
      url: `${AGENT_URL}/send/${encodeURIComponent(clerk_id!)}`,
      hasData: Boolean(data),
      hasAttachments: Boolean(attachments?.length),
      session_id
    });

    const res = await fetch(`${AGENT_URL}/send/${encodeURIComponent(clerk_id)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(forwardBody),
    });

    const json = await res.json();
    console.log('[agent/send] inbound', { 
      status: res.status, 
      success: json?.success, 
      found_items_ids: json?.found_items_ids, 
      lost_items_ids: json?.lost_items_ids, 
      author: json?.author 
    });
    
    let lostIds = json?.lost_items_ids || [];
    let foundIds = json?.found_items_ids || [];
    
    // Filter out resolved cases from both found and lost IDs
    const allIds = [...foundIds, ...lostIds];
    if (allIds.length > 0) {
      try {
        await connectDB();
        
        // Convert string IDs to ObjectIds
        const validObjectIds = allIds
          .map((id: any) => String(id))
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
          .map((id) => new mongoose.Types.ObjectId(id));
        
        if (validObjectIds.length > 0) {
          // Query database to find which cases are resolved
          const resolvedCases = await (Case as any)
            .find({ 
              _id: { $in: validObjectIds },
              status: 'resolved'
            })
            .select('_id')
            .lean();
          
          const resolvedIds = new Set(resolvedCases.map((c: any) => String(c._id)));
          
          // Filter out resolved IDs
          const originalFoundCount = foundIds.length;
          const originalLostCount = lostIds.length;
          
          foundIds = foundIds.filter((id: string) => !resolvedIds.has(id));
          lostIds = lostIds.filter((id: string) => !resolvedIds.has(id));
          
          console.log('[agent/send] ✅ FILTERED RESOLVED CASES:', {
            resolvedCasesFound: resolvedIds.size,
            foundIds: { original: originalFoundCount, filtered: foundIds.length, removed: originalFoundCount - foundIds.length },
            lostIds: { original: originalLostCount, filtered: lostIds.length, removed: originalLostCount - lostIds.length }
          });
        }
      } catch (error) {
        console.error('[agent/send] Error filtering resolved cases:', error);
        // Continue with original IDs if filtering fails
      }
    }
    
    console.log('[agent/send] 🔍 CRITICAL DEBUG:', {
      foundIds,
      lostIds,
      foundIdsLength: foundIds.length,
      lostIdsLength: lostIds.length,
      willNotify: lostIds.length > 0
    });
    
    // Fire-and-forget: trigger unresolved case notification emails when lost item IDs are present
    if (Array.isArray(lostIds) && lostIds.length > 0) {
      (async () => {
        try {
          // Get the foundCaseId from the most recent FOUND case created in this session
          // If multiple found items, we use the first one (most recent)
          const foundCaseId = Array.isArray(foundIds) && foundIds.length > 0 ? foundIds[0] : undefined;
          
          const payload = {
            ids: lostIds,
            foundCaseId: foundCaseId, // Add the found case ID
            finder: {
              name: clerk_name,
              email: clerk_email,
              id: clerk_id,
            },
          };
          console.log('[agent/send] notify-unresolved payload (redacted email):', {
            idsCount: lostIds.length,
            foundCaseId,
            finder: { name: clerk_name, email: clerk_email ? `${clerk_email.substring(0,3)}***` : undefined, id: clerk_id }
          });
          const notifyRes = await fetch(`${APP_URL}/api/cases/notify-unresolved`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          let notifyJson: any = {};
          try { notifyJson = await notifyRes.json(); } catch {}
          console.log('[agent/send] notify-unresolved', {
            status: notifyRes.status,
            sent: notifyJson?.sent,
            failed: notifyJson?.failed,
            processed: notifyJson?.processed,
          });
        } catch (err) {
          console.error('[agent/send] notify-unresolved trigger failed', err);
        }
      })();
    }
    
    // Return the response with filtered IDs
    const filteredResponse = {
      ...json,
      found_items_ids: foundIds,
      lost_items_ids: lostIds
    };

    return NextResponse.json(filteredResponse, { status: res.status });
  } catch (e) {
    console.error('Agent proxy error:', e);
    return NextResponse.json({ error: 'Agent proxy failed' }, { status: 500 });
  }
}