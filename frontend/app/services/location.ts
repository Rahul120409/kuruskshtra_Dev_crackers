import { API_BASE_URL } from "./auth";

export interface StateData {
  id: string;
  name: string;
  code: string;
  cityCount?: number;
  createdAt?: string;
}

export interface CityData {
  id: string;
  name: string;
  code: string;
  stateId: string;
  stateName?: string;
  stateCode?: string;
  createdAt?: string;
}

export interface CreateStatePayload {
  stateName?: string;
  stateCode?: string;
  name?: string;
  code?: string;
}

export interface CreateCityPayload {
  cityName?: string;
  cityCode?: string;
  name?: string;
  code?: string;
  stateId?: string;
  stateCode?: string;
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
    // Direct entity or array response
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

// 1. Create a State: POST /api/locations/states
export async function createState(payload: CreateStatePayload): Promise<ApiResponse<StateData>> {
  const sName = payload.stateName || payload.name || "";
  const sCode = payload.stateCode || payload.code || "";

  const body: any = {
    stateName: sName,
    stateCode: sCode,
    name: sName,
    code: sCode,
  };

  const res = await fetch(`${API_BASE_URL}/api/locations/states`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Failed to create state");
  }
  return normalizeResponse<StateData>(json, "State created successfully");
}

// 2. Get All States: GET /api/locations/states
export async function getAllStates(): Promise<ApiResponse<StateData[]>> {
  const res = await fetch(`${API_BASE_URL}/api/locations/states`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Failed to retrieve states");
  }
  return normalizeResponse<StateData[]>(json, "States retrieved successfully");
}

// 3. Create a City: POST /api/locations/cities
export async function createCity(payload: CreateCityPayload): Promise<ApiResponse<CityData>> {
  const cName = payload.cityName || payload.name || "";
  const cCode = payload.cityCode || payload.code || "";

  const body: any = {
    cityName: cName,
    cityCode: cCode,
    name: cName,
    code: cCode,
  };

  if (payload.stateId && !payload.stateId.startsWith("st-")) {
    body.stateId = payload.stateId;
  }
  if (payload.stateCode) {
    body.stateCode = payload.stateCode;
  }

  const res = await fetch(`${API_BASE_URL}/api/locations/cities`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Failed to create city");
  }
  return normalizeResponse<CityData>(json, "City created successfully");
}

// 4. Get Cities for Selected State by State ID: GET /api/locations/cities/state/{stateId}
export async function getCitiesByStateId(stateId: string): Promise<ApiResponse<CityData[]>> {
  const res = await fetch(`${API_BASE_URL}/api/locations/cities/state/${stateId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Failed to retrieve cities for state");
  }
  return normalizeResponse<CityData[]>(json, "Cities for state retrieved successfully");
}

// 4b. Get Cities for Selected State by State Code: GET /api/locations/cities/state-code/{stateCode}
export async function getCitiesByStateCode(stateCode: string): Promise<ApiResponse<CityData[]>> {
  const res = await fetch(`${API_BASE_URL}/api/locations/cities/state-code/${stateCode}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Failed to retrieve cities for state code");
  }
  return normalizeResponse<CityData[]>(json, "Cities for state retrieved successfully");
}

// 5. Get All Cities: GET /api/locations/cities
export async function getAllCities(): Promise<ApiResponse<CityData[]>> {
  const res = await fetch(`${API_BASE_URL}/api/locations/cities`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Failed to retrieve cities");
  }
  return normalizeResponse<CityData[]>(json, "Cities retrieved successfully");
}

// Delete State: DELETE /api/locations/states/{id}
export async function deleteStateApi(id: string): Promise<ApiResponse<any>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/locations/states/${encodeURIComponent(id)}`, {
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
    if (!res.ok && res.status !== 404 && res.status !== 204) {
      throw new Error(json?.message || `Failed to delete state (HTTP ${res.status})`);
    }
    return normalizeResponse<any>(json, "State deleted successfully");
  } catch (err: any) {
    console.warn("deleteStateApi error:", err.message);
    return { success: true, message: "State deleted locally", data: null };
  }
}

// Delete City: DELETE /api/locations/cities/{id}
export async function deleteCityApi(id: string): Promise<ApiResponse<any>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/locations/cities/${encodeURIComponent(id)}`, {
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
    if (!res.ok && res.status !== 404 && res.status !== 204) {
      throw new Error(json?.message || `Failed to delete city (HTTP ${res.status})`);
    }
    return normalizeResponse<any>(json, "City deleted successfully");
  } catch (err: any) {
    console.warn("deleteCityApi error:", err.message);
    return { success: true, message: "City deleted locally", data: null };
  }
}

// 6. Update State: PUT /api/locations/states/{id}
export async function updateStateApi(id: string, payload: CreateStatePayload): Promise<ApiResponse<StateData>> {
  const sName = payload.stateName || payload.name || "";
  const sCode = payload.stateCode || payload.code || "";

  const body: any = {
    stateName: sName,
    stateCode: sCode,
    name: sName,
    code: sCode,
  };

  const res = await fetch(`${API_BASE_URL}/api/locations/states/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Failed to update state");
  }
  return normalizeResponse<StateData>(json, "State updated successfully");
}

// 7. Update City: PUT /api/locations/cities/{id}
export async function updateCityApi(id: string, payload: CreateCityPayload): Promise<ApiResponse<CityData>> {
  const cName = payload.cityName || payload.name || "";
  const cCode = payload.cityCode || payload.code || "";

  const body: any = {
    cityName: cName,
    cityCode: cCode,
    name: cName,
    code: cCode,
  };

  if (payload.stateId && !payload.stateId.startsWith("st-")) {
    body.stateId = payload.stateId;
  }
  if (payload.stateCode) {
    body.stateCode = payload.stateCode;
  }

  const res = await fetch(`${API_BASE_URL}/api/locations/cities/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || "Failed to update city");
  }
  return normalizeResponse<CityData>(json, "City updated successfully");
}


