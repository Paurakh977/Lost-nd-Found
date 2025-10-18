import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import Conversation from '../../../../../models/Conversation';
import Message from '../../../../../models/Message';
import { getJWTFromRequest, verifyJWT } from '../../../../../lib/jwt';
import mongoose from 'mongoose';
import { publisher, CHAT_CHANNEL, ensureRedisConnected } from '../../../../../lib/redis';
import { getProfile } from '../../../../../lib/user-utils';
import { createChatNotification } from '../../../../../lib/notification-utils';

async function resolveCurrentUser(req: NextRequest): Promise<{ id: string; type: 'clerk' | 'jwt'; name: string } | null> {
  const token = getJWTFromRequest(req as any);
  if (token) {
    const payload = await verifyJWT(token);
    if (payload?.userId) {
      return { id: String(payload.userId), type: 'jwt', name: `${payload.firstName} ${payload.lastName}`.trim() || payload.email };
    }
  }
  const { auth, currentUser } = await import('@clerk/nextjs/server');
  const { userId } = await auth();
  if (userId) {
    const cu = await currentUser();
    return { id: userId, type: 'clerk', name: `${cu?.firstName || ''} ${cu?.lastName || ''}`.trim() || cu?.username || 'User' };
  }
  return null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const me = await resolveCurrentUser(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { conversationId } = await params;
    const body = await req.json();
    const { content } = body || {};
    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 });
    }

    await connectDB();

    const conv: any = await Conversation.findById(conversationId).lean();
    if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    const isParticipant = conv.participants?.some((p: any) => String(p.userId) === me.id);
    if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Create message
    const msg = await Message.create({
      conversationId: new mongoose.Types.ObjectId(conversationId),
      senderId: me.id,
      senderType: conv.participants.find((p: any) => String(p.userId) === me.id)?.userType || 'clerk',
      content: content.trim(),
      isRead: false
    });

    // Update conversation lastMessage and unread counts
    const recipients = (conv.participants || []).filter((p: any) => String(p.userId) !== me.id);
    const unreadUpdate: Record<string, number> = {};
    for (const r of recipients) {
      const prev = (conv.unreadCount && conv.unreadCount[r.userId]) || 0;
      unreadUpdate[r.userId] = prev + 1;
    }

    await Conversation.updateOne(
      { _id: new mongoose.Types.ObjectId(conversationId) },
      {
        $set: {
          lastMessage: { content: content.trim(), sentAt: new Date(), senderId: me.id },
          updatedAt: new Date()
        },
        $inc: Object.fromEntries(Object.entries(unreadUpdate).map(([k, v]) => [[`unreadCount.${k}`], v]))
      }
    );

    // Publish to Redis for real-time delivery
    await ensureRedisConnected();
    const payload = {
      conversationId,
      message: {
        _id: String(msg._id),
        conversationId,
        senderId: me.id,
        senderType: conv.participants.find((p: any) => String(p.userId) === me.id)?.userType || 'clerk',
        content: content.trim(),
        isRead: false,
        createdAt: msg.createdAt
      },
      recipients: recipients.map((r: any) => r.userId)
    };
    await publisher.publish(CHAT_CHANNEL, JSON.stringify(payload));

    // Create officer notification for recipients who are JWT officers
    try {
      for (const r of recipients) {
        if (r.userType === 'jwt' && r.role === 'officer') {
          await createChatNotification({
            recipientOfficerId: r.userId,
            senderId: me.id,
            senderName: me.name,
            conversationId,
            messagePreview: content.trim()
          });
        }
      }
    } catch {}

    // Include sender profile for convenience
    const senderProf = await getProfile(me.id, (payload.message as any).senderType);
    return NextResponse.json({ success: true, message: { ...(payload.message as any), senderProfile: senderProf } });
  } catch (e) {
    console.error('[conversations/:id/messages] POST error', e);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
