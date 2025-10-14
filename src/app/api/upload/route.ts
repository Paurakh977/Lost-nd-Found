import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const type: string | null = data.get('type') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Determine upload directory based on type
    let uploadDir: string;
    switch (type) {
      case 'evidence':
        uploadDir = join(process.cwd(), 'uploads', 'evidence');
        break;
      case 'found':
        uploadDir = join(process.cwd(), 'uploads', 'found');
        break;
      case 'lost':
        uploadDir = join(process.cwd(), 'uploads', 'lost');
        break;
      default:
        uploadDir = join(process.cwd(), 'uploads', 'tmp');
    }

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `uploaded_image_${timestamp}_${randomString}.${fileExtension}`;
    
    const filepath = join(uploadDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    console.log(`[Upload] File saved: ${filepath}`);

    return NextResponse.json({
      success: true,
      filename,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('[Upload] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
