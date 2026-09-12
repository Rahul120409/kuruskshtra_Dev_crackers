import { getApiBaseUrl } from './apiConfig';

export type StaffStatus = 'AVAILABLE' | 'BUSY' | 'BREAK' | 'OFFLINE';

export interface StaffRequest {
  salonId: string;
  userId?: string;
  name: string;
  email?: string;
  phone: string;
  specialization: string;
  status?: StaffStatus;
  experienceYears?: number;
  profileImage?: string;
}

export interface StaffResponse {
  id: string;
  salonId: string;
  userId?: string | null;
  name: string;
  email?: string | null;
  phone: string;
  specialization: string;
  status: StaffStatus;
  experienceYears?: number | null;
  profileImage?: string | null;
  createdAt?: string;
}

export interface StaffStatusRequest {
  status: StaffStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Resilient default seed data if database has not yet been seeded with staff
export const DEFAULT_STAFF: StaffResponse[] = [
  {
    id: 'staff-vikram-01',
    salonId: 'salon-pune-01',
    userId: 'd7e3a981-55bb-4a23-88cd-112233445577',
    name: 'Vikram Joshi (Master Stylist)',
    email: 'vikram.joshi@salonflow.com',
    phone: '+919876543219',
    specialization: 'Top Rated Stylist',
    status: 'AVAILABLE',
    experienceYears: 12,
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    createdAt: '2026-09-11T17:50:00',
  },
  {
    id: '89ab12cd-34ef-5678-90ab-cdef12345678',
    salonId: 'c4b2a8d5-1122-48f1-a1e6-348e89cf1862',
    userId: 'd7e3a981-55bb-4a23-88cd-112233445566',
    name: 'Alex Smith',
    email: 'alex.smith@example.com',
    phone: '+919876543210',
    specialization: 'Master Barber & Fade Specialist',
    status: 'AVAILABLE',
    experienceYears: 7,
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    createdAt: '2026-09-11T17:50:00',
  },
  {
    id: 'staff-02',
    salonId: 'c4b2a8d5-1122-48f1-a1e6-348e89cf1862',
    name: 'Marcus Vance',
    email: 'marcus.v@example.com',
    phone: '+919876543211',
    specialization: 'Executive Beard Sculptor',
    status: 'BUSY',
    experienceYears: 9,
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    createdAt: '2026-09-11T17:50:00',
  },
  {
    id: 'staff-03',
    salonId: 'c4b2a8d5-1122-48f1-a1e6-348e89cf1862',
    name: 'Elena Rostova',
    email: 'elena.r@example.com',
    phone: '+919876543212',
    specialization: 'Keratin & Scalp Therapy Lead',
    status: 'AVAILABLE',
    experienceYears: 6,
    profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    createdAt: '2026-09-11T17:50:00',
  },
  {
    id: 'staff-04',
    salonId: 'c4b2a8d5-1122-48f1-a1e6-348e89cf1862',
    name: 'Tariq Al-Mansoor',
    email: 'tariq.m@example.com',
    phone: '+919876543213',
    specialization: 'Royal Hot Lather Artisan',
    status: 'BREAK',
    experienceYears: 11,
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    createdAt: '2026-09-11T17:50:00',
  },
];

class StaffService {
  private getBaseUrl(): string {
    return getApiBaseUrl();
  }

  /**
   * 1. Get All Staff (optionally filter by salonId)
   * GET /api/staff?salonId=...
   */
  async getAllStaff(salonId?: string): Promise<StaffResponse[]> {
    const query = salonId ? `?salonId=${encodeURIComponent(salonId)}` : '';
    console.log(`💈 [staffService: getAllStaff] Querying /api/staff${query}...`);

    try {
      const res = await fetch(`${this.getBaseUrl()}/api/staff${query}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : null);
        if (items && items.length > 0) {
          console.log(`✅ [staffService: getAllStaff] Loaded ${items.length} live staff from DB:`, items);
          return items;
        }
      }
    } catch (err) {
      console.warn('⚠️ [staffService: getAllStaff] Could not fetch live staff:', err);
    }
    return [];
  }

  /**
   * 2. Get Staff by Salon ID with optional status filter
   * GET /api/staff/salon/{salonId}?status=AVAILABLE
   * If salonId is omitted or no staff is mapped specifically to this salon, queries all real staff.
   */
  async getStaffBySalon(salonId?: string, status?: StaffStatus): Promise<StaffResponse[]> {
    const isUuid = !!salonId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(salonId);

    if (isUuid) {
      const query = status ? `?status=${encodeURIComponent(status)}` : '';
      console.log(`💈 [staffService: getStaffBySalon] Querying /api/staff/salon/${salonId}${query}...`);

      try {
        const res = await fetch(`${this.getBaseUrl()}/api/staff/salon/${salonId}${query}`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });

        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : null);
          if (items && items.length > 0) {
            console.log(`✅ [staffService: getStaffBySalon] Loaded ${items.length} staff members for salon ${salonId}:`, items);
            return items;
          }
        }
      } catch (err) {
        console.warn('⚠️ [staffService: getStaffBySalon] Could not fetch salon staff:', err);
      }
    }

    // Return all real staff from DB
    return this.getAllStaff(isUuid ? salonId : undefined);
  }

  /**
   * 3. Get Staff by ID
   * GET /api/staff/{id}
   */
  async getStaffById(id: string): Promise<StaffResponse | null> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/staff/${id}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch (err) {
      console.error(`❌ [staffService: getStaffById] Error fetching ${id}:`, err);
    }
    return null;
  }

  /**
   * 4. Create Staff
   * POST /api/staff
   */
  async createStaff(payload: StaffRequest): Promise<StaffResponse> {
    console.log('💈 [staffService: createStaff] POST /api/staff:', payload);
    const res = await fetch(`${this.getBaseUrl()}/api/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create staff: ${res.status} ${errorText}`);
    }

    const json = await res.json();
    return json.data || json;
  }

  /**
   * 5. Update Staff Status
   * PUT /api/staff/{id}/status
   */
  async updateStaffStatus(id: string, status: StaffStatus): Promise<StaffResponse> {
    console.log(`💈 [staffService: updateStaffStatus] PUT /api/staff/${id}/status ->`, status);
    const res = await fetch(`${this.getBaseUrl()}/api/staff/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update staff status: ${res.status} ${errorText}`);
    }

    const json = await res.json();
    return json.data || json;
  }

  /**
   * 6. Update Staff Details
   * PUT /api/staff/{id}
   */
  async updateStaff(id: string, payload: Partial<StaffRequest>): Promise<StaffResponse> {
    console.log(`💈 [staffService: updateStaff] PUT /api/staff/${id}:`, payload);
    const res = await fetch(`${this.getBaseUrl()}/api/staff/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update staff: ${res.status} ${errorText}`);
    }

    const json = await res.json();
    return json.data || json;
  }

  /**
   * 7. Delete Staff
   * DELETE /api/staff/{id}
   */
  async deleteStaff(id: string): Promise<boolean> {
    console.log(`💈 [staffService: deleteStaff] DELETE /api/staff/${id}`);
    const res = await fetch(`${this.getBaseUrl()}/api/staff/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`❌ [staffService: deleteStaff] Error deleting staff: ${res.status}`);
      return false;
    }
    return true;
  }
}

export const staffService = new StaffService();
