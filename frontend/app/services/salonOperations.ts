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
  status: "CONFIRMED" | "CHECKED_IN" | "IN_SERVICE" | "COMPLETED" | "CANCELLED" | "LATE";
  lateTimestamp?: string;
  cancellationFee?: number;
  rating?: number;
  feedback?: string;
  source?: "ONLINE" | "WALK_IN" | "CALL" | "OFFLINE";
  bookingSource?: "ONLINE" | "WALK_IN" | "CALL" | "OFFLINE";
  notes?: string;
  queueTokenId?: string | null;
  queueTokenNumber?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentReviewData {
  id: string;
  userId?: string;
  customerName: string;
  appointmentId: string;
  salonId: string;
  staffId?: string;
  staffName?: string;
  rating: number;
  message?: string;
  createdAt?: string;
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

// 1b. Get Live Queue
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
    const query = staffId ? `?staffId=${encodeURIComponent(staffId)}` : "";
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

// 4c. Late Check-In / Restore Token
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

// 4d. Notify Customer via WhatsApp (Powered by Backend CallMeBot): POST /api/queue/{tokenId}/notify
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
export async function joinQueueApi(payload: JoinQueueApiPayload | Partial<QueueTokenData> | any): Promise<ApiResponse<any>> {
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
        source: payload.source || payload.bookingSource || "OFFLINE",
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
    const rawList: any[] = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
    const mapped: AppointmentData[] = rawList.map((item: any) => ({
      id: item.id ? String(item.id) : `apt-${Date.now()}`,
      salonId: item.salonId || salonId,
      salonName: item.salonName || "",
      userId: item.userId || undefined,
      customerName: item.customerName || "Customer",
      customerPhone: item.customerPhone || "",
      customerEmail: item.customerEmail || "",
      serviceId: item.serviceId || undefined,
      serviceName: item.serviceName || "Haircut & Styling",
      servicePrice: Number(item.servicePrice || 0),
      serviceDurationMinutes: item.serviceDurationMinutes || 30,
      staffId: item.staffId || undefined,
      staffName: item.staffName || item.stylistName || "Stylist",
      stylistId: item.stylistId || item.staffId || undefined,
      stylistName: item.stylistName || item.staffName || "Stylist",
      appointmentDate: item.appointmentDate ? String(item.appointmentDate).split("T")[0] : "Today",
      appointmentTime: item.appointmentTime || "12:00 PM",
      status: (item.status?.toUpperCase() as any) || "CONFIRMED",
      lateTimestamp: item.lateTimestamp || undefined,
      cancellationFee: item.cancellationFee !== undefined && item.cancellationFee !== null ? Number(item.cancellationFee) : undefined,
      rating: item.rating !== undefined && item.rating !== null ? Number(item.rating) : undefined,
      feedback: item.feedback || item.message || undefined,
      source: (item.bookingSource || item.source || "ONLINE") as any,
      bookingSource: (item.bookingSource || item.source || "ONLINE") as any,
      notes: item.notes || "",
      queueTokenId: item.queueTokenId || null,
      queueTokenNumber: item.queueTokenNumber || null,
      createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : new Date().toISOString(),
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

// 7c. Mark Late Appointment: POST /api/appointments/{id}/late
export async function markAppointmentLateApi(id: string): Promise<ApiResponse<any>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/appointments/${id}/late`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await res.json();
    return normalizeResponse<any>(json, "Appointment marked as LATE");
  } catch {
    return { success: true, message: "Marked late locally", data: null };
  }
}

// 8. Create Appointment: POST /api/appointments
export async function createAppointmentApi(payload: Partial<AppointmentData> | any): Promise<ApiResponse<any>> {
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
        bookingSource: payload.source || payload.bookingSource || "ONLINE",
        notes: payload.notes,
      }),
    });
    const json = await res.json();
    return normalizeResponse<any>(json, "Appointment created successfully");
  } catch {
    return { success: true, message: "Appointment created locally", data: payload };
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

// 11. Get Dedicated Salon Reviews: GET /api/appointments/salon/{salonId}/reviews
export async function getSalonReviewsApi(salonId: string): Promise<ApiResponse<AppointmentReviewData[]>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/appointments/salon/${salonId}/reviews`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const json = await res.json();
    const rawList = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
    const mapped: AppointmentReviewData[] = rawList.map((item: any) => ({
      id: item.id || `rev-${Date.now()}`,
      userId: item.userId || undefined,
      customerName: item.customerName || "Customer",
      appointmentId: item.appointmentId,
      salonId: item.salonId || salonId,
      staffId: item.staffId || undefined,
      staffName: item.staffName || undefined,
      rating: Number(item.rating || 5),
      message: item.message || item.feedback || "",
      createdAt: item.createdAt || new Date().toISOString(),
    }));
    return {
      success: json.success !== false,
      message: json.message || "Salon reviews retrieved successfully",
      data: mapped,
    };
  } catch (err) {
    return { success: false, message: "Salon reviews fetched locally", data: [] };
  }
}

// 12. Submit Rating: POST /api/appointments/{appointmentId}/rating
export async function submitAppointmentRatingApi(
  appointmentId: string,
  payload: { userId?: string; rating: number; message?: string; feedback?: string }
): Promise<ApiResponse<AppointmentReviewData>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/rating`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return normalizeResponse<AppointmentReviewData>(json, "Rating submitted successfully");
  } catch {
    return {
      success: true,
      message: "Rating saved locally",
      data: {
        id: `rev-${Date.now()}`,
        appointmentId,
        customerName: "Customer",
        salonId: "",
        rating: payload.rating,
        message: payload.feedback || payload.message,
        createdAt: new Date().toISOString(),
      },
    };
  }
}
