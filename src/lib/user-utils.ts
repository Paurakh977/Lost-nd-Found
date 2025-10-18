import { clerkClient } from '@clerk/nextjs/server';
import User from '../models/User';

export interface ProfileInfo {
  name: string;
  imageUrl: string;
}

const clerkCache = new Map<string, { data: ProfileInfo; expiresAt: number }>();
const TTL_MS = 5 * 60 * 1000;

export async function getProfile(userId: string, userType: 'clerk' | 'jwt'): Promise<ProfileInfo> {
  try {
    if (userType === 'clerk') {
      const cached = clerkCache.get(userId);
      const now = Date.now();
      if (cached && cached.expiresAt > now) return cached.data;

      console.log(`[getProfile] Fetching Clerk user: ${userId}`);
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      console.log(`[getProfile] Clerk user fetched successfully:`, {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        hasImage: !!user.imageUrl
      });
      const data = {
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || (user.username || 'User'),
        imageUrl: user.imageUrl || '/default-avatar.png'
      };
      clerkCache.set(userId, { data, expiresAt: now + TTL_MS });
      return data;
    }

    // jwt
    const u = await User.findById(userId).select('firstName lastName email profileImage').lean();
    if (u) {
      return {
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'User',
        imageUrl: u.profileImage ? `/api/profile/image/${u.profileImage}` : '/default-avatar.png'
      };
    }
    return { name: 'User', imageUrl: '/default-avatar.png' };
  } catch (e) {
    console.error(`[getProfile] Error fetching profile for userId=${userId}, userType=${userType}:`, e);
    return { name: 'User', imageUrl: '/default-avatar.png' };
  }
}
