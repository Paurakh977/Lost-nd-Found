import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Basic health info
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            version: process.env.npm_package_version || 'unknown',
        };

        return NextResponse.json(healthData, {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            {
                status: 503,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}

// Ensureit is accible  without authentication
export const runtime = 'nodejs'; 