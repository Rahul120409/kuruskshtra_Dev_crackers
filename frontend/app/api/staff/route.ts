import { NextResponse } from 'next/server';

const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL || '').replace(/\/$/, '');

async function fetchFromBackend(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = `${BACKEND_BASE}${endpoint}`;
  return fetch(url, options);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.search; // preserves ?salonId=...
    const endpoint = `/api/staff${search}`;
    console.log(`💈 [API PROXY: GET /api/staff] Forwarding to backend: ${endpoint}`);

    const res = await fetchFromBackend(endpoint, {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error('❌ [API PROXY: GET /api/staff] Error:', err?.message || err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to fetch staff data from backend',
        data: [],
      },
      { status: 502 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const endpoint = `/api/staff`;
    const body = await req.json();
    console.log(`💈 [API PROXY: POST /api/staff] Forwarding to backend: ${endpoint}`, body);

    const res = await fetchFromBackend(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error('❌ [API PROXY: POST /api/staff] Error:', err?.message || err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to create staff on backend',
      },
      { status: 502 }
    );
  }
}
