import { API_BASE_URL } from "./auth";

export interface StaffItemData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  mobileNumber?: string;
  specialization?: string;
  role?: string;
  status?: string;
  salonId?: string;
  experienceYears?: number;
  profileImage?: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// 1. Get All Staff: GET /api/staff
export async function getAllStaffApi(): Promise<ApiResponse<StaffItemData[]>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/staff`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const json = await res.json();
    if (res.ok) {
      const list = Array.isArray(json) ? json : json.data || [];
      return {
        success: true,
        message: json.message || "Staff retrieved successfully",
        data: list,
      };
    }
  } catch (err) {
    console.warn("Failed to fetch staff from /api/staff:", err);
  }

  return {
    success: false,
    message: "Could not fetch staff from backend",
    data: [],
  };
}
