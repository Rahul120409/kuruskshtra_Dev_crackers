import { User } from '../types';

const STORAGE_KEY_AUTH_USER = 'salonflow_auth_user';
const STORAGE_KEY_AUTH_TOKEN = 'salonflow_auth_token';

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  message?: string;
}

export class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.137.199:8081';
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (!raw) return null; // Guest by default
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEY_AUTH_TOKEN);
  }

  /**
   * Real-time Login with Email or Mobile Number
   * Contract:
   * With Email: POST /api/auth/login { "email": "...", "password": "..." }
   * With Mobile: POST /api/auth/login { "mobileNumber": "...", "password": "..." }
   */
  async login(emailOrPhone: string, password: string): Promise<AuthResponse> {
    const trimmedInput = emailOrPhone.trim();
    const isEmail = trimmedInput.includes('@');

    // Build payload according to real-time contract
    const payload = isEmail
      ? { email: trimmedInput, password }
      : { mobileNumber: trimmedInput.replace(/\D/g, ''), password };

    try {
      const res = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json().catch(() => null);

      if (res.ok && resData) {
        // Handle response shape { success: true, message: "...", data: { token: "...", user: {...} } }
        const token = resData.data?.token || resData.token;
        const rawUser = resData.data?.user || resData.user || resData.data;

        const user: User = {
          id: rawUser.id || 'usr-' + Date.now(),
          name: rawUser.name || 'Customer',
          email: rawUser.email || '',
          phone: rawUser.phone || rawUser.mobileNumber || '',
          role: rawUser.role || 'CUSTOMER',
          dob: rawUser.dob,
          gender: rawUser.gender,
          profileImage: rawUser.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          createdAt: rawUser.createdAt,
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
          if (token) {
            localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token);
          }
        }

        return {
          success: true,
          user,
          token,
          message: resData.message || 'Login successful',
        };
      }

      // Handle backend error responses (e.g. 401, 400, 404)
      const errorMsg =
        resData?.message ||
        resData?.error ||
        (res.status === 401
          ? 'Invalid credentials. If you are a new user, please register first.'
          : `Login failed (Status: ${res.status})`);

      return {
        success: false,
        error: errorMsg,
      };
    } catch (err: any) {
      console.error('Real-time login connection error:', err);
      return {
        success: false,
        error: `Could not connect to backend at ${this.baseUrl}. Please verify the server is running.`,
      };
    }
  }

  /**
   * Real-time Registration
   * Contract:
   * POST /api/auth/register
   * Body:
   * {
   *   "name": "...",
   *   "email": "...",
   *   "password": "...",
   *   "confirmPassword": "...",
   *   "dob": "1998-05-15",
   *   "gender": "MALE",
   *   "mobileNumber": "9876543210",
   *   "role": "CUSTOMER"
   * }
   */
  async register(data: {
    name: string;
    email: string;
    phone: string;
    dob?: string;
    gender?: string;
    password: string;
    confirmPassword?: string;
  }): Promise<AuthResponse> {
    const cleanMobile = data.phone.replace(/\D/g, '');
    const cleanGender = (data.gender || 'MALE').toUpperCase();

    const payload = {
      name: data.name.trim(),
      email: data.email.trim(),
      password: data.password,
      confirmPassword: data.confirmPassword || data.password,
      dob: data.dob || '1998-01-01',
      gender: cleanGender,
      mobileNumber: cleanMobile,
      role: 'CUSTOMER',
    };

    try {
      const res = await fetch(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json().catch(() => null);

      if ((res.status === 201 || res.ok) && resData) {
        const token = resData.data?.token || resData.token;
        const rawUser = resData.data?.user || resData.user || resData.data;

        const user: User = {
          id: rawUser?.id || 'usr-' + Date.now(),
          name: rawUser?.name || data.name,
          email: rawUser?.email || data.email,
          phone: rawUser?.phone || rawUser?.mobileNumber || cleanMobile,
          role: rawUser?.role || 'CUSTOMER',
          dob: rawUser?.dob || data.dob,
          gender: rawUser?.gender || cleanGender as any,
          profileImage: rawUser?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          createdAt: rawUser?.createdAt || new Date().toISOString(),
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
          if (token) {
            localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token);
          }
        }

        return {
          success: true,
          user,
          token,
          message: resData.message || 'User registered successfully',
        };
      }

      const errorMsg =
        resData?.message ||
        resData?.error ||
        `Registration failed (Status: ${res.status})`;

      return {
        success: false,
        error: errorMsg,
      };
    } catch (err: any) {
      console.error('Real-time registration connection error:', err);
      return {
        success: false,
        error: `Could not connect to backend at ${this.baseUrl}. Please verify the server is running.`,
      };
    }
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
      localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
    }
  }
}

export const authService = new AuthService();
