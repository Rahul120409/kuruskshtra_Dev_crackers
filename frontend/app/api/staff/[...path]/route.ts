import { NextResponse } from 'next/server';

const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL || '').replace(/\/$/, '');

async function fetchFromBackend(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = `${BACKEND_BASE}${endpoint}`;
  return fetch(url, options);
}

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const url = new URL(req.url);
    const search = url.search; // preserves ?status=...
    const endpoint = `/api/staff/${path.join('/')}${search}`;
    console.log(`💈 [API PROXY: GET] Forwarding to backend: ${endpoint}`);

    const res = await fetchFromBackend(endpoint, {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error('❌ [API PROXY: GET /api/staff/*] Error:', err?.message || err);
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

export async function PUT(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const endpoint = `/api/staff/${path.join('/')}`;
    const body = await req.json();
    console.log(`💈 [API PROXY: PUT] Forwarding to backend: ${endpoint}`, body);

    const res = await fetchFromBackend(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error('❌ [API PROXY: PUT /api/staff/*] Error:', err?.message || err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to update staff on backend',
      },
      { status: 502 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const endpoint = `/api/staff/${path.join('/')}`;
    console.log(`💈 [API PROXY: DELETE] Forwarding to backend: ${endpoint}`);

    const res = await fetchFromBackend(endpoint, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error('❌ [API PROXY: DELETE /api/staff/*] Error:', err?.message || err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to delete staff on backend',
      },
      { status: 502 }
    );
  }
}
