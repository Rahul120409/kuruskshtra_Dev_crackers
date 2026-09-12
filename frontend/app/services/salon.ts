import { API_BASE_URL } from "./auth";

export interface SalonData {
  id: string;
  salonName: string;
  ownerName: string;
  phoneNumber: string;
  email: string;
  salonAddress: string;
  city: string;
  pincode: string;
  salonLogo?: string | null;
  salonDescription?: string | null;
  locationLink?: string | null;
  openingTime: string;
  closingTime: string;
  status?: string;
  createdAt?: string;
  // UI extended fields
  type?: "UNISEX" | "MALE_ONLY" | "FEMALE_ONLY";
  activeStylists?: number;
  todayRevenue?: number;
  stateCode?: string;
  totalWaiting?: number;
  currentServingTokenNumber?: number | null;
}

export interface CreateSalonPayload {
  salonName: string;
  ownerName: string;
  phoneNumber: string;
  email: string;
  salonAddress: string;
  city: string;
  pincode: string;
  salonLogo?: string;
  salonDescription?: string;
  locationLink?: string;
  mapLink?: string;
  googleMapsUrl?: string;
  openingTime: string;
  closingTime: string;
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

// 1. Create a Salon: POST /api/salons
export async function createSalon(payload: CreateSalonPayload): Promise<ApiResponse<SalonData>> {
  const body: any = {
    salonName: payload.salonName,
    ownerName: payload.ownerName,
    phoneNumber: payload.phoneNumber,
    email: payload.email,
    salonAddress: payload.salonAddress,
    city: payload.city,
    pincode: payload.pincode,
    salonLogo: payload.salonLogo || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500",
    salonDescription: payload.salonDescription || "Premium salon offering haircuts, styling, grooming, and bespoke beauty treatments.",
    locationLink: payload.locationLink || payload.mapLink || payload.googleMapsUrl || "",
    openingTime: payload.openingTime || "09:00",
    closingTime: payload.closingTime || "21:00",
  };

  const targetUrl = `${API_BASE_URL}/api/salons`;
  console.log(`🌐 [SERVICES: createSalon] Initiating POST ${targetUrl} with body:`, body);

  const res = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  console.log(`🌐 [SERVICES: createSalon] Received HTTP ${res.status} ${res.statusText} from ${targetUrl}`);

  const json = await res.json();
  console.log("🌐 [SERVICES: createSalon] Response JSON from backend:", json);

  if (!res.ok) {
    console.error("❌ [SERVICES: createSalon] Request failed with error:", json);
    throw new Error(json?.message || "Failed to create salon");
  }
  return normalizeResponse<SalonData>(json, "Salon created successfully");
}

// 2. Get All Salons: GET /api/salons
export async function getAllSalons(): Promise<ApiResponse<SalonData[]>> {
  const targetUrl = `${API_BASE_URL}/api/salons`;
  console.log(`🌐 [SERVICES: getAllSalons] Initiating GET ${targetUrl}...`);

  const res = await fetch(targetUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  console.log(`🌐 [SERVICES: getAllSalons] Received HTTP ${res.status} ${res.statusText}`);

  const json = await res.json();
  const count = json?.data ? (Array.isArray(json.data) ? json.data.length : 1) : (Array.isArray(json) ? json.length : 0);
  console.log(`🌐 [SERVICES: getAllSalons] Salons in database count: ${count}`, json);

  if (!res.ok) {
    console.error("❌ [SERVICES: getAllSalons] Failed to retrieve salons:", json);
    throw new Error(json?.message || "Failed to retrieve salons");
  }
  return normalizeResponse<SalonData[]>(json, "Salons retrieved successfully");
}

// 3. Get Salon by ID: GET /api/salons/{id}
export async function getSalonById(id: string): Promise<ApiResponse<SalonData>> {
  const res = await fetch(`${API_BASE_URL}/api/salons/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Failed to retrieve salon details");
  }
  return normalizeResponse<SalonData>(json, "Salon retrieved successfully");
}

// 4. Delete Salon: DELETE /api/salons/{id}
export async function deleteSalonApi(id: string): Promise<ApiResponse<any>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/salons/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    let json: any = {};
    try {
      json = await res.json();
    } catch {
      // 204 or empty response
    }
    if (!res.ok && res.status !== 404) {
      throw new Error(json?.message || `Failed to delete salon (HTTP ${res.status})`);
    }
    return normalizeResponse<any>(json, "Salon deleted successfully");
  } catch (err: any) {
    console.warn("deleteSalonApi error:", err.message);
    return { success: true, message: "Salon deleted locally", data: null };
  }
}

// 5. Update Salon: PUT /api/salons/{id}
export async function updateSalonApi(id: string, payload: Partial<CreateSalonPayload> & { status?: string }): Promise<ApiResponse<SalonData>> {
  const body: any = {
    ...payload,
  };

  const res = await fetch(`${API_BASE_URL}/api/salons/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Failed to update salon");
  }
  return normalizeResponse<SalonData>(json, "Salon updated successfully");
}


