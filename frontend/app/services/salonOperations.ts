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
  status: "WAITING" | "CALLED" | "IN_SERVICE" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | "LATE" | "ON_HOLD";
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
  status: "CONFIRMED" | "CHECKED_IN" | "IN_SERVICE" | "COMPLETED" | "CANCELLED" | "LATE";
  source: "ONLINE" | "WALK_IN" | "CALL";
  notes?: string;
  rating?: number;
  feedback?: string;
  lateTimestamp?: string;
  cancellationFee?: number;
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

export interface LiveQueueBoardData {
  salonId: string;
  queueDate?: string;
  currentServingTokenNumber?: number | null;
  currentServingCustomer?: string | null;
  lastCalledTokenNumber?: number | null;
  nextAvailableTokenNumber?: number;
  totalWaiting: number;
  activeStylistsCount: number;
  activeQueue: QueueTokenData[];
}

// 1. Get Live Queue
export async function getLiveQueue(salonId: string): Promise<ApiResponse<LiveQueueBoardData>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/queue/live/${salonId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await res.json();
    if (json && json.data) {
      const board = json.data;
      const rawQueue: any[] = Array.isArray(board.activeQueue) 
        ? board.activeQueue 
        : (Array.isArray(board) ? board : []);

      const activeQueue: QueueTokenData[] = rawQueue.map((t: any) => ({
        id: t.id ? String(t.id) : `tok-${t.tokenNumber}`,
        tokenId: t.id ? String(t.id) : undefined,
        tokenNumber: t.tokenNumber,
        salonId: t.salonId || salonId,
        customerName: t.customerName || "Customer",
        customerPhone: t.customerPhone || "",
        serviceId: t.serviceId,
        serviceName: t.serviceName || "Haircut & Styling",
        servicePrice: t.servicePrice || 500,
        staffId: t.staffId,
        staffName: t.staffName || "",
        status: t.status || "WAITING",
        position: t.position || 1,
        estimatedWait: t.estimatedWaitMinutes ?? t.estimatedWait ?? 0,
        createdAt: t.joinedAt ? new Date(t.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (t.createdAt || "Just now"),
        calledAt: t.calledAt ? new Date(t.calledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        startedAt: t.startedAt ? new Date(t.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        completedAt: t.completedAt ? new Date(t.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      }));

      return {
        success: true,
        message: "Queue retrieved successfully",
        data: {
          salonId: board.salonId || salonId,
          queueDate: board.queueDate,
          currentServingTokenNumber: board.currentServingTokenNumber,
          currentServingCustomer: board.currentServingCustomer,
          lastCalledTokenNumber: board.lastCalledTokenNumber,
          nextAvailableTokenNumber: board.nextAvailableTokenNumber,
          totalWaiting: board.totalWaiting ?? activeQueue.filter((t) => t.status === "WAITING").length,
          activeStylistsCount: board.activeStylistsCount ?? 1,
          activeQueue,
        },
      };
    }
    return { success: false, message: "Queue empty", data: { salonId, totalWaiting: 0, activeStylistsCount: 1, activeQueue: [] } };
  } catch (err) {
    return { success: false, message: "Failed to connect to live queue API", data: { salonId, totalWaiting: 0, activeStylistsCount: 1, activeQueue: [] } };
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
export async function startQueueServiceApi(tokenId: string, staffId?: string): Promise<ApiResponse<any>> {
  try {
    const query = staffId ? `?staffId=${staffId}` : "";
    const res = await fetch(`${API_BASE_URL}/api/queue/${tokenId}/start${query}`, {
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

// 4a. Mark Token Late / On-Hold
export async function markTokenLateApi(tokenId: string): Promise<ApiResponse<any>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/queue/${tokenId}/hold`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await res.json();
    return normalizeResponse<any>(json, "Customer marked late / on-hold");
  } catch {
    return { success: true, message: "Customer marked late locally", data: null };
  }
}

// 4b. Late Check-In / Restore Token
export async function lateCheckInTokenApi(tokenId: string): Promise<ApiResponse<any>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/queue/${tokenId}/restore`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await res.json();
    return normalizeResponse<any>(json, "Customer restored to queue");
  } catch {
    return { success: true, message: "Customer restored locally", data: null };
  }
}

// 4b. Notify Customer via WhatsApp (Powered by Backend CallMeBot): POST /api/queue/{tokenId}/notify
export async function notifyQueueCustomerApi(tokenId: string, message?: string): Promise<ApiResponse<any>> {
  try {
    const query = message ? `?message=${encodeURIComponent(message)}` : "";
    const res = await fetch(`${API_BASE_URL}/api/queue/${tokenId}/notify${query}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await res.json();
    return normalizeResponse<any>(json, "WhatsApp notification sent successfully");
  } catch {
    return { success: true, message: "Notification triggered locally", data: null };
  }
}

// 5. Join / Create Queue Token: POST /api/queue/join
export async function joinQueueApi(payload: Partial<QueueTokenData> | any): Promise<ApiResponse<any>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/queue/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        salonId: payload.salonId,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        serviceName: payload.serviceName || "Signature Haircut",
        servicePrice: payload.servicePrice || 0,
        serviceDurationMinutes: payload.serviceDurationMinutes || 25,
        staffId: payload.staffId || null,
        source: payload.source || "OFFLINE",
      }),
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
    const rawList: any[] = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
    const mapped: AppointmentData[] = rawList.map((a: any) => ({
      id: a.id ? String(a.id) : `apt-${Date.now()}`,
      customerName: a.customerName || "Customer",
      customerPhone: a.customerPhone || "",
      customerEmail: a.customerEmail || "",
      serviceName: a.serviceName || "Haircut & Styling",
      servicePrice: a.servicePrice || 0,
      stylistName: a.staffName || "Stylist",
      stylistId: a.staffId,
      appointmentDate: a.appointmentDate || "Today",
      appointmentTime: a.appointmentTime || "12:00 PM",
      status: a.status || "CONFIRMED",
      source: a.bookingSource || "ONLINE",
      notes: a.notes,
      rating: a.rating,
      feedback: a.feedback,
      lateTimestamp: a.lateTimestamp,
      cancellationFee: a.cancellationFee,
      createdAt: a.createdAt ? new Date(a.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "Recently",
    }));

    return {
      success: true,
      message: "Appointments retrieved successfully",
      data: mapped,
    };
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

// Mark Appointment Late: POST /api/appointments/{id}/late
export async function markAppointmentLateApi(id: string): Promise<ApiResponse<any>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/appointments/${id}/late`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await res.json();
    return normalizeResponse<any>(json, "Marked as late");
  } catch {
    return { success: true, message: "Marked late locally", data: null };
  }
}

// Get Salon Reviews & Ratings: GET /api/appointments/salon/{salonId}/reviews
export async function getSalonReviewsApi(salonId: string): Promise<ApiResponse<any[]>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/appointments/salon/${salonId}/reviews`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await res.json();
    return normalizeResponse<any[]>(json, "Reviews retrieved successfully");
  } catch {
    return { success: false, message: "Failed to fetch salon reviews", data: [] };
  }
}

// 8. Create Appointment: POST /api/appointments
export async function createAppointmentApi(payload: any): Promise<ApiResponse<any>> {
  try {
    let apptDate = payload.appointmentDate;
    if (!apptDate || apptDate === "Today") {
      apptDate = new Date().toISOString().split("T")[0];
    } else if (apptDate === "Tomorrow") {
      const tom = new Date();
      tom.setDate(tom.getDate() + 1);
      apptDate = tom.toISOString().split("T")[0];
    }

    const res = await fetch(`${API_BASE_URL}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        salonId: payload.salonId,
        userId: payload.userId || null,
        customerId: payload.customerId || payload.userId || null,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        customerEmail: payload.customerEmail,
        serviceId: payload.serviceId || null,
        serviceName: payload.serviceName || "Haircut & Styling",
        servicePrice: payload.servicePrice || 0,
        serviceDurationMinutes: payload.serviceDurationMinutes || 30,
        staffId: payload.staffId || null,
        staffName: payload.staffName || payload.stylistName || null,
        appointmentDate: apptDate,
        appointmentTime: payload.appointmentTime || "12:00 PM",
        bookingSource: payload.source || "ONLINE",
        notes: payload.notes,
      }),
    });
    const json = await res.json();
    return normalizeResponse<any>(json, "Appointment created successfully");
  } catch {
    return { success: true, message: "Appointment created locally", data: payload };
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
