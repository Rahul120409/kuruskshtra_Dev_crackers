import { API_BASE_URL } from "./auth";

export interface StyleTypeData {
  id: string;
  salonId?: string;
  name: string;
  typeName?: string;
  styleTypeName?: string;
  code: string;
  description?: string;
  imageUrl?: string;
  specificStyleCount?: number;
  createdAt?: string;
}

export interface SpecificStyleData {
  id: string;
  styleTypeId: string;
  styleTypeCode?: string;
  styleTypeName?: string;
  name: string;
  styleName?: string;
  code?: string;
  description?: string;
  price: number;
  durationMinutes: number;
  imageUrl?: string;
  suitableFaceShapes?: string;
  suitableHairTypes?: string;
  status?: "ACTIVE" | "INACTIVE";
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// 1. Create Style Type: POST /api/styles/types
export async function createStyleTypeApi(payload: {
  name: string;
  code: string;
  description?: string;
  imageUrl?: string;
  salonId?: string;
}): Promise<ApiResponse<StyleTypeData>> {
  const body = {
    name: payload.name,
    typeName: payload.name,
    styleTypeName: payload.name,
    code: payload.code.toUpperCase(),
    description: payload.description || "",
    imageUrl: payload.imageUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500",
    salonId: payload.salonId,
  };

  const res = await fetch(`${API_BASE_URL}/api/styles/types`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Failed to create style type");
  }

  return {
    success: true,
    message: json.message || "Style type created successfully",
    data: json.data || json,
  };
}

// 2. Get All Style Types: GET /api/styles/types
export async function getAllStyleTypesApi(salonId?: string): Promise<ApiResponse<StyleTypeData[]>> {
  const url = salonId ? `${API_BASE_URL}/api/styles/types?salonId=${salonId}` : `${API_BASE_URL}/api/styles/types`;
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Failed to retrieve style types");
  }

  const list = Array.isArray(json) ? json : json.data || [];
  return {
    success: true,
    message: json.message || "Style types retrieved successfully",
    data: list,
  };
}

// 3. Create Specific Style: POST /api/styles/specific
export async function createSpecificStyleApi(payload: {
  styleTypeId: string;
  styleTypeCode?: string;
  name: string;
  code?: string;
  description?: string;
  price: number;
  durationMinutes: number;
  imageUrl?: string;
  suitableFaceShapes?: string;
  suitableHairTypes?: string;
}): Promise<ApiResponse<SpecificStyleData>> {
  const body = {
    styleTypeId: payload.styleTypeId,
    styleTypeCode: payload.styleTypeCode,
    name: payload.name,
    styleName: payload.name,
    code: payload.code || payload.name.toLowerCase().replace(/\s+/g, "_"),
    description: payload.description || "",
    price: payload.price,
    durationMinutes: payload.durationMinutes,
    imageUrl: payload.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
    suitableFaceShapes: payload.suitableFaceShapes || "Oval, Square, Round",
    suitableHairTypes: payload.suitableHairTypes || "Straight, Wavy, Thick",
  };

  const res = await fetch(`${API_BASE_URL}/api/styles/specific`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Failed to create specific style");
  }

  return {
    success: true,
    message: json.message || "Specific style created successfully",
    data: json.data || json,
  };
}

// 4. Get All Specific Styles: GET /api/styles/specific
export async function getAllSpecificStylesApi(): Promise<ApiResponse<SpecificStyleData[]>> {
  const res = await fetch(`${API_BASE_URL}/api/styles/specific`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Failed to retrieve specific styles");
  }

  const list = Array.isArray(json) ? json : json.data || [];
  return {
    success: true,
    message: json.message || "Specific styles retrieved successfully",
    data: list,
  };
}

// 5. Get Specific Styles By Type ID: GET /api/styles/specific/type/{styleTypeId}
export async function getSpecificStylesByTypeApi(styleTypeId: string): Promise<ApiResponse<SpecificStyleData[]>> {
  const res = await fetch(`${API_BASE_URL}/api/styles/specific/type/${styleTypeId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Failed to retrieve specific styles by type");
  }

  const list = Array.isArray(json) ? json : json.data || [];
  return {
    success: true,
    message: json.message || "Styles retrieved successfully",
    data: list,
  };
}

// 6. Update Specific Style: PUT /api/styles/specific/{id}
export async function updateSpecificStyleApi(id: string, payload: Partial<SpecificStyleData>): Promise<ApiResponse<SpecificStyleData>> {
  const res = await fetch(`${API_BASE_URL}/api/styles/specific/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Failed to update specific style");
  }

  return {
    success: true,
    message: json.message || "Specific style updated successfully",
    data: json.data || json,
  };
}

// 7. Delete Specific Style: DELETE /api/styles/specific/{id}
export async function deleteSpecificStyleApi(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/styles/specific/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || "Failed to delete specific style");
  }

  return {
    success: true,
    message: json?.message || "Specific style deleted successfully",
  };
}
