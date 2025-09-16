import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { getJWTFromRequest, verifyJWT } from '../../../../lib/jwt';
import { hashPassword } from '../../../../lib/password';

// GET - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get token and verify admin
    const token = getJWTFromRequest(request);
    const payload = await verifyJWT(token!);
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    
    // Verify admin user is still active
    const adminUser = await User.findById(payload.userId);
    if (!adminUser || !adminUser.isActive) {
      return NextResponse.json(
        { error: 'Admin account is inactive' },
        { status: 403 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    
    // Build query
    const query: any = {};
    if (role && role !== 'all') {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Get users with pagination
    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .select('-password')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(query);
    
    // Transform users to include id field
    const transformedUsers = users.map(user => ({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      department: user.department,
      institutionName: user.institutionName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      createdBy: user.createdBy,
      address: user.address,
      location: user.location,
    }));
    
    return NextResponse.json({
      success: true,
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Get token and verify admin
    const token = getJWTFromRequest(request);
    const payload = await verifyJWT(token!);
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    
    // Verify admin user is still active
    const adminUser = await User.findById(payload.userId);
    if (!adminUser || !adminUser.isActive) {
      return NextResponse.json(
        { error: 'Admin account is inactive' },
        { status: 403 }
      );
    }
    
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role, 
      department, 
      institutionName,
      permissions,
      address,
      location
    } = await request.json();
    
    // Validation
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (!['admin', 'officer', 'institutional'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }
    
    if (role === 'officer' && !department) {
      return NextResponse.json(
        { error: 'Department is required for officers' },
        { status: 400 }
      );
    }
    
    if (role === 'institutional' && !institutionName) {
      return NextResponse.json(
        { error: 'Institution name is required for institutional users' },
        { status: 400 }
      );
    }
    
    // Validate address fields for officers and institutional users
    if (role === 'officer' || role === 'institutional') {
      if (!address || !address.province || !address.district || !address.municipality || !address.ward) {
        return NextResponse.json(
          { error: 'Complete address information (province, district, municipality, ward) is required' },
          { status: 400 }
        );
      }
    }
    
    // Validate location for institutional users
    if (role === 'institutional') {
      if (!location || !location.latitude || !location.longitude) {
        return NextResponse.json(
          { error: 'Location coordinates (latitude, longitude) are required for institutional users' },
          { status: 400 }
        );
      }
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role,
      department: role === 'officer' ? department : undefined,
      institutionName: role === 'institutional' ? institutionName : undefined,
      permissions: permissions || [],
      address: address || undefined,
      location: location || undefined,
      createdBy: payload.userId,
    });
    
    await newUser.save();
    
    // Return user without password
    const userResponse = await User.findById(newUser._id)
      .select('-password')
      .populate('createdBy', 'firstName lastName email');
    
    // Transform user response to include id field
    const transformedUser = {
      id: userResponse._id,
      email: userResponse.email,
      firstName: userResponse.firstName,
      lastName: userResponse.lastName,
      role: userResponse.role,
      department: userResponse.department,
      institutionName: userResponse.institutionName,
      isActive: userResponse.isActive,
      createdAt: userResponse.createdAt,
      lastLogin: userResponse.lastLogin,
      createdBy: userResponse.createdBy,
      address: userResponse.address,
      location: userResponse.location,
    };
    
    return NextResponse.json({
      success: true,
      user: transformedUser,
      message: 'User created successfully',
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
