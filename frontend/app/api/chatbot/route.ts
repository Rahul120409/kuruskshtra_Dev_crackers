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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || url.searchParams.get('type') || 'welcome';
    let endpoint = '/api/chatbot/welcome';
    if (action === 'services') endpoint = '/api/chatbot/services';
    if (action === 'salons') endpoint = '/api/chatbot/salons';

    console.log(`🤖 [NEXT ROUTE: GET /api/chatbot] Fetching ${action} from backend (${endpoint})...`);
    const res = await fetchFromBackend(endpoint, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('❌ [NEXT ROUTE: GET /api/chatbot] Backend error:', err?.message);
    return NextResponse.json({
      success: true,
      message: {
        id: `welcome_${Date.now()}`,
        sender: 'bot',
        text: "👋 Hello! I am your **SalonFlow Concierge**.\n\nI can help you locate **nearby partner suites by Pincode**, check **live wait times & queue numbers**, explore **hair & beard styles**, or **reserve your slot**.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: [
          { id: 'opt_nearby', label: '📍 Nearby Salons (Pincode)', action: 'FLOW_NEARBY' },
          { id: 'opt_wait', label: '⏱️ Live Wait Times & Queue', action: 'FLOW_WAIT_TIMES' },
          { id: 'opt_book', label: '📅 Book an Appointment', action: 'FLOW_NEARBY' },
          { id: 'opt_ai_studio', label: '✨ Launch AI Studio', action: 'NAV_AI_STUDIO' }
        ]
      },
      source: 'Frontend Fallback'
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('🤖 [NEXT ROUTE: POST /api/chatbot] Forwarding message to backend:', body?.action || body?.message);

    const res = await fetchFromBackend('/api/chatbot/message', {
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
    console.error('❌ [NEXT ROUTE: POST /api/chatbot] Backend error:', err?.message);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Chatbot backend processing failed',
      },
      { status: 502 }
    );
  }
}
