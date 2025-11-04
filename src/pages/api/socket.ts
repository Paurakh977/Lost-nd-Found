import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';
import { ensureRedisConnected, subscriber, CHAT_CHANNEL } from '../../lib/redis';

// Attach Socket.io to Next's internal Node server and set up Redis relay
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const anyRes: any = res as any;
  const server = anyRes.socket?.server;

  if (!server) {
    return res.status(500).json({ ok: false, error: 'Socket server not available' });
  }

  // Initialize Socket.io once per server instance
  if (!server.io) {
    const io = new IOServer(server, {
      path: '/socket.io/',
      cors: { origin: process.env.NEXT_PUBLIC_APP_URL || '*' }
    });

    server.io = io;

    // Redis subscription relay (initialize once)
    if (!globalThis.__redisRelayInitialized) {
      try {
        await ensureRedisConnected();
        await subscriber.subscribe(CHAT_CHANNEL, (raw: string) => {
          try {
            const data = JSON.parse(raw);
            if (!data?.conversationId || !data?.message) return;

            // Emit message to conversation room
            io.to(String(data.conversationId)).emit('new_message', data.message);

            // Unread badge updates per recipient
            if (Array.isArray(data.recipients)) {
              data.recipients.forEach((uid: string) => {
                io.to(`user:${uid}`).emit('update_unread', { conversationId: data.conversationId });
              });
            }
          } catch (e) {
            console.error('[socket] failed to parse redis message', e);
          }
        });
        // Flag to avoid duplicate subscriptions during dev hot reloads
        (globalThis as any).__redisRelayInitialized = true;
        console.log('[socket] Redis relay initialized');
      } catch (err) {
        console.error('[socket] Redis subscription setup error:', err);
      }
    }

    // Socket events
    io.on('connection', (socket) => {
      // Client registers user room for unread counts
      socket.on('register_user', (userId: string) => {
        if (typeof userId === 'string' && userId) {
          socket.join(`user:${userId}`);
        }
      });

      socket.on('join_conversation', (payload: any) => {
        try {
          const { conversationId } = payload || {};
          if (!conversationId) return;
          socket.join(String(conversationId));
        } catch (err) {
          console.error('[socket] join_conversation error', err);
        }
      });

      socket.on('leave_conversation', (conversationId: string) => {
        if (conversationId) socket.leave(String(conversationId));
      });

      socket.on('disconnect', () => {
        // no-op
      });
    });

    console.log('[socket] Socket.io initialized on path /socket.io/');
  }

  // Respond OK for bootstrap call
  res.status(200).json({ ok: true });
}

declare global {
  // Track initialization across dev hot reloads
  var __redisRelayInitialized: boolean | undefined;
}