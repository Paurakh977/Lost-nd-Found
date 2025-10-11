import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';

/**
 * GET /api/officers/by-location
 * 
 * Returns active officers filtered by district and municipality
 * Query params: district, municipality
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const municipality = searchParams.get('municipality');

    if (!district || !municipality) {
      return NextResponse.json(
        { success: false, error: 'District and municipality are required' },
        { status: 400 }
      );
    }

    // Build query for officers in the specified location
    const query = {
      role: 'officer',
      isActive: true,
      'address.district': district,
      'address.municipality': municipality
    };

    const officers = await User.find(query)
      .select('firstName lastName email department address')
      .sort({ firstName: 1, lastName: 1 })
      .lean();

    // Transform officers to include id field
    const transformedOfficers = officers.map(officer => ({
      _id: officer._id,
      firstName: officer.firstName,
      lastName: officer.lastName,
      email: officer.email,
      department: officer.department,
      address: officer.address
    }));

    return NextResponse.json({
      success: true,
      officers: transformedOfficers,
      count: transformedOfficers.length
    });

  } catch (error) {
    console.error('[Officers by Location] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch officers' },
      { status: 500 }
    );
  }
}
