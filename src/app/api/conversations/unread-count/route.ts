import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Conversation from '../../../../models/Conversation';

import { getJWTFromRequest, verifyJWT } from '../../../../lib/jwt';

async function resolveCurrentUser(req: NextRequest): Promise<{ id: string; type: 'clerk' | 'jwt' } | null> {
  const token = getJWTFromRequest(req as any);
  if (token) {
    const payload = await verifyJWT(token);
    if (payload?.userId) return { id: String(payload.userId), type: 'jwt' };
  }
  const { auth } = await import('@clerk/nextjs/server');
  const { userId } = await auth();
  if (userId) return { id: userId, type: 'clerk' };
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const me = await resolveCurrentUser(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    // Faster aggregation using $getField to read dynamic key from unreadCount
    const agg = await Conversation.aggregate([
      { $match: { 'participants.userId': me.id } },
      { $project: { u: { $ifNull: [ { $getField: { field: me.id, input: '$unreadCount' } }, 0 ] } } },
      { $group: { _id: null, total: { $sum: '$u' } } }
    ]);
    const total = agg?.[0]?.total || 0;
    return NextResponse.json({ success: true, count: total });
  } catch (e) {
    console.error('[conversations/unread-count] GET error', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
