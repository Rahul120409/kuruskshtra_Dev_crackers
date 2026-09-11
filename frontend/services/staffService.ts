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

// Defaults initialized as empty arrays
export const DEFAULT_STAFF: StaffResponse[] = [];

class StaffService {
  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return ''; // browser relative proxy
    }
    return (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  }

  /**
   * 1. Get All Staff (optionally filter by salonId)
   * GET /api/staff?salonId=...
   */
  async getAllStaff(salonId?: string): Promise<StaffResponse[]> {
    const query = salonId ? `?salonId=${encodeURIComponent(salonId)}` : '';

    try {
      const res = await fetch(`${this.getBaseUrl()}/api/staff${query}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        return items;
      }
    } catch (err) {
      console.warn('⚠️ [staffService: getAllStaff] Could not fetch live staff:', err);
    }
    return [];
  }

  /**
   * 2. Get Staff by Salon ID with optional status filter
   * GET /api/staff/salon/{salonId}?status=AVAILABLE
   */
  async getStaffBySalon(salonId: string, status?: StaffStatus): Promise<StaffResponse[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';

    try {
      const res = await fetch(`${this.getBaseUrl()}/api/staff/salon/${salonId}${query}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        return items;
      }
    } catch (err) {
      console.warn('⚠️ [staffService: getStaffBySalon] Could not fetch salon staff:', err);
    }
    return [];
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
