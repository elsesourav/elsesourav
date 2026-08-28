import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: Date.now(),
    version: '2.0.0',
    platform: 'Next.js 15 App Router',
  });
}
