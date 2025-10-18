import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Conversation from '../../../../../models/Conversation';
import Message from '../../../../../models/Message';
import mongoose from 'mongoose';
import { getJWTFromRequest, verifyJWT } from '../../../../../lib/jwt';

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const me = await resolveCurrentUser(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { conversationId } = await params;
    await connectDB();

    const conv: any = await Conversation.findById(conversationId).lean();
    if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    const isParticipant = conv.participants?.some((p: any) => String(p.userId) === me.id);
    if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Mark all messages from others as read
    await Message.updateMany(
      {
        conversationId: new mongoose.Types.ObjectId(conversationId),
        senderId: { $ne: me.id },
        isRead: false
      },
      { $set: { isRead: true } }
    );

    // Reset unread counter for current user
    await Conversation.updateOne(
      { _id: new mongoose.Types.ObjectId(conversationId) },
      { $set: { [`unreadCount.${me.id}`]: 0 } }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[conversations/:id/read] PATCH error', e);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}
