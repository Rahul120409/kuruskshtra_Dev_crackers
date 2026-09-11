import { NextResponse } from 'next/server';

const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL || '').replace(/\/$/, '');

async function fetchFromBackend(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = `${BACKEND_BASE}${endpoint}`;
  return fetch(url, options);
}

export async function GET() {
  console.log('🖥️ [NEXT ROUTE: GET /api/salons] Fetching salons from backend...');
  try {
    const res = await fetchFromBackend('/api/salons', {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    const count = data?.data ? (Array.isArray(data.data) ? data.data.length : 1) : (Array.isArray(data) ? data.length : 0);
    console.log(`🖥️ [NEXT ROUTE: GET /api/salons] Successfully retrieved ${count} salons from backend (HTTP ${res.status})`);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('❌ [NEXT ROUTE: GET /api/salons] Backend error:', err?.message);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Could not fetch salons from backend',
        data: [],
      },
      { status: 502 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('🖥️ [NEXT ROUTE: POST /api/salons] Received salon to save in DB:', body);
    const res = await fetchFromBackend('/api/salons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log(`🖥️ [NEXT ROUTE: POST /api/salons] Backend returned HTTP ${res.status}:`, data);
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error('❌ [NEXT ROUTE: POST /api/salons] Failed to save salon to backend DB:', err?.message);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to create salon on backend',
      },
      { status: 502 }
    );
  }
}
