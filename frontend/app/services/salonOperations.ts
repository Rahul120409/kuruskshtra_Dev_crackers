import { API_BASE_URL } from "./auth";

export interface QueueTokenData {
  id: string;
  tokenId?: string;
  tokenNumber: number;
  salonId: string;
  customerName: string;
  customerPhone?: string;
  serviceId?: string;
  serviceName: string;
  servicePrice: number;
  staffId?: string;
  staffName?: string;
  status: "WAITING" | "CALLED" | "IN_SERVICE" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  position: number;
  estimatedWait: number; // in minutes
  createdAt: string;
  calledAt?: string;
  startedAt?: string;
  completedAt?: string;
  // AI Intelligence matching
  aiRecommendation?: {
    faceShape: string;
    hairType: string;
    hairDensity: string;
    selectedHairstyle: string;
    matchScore: number;
    reason: string;
  };
}

export interface AppointmentData {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceName: string;
  servicePrice: number;
  stylistName: string;
  stylistId?: string;
  appointmentDate: string;
  appointmentTime: string;
  status: "CONFIRMED" | "CHECKED_IN" | "IN_SERVICE" | "COMPLETED" | "CANCELLED";
  source: "ONLINE" | "WALK_IN" | "CALL";
  notes?: string;
  createdAt: string;
}

export interface StylistData {
  id: string;
  name: string;
  phone: string;
  email: string;
  specialization: string; // e.g. "Master Colorist", "Fade & Beard Specialist", "Creative Stylist"
  status: "AVAILABLE" | "BUSY" | "BREAK" | "OFFLINE";
  experienceYears: number;
  rating: number;
  completedToday: number;
  currentClient?: string;
  avatarUrl: string;
  shiftHours: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

function normalizeResponse<T>(json: any, defaultMessage = "Success"): ApiResponse<T> {
  if (json && typeof json === "object") {
    if ("data" in json) {
      return {
        success: json.success !== false,
        message: json.message || defaultMessage,
        data: json.data as T,
      };
    }
    return {
      success: true,
      message: defaultMessage,
      data: json as T,
    };
  }
  return {
    success: true,
    message: defaultMessage,
    data: json as T,
  };
}

// 1. Get Live Queue
export async function getLiveQueue(salonId: string): Promise<ApiResponse<QueueTokenData[]>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/queue/live/${salonId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await res.json();
    return normalizeResponse<QueueTokenData[]>(json, "Queue retrieved successfully");
  } catch (err) {
    return { success: false, message: "Live queue fetched locally", data: [] };
  }
}

// 2. Call Next Token: PUT /api/queue/{tokenId}/call
export async function callQueueTokenApi(tokenId: string): Promise<ApiResponse<any>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/queue/${tokenId}/call`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await res.json();
    return normalizeResponse<any>(json, "Customer called successfully");
  } catch {
    return { success: true, message: "Customer called locally", data: null };
  }
}

// 3. Start Service: PUT /api/queue/{tokenId}/start
export async function startQueueServiceApi(tokenId: string): Promise<ApiResponse<any>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/queue/${tokenId}/start`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await res.json();
    return normalizeResponse<any>(json, "Service started successfully");
  } catch {
    return { success: true, message: "Service started locally", data: null };
  }
}

// 4. Complete Service: PUT /api/queue/{tokenId}/complete
export async function completeQueueServiceApi(tokenId: string): Promise<ApiResponse<any>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/queue/${tokenId}/complete`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await res.json();
    return normalizeResponse<any>(json, "Service completed successfully");
  } catch {
    return { success: true, message: "Service completed locally", data: null };
  }
}

// 5. Join / Create Queue Token: POST /api/queue/join
export async function joinQueueApi(payload: Partial<QueueTokenData>): Promise<ApiResponse<QueueTokenData>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/queue/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return normalizeResponse<QueueTokenData>(json, "Token created successfully");
  } catch {
    return { success: true, message: "Token issued locally", data: payload as QueueTokenData };
  }
}

// 6. Get Salon Appointments: GET /api/appointments/salon/{id}
export async function getSalonAppointments(salonId: string): Promise<ApiResponse<AppointmentData[]>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/appointments/salon/${salonId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await res.json();
    return normalizeResponse<AppointmentData[]>(json, "Appointments retrieved successfully");
  } catch {
    return { success: false, message: "Appointments fetched locally", data: [] };
  }
}

// 7. Update Appointment Status: PUT /api/appointments/{id}/status
export async function updateAppointmentStatusApi(id: string, status: string): Promise<ApiResponse<any>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/appointments/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    return normalizeResponse<any>(json, "Status updated successfully");
  } catch {
    return { success: true, message: "Status updated locally", data: null };
  }
}

// 8. Create Appointment: POST /api/appointments
export async function createAppointmentApi(payload: Partial<AppointmentData>): Promise<ApiResponse<AppointmentData>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return normalizeResponse<AppointmentData>(json, "Appointment created successfully");
  } catch {
    return { success: true, message: "Appointment created locally", data: payload as AppointmentData };
  }
}

// 9. Get Stylists: GET /api/staff
export async function getAllStylistsApi(): Promise<ApiResponse<StylistData[]>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/staff`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await res.json();
    return normalizeResponse<StylistData[]>(json, "Stylists retrieved successfully");
  } catch {
    return { success: false, message: "Stylists fetched locally", data: [] };
  }
}

// 10. Update Stylist Status: PUT /api/staff/{id}/status
export async function updateStylistStatusApi(id: string, status: string): Promise<ApiResponse<any>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/staff/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    return normalizeResponse<any>(json, "Stylist status updated");
  } catch {
    return { success: true, message: "Stylist status updated locally", data: null };
  }
}
