import { Salon } from '../types';

export interface CreateSalonRequest {
  salonName: string;
  ownerName: string;
  phoneNumber: string;
  email: string;
  salonAddress: string;
  city: string;
  pincode: string;
  salonLogo: string;
  salonDescription: string;
  locationLink?: string;
  openingTime: string;
  closingTime: string;
}

export interface BackendSalonResponse {
  id: string;
  salonName: string;
  ownerName: string;
  phoneNumber: string;
  email: string;
  salonAddress: string;
  city: string;
  pincode: string;
  salonLogo: string;
  salonDescription: string;
  locationLink?: string | null;
  openingTime: string;
  closingTime: string;
  status: string;
  createdAt: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.137.199:8081';

function formatTimeString(timeStr?: string): string {
  if (!timeStr) return '09:00 AM';
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hour = parseInt(parts[0], 10);
    const min = parts[1].padStart(2, '0');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${min} ${ampm}`;
  }
  return timeStr;
}

function extractAreaFromAddress(address: string): string {
  if (!address) return 'Pune';
  const knownAreas = [
    'Koregaon Park',
    'Baner',
    'Viman Nagar',
    'Kalyani Nagar',
    'Aundh',
    'Kothrud',
    'Hinjawadi',
    'Wakad',
    'Shivajinagar',
    'Camp'
  ];

  for (const area of knownAreas) {
    if (new RegExp(`\\b${area}\\b`, 'i').test(address)) {
      return area;
    }
  }

  const parts = address.split(',');
  if (parts.length > 1) {
    return parts[parts.length - 2].trim();
  }
  return 'Pune';
}

function mapBackendSalonToFrontend(item: BackendSalonResponse): Salon {
  return {
    id: item.id,
    name: item.salonName,
    ownerName: item.ownerName,
    phone: item.phoneNumber,
    email: item.email,
    address: item.salonAddress,
    city: item.city || 'Pune',
    pincode: item.pincode,
    area: extractAreaFromAddress(item.salonAddress),
    imageUrl: item.salonLogo || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500',
    salonDescription: item.salonDescription,
    locationLink: item.locationLink || undefined,
    openingTime: formatTimeString(item.openingTime),
    closingTime: formatTimeString(item.closingTime),
    status: item.status === 'ACTIVE' || item.status === 'OPEN' ? 'OPEN' : 'CLOSED',
    rating: 4.9,
    reviewCount: 148,
    currentWaitMinutes: 18,
    totalWaiting: 3,
    createdAt: item.createdAt,
  };
}

const STORAGE_KEY_REGISTERED_SALONS = 'salonflow_registered_salons';
const STORAGE_KEY_CACHED_SALONS = 'salonflow_cached_salons';

function getStoredSalons(): Salon[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTERED_SALONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getCachedSalons(): Salon[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CACHED_SALONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function storeSalonsLocally(salons: Salon[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CACHED_SALONS, JSON.stringify(salons));
  } catch {
    // Ignore quota issues
  }
}

async function fetchApi(endpoint: string, options?: RequestInit): Promise<Response> {
  // In the browser, try relative path first to utilize the Next.js server proxy (zero CORS, zero PNA)
  const candidateUrls: string[] = [];
  if (typeof window !== 'undefined') {
    candidateUrls.push(''); // Relative URL e.g. /api/salons
  }

  candidateUrls.push(
    BASE_URL,
    'http://192.168.137.199:8081',
    'http://localhost:8081',
    'http://127.0.0.1:8081',
    'http://192.168.137.162:8081'
  );

  const uniqueCandidates = Array.from(new Set(candidateUrls));
  let lastError: any = null;

  for (const host of uniqueCandidates) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const url = host ? `${host}${endpoint}` : endpoint;
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok || res.status === 201) {
        return res;
      }
      lastError = new Error(`HTTP ${res.status} from ${url}`);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('All candidate backend hosts failed to connect');
}

class SalonService {
  /**
   * Real-time fetch of all salons from backend API with localStorage resilience
   */
  async getSalons(): Promise<Salon[]> {
    try {
      const res = await fetchApi('/api/salons', {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const liveSalons = json.data.map(mapBackendSalonToFrontend);
          
          // Merge with any locally registered salons by user
          const localSalons = getStoredSalons();
          const liveIds = new Set(liveSalons.map((s: Salon) => s.id));
          const merged = [
            ...liveSalons,
            ...localSalons.filter((s: Salon) => !liveIds.has(s.id)),
          ];

          storeSalonsLocally(merged);
          return merged;
        }
      }
    } catch (err) {
      console.warn('Backend salon fetch error, checking local storage cache:', err);
    }

    // Resilience fallback: Return cached/registered salons so salons never vanish
    const cached = getCachedSalons();
    const local = getStoredSalons();
    const allKnown = Array.from(
      new Map([...cached, ...local].map((s) => [s.id, s])).values()
    );

    return allKnown;
  }

  /**
   * Real-time creation of a new salon on the backend via POST /api/salons
   */
  async createSalon(data: CreateSalonRequest): Promise<{ success: boolean; salon?: Salon; message?: string }> {
    try {
      const res = await fetchApi('/api/salons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if ((res.ok || res.status === 201) && json.success && json.data) {
        const mapped = mapBackendSalonToFrontend(json.data);
        
        // Save to locally registered salons
        if (typeof window !== 'undefined') {
          try {
            const existing = getStoredSalons();
            localStorage.setItem(
              STORAGE_KEY_REGISTERED_SALONS,
              JSON.stringify([mapped, ...existing.filter((s) => s.id !== mapped.id)])
            );
          } catch (e) {
            console.error('Failed to cache registered salon locally', e);
          }
        }

        return { success: true, salon: mapped, message: json.message };
      }

      return {
        success: false,
        message: json.message || 'Failed to create salon on server',
      };
    } catch (err: any) {
      console.error('Error creating salon on backend:', err);
      return {
        success: false,
        message: err.message || 'Network error connecting to backend API',
      };
    }
  }
}

export const salonService = new SalonService();

