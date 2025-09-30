import { NextRequest } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';

function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const resolvedParams = await params;
    const segments = resolvedParams.path || [];
    // Prevent path traversal
    if (segments.some(seg => seg.includes('..') || seg.includes(':') || seg.startsWith('/'))) {
      return new Response('Bad path', { status: 400 });
    }

    const uploadsRoot = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadsRoot, ...segments);
    const data = await fs.readFile(filePath);
    const contentType = getContentType(filePath);
    return new Response(data, { status: 200, headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000, immutable' } });
  } catch (e) {
    console.error('[uploads route] error', e);
    return new Response('Not Found', { status: 404 });
  }
}


