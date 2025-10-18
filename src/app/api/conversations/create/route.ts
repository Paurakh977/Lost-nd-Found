import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Conversation from '../../../../models/Conversation';
import { getJWTFromRequest, verifyJWT } from '../../../../lib/jwt';

function inferUserType(id: string): 'clerk' | 'jwt' {
  // ObjectId -> jwt, otherwise clerk
  return /^[0-9a-fA-F]{24}$/.test(id) ? 'jwt' : 'clerk';
}

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

export async function POST(req: NextRequest) {
  try {
    const me = await resolveCurrentUser(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { participantId, caseId, role } = body || {};
    if (!participantId || !role) {
      return NextResponse.json({ error: 'participantId and role are required' }, { status: 400 });
    }

    await connectDB();

    const otherType = inferUserType(String(participantId));

    // Find existing conversation (order-agnostic), optionally by caseId
    const query: any = {
      $and: [
        { 'participants.userId': me.id },
        { 'participants.userId': String(participantId) }
      ]
    };
    if (caseId && /^[0-9a-fA-F]{24}$/.test(caseId)) {
      query.caseId = caseId;
    }

    let conv = await Conversation.findOne(query).lean();
    if (!conv) {
      conv = await (await Conversation.create({
        participants: [
          { userId: me.id, userType: me.type, role: role === 'officer' ? 'user' : 'user' },
          { userId: String(participantId), userType: otherType, role: role }
        ],
        caseId: caseId && /^[0-9a-fA-F]{24}$/.test(caseId) ? caseId : undefined,
        unreadCount: { [String(participantId)]: 0, [me.id]: 0 }
      })).toObject();
    }

    return NextResponse.json({ success: true, conversation: conv });
  } catch (e: any) {
    console.error('[conversations/create] error', e);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
