import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getJWTFromRequest, verifyJWT } from '../../../../lib/jwt';

const AGENT_URL = process.env.AGENT_SERVER_URL || process.env.NEXT_PUBLIC_AGENT_SERVER_URL || 'http://localhost:8000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mime_type, data, attachments, session_id } = body || {};

    // Resolve identity from custom JWT first (admins/officers/institutional)
    let clerk_id: string | undefined;
    let clerk_name: string | undefined;
    let auth_token: string | undefined;
    let clerk_email: string | undefined;

    const token = getJWTFromRequest(req);
    if (token) {
      const payload = await verifyJWT(token);
      if (payload) {
        auth_token = token;
        clerk_id = payload.userId;
        const first = (payload as any).firstName || '';
        const last = (payload as any).lastName || '';
        clerk_name = `${first} ${last}`.trim() || payload.email || 'User';
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
        // Include Clerk session token if needed downstream (opaque)
        // Note: We avoid exposing cookies; FastAPI doesn't need to verify this token right now
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
    console.log('[agent/send] inbound', { status: res.status, success: json?.success, found_items_ids: json?.found_items_ids, author: json?.author });
    return NextResponse.json(json, { status: res.status });
  } catch (e) {
    console.error('Agent proxy error:', e);
    return NextResponse.json({ error: 'Agent proxy failed' }, { status: 500 });
  }
}


