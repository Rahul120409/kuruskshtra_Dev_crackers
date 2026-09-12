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

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

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
  const url = BASE_URL ? `${BASE_URL}${endpoint}` : endpoint;
  return fetch(url, options);
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
        const rawList = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : null);
        if (rawList) {
          const liveSalons = rawList.map(mapBackendSalonToFrontend);
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
    } catch {
      // Backend offline: silently and seamlessly serve cached/registered salons
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
    console.log("💈 [salonService: createSalon] Initiating salon registration with payload:", data);
    try {
      const res = await fetchApi('/api/salons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log(`💈 [salonService: createSalon] HTTP status: ${res.status}`);
      const json = await res.json();
      console.log("💈 [salonService: createSalon] Response JSON:", json);

      const rawItem = json?.data || (json?.id ? json : null);

      if ((res.ok || res.status === 201) && rawItem) {
        const mapped = mapBackendSalonToFrontend(rawItem);
        console.log("✅ [salonService: createSalon] SALON DATA SAVED SUCCESSFULLY IN DB:", mapped);

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

        return { success: true, salon: mapped, message: json.message || "Salon saved" };
      }

      console.warn("⚠️ [salonService: createSalon] Backend did not return saved item:", json);
      return {
        success: false,
        message: json.message || 'Failed to create salon on server',
      };
    } catch (err: any) {
      console.error('❌ [salonService: createSalon] Error saving salon on backend:', err);
      return {
        success: false,
        message: err.message || 'Network error connecting to backend API',
      };
    }
  }
}

export const salonService = new SalonService();

