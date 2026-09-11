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

// Resilient default seed data if database has not yet been seeded with styles
export const DEFAULT_STYLE_TYPES: StyleTypeResponse[] = [
  {
    id: 'st-01',
    name: 'Haircut & Styling',
    code: 'HAIRCUT',
    description: 'Precision scissor work, fades, tapers, and bespoke styling rituals',
    imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500',
    gender: 'UNISEX',
    isActive: true,
    specificStyleCount: 4,
  },
  {
    id: 'st-02',
    name: 'Beard & Mustache Sculpt',
    code: 'BEARD',
    description: 'Hot lather razor lines, hot towel conditioning, and beard oil nourishment',
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500',
    gender: 'MALE',
    isActive: true,
    specificStyleCount: 3,
  },
  {
    id: 'st-03',
    name: 'Spa & Scalp Therapy',
    code: 'SPA',
    description: 'Deep detoxifying scalp rituals, facial steamer treatment, and stress relief',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500',
    gender: 'UNISEX',
    isActive: true,
    specificStyleCount: 3,
  },
  {
    id: 'st-04',
    name: 'Color & Highlights',
    code: 'COLOR',
    description: 'Executive grey blending, balayage, and vibrant custom tones',
    imageUrl: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=500',
    gender: 'UNISEX',
    isActive: true,
    specificStyleCount: 2,
  },
];

export const DEFAULT_SPECIFIC_STYLES: SpecificStyleResponse[] = [
  {
    id: 'spec-01',
    styleTypeId: 'st-01',
    styleTypeName: 'Haircut & Styling',
    styleTypeCode: 'HAIRCUT',
    name: 'Taper Fade & Textured Crop',
    code: 'TAPER_FADE',
    description: 'Seamless skin fade blended into a textured scissor-cut top with matte finish clay.',
    price: 650,
    durationMinutes: 35,
    imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500',
    suitableFaceShapes: 'Oval, Square, Round',
    suitableHairTypes: 'Straight, Wavy',
    gender: 'MALE',
    isActive: true,
  },
  {
    id: 'spec-02',
    styleTypeId: 'st-01',
    styleTypeName: 'Haircut & Styling',
    styleTypeCode: 'HAIRCUT',
    name: 'Classic Executive Pompadour',
    code: 'POMPADOUR',
    description: 'Timeless high-volume gentleman cut with tapered neck and high-gloss pomade.',
    price: 850,
    durationMinutes: 45,
    imageUrl: 'https://images.unsplash.com/photo-1517832606589-7629c3ae771a?w=500',
    suitableFaceShapes: 'Oval, Rectangular',
    suitableHairTypes: 'Thick, Straight',
    gender: 'MALE',
    isActive: true,
  },
  {
    id: 'spec-03',
    styleTypeId: 'st-01',
    styleTypeName: 'Haircut & Styling',
    styleTypeCode: 'HAIRCUT',
    name: 'Low Buzz Cut & Edge Up',
    code: 'BUZZ_CUT',
    description: 'Crisp line-up with #2 guard fade and straight-razor hairline detailing.',
    price: 450,
    durationMinutes: 25,
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500',
    suitableFaceShapes: 'Square, Diamond',
    suitableHairTypes: 'All Types',
    gender: 'MALE',
    isActive: true,
  },
  {
    id: 'spec-04',
    styleTypeId: 'st-01',
    styleTypeName: 'Haircut & Styling',
    styleTypeCode: 'HAIRCUT',
    name: 'Layered French Bob',
    code: 'FRENCH_BOB',
    description: 'Chic Parisian chin-length cut with effortless texturing and airy fringe.',
    price: 950,
    durationMinutes: 50,
    imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500',
    suitableFaceShapes: 'Heart, Oval',
    suitableHairTypes: 'Fine, Wavy',
    gender: 'FEMALE',
    isActive: true,
  },
  {
    id: 'spec-05',
    styleTypeId: 'st-02',
    styleTypeName: 'Beard & Mustache Sculpt',
    styleTypeCode: 'BEARD',
    name: 'Hot Towel Beard Sculpt & Shape',
    code: 'BEARD_SCULPT',
    description: 'Steam towel infusion, straight-edge cheek line detailing, and cedarwood oil massage.',
    price: 450,
    durationMinutes: 25,
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500',
    suitableFaceShapes: 'All Shapes',
    suitableHairTypes: 'Coarse, Curly',
    gender: 'MALE',
    isActive: true,
  },
  {
    id: 'spec-06',
    styleTypeId: 'st-02',
    styleTypeName: 'Beard & Mustache Sculpt',
    styleTypeCode: 'BEARD',
    name: 'Royal Shave & Face Massage',
    code: 'ROYAL_SHAVE',
    description: 'Triple hot lather traditional straight razor shave with botanical aftershave balm.',
    price: 550,
    durationMinutes: 30,
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500',
    suitableFaceShapes: 'All Shapes',
    suitableHairTypes: 'All Types',
    gender: 'MALE',
    isActive: true,
  },
  {
    id: 'spec-07',
    styleTypeId: 'st-03',
    styleTypeName: 'Spa & Scalp Therapy',
    styleTypeCode: 'SPA',
    name: 'Keratin Deep Scalp Detox',
    code: 'KERATIN_SPA',
    description: 'Invigorating tea tree scalp scrub, steam infusion, and acupressure head massage.',
    price: 1100,
    durationMinutes: 45,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500',
    suitableFaceShapes: 'All',
    suitableHairTypes: 'Dry, Dandruff-prone',
    gender: 'UNISEX',
    isActive: true,
  },
];

class StyleService {
  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return ''; // browser relative proxy
    }
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';
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
      console.warn('⚠️ [styleService: getStyleTypes] Could not fetch live style types, using defaults:', err);
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
    return DEFAULT_STYLE_TYPES.find(st => st.id === id) || null;
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
      console.warn('⚠️ [styleService: getAllSpecificStyles] Could not fetch from backend, using defaults:', err);
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
    return DEFAULT_SPECIFIC_STYLES.filter(s => s.styleTypeId === styleTypeId);
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
    return DEFAULT_SPECIFIC_STYLES.filter(s => s.styleTypeCode === typeCode.toUpperCase());
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
