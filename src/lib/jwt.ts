import { SignJWT, jwtVerify } from 'jose';
import { UserRole } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Convert string secret to Uint8Array for jose
const getSecretKey = () => new TextEncoder().encode(JWT_SECRET);

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  iat?: number;
  exp?: number;
}

export async function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  try {
    const secretKey = getSecretKey();
    
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRES_IN)
      .sign(secretKey);
  } catch (error) {
    console.error('JWT signing failed:', error);
    throw new Error('Failed to sign JWT');
  }
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const secretKey = getSecretKey();
    
    const { payload } = await jwtVerify(token, secretKey);
    
    // Validate that the payload has the required fields
    if (
      typeof payload.userId === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.role === 'string' &&
      typeof payload.firstName === 'string' &&
      typeof payload.lastName === 'string'
    ) {
      return payload as unknown as JWTPayload;
    }
    
    return null;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export async function refreshJWT(token: string): Promise<string | null> {
  try {
    const secretKey = getSecretKey();
    
    // Verify the token without checking expiration manually
    const { payload } = await jwtVerify(token, secretKey, {
      // Don't check expiration time for refresh
    });
    
    // Create new token with fresh expiration
    const newPayload = {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
    };
    
    return await signJWT(newPayload);
  } catch (error) {
    console.error('JWT refresh failed:', error);
    return null;
  }
}

export function getJWTFromRequest(request: Request): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Try to get token from cookies
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth-token') {
        return value;
      }
    }
  }
  
  return null;
}
