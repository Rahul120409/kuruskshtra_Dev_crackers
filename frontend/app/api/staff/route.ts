import { NextResponse } from 'next/server';

const CANDIDATE_BACKEND_HOSTS = [
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.137.199:8081',
  'http://localhost:8081',
  'http://127.0.0.1:8081',
  'http://192.168.137.162:8081',
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
