import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@elsesourav/database';

export const dynamic = 'force-dynamic';

const searchService = new SearchService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json(
        { query: '', results: [], grouped: {}, totalCount: 0 },
        {
          status: 200,
          headers: { 'Cache-Control': 'private, no-store' },
        }
      );
    }

    const response = await searchService.search(query);

    return NextResponse.json(response, {
      status: 200,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch {
    return NextResponse.json(
      { query: '', results: [], grouped: {}, totalCount: 0, error: 'Search failed' },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }
}
