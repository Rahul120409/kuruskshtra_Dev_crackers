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
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${host}${endpoint}`, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok || res.status === 201) {
        return res;
      }
      lastError = new Error(`HTTP ${res.status} from ${host}`);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('All backend hosts unreachable');
}

export async function GET() {
  try {
    const res = await fetchFromBackend('/api/salons', {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Server-side GET /api/salons error:', err?.message);
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
    const res = await fetchFromBackend('/api/salons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error('Server-side POST /api/salons error:', err?.message);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to create salon on backend',
      },
      { status: 502 }
    );
  }
}
