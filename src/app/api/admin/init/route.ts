import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '../../../../lib/seedAdmin';

export async function POST(request: NextRequest) {
  try {
    // In production, you might want to add some protection here
    // For now, allow initialization if no auth is present
    
    await initializeDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
    });
    
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'Database initialization check completed',
    });
    
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
