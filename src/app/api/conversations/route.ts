import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Conversation from '../../../models/Conversation';
import Message from '../../../models/Message';
import { getJWTFromRequest, verifyJWT } from '../../../lib/jwt';
import { getProfile } from '../../../lib/user-utils';

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

    const conversations = await Conversation
      .find({ 'participants.userId': me.id })
      .sort({ updatedAt: -1 })
      .lean();

    // Attach display profiles for the "other" participant
    const enriched = await Promise.all(conversations.map(async (c: any) => {
      const other = c.participants.find((p: any) => String(p.userId) !== me.id);
      if (other) {
        const prof = await getProfile(other.userId, other.userType);
        c.otherParticipant = { ...other, profile: prof };
      }
      return c;
    }));

    // Get last message per conversation
    const convIds = enriched.map((c: any) => c._id);
    const lastMsgs = await Message.aggregate([
      { $match: { conversationId: { $in: convIds } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$conversationId', last: { $first: '$$ROOT' } } }
    ]);
    const lastMap = new Map<string, any>(lastMsgs.map((x: any) => [String(x._id), x.last]));

    const withLast = enriched.map((c: any) => ({
      ...c,
      lastMessage: c.lastMessage || lastMap.get(String(c._id)) || null,
      unread: (c.unreadCount && c.unreadCount[me.id]) || 0
    }));

    return NextResponse.json({ success: true, conversations: withLast });
  } catch (e) {
    console.error('[conversations] GET error', e);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
