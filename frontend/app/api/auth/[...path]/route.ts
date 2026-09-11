import { NextResponse } from 'next/server';

const BACKEND_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL || '').replace(/\/$/, '');

async function fetchFromBackend(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = `${BACKEND_BASE}${endpoint}`;
  return fetch(url, options);
}

export async function POST(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const endpoint = `/api/auth/${path.join('/')}`;
    const body = await req.json();

    const res = await fetchFromBackend(endpoint, {
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
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Authentication error connecting to backend',
      },
      { status: 502 }
    );
  }
}
