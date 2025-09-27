import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '../../../../lib/mongodb';
import Case from '../../../../models/Case';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ids: string[] = body?.ids || [];
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 });
    }

    await connectDB();

    // Fetch cases by IDs, newest first
    // Normalize and validate ids to ObjectId[]
    const strIds = ids.map((x: any) => String(x)).filter(Boolean);
    console.log('[cases/by-ids] incoming ids', strIds);
    const validObjectIds = strIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));
    console.log('[cases/by-ids] validObjectIds length', validObjectIds.length);

    if (validObjectIds.length === 0) {
      return NextResponse.json({ cases: [] });
    }

    let docs = await (Case as any)
      .find({ _id: { $in: validObjectIds } })
      .sort({ createdAt: -1 })
      .lean();
    console.log('[cases/by-ids] fetched docs (primary mongoose)', docs?.length, 'db=', (mongoose.connection as any)?.name);

    // Fallback: if none found, try querying the explicit DB/collection that the Python server uses
    if (!docs || docs.length === 0) {
      const fallbackDbName = process.env.MONGODB_DB || 'loss_and_found';
      try {
        const fallbackDb = mongoose.connection.useDb(fallbackDbName, { noListener: true });
        const raw = await fallbackDb.collection('cases').find({ _id: { $in: validObjectIds } }).sort({ createdAt: -1 }).toArray();
        console.log('[cases/by-ids] fallback query db=', fallbackDbName, 'found=', raw?.length);
        docs = raw as any[];
      } catch (e) {
        console.log('[cases/by-ids] fallback failed', e);
      }
    }

    // Preserve the incoming order if desired; otherwise keep sort by createdAt
    // const orderMap = new Map(ids.map((id, i) => [id, i]));
    // docs.sort((a: any, b: any) => (orderMap.get(String(a._id)) ?? 0) - (orderMap.get(String(b._id)) ?? 0));

    // Normalize image paths for frontend: ensure strings like 'found/xyz.jpg' are preserved
    const normalized = (docs || []).map((d: any) => ({
      ...d,
      images: Array.isArray(d?.images) ? d.images.map((p: any) => String(p)) : []
    }));

    return NextResponse.json({ cases: normalized });
  } catch (e) {
    console.error('[cases/by-ids] error', e);
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
  }
}


