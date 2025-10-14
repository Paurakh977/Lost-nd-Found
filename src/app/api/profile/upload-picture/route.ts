import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { getJWTFromRequest, verifyJWT } from '../../../../lib/jwt';

/**
 * POST /api/profile/upload-picture
 * 
 * Upload or update profile picture for JWT authenticated users only.
 * Clerk users cannot use this endpoint as their profile images come from Clerk API.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Step 1: Verify JWT authentication (reject Clerk users)
    const token = getJWTFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Only JWT users can upload profile pictures.' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired authentication token' },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // Step 2: Fetch user from database
    const user = await User.findById(userId).select('-password');
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'User not found or inactive' },
        { status: 404 }
      );
    }

    // Step 3: Parse form data
    const formData = await request.formData();
    const file: File | null = formData.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Step 4: Validate file type (only images)
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    // Step 5: Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 2MB limit' },
        { status: 400 }
      );
    }

    // Step 6: Setup upload directory
    const uploadDir = join(process.cwd(), 'uploads', 'profile');
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Step 7: Delete old profile image if exists
    if (user.profileImage) {
      const oldImagePath = join(process.cwd(), 'uploads', 'profile', user.profileImage);
      if (existsSync(oldImagePath)) {
        try {
          await unlink(oldImagePath);
          console.log(`[Profile Upload] Deleted old image: ${oldImagePath}`);
        } catch (error) {
          console.error(`[Profile Upload] Failed to delete old image:`, error);
          // Continue even if deletion fails
        }
      }
    }

    // Step 8: Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filename = `${userId}-${timestamp}.${fileExtension}`;
    const filepath = join(uploadDir, filename);

    // Step 9: Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    console.log(`[Profile Upload] File saved: ${filepath}`);

    // Step 10: Update user document with new profile image filename
    user.profileImage = filename;
    await user.save();

    console.log(`[Profile Upload] Updated user ${userId} profile image to: ${filename}`);

    return NextResponse.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profileImage: filename,
      imageUrl: `/api/profile/image/${filename}`
    });

  } catch (error) {
    console.error('[Profile Upload] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload profile picture' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/upload-picture
 * 
 * Delete profile picture and revert to initials
 */
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    // Verify JWT authentication
    const token = getJWTFromRequest(request);
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired authentication token' },
        { status: 401 }
      );
    }

    const userId = payload.userId;

    // Fetch user from database
    const user = await User.findById(userId).select('-password');
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'User not found or inactive' },
        { status: 404 }
      );
    }

    // Delete profile image file if exists
    if (user.profileImage) {
      const imagePath = join(process.cwd(), 'uploads', 'profile', user.profileImage);
      if (existsSync(imagePath)) {
        try {
          await unlink(imagePath);
          console.log(`[Profile Upload] Deleted image: ${imagePath}`);
        } catch (error) {
          console.error(`[Profile Upload] Failed to delete image:`, error);
        }
      }

      // Update user document
      user.profileImage = undefined;
      await user.save();

      console.log(`[Profile Upload] Removed profile image for user ${userId}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Profile picture deleted successfully'
    });

  } catch (error) {
    console.error('[Profile Upload] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete profile picture' },
      { status: 500 }
    );
  }
}
