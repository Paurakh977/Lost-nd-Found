// Custom Next.js server with Socket.io + Redis relay
const http = require('http');
const next = require('next');
const { Server } = require('socket.io');
const { createClient } = require('redis');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function bootstrap() {
  await app.prepare();

  const subscriber = createClient({ url: process.env.REDIS_URL });
  await subscriber.connect();
  const CHAT_CHANNEL = 'chat_messages';

  const server = http.createServer((req, res) => handle(req, res));
  const io = new Server(server, {
    path: '/socket.io/',
    cors: { origin: process.env.NEXT_PUBLIC_APP_URL || '*' }
  });

  // Relay Redis pub -> socket room
  subscriber.subscribe(CHAT_CHANNEL, (raw) => {
    try {
      const data = JSON.parse(raw);
      if (!data?.conversationId || !data?.message) return;
      io.to(String(data.conversationId)).emit('new_message', data.message);
      // Unread badge update
      if (Array.isArray(data.recipients)) {
        data.recipients.forEach((uid) => {
          io.to(`user:${uid}`).emit('update_unread', { conversationId: data.conversationId });
        });
      }
    } catch (e) {
      console.error('[socket] failed to parse redis message', e);
    }
  });

  io.on('connection', (socket) => {
    // Client should immediately register their user room for unread counts
    socket.on('register_user', (userId) => {
      if (typeof userId === 'string' && userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('join_conversation', (payload) => {
      try {
        const { conversationId } = payload || {};
        if (!conversationId) return;
        socket.join(String(conversationId));
      } catch (err) {
        console.error('[socket] join_conversation error', err);
      }
    });

    socket.on('leave_conversation', (conversationId) => {
      if (conversationId) socket.leave(String(conversationId));
    });

    socket.on('disconnect', () => {
      // no-op
    });
  });

  server.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.io enabled on path /socket.io/`);
    console.log(`> Redis connected: ${process.env.REDIS_URL ? 'Yes' : 'No (set REDIS_URL)'}`);
  });
}

bootstrap().catch((e) => {
  console.error('Failed to bootstrap server', e);
  process.exit(1);
});
