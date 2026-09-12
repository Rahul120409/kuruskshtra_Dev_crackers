import { User } from '../types';
import { getApiBaseUrl } from './apiConfig';

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
  private getBaseUrl(): string {
    return getApiBaseUrl();
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
      const res = await fetch(`${this.getBaseUrl()}/api/auth/login`, {
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
          localStorage.setItem('salonflow_user', JSON.stringify(user));
          if (token) {
            localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, token);
            localStorage.setItem('salonflow_token', token);
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
        error: `Could not connect to backend at ${this.getBaseUrl()}. Please verify the server is running.`,
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
      const res = await fetch(`${this.getBaseUrl()}/api/auth/register`, {
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
        error: `Could not connect to backend at ${this.getBaseUrl()}. Please verify the server is running.`,
      };
    }
  }

  /**
   * Real-time User Profile Update
   * Contract:
   * PUT /api/users/{id}
   * Body:
   * {
   *   "name": "...",
   *   "email": "...",
   *   "phone": "...",
   *   "dob": "1998-05-15",
   *   "gender": "MALE",
   *   "profileImage": "https://..."
   * }
   */
  async updateProfile(userId: string, data: Partial<User>): Promise<AuthResponse> {
    const payload: any = {};
    if (data.name) payload.name = data.name.trim();
    if (data.email) payload.email = data.email.trim();
    if (data.phone) {
      const cleanPhone = data.phone.replace(/\D/g, '');
      payload.phone = cleanPhone;
      payload.mobileNumber = cleanPhone;
    }
    if (data.dob) payload.dob = data.dob;
    if (data.gender) {
      const g = data.gender.toUpperCase();
      if (g.includes('FEMALE')) payload.gender = 'FEMALE';
      else if (g.includes('MALE')) payload.gender = 'MALE';
      else payload.gender = 'OTHER';
    }
    if (data.profileImage) payload.profileImage = data.profileImage.trim();

    try {
      const token = this.getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Check if user ID is a valid UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      let currentUser = this.getCurrentUser();
      let updatedUser: User = {
        id: userId,
        name: data.name || currentUser?.name || 'Customer',
        email: data.email || currentUser?.email || '',
        phone: data.phone || currentUser?.phone || '',
        role: currentUser?.role || 'CUSTOMER',
        dob: data.dob || currentUser?.dob,
        gender: data.gender || currentUser?.gender,
        profileImage: data.profileImage || currentUser?.profileImage,
        preferredArea: data.preferredArea || currentUser?.preferredArea,
        hairNotes: data.hairNotes || currentUser?.hairNotes,
        createdAt: currentUser?.createdAt,
      };

      if (isUuid) {
        console.log(`💈 [authService: updateProfile] Calling PUT /api/users/${userId}:`, payload);
        const res = await fetch(`${this.getBaseUrl()}/api/users/${userId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });

        const resData = await res.json().catch(() => null);

        if (res.ok && resData) {
          const raw = resData.data || resData.user || resData;
          updatedUser = {
            id: raw.id || userId,
            name: raw.name || data.name || updatedUser.name,
            email: raw.email || data.email || updatedUser.email,
            phone: raw.phone || raw.mobileNumber || data.phone || updatedUser.phone,
            role: raw.role || updatedUser.role,
            dob: raw.dob || data.dob || updatedUser.dob,
            gender: raw.gender || data.gender || updatedUser.gender,
            profileImage: raw.profileImage || data.profileImage || updatedUser.profileImage,
            preferredArea: data.preferredArea || updatedUser.preferredArea,
            hairNotes: data.hairNotes !== undefined ? data.hairNotes : updatedUser.hairNotes,
            createdAt: raw.createdAt || updatedUser.createdAt,
          };
          console.log('✅ [authService: updateProfile] Profile successfully updated in database:', updatedUser);
        } else {
          const errorMsg = resData?.message || resData?.error || `Failed with status ${res.status}`;
          console.warn(`⚠️ [authService: updateProfile] Backend notice: ${errorMsg}`);
          return {
            success: false,
            error: errorMsg,
          };
        }
      }

      // Save locally to persist styling preferences and update memory
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(updatedUser));
        localStorage.setItem('salonflow_user', JSON.stringify(updatedUser));
      }

      return {
        success: true,
        user: updatedUser,
        message: 'Profile updated successfully',
      };
    } catch (err: any) {
      console.error('Error updating user profile via API:', err);
      // If server is unreachable, fall back to local update
      const currentUser = this.getCurrentUser();
      const fallbackUser: User = {
        id: userId,
        name: data.name || currentUser?.name || 'Customer',
        email: data.email || currentUser?.email || '',
        phone: data.phone || currentUser?.phone || '',
        role: currentUser?.role || 'CUSTOMER',
        dob: data.dob || currentUser?.dob,
        gender: data.gender || currentUser?.gender,
        profileImage: data.profileImage || currentUser?.profileImage,
        preferredArea: data.preferredArea || currentUser?.preferredArea,
        hairNotes: data.hairNotes !== undefined ? data.hairNotes : currentUser?.hairNotes,
        createdAt: currentUser?.createdAt,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(fallbackUser));
        localStorage.setItem('salonflow_user', JSON.stringify(fallbackUser));
      }
      return {
        success: true,
        user: fallbackUser,
        message: 'Profile saved locally (Offline mode)',
      };
    }
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
      localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
      localStorage.removeItem('salonflow_user');
      localStorage.removeItem('salonflow_token');
    }
  }
}

export const authService = new AuthService();
