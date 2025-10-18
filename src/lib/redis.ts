import { createClient } from 'redis';

const url = process.env.REDIS_URL;

if (!url) {
  console.warn('[redis] REDIS_URL is not set. Real-time messaging will not function until it is configured.');
}

export const publisher = createClient({ url });
export const subscriber = createClient({ url });

let connected = false;

export async function ensureRedisConnected() {
  if (connected) return;
  try {
    if (!publisher.isOpen) await publisher.connect();
    if (!subscriber.isOpen) await subscriber.connect();
    connected = true;
    console.log('[redis] connected');
  } catch (err) {
    console.error('[redis] connection error:', err);
  }
}

export const CHAT_CHANNEL = 'chat_messages';
