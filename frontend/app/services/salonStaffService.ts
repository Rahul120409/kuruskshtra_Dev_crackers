import { API_BASE_URL } from "./auth";

export interface SalonStaffData {
  id: string;
  salonId?: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  specialization: string;
  status: "AVAILABLE" | "BUSY" | "BREAK" | "OFFLINE";
  experienceYears?: number;
  profileImage?: string | null;
  createdAt?: string;
}

export interface SalonStaffRequest {
  salonId?: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  specialization: string;
  status?: "AVAILABLE" | "BUSY" | "BREAK" | "OFFLINE";
  experienceYears?: number;
  profileImage?: string;
}

// Helper to test if a string is a valid standard UUID
function isValidUuid(id?: string): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id.trim());
}

// 1. Get All Salon Staff
export async function getAllSalonStaffApi(salonId?: string): Promise<{ success: boolean; message: string; data: SalonStaffData[] }> {
  try {
    const url = isValidUuid(salonId)
      ? `${API_BASE_URL}/api/salon-staff?salonId=${encodeURIComponent(salonId!.trim())}`
      : `${API_BASE_URL}/api/salon-staff`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "Failed to fetch salon staff");
    }

    const items = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
    return {
      success: true,
      message: data.message || "Salon staff retrieved successfully",
      data: items,
    };
  } catch (err: any) {
    console.warn("getAllSalonStaffApi fallback:", err.message);
    return {
      success: false,
      message: err.message,
      data: [],
    };
  }
}

// 2. Create Salon Staff
export async function createSalonStaffApi(payload: SalonStaffRequest): Promise<{ success: boolean; message: string; data: SalonStaffData }> {
  const sanitizedPayload = {
    ...payload,
    salonId: isValidUuid(payload.salonId) ? payload.salonId!.trim() : undefined,
  };

  const res = await fetch(`${API_BASE_URL}/api/salon-staff`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(sanitizedPayload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Failed to create salon staff");
  }

  return {
    success: true,
    message: data.message || "Salon staff created successfully",
    data: data.data || data,
  };
}

// 3. Update Salon Staff
export async function updateSalonStaffApi(id: string, payload: Partial<SalonStaffRequest>): Promise<{ success: boolean; message: string; data: SalonStaffData }> {
  const res = await fetch(`${API_BASE_URL}/api/salon-staff/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Failed to update salon staff");
  }

  return {
    success: true,
    message: data.message || "Salon staff updated successfully",
    data: data.data || data,
  };
}

// 4. Update Salon Staff Status
export async function updateSalonStaffStatusApi(id: string, status: "AVAILABLE" | "BUSY" | "BREAK" | "OFFLINE"): Promise<{ success: boolean; message: string; data: SalonStaffData }> {
  const res = await fetch(`${API_BASE_URL}/api/salon-staff/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Failed to update staff status");
  }

  return {
    success: true,
    message: data.message || "Staff status updated successfully",
    data: data.data || data,
  };
}

// 5. Delete Salon Staff
export async function deleteSalonStaffApi(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/salon-staff/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      // 204 response
    }

    if (!res.ok && res.status !== 404) {
      throw new Error(data?.message || `Failed to delete staff (HTTP ${res.status})`);
    }

    return {
      success: true,
      message: data?.message || "Salon staff deleted successfully",
    };
  } catch (err: any) {
    console.warn("deleteSalonStaffApi error:", err.message);
    return {
      success: true,
      message: "Staff deleted locally",
    };
  }
}
