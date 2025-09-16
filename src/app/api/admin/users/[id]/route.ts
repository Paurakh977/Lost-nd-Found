import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import { getJWTFromRequest, verifyJWT } from '../../../../../lib/jwt';
import { hashPassword } from '../../../../../lib/password';

// GET - Get specific user (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    const user = await User.findById(id)
      .select('-password')
      .populate('createdBy', 'firstName lastName email');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Transform user response to include id field
    const transformedUser = {
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
    };
    
    return NextResponse.json({
      success: true,
      user: transformedUser,
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    const updateData = await request.json();
    
    console.log('Updating user:', id, 'with data:', updateData);
    
    // Find user
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Validate role-specific fields
    if (updateData.role === 'officer' && !updateData.department) {
      return NextResponse.json(
        { error: 'Department is required for officers' },
        { status: 400 }
      );
    }
    
    if (updateData.role === 'institutional' && !updateData.institutionName) {
      return NextResponse.json(
        { error: 'Institution name is required for institutional users' },
        { status: 400 }
      );
    }
    
    // Validate address fields for officers and institutional users
    if (updateData.role === 'officer' || updateData.role === 'institutional') {
      if (!updateData.address || !updateData.address.province || !updateData.address.district || !updateData.address.municipality || !updateData.address.ward) {
        return NextResponse.json(
          { error: 'Complete address information (province, district, municipality, ward) is required' },
          { status: 400 }
        );
      }
    }
    
    // Validate location for institutional users
    if (updateData.role === 'institutional') {
      if (!updateData.location || !updateData.location.latitude || !updateData.location.longitude) {
        return NextResponse.json(
          { error: 'Location coordinates (latitude, longitude) are required for institutional users' },
          { status: 400 }
        );
      }
    }
    
    // Hash password if provided
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').populate('createdBy', 'firstName lastName email');
    
    console.log('Updated user:', updatedUser);
    
    // Transform user response to include id field
    const transformedUser = {
      id: updatedUser._id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      department: updatedUser.department,
      institutionName: updatedUser.institutionName,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt,
      lastLogin: updatedUser.lastLogin,
      createdBy: updatedUser.createdBy,
      address: updatedUser.address,
      location: updatedUser.location,
    };
    
    return NextResponse.json({
      success: true,
      user: transformedUser,
      message: 'User updated successfully',
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    // Find user
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin user' },
          { status: 400 }
        );
      }
    }
    
    // Hard delete - actually remove the user from database
    await User.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
