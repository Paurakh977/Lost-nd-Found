import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { getJWTFromRequest, verifyJWT } from '../../../../lib/jwt';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get token from request
    const token = getJWTFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token provided' },
        { status: 401 }
      );
    }
    
    // Verify token
    const payload = await verifyJWT(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // Find user in database to get latest data
    const user = await User.findById(payload.userId).select('-password');
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      );
    }
    
    // Return user data
    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      department: user.department,
      institutionName: user.institutionName,
      permissions: user.permissions,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };
    
    return NextResponse.json({
      success: true,
      user: userResponse,
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
