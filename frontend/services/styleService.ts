import { getApiBaseUrl } from './apiConfig';

export interface StyleTypeRequest {
  name: string;
  code: string;
  description?: string;
  imageUrl?: string;
  gender?: string;
  salonId?: string;
}

export interface StyleTypeResponse {
  id: string;
  salonId?: string | null;
  name: string;
  code: string;
  description?: string;
  imageUrl?: string;
  gender?: string;
  isActive: boolean;
  specificStyleCount?: number;
  createdAt?: string;
}

export interface SpecificStyleRequest {
  styleTypeId?: string;
  styleTypeCode?: string;
  name: string;
  code: string;
  description?: string;
  price: number;
  durationMinutes: number;
  imageUrl?: string;
  suitableFaceShapes?: string;
  suitableHairTypes?: string;
  gender?: string;
}

export interface SpecificStyleResponse {
  id: string;
  styleTypeId: string;
  styleTypeName?: string;
  styleTypeCode?: string;
  name: string;
  code: string;
  description?: string;
  price: number;
  durationMinutes: number;
  imageUrl?: string;
  suitableFaceShapes?: string;
  suitableHairTypes?: string;
  gender?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const DEFAULT_STYLE_TYPES: StyleTypeResponse[] = [];
export const DEFAULT_SPECIFIC_STYLES: SpecificStyleResponse[] = [];

class StyleService {
  private getBaseUrl(): string {
    return getApiBaseUrl();
  }

  // --- Style Types API ---

  async getStyleTypes(params?: { gender?: string; salonId?: string }): Promise<StyleTypeResponse[]> {
    const query = new URLSearchParams();
    if (params?.gender) query.set('gender', params.gender);
    if (params?.salonId) query.set('salonId', params.salonId);
    const qs = query.toString() ? `?${query.toString()}` : '';

    console.log(`💈 [styleService: getStyleTypes] Querying /api/styles/types${qs}...`);
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/styles/types${qs}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : null);
        if (items && items.length > 0) {
          console.log(`✅ [styleService: getStyleTypes] Loaded ${items.length} live style types from DB:`, items);
          return items;
        }
      }
    } catch (err) {
      console.warn('⚠️ [styleService: getStyleTypes] Could not fetch live style types:', err);
    }
    return [];
  }

  async getStyleTypeById(id: string): Promise<StyleTypeResponse | null> {
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/styles/types/${id}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
    } catch (err) {
      console.error(`❌ [styleService: getStyleTypeById] Error fetching ${id}:`, err);
    }
    return null;
  }

  async createStyleType(payload: StyleTypeRequest): Promise<StyleTypeResponse> {
    console.log("💈 [styleService: createStyleType] POST /api/styles/types:", payload);
    const res = await fetch(`${this.getBaseUrl()}/api/styles/types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to create style type');
    }
    console.log("✅ [styleService: createStyleType] Created:", json.data);
    return json.data;
  }

  async updateStyleType(id: string, payload: Partial<StyleTypeRequest>): Promise<StyleTypeResponse> {
    const res = await fetch(`${this.getBaseUrl()}/api/styles/types/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to update style type');
    }
    return json.data;
  }

  async deleteStyleType(id: string): Promise<void> {
    const res = await fetch(`${this.getBaseUrl()}/api/styles/types/${id}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.message || 'Failed to delete style type');
    }
  }

  // --- Specific Styles API ---

  async getAllSpecificStyles(params?: { gender?: string }): Promise<SpecificStyleResponse[]> {
    const query = new URLSearchParams();
    if (params?.gender) query.set('gender', params.gender);
    const qs = query.toString() ? `?${query.toString()}` : '';

    console.log(`💈 [styleService: getAllSpecificStyles] Querying /api/styles/specific${qs}...`);
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/styles/specific${qs}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : null);
        if (items && items.length > 0) {
          console.log(`✅ [styleService: getAllSpecificStyles] Loaded ${items.length} live specific styles from DB:`, items);
          return items;
        }
      }
    } catch (err) {
      console.warn('⚠️ [styleService: getAllSpecificStyles] Could not fetch from backend:', err);
    }
    return [];
  }

  async getSpecificStylesByType(styleTypeId: string, gender?: string): Promise<SpecificStyleResponse[]> {
    const qs = gender ? `?gender=${gender}` : '';
    console.log(`💈 [styleService: getSpecificStylesByType] Querying /api/styles/specific/type/${styleTypeId}${qs}...`);
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/styles/specific/type/${styleTypeId}${qs}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : null);
        if (items && items.length > 0) {
          return items;
        }
      }
    } catch (err) {
      console.warn(`⚠️ [styleService: getSpecificStylesByType] Failed for type ${styleTypeId}:`, err);
    }
    return [];
  }

  async getSpecificStylesByTypeCode(typeCode: string): Promise<SpecificStyleResponse[]> {
    console.log(`💈 [styleService: getSpecificStylesByTypeCode] Querying /api/styles/specific/type-code/${typeCode}...`);
    try {
      const res = await fetch(`${this.getBaseUrl()}/api/styles/specific/type-code/${typeCode}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : null);
        if (items && items.length > 0) {
          return items;
        }
      }
    } catch (err) {
      console.warn(`⚠️ [styleService: getSpecificStylesByTypeCode] Failed for code ${typeCode}:`, err);
    }
    return [];
  }

  async createSpecificStyle(payload: SpecificStyleRequest): Promise<SpecificStyleResponse> {
    console.log("💈 [styleService: createSpecificStyle] POST /api/styles/specific:", payload);
    const res = await fetch(`${this.getBaseUrl()}/api/styles/specific`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to create specific style');
    }
    console.log("✅ [styleService: createSpecificStyle] Created:", json.data);
    return json.data;
  }
}

export const styleService = new StyleService();
