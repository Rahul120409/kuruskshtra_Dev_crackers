import {
  AIRecommendationResponse,
  FaceShape,
  HairDensity,
  HairType,
  HairstyleRecommendation
} from './types';
import { HAIRSTYLE_CATALOG, getHairstyleById, getHairstylesByGender } from './catalog';
import { MockAIService } from './mockAiService';

export interface VisionAnalysisOptions {
  imageInput: string; // Base64 (with or without data URI) or image URL
  mimeType?: string;
  preferredGender?: 'boy' | 'girl' | 'male' | 'female';
  forceMock?: boolean;
}

export class GeminiVisionService {
  /**
   * Analyzes customer selfie, detects gender (boy or girl) and face shape,
   * and returns catalog-matched hairstyle recommendations strictly tailored to their gender.
   */
  static async analyzeSelfie(options: VisionAnalysisOptions): Promise<AIRecommendationResponse> {
    const { imageInput, mimeType = 'image/jpeg', preferredGender, forceMock } = options;

    const apiKey = process.env.GEMINI_API_KEY;

    // Normalize gender
    const normalizedGender: 'boy' | 'girl' =
      preferredGender === 'girl' || preferredGender === 'female' ? 'girl' : 'boy';

    // Fast-path to mock if forced or no key is configured
    if (forceMock || !apiKey) {
      console.warn('[GeminiVisionService] Using MockAIService preset.');
      return MockAIService.getMockRecommendations(normalizedGender === 'girl' ? 'girl-oval' : 'boy-oval');
    }

    try {
      // Clean base64 data
      let base64Data = imageInput;
      let detectedMime = mimeType;

      if (imageInput.startsWith('data:')) {
        const matches = imageInput.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          detectedMime = matches[1];
          base64Data = matches[2];
        }
      }

      const catalogSummary = HAIRSTYLE_CATALOG.map(h => ({
        id: h.id,
        name: h.name,
        targetGender: h.targetGender,
        category: h.category,
        suitableFaceShapes: h.suitableFaceShapes,
        suitableHairTypes: h.suitableHairTypes,
        description: h.description
      }));

      const systemPrompt = `You are the Master AI Stylist for "NovaQ AI".
Analyze the user's face in the provided selfie:
1. Detect whether the person is a 'boy' (male) or 'girl' (female). If unclear or preference is provided, respect preference: "${preferredGender || 'auto-detect'}".
2. Identify their facial geometry (faceShape: "Oval", "Round", "Square", "Heart", "Diamond", or "Oblong").
3. Identify hairType ("Straight", "Wavy", "Curly", "Coily") and hairDensity ("Thin", "Medium", "Thick").
4. CRITICAL: Recommend 3 to 4 hairstyles ONLY from the catalog matching their detected gender (boys' styles for boys, girls' styles for girls).
5. DO NOT invent new hairstyle names or IDs. Use the catalog IDs and names strictly.

CATALOG:
${JSON.stringify(catalogSummary, null, 2)}`;

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: systemPrompt },
              {
                inline_data: {
                  mime_type: detectedMime,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          response_mime_type: 'application/json',
          response_schema: {
            type: 'OBJECT',
            properties: {
              detectedGender: {
                type: 'STRING',
                enum: ['boy', 'girl']
              },
              faceShape: {
                type: 'STRING',
                enum: ['Oval', 'Round', 'Square', 'Heart', 'Diamond', 'Oblong']
              },
              hairType: {
                type: 'STRING',
                enum: ['Straight', 'Wavy', 'Curly', 'Coily']
              },
              hairDensity: {
                type: 'STRING',
                enum: ['Thin', 'Medium', 'Thick']
              },
              facialFeaturesDetected: {
                type: 'ARRAY',
                items: { type: 'STRING' }
              },
              recommendations: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    hairstyleId: { type: 'STRING' },
                    name: { type: 'STRING' },
                    matchScore: { type: 'INTEGER' },
                    reason: { type: 'STRING' }
                  },
                  required: ['hairstyleId', 'name', 'matchScore', 'reason']
                }
              }
            },
            required: ['detectedGender', 'faceShape', 'hairType', 'hairDensity', 'recommendations']
          }
        }
      };

      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(12000)
      });

      if (!response.ok) {
        console.warn('[GeminiVisionService] API Error, falling back to mock.');
        return MockAIService.getMockRecommendations(normalizedGender === 'girl' ? 'girl-oval' : 'boy-oval');
      }

      const result = await response.json();
      const contentText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!contentText) {
        return MockAIService.getMockRecommendations(normalizedGender === 'girl' ? 'girl-oval' : 'boy-oval');
      }

      const parsed = JSON.parse(contentText);
      const detectedGen: 'boy' | 'girl' = parsed.detectedGender || normalizedGender;

      // Validate recommendations against gender catalog
      const validatedRecs: HairstyleRecommendation[] = [];
      for (const rec of parsed.recommendations || []) {
        const item = getHairstyleById(rec.hairstyleId);
        if (item && (item.targetGender === detectedGen || item.targetGender === 'unisex')) {
          validatedRecs.push({
            hairstyleId: item.id,
            name: item.name,
            targetGender: item.targetGender,
            matchScore: Math.min(99, Math.max(60, Number(rec.matchScore) || 88)),
            reason: rec.reason || `Flattering style for ${parsed.faceShape} face shape.`,
            imageUrl: item.imageUrl,
            tryOnImageUrl: item.imageUrl,
            category: item.category
          });
        }
      }

      // If fewer than 3, backfill from catalog
      if (validatedRecs.length < 3) {
        const fallback = MockAIService.matchTraitsToCatalog(
          parsed.faceShape as FaceShape,
          parsed.hairType as HairType,
          parsed.hairDensity as HairDensity,
          detectedGen
        );
        for (const fbItem of fallback.recommendations) {
          if (!validatedRecs.some(r => r.hairstyleId === fbItem.hairstyleId) && validatedRecs.length < 3) {
            validatedRecs.push(fbItem);
          }
        }
      }

      return {
        detectedGender: detectedGen,
        faceShape: parsed.faceShape as FaceShape,
        hairType: parsed.hairType as HairType,
        hairDensity: parsed.hairDensity as HairDensity,
        facialFeaturesDetected: parsed.facialFeaturesDetected || [
          `${detectedGen === 'boy' ? 'Male' : 'Female'} facial structure identified`,
          `${parsed.faceShape} contour detected`,
          `${parsed.hairType} density analyzed`
        ],
        recommendations: validatedRecs,
        analyzedAt: new Date().toISOString(),
        isMock: false
      };
    } catch (error) {
      console.error('[GeminiVisionService] Exception during vision analysis:', error);
      return MockAIService.getMockRecommendations(normalizedGender === 'girl' ? 'girl-oval' : 'boy-oval');
    }
  }
}
