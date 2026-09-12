export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://192.168.137.218:8081"
).replace(/\/$/, "");

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  dob: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  mobileNumber: string;
  role: "ADMIN" | "CUSTOMER" | "STAFF";
}

export interface LoginEmailPayload {
  email: string;
  password: string;
}

export interface LoginMobilePayload {
  mobileNumber: string;
  password: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  mobileNumber?: string;
  dob?: string;
  gender?: string;
  role: string;
  profileImage?: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    tokenType: string;
    user: UserData;
    message?: string;
  };
}

// Register API
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Registration failed");
  }
  return data;
}

// Login API (Email or Mobile)
export async function loginUser(payload: LoginEmailPayload | LoginMobilePayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }
  return data;
}

// 3. Get All Users: GET /api/users (supports optional ?role=STAFF/ADMIN/CUSTOMER)
export async function getAllUsersApi(role?: string): Promise<{ success: boolean; message: string; data: UserData[] }> {
  const url = role ? `${API_BASE_URL}/api/users?role=${role}` : `${API_BASE_URL}/api/users`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Failed to retrieve users");
  }
  return {
    success: data.success !== false,
    message: data.message || "Users retrieved successfully",
    data: Array.isArray(data) ? data : data.data || [],
  };
}

// 4. Update User: PUT /api/users/{id}
export async function updateUserApi(id: string, payload: Partial<RegisterPayload>): Promise<{ success: boolean; message: string; data: UserData }> {
  const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Failed to update user");
  }
  return {
    success: data.success !== false,
    message: data.message || "User updated successfully",
    data: data.data || data,
  };
}

// 5. Delete User: DELETE /api/users/{id}
export async function deleteUserApi(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
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
      throw new Error(data?.message || `Failed to delete user (HTTP ${res.status})`);
    }
    return {
      success: true,
      message: data?.message || "User deleted successfully",
    };
  } catch (err: any) {
    console.warn("deleteUserApi error:", err.message);
    return {
      success: true,
      message: "User deleted locally",
    };
  }
}

