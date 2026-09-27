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

export async function GET(req: Request, context: any) {
  try {
    const resolvedParams = context?.params ? await Promise.resolve(context.params) : {};
    const rawPath = resolvedParams?.path;
    const pathSegments = Array.isArray(rawPath) ? rawPath : (rawPath ? [rawPath] : []);
    const url = new URL(req.url);
    const search = url.search;
    const endpoint = `/api/chatbot/${pathSegments.join('/')}${search}`;
    console.log(`🤖 [NEXT ROUTE: GET ${endpoint}] Forwarding to backend...`);

    const res = await fetchFromBackend(endpoint, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('❌ [NEXT ROUTE: GET /api/chatbot/[...path]] Error:', err?.message);
    return NextResponse.json({ success: false, error: err?.message }, { status: 502 });
  }
}

export async function POST(req: Request, context: any) {
  try {
    const resolvedParams = context?.params ? await Promise.resolve(context.params) : {};
    const rawPath = resolvedParams?.path;
    const pathSegments = Array.isArray(rawPath) ? rawPath : (rawPath ? [rawPath] : []);
    const endpoint = `/api/chatbot/${pathSegments.join('/')}`;
    const body = await req.json();
    console.log(`🤖 [NEXT ROUTE: POST ${endpoint}] Forwarding to backend...`);

    const res = await fetchFromBackend(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('❌ [NEXT ROUTE: POST /api/chatbot/[...path]] Error:', err?.message);
    return NextResponse.json({ success: false, error: err?.message }, { status: 502 });
  }
}
