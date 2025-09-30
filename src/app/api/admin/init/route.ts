import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '../../../../lib/seedAdmin';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting admin initialization...');
    console.log('MongoDB URI:', process.env.MONGODB_URI?.replace(/:([^@]+)@/, ':****@')); // Mask password
    
    await initializeDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      adminEmail: process.env.ADMIN_EMAIL || 'admin@gotus.com'
    });
    
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Checking admin initialization...');
    
    await initializeDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'Database initialization check completed',
      adminEmail: process.env.ADMIN_EMAIL || 'admin@gotus.com'
    });
    
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
