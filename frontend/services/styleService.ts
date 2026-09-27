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

export const DEFAULT_STYLE_TYPES: StyleTypeResponse[] = [
  {
    id: 'st-01',
    name: 'Precision Haircuts',
    code: 'HAIRCUT',
    description: 'Modern cuts, fades, textured crops & classic styles',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    gender: 'ALL',
    isActive: true,
    specificStyleCount: 4,
  },
  {
    id: 'st-02',
    name: 'Beard Sculpt & Shave',
    code: 'BEARD',
    description: 'Sharp razor lines, hot towel treatments & beard sculpting',
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80',
    gender: 'MALE',
    isActive: true,
    specificStyleCount: 3,
  },
  {
    id: 'st-03',
    name: 'Color & Balayage',
    code: 'COLOR',
    description: 'Highlights, global hair color, balayage & tone gloss',
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
    gender: 'ALL',
    isActive: true,
    specificStyleCount: 3,
  },
  {
    id: 'st-04',
    name: 'Spa & Scalp Care',
    code: 'SPA',
    description: 'Detox head massages, hair spa & deep conditioning',
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80',
    gender: 'ALL',
    isActive: true,
    specificStyleCount: 2,
  },
];

export const DEFAULT_SPECIFIC_STYLES: SpecificStyleResponse[] = [
  {
    id: 'spec-01',
    styleTypeId: 'st-01',
    styleTypeCode: 'HAIRCUT',
    name: 'Textured Crop Fade',
    code: 'TC_FADE',
    description: 'High skin fade on the sides with textured scissor cut on top. Styled with matte clay.',
    price: 499,
    durationMinutes: 30,
    imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80',
    suitableFaceShapes: 'Oval, Heart, Square',
    suitableHairTypes: 'Straight, Wavy',
    gender: 'MALE',
    isActive: true,
  },
  {
    id: 'spec-02',
    styleTypeId: 'st-01',
    styleTypeCode: 'HAIRCUT',
    name: 'Classic Side Part Pompadour',
    code: 'POMP_CLASSIC',
    description: 'Timeless low taper with voluminous pomp top. Styled with natural shine pomade.',
    price: 549,
    durationMinutes: 35,
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    suitableFaceShapes: 'Round, Oval, Diamond',
    suitableHairTypes: 'Straight, Thick',
    gender: 'MALE',
    isActive: true,
  },
  {
    id: 'spec-03',
    styleTypeId: 'st-01',
    styleTypeCode: 'HAIRCUT',
    name: 'Modern Butterfly Layer Cut',
    code: 'BUTTERFLY_LAYER',
    description: 'Feathered face-framing layers with voluminous bounce and curtain bangs.',
    price: 899,
    durationMinutes: 45,
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    suitableFaceShapes: 'Oval, Round, Heart',
    suitableHairTypes: 'All Types',
    gender: 'FEMALE',
    isActive: true,
  },
  {
    id: 'spec-04',
    styleTypeId: 'st-02',
    styleTypeCode: 'BEARD',
    name: 'Royal Beard Sculpt & Hot Towel',
    code: 'BEARD_ROYAL',
    description: 'Sharp razor lines, beard softening oil massage & herbal hot towel wrap.',
    price: 349,
    durationMinutes: 25,
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80',
    suitableFaceShapes: 'All Face Shapes',
    suitableHairTypes: 'Beard Grooming',
    gender: 'MALE',
    isActive: true,
  },
  {
    id: 'spec-05',
    styleTypeId: 'st-03',
    styleTypeCode: 'COLOR',
    name: 'Dimensional Balayage & Ash Highlights',
    code: 'BALAYAGE_ASH',
    description: 'Hand-painted sun-kissed blonde or caramel highlights with gloss toner.',
    price: 1899,
    durationMinutes: 75,
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
    suitableFaceShapes: 'All Types',
    suitableHairTypes: 'Wavy, Straight, Thick',
    gender: 'FEMALE',
    isActive: true,
  },
  {
    id: 'spec-06',
    styleTypeId: 'st-04',
    styleTypeCode: 'SPA',
    name: 'Charcoal Scalp Detox & Head Massage',
    code: 'SPA_DETOX',
    description: 'Exfoliating scalp scrub followed by relaxing pressure point massage and cooling tonic.',
    price: 649,
    durationMinutes: 30,
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80',
    suitableFaceShapes: 'All Types',
    suitableHairTypes: 'All Types',
    gender: 'ALL',
    isActive: true,
  }
];

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

    try {
      const res = await fetch(`${this.getBaseUrl()}/api/styles/types${qs}`, {
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
    } catch {
      // Backend not available or endpoint empty - fallback to defaults
    }
    return DEFAULT_STYLE_TYPES;
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
      // Backend not reached, fall back to default catalog styles
    }
    return DEFAULT_SPECIFIC_STYLES;
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
