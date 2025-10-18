import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Conversation from '../../../../models/Conversation';
import Message from '../../../../models/Message';
import { getJWTFromRequest, verifyJWT } from '../../../../lib/jwt';
import mongoose from 'mongoose';
import { getProfile } from '../../../../lib/user-utils';

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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const { conversationId } = await params;
    await connectDB();

    const conv: any = await Conversation.findById(conversationId).lean();
    if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Fetch messages (last 100)
    const msgs = await Message.find({ conversationId: new mongoose.Types.ObjectId(conversationId) })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    // Attach participant profiles
    const withProfiles = await Promise.all((conv.participants || []).map(async (p: any) => ({
      ...p,
      profile: await getProfile(p.userId, p.userType)
    })));
    conv.participants = withProfiles;

    return NextResponse.json({ success: true, conversation: conv, messages: msgs });
  } catch (e) {
    console.error('[conversations/:id] GET error', e);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}
