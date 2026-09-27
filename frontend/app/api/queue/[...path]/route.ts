import { NextResponse } from 'next/server';

const CANDIDATE_BACKEND_HOSTS = [
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081',
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
];

async function fetchFromBackend(endpoint: string, options?: RequestInit): Promise<Response> {
  const hosts = Array.from(new Set(CANDIDATE_BACKEND_HOSTS));
  let lastError: any = null;

  for (const host of hosts) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${host}${endpoint}`, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return res;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('All backend hosts unreachable');
}

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const url = new URL(req.url);
    const search = url.search;
    const endpoint = `/api/queue/${path.join('/')}${search}`;
    console.log(`⏱️ [API PROXY: GET] Forwarding to backend queue API: ${endpoint}`);

    const res = await fetchFromBackend(endpoint, {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error('❌ [API PROXY: GET /api/queue/*] Error:', err?.message || err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to fetch queue data from backend',
        data: null,
      },
      { status: 502 }
    );
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const endpoint = `/api/queue/${path.join('/')}`;
    const body = await req.json();
    console.log(`⏱️ [API PROXY: POST] Forwarding to backend queue API: ${endpoint}`, body);

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
    console.error('❌ [API PROXY: POST /api/queue/*] Error:', err?.message || err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to post queue data to backend',
      },
      { status: 502 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const endpoint = `/api/queue/${path.join('/')}`;
    let body = {};
    try {
      body = await req.json();
    } catch {
      // Empty body
    }
    console.log(`⏱️ [API PROXY: PUT] Forwarding to backend queue API: ${endpoint}`, body);

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
    console.error('❌ [API PROXY: PUT /api/queue/*] Error:', err?.message || err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to update queue on backend',
      },
      { status: 502 }
    );
  }
}
