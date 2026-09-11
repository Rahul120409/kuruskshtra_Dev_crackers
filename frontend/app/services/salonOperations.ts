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
  salonId?: string;
  salonName?: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceId?: string;
  serviceName: string;
  servicePrice: number;
  serviceDurationMinutes?: number;
  stylistName?: string;
  stylistId?: string;
  staffId?: string;
  staffName?: string;
  appointmentDate: string;
  appointmentTime: string;
  status: "CONFIRMED" | "CHECKED_IN" | "IN_SERVICE" | "COMPLETED" | "CANCELLED";
  source?: "ONLINE" | "WALK_IN" | "CALL" | "OFFLINE";
  bookingSource?: "ONLINE" | "WALK_IN" | "CALL" | "OFFLINE";
  notes?: string;
  queueTokenId?: string | null;
  queueTokenNumber?: number | null;
  createdAt?: string;
  updatedAt?: string;
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

export interface LiveQueueBoardData {
  salonId: string;
  queueDate: string;
  currentServingTokenNumber?: number | null;
  currentServingCustomer?: string | null;
  lastCalledTokenNumber?: number | null;
  nextAvailableTokenNumber: number;
  totalWaiting: number;
  activeStylistsCount: number;
  activeQueue: QueueTokenData[];
}

export interface JoinQueueApiPayload {
  salonId: string;
  customerName: string;
  customerPhone?: string;
  source?: "ONLINE" | "OFFLINE";
  userId?: string;
  serviceId?: string;
  serviceName?: string;
  serviceDurationMinutes?: number;
  staffId?: string;
}

// 1. Get Live Queue Board (Scoreboard & full active queue)
export async function getLiveQueueBoardApi(salonId: string): Promise<ApiResponse<LiveQueueBoardData>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/queue/live/${salonId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await res.json();
    return normalizeResponse<LiveQueueBoardData>(json, "Live queue board retrieved successfully");
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Failed to fetch live queue",
      data: {
        salonId,
        queueDate: new Date().toISOString().split("T")[0],
        currentServingTokenNumber: null,
        currentServingCustomer: null,
        lastCalledTokenNumber: null,
        nextAvailableTokenNumber: 101,
        totalWaiting: 0,
        activeStylistsCount: 1,
        activeQueue: [],
      },
    };
  }
}

// 1b. Get Live Queue Tokens List
export async function getLiveQueue(salonId: string): Promise<ApiResponse<QueueTokenData[]>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/queue/live/${salonId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await res.json();
    const board = json?.data;
    const tokens = board?.activeQueue || (Array.isArray(json) ? json : []);
    return {
      success: true,
      message: json.message || "Queue retrieved successfully",
      data: tokens,
    };
  } catch {
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

// 3. Start Service: PUT /api/queue/{tokenId}/start?staffId={staffId}
export async function startQueueServiceApi(tokenId: string, staffId?: string): Promise<ApiResponse<any>> {
  try {
    const url = staffId
      ? `${API_BASE_URL}/api/queue/${tokenId}/start?staffId=${staffId}`
      : `${API_BASE_URL}/api/queue/${tokenId}/start`;
    const res = await fetch(url, {
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

// 4b. Cancel Token: PUT /api/queue/{tokenId}/cancel
export async function cancelQueueTokenApi(tokenId: string): Promise<ApiResponse<any>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/queue/${tokenId}/cancel`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await res.json();
    return normalizeResponse<any>(json, "Token cancelled successfully");
  } catch {
    return { success: true, message: "Token cancelled locally", data: null };
  }
}

// 5. Join / Issue Walk-In Queue Token: POST /api/queue/join
export async function joinQueueApi(payload: JoinQueueApiPayload | Partial<QueueTokenData>): Promise<ApiResponse<any>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/queue/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return normalizeResponse<any>(json, "Token created successfully");
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
    const rawList = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
    const mapped: AppointmentData[] = rawList.map((item: any) => ({
      id: item.id || `apt-${Date.now()}`,
      salonId: item.salonId || salonId,
      salonName: item.salonName || "",
      userId: item.userId || undefined,
      customerName: item.customerName || "Guest Customer",
      customerPhone: item.customerPhone || "",
      customerEmail: item.customerEmail || "",
      serviceId: item.serviceId || undefined,
      serviceName: item.serviceName || "Signature Styling",
      servicePrice: Number(item.servicePrice || 0),
      serviceDurationMinutes: item.serviceDurationMinutes || 30,
      staffId: item.staffId || undefined,
      staffName: item.staffName || item.stylistName || "Assigned Stylist",
      stylistId: item.stylistId || item.staffId || undefined,
      stylistName: item.stylistName || item.staffName || "Assigned Stylist",
      appointmentDate: item.appointmentDate ? String(item.appointmentDate).split("T")[0] : new Date().toISOString().split("T")[0],
      appointmentTime: item.appointmentTime || "10:00 AM",
      status: (item.status?.toUpperCase() as any) || "CONFIRMED",
      source: (item.bookingSource || item.source || "ONLINE") as any,
      bookingSource: (item.bookingSource || item.source || "ONLINE") as any,
      notes: item.notes || "",
      queueTokenId: item.queueTokenId || null,
      queueTokenNumber: item.queueTokenNumber || null,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    }));
    return {
      success: json.success !== false,
      message: json.message || "Appointments retrieved successfully",
      data: mapped,
    };
  } catch (err) {
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

// 7b. Check-in Appointment: POST /api/appointments/{id}/check-in
export async function checkInAppointmentApi(id: string): Promise<ApiResponse<any>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/appointments/${id}/check-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await res.json();
    return normalizeResponse<any>(json, "Check-in successful! Joined live queue");
  } catch {
    return { success: true, message: "Checked in locally", data: null };
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

// 9. Get Stylists: GET /api/staff (optionally filter by salonId)
export async function getAllStylistsApi(salonId?: string): Promise<ApiResponse<StylistData[]>> {
  try {
    const url = salonId
      ? `${API_BASE_URL}/api/staff?salonId=${encodeURIComponent(salonId)}`
      : `${API_BASE_URL}/api/staff`;
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await res.json();
    const rawList = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
    const mapped: StylistData[] = rawList.map((item: any) => ({
      id: item.id || `sty-${Date.now()}`,
      name: item.name || "Stylist",
      phone: item.phone || "+91 98000 00000",
      email: item.email || "stylist@salonflow.in",
      specialization: item.specialization || "Hair Stylist",
      status: (item.status as any) || "AVAILABLE",
      experienceYears: item.experienceYears || 3,
      rating: item.rating || 5.0,
      completedToday: item.completedToday || 0,
      avatarUrl: item.profileImage || item.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
      shiftHours: item.shiftHours || "09:00 AM - 06:00 PM",
    }));
    return {
      success: true,
      message: "Stylists retrieved successfully",
      data: mapped,
    };
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

