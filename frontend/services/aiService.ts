import { AIAnalysisResult } from '../types';
import { DEMO_HAIRSTYLES } from './mockData';

export interface IAIService {
  analyzeSelfie(imageFileOrBase64: string): Promise<AIAnalysisResult>;
  getHairstylePreview(selfie: string, hairstyleId: string): Promise<string>;
}

export class MockAIService implements IAIService {
  async analyzeSelfie(_image: string): Promise<AIAnalysisResult> {
    // Simulate AI inference latency
    await new Promise((resolve) => setTimeout(resolve, 1400));

    return {
      faceShape: 'Oval',
      hairType: 'Wavy',
      hairDensity: 'Medium',
      analyzedAt: new Date().toISOString(),
      recommendations: [
        {
          hairstyleId: 'HS01',
          name: 'Textured Crop',
          matchScore: 95,
          reason: 'Works well with oval face shape and wavy hair. Adds clean volume on top while keeping the profile sharp.',
          imageUrl: DEMO_HAIRSTYLES[0].imageUrl,
          mappedServiceId: DEMO_HAIRSTYLES[0].mappedServiceId,
        },
        {
          hairstyleId: 'HS02',
          name: 'Low Drop Fade & Pompadour',
          matchScore: 91,
          reason: 'Accentuates cheekbone symmetry and balances jawline proportions with subtle top height.',
          imageUrl: DEMO_HAIRSTYLES[1].imageUrl,
          mappedServiceId: DEMO_HAIRSTYLES[1].mappedServiceId,
        },
        {
          hairstyleId: 'HS03',
          name: 'Executive Side Part & Taper',
          matchScore: 88,
          reason: 'Classic structured silhouette suitable for professional styling and manageable hold.',
          imageUrl: DEMO_HAIRSTYLES[2].imageUrl,
          mappedServiceId: DEMO_HAIRSTYLES[2].mappedServiceId,
        },
      ],
    };
  }

  async getHairstylePreview(_selfie: string, hairstyleId: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const style = DEMO_HAIRSTYLES.find((h) => h.id === hairstyleId);
    return style ? style.imageUrl : DEMO_HAIRSTYLES[0].imageUrl;
  }
}

export class ApiAIService implements IAIService {
  private baseUrl: string;
  private fallback: MockAIService;

  constructor() {
    this.baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
    this.fallback = new MockAIService();
  }

  async analyzeSelfie(imageFileOrBase64: string): Promise<AIAnalysisResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/analyze-hairstyle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageFileOrBase64 }),
      });

      if (!response.ok) {
        throw new Error(`API AI status error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.warn('Backend AI API unreachable or returned error. Falling back to MockAIService.', err);
      return this.fallback.analyzeSelfie(imageFileOrBase64);
    }
  }

  async getHairstylePreview(selfie: string, hairstyleId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/preview-hairstyle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selfie, hairstyleId }),
      });

      if (!response.ok) throw new Error('Preview API failed');
      const data = await response.json();
      return data.previewUrl;
    } catch (err) {
      return this.fallback.getHairstylePreview(selfie, hairstyleId);
    }
  }
}

// Swappable singleton
const isMockForced = process.env.NEXT_PUBLIC_FORCE_MOCK === 'true';
export const aiService: IAIService = isMockForced ? new MockAIService() : new ApiAIService();
