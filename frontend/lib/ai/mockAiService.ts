import {
  AIRecommendationResponse,
  FaceShape,
  HairType,
  HairDensity,
  OperationsIntelligenceReport,
  QueueWaitEstimate
} from './types';
import { HAIRSTYLE_CATALOG, getHairstylesByGender } from './catalog';

export const MOCK_PRESETS: Record<string, AIRecommendationResponse> = {
  // ==================== BOY PRESETS ====================
  'boy-oval': {
    detectedGender: 'boy',
    faceShape: 'Oval',
    hairType: 'Wavy',
    hairDensity: 'Medium',
    userPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    facialFeaturesDetected: ['Balanced facial symmetry', 'Soft jawline taper', 'Natural wave pattern'],
    recommendations: [
      {
        hairstyleId: 'HS-B01',
        name: 'Textured Crop',
        matchScore: 95,
        targetGender: 'boy',
        reason: 'Works exceptionally well with your oval face shape and natural wavy texture, accentuating facial symmetry without requiring heavy daily styling.',
        imageUrl: HAIRSTYLE_CATALOG.find(h => h.id === 'HS-B01')?.imageUrl,
        tryOnImageUrl: '/looks/boy_crop.jpg',
        category: 'Fade'
      },
      {
        hairstyleId: 'HS-B02',
        name: 'Quiff',
        matchScore: 91,
        targetGender: 'boy',
        reason: 'The controlled height enhances your balanced cheekbone structure while celebrating your natural wavy movement.',
        imageUrl: HAIRSTYLE_CATALOG.find(h => h.id === 'HS-B02')?.imageUrl,
        tryOnImageUrl: '/looks/boy_quiff.jpg',
        category: 'Modern'
      },
      {
        hairstyleId: 'HS-B03',
        name: 'Pompadour',
        matchScore: 86,
        targetGender: 'boy',
        reason: 'A structured classic that looks great on oval face contours when groomed with medium-hold styling pomade.',
        imageUrl: HAIRSTYLE_CATALOG.find(h => h.id === 'HS-B03')?.imageUrl,
        tryOnImageUrl: '/looks/boy_pompadour.jpg',
        category: 'Classic'
      }
    ],
    analyzedAt: new Date().toISOString(),
    isMock: true
  },

  'boy-round': {
    detectedGender: 'boy',
    faceShape: 'Round',
    hairType: 'Straight',
    hairDensity: 'Medium',
    userPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
    facialFeaturesDetected: ['Soft curved jawline', 'Equal facial width and height', 'Straight strand texture'],
    recommendations: [
      {
        hairstyleId: 'HS-B02',
        name: 'Quiff',
        matchScore: 94,
        targetGender: 'boy',
        reason: 'The vertical volume of the quiff elongates round facial proportions, creating a more angular and balanced profile.',
        imageUrl: HAIRSTYLE_CATALOG.find(h => h.id === 'HS-B02')?.imageUrl,
        tryOnImageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80',
        category: 'Modern'
      },
      {
        hairstyleId: 'HS-B01',
        name: 'Textured Crop',
        matchScore: 89,
        targetGender: 'boy',
        reason: 'Tapered skin fade sides slim down the sides of the face while the textured top adds dynamic shape.',
        imageUrl: HAIRSTYLE_CATALOG.find(h => h.id === 'HS-B01')?.imageUrl,
        tryOnImageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&auto=format&fit=crop&q=80',
        category: 'Fade'
      },
      {
        hairstyleId: 'HS-B05',
        name: 'Side Part',
        matchScore: 84,
        targetGender: 'boy',
        reason: 'The defined side part creates diagonal lines that optically streamline curved face shapes.',
        imageUrl: HAIRSTYLE_CATALOG.find(h => h.id === 'HS-B05')?.imageUrl,
        tryOnImageUrl: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=800&auto=format&fit=crop&q=80',
        category: 'Classic'
      }
    ],
    analyzedAt: new Date().toISOString(),
    isMock: true
  },

  'boy-square': {
    detectedGender: 'boy',
    faceShape: 'Square',
    hairType: 'Curly',
    hairDensity: 'Thick',
    userPhotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
    facialFeaturesDetected: ['Prominent square jawline', 'Defined angles', 'Tight curl pattern'],
    recommendations: [
      {
        hairstyleId: 'HS-B04',
        name: 'Buzz Cut',
        matchScore: 96,
        targetGender: 'boy',
        reason: 'A sharp, masculine skin fade that frames strong chiseled cheekbones and jawlines perfectly with zero daily hassle.',
        imageUrl: HAIRSTYLE_CATALOG.find(h => h.id === 'HS-B04')?.imageUrl,
        tryOnImageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&auto=format&fit=crop&q=80',
        category: 'Fade'
      },
      {
        hairstyleId: 'HS-B06',
        name: 'Undercut',
        matchScore: 90,
        targetGender: 'boy',
        reason: 'Provides a clean contrast against strong jawlines while letting thick curly texture thrive on top.',
        imageUrl: HAIRSTYLE_CATALOG.find(h => h.id === 'HS-B06')?.imageUrl,
        tryOnImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
        category: 'Modern'
      },
      {
        hairstyleId: 'HS-B08',
        name: 'Crew Cut',
        matchScore: 85,
        targetGender: 'boy',
        reason: 'Channels disciplined crown volume to harmonize with wide, powerful jaw structures.',
        imageUrl: HAIRSTYLE_CATALOG.find(h => h.id === 'HS-B08')?.imageUrl,
        tryOnImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
        category: 'Short'
      }
    ],
    analyzedAt: new Date().toISOString(),
    isMock: true
  },

  // ==================== GIRL PRESETS ====================
  'girl-oval': {
    detectedGender: 'girl',
    faceShape: 'Oval',
    hairType: 'Wavy',
    hairDensity: 'Medium',
    userPhotoUrl: '/looks/girl_original.jpg',
    facialFeaturesDetected: ['Balanced facial symmetry', 'Soft cheekbone curves', 'Silky wavy flow'],
    recommendations: [
      {
        hairstyleId: 'HS-G01',
        name: 'Butterfly Cut',
        matchScore: 96,
        targetGender: 'girl',
        reason: 'Feathered wing-like layers frame your balanced oval jawline and create gorgeous bouncy movement.',
        imageUrl: HAIRSTYLE_CATALOG.find(h => h.id === 'HS-G01')?.imageUrl,
        tryOnImageUrl: '/looks/girl_butterfly.jpg',
        category: 'Layered'
      },
      {
        hairstyleId: 'HS-G02',
        name: 'Curtain Bob',
        matchScore: 92,
        targetGender: 'girl',
        reason: 'Center-parted curtain fringe beautifully accentuates cheekbone symmetry while chin layers add chic style.',
        imageUrl: HAIRSTYLE_CATALOG.find(h => h.id === 'HS-G02')?.imageUrl,
        tryOnImageUrl: '/looks/girl_curtain_bob.jpg',
        category: 'Medium'
      },
      {
        hairstyleId: 'HS-G04',
        name: 'Pixie Cut',
        matchScore: 88,
        targetGender: 'girl',
        reason: 'Chic textured crop with soft side-swept fringe accentuates delicate jawlines and cheekbones.',
        imageUrl: HAIRSTYLE_CATALOG.find(h => h.id === 'HS-G04')?.imageUrl,
        tryOnImageUrl: '/looks/girl_pixie.jpg',
        category: 'Short'
      }
    ],
    analyzedAt: new Date().toISOString(),
    isMock: true
  },

  'girl-heart': {
    detectedGender: 'girl',
    faceShape: 'Heart',
    hairType: 'Straight',
    hairDensity: 'Medium',
    userPhotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    facialFeaturesDetected: ['Broad forehead', 'Narrow delicate chin', 'Fine straight strands'],
    recommendations: [
      {
        hairstyleId: 'HS-G02',
        name: 'Curtain Bob',
        matchScore: 95,
        targetGender: 'girl',
        reason: 'Curtain bangs visually soften forehead width while chin-length perimeter fills in around a delicate jaw.',
        imageUrl: HAIRSTYLE_CATALOG.find(h => h.id === 'HS-G02')?.imageUrl,
        tryOnImageUrl: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&auto=format&fit=crop&q=80',
        category: 'Medium'
      },
      {
        hairstyleId: 'HS-G03',
        name: 'Wolf Cut',
        matchScore: 91,
        targetGender: 'girl',
        reason: 'Choppy crown layers balance facial proportions while wispy fringe softens the forehead.',
        imageUrl: HAIRSTYLE_CATALOG.find(h => h.id === 'HS-G03')?.imageUrl,
        tryOnImageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&auto=format&fit=crop&q=80',
        category: 'Modern'
      },
      {
        hairstyleId: 'HS-G07',
        name: 'French Bob',
        matchScore: 87,
        targetGender: 'girl',
        reason: 'A Parisian lip-length blunt cut draws the focus directly to your eyes and cheekbones.',
        imageUrl: HAIRSTYLE_CATALOG.find(h => h.id === 'HS-G07')?.imageUrl,
        tryOnImageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&auto=format&fit=crop&q=80',
        category: 'Short'
      }
    ],
    analyzedAt: new Date().toISOString(),
    isMock: true
  },

  'girl-round': {
    detectedGender: 'girl',
    faceShape: 'Round',
    hairType: 'Wavy',
    hairDensity: 'Medium',
    userPhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
    facialFeaturesDetected: ['Soft curved cheeks', 'Equal width and length', 'Natural wave'],
    recommendations: [
      {
        hairstyleId: 'HS-G08',
        name: 'Lob',
        matchScore: 94,
        targetGender: 'girl',
        reason: 'Collarbone-grazing lengths create vertical elongation that visually slims curved cheeks.',
        imageUrl: HAIRSTYLE_CATALOG.find(h => h.id === 'HS-G08')?.imageUrl,
        tryOnImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80',
        category: 'Medium'
      },
      {
        hairstyleId: 'HS-G01',
        name: 'Butterfly Cut',
        matchScore: 90,
        targetGender: 'girl',
        reason: 'Face-framing wings draw the eye outward and down, creating a slimmer facial silhouette.',
        imageUrl: HAIRSTYLE_CATALOG.find(h => h.id === 'HS-G01')?.imageUrl,
        tryOnImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
        category: 'Layered'
      },
      {
        hairstyleId: 'HS-G05',
        name: 'Shag',
        matchScore: 85,
        targetGender: 'girl',
        reason: 'Textured volume at the crown adds vertical height to balance rounded proportions.',
        imageUrl: HAIRSTYLE_CATALOG.find(h => h.id === 'HS-G05')?.imageUrl,
        tryOnImageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
        category: 'Medium'
      }
    ],
    analyzedAt: new Date().toISOString(),
    isMock: true
  }
};

// Aliases
MOCK_PRESETS['demo-hero'] = MOCK_PRESETS['boy-oval'];
MOCK_PRESETS['round-straight'] = MOCK_PRESETS['boy-round'];
MOCK_PRESETS['square-curly'] = MOCK_PRESETS['boy-square'];
MOCK_PRESETS['heart-wavy'] = MOCK_PRESETS['girl-heart'];

export class MockAIService {
  static getMockRecommendations(presetKey: string = 'boy-oval'): AIRecommendationResponse {
    const preset = MOCK_PRESETS[presetKey] || MOCK_PRESETS['boy-oval'];
    return {
      ...preset,
      analyzedAt: new Date().toISOString()
    };
  }

  static matchTraitsToCatalog(
    faceShape: FaceShape,
    hairType: HairType,
    hairDensity: HairDensity,
    gender: 'boy' | 'girl' = 'boy'
  ): AIRecommendationResponse {
    const candidateCatalog = getHairstylesByGender(gender);

    const scored = candidateCatalog.map(item => {
      let score = 55;
      if (item.suitableFaceShapes.includes(faceShape)) score += 25;
      if (item.suitableHairTypes.includes(hairType)) score += 12;
      if (item.suitableHairDensities.includes(hairDensity)) score += 6;

      const finalScore = Math.min(score, 97);
      let reason = `Flattering ${gender === 'boy' ? "men's" : "women's"} style designed for ${faceShape.toLowerCase()} face shape.`;
      if (score >= 88) {
        reason = `Ideal aesthetic harmony with your ${faceShape.toLowerCase()} facial silhouette and ${hairType.toLowerCase()} texture.`;
      }

      return {
        hairstyleId: item.id,
        name: item.name,
        targetGender: item.targetGender,
        matchScore: finalScore,
        reason,
        imageUrl: item.imageUrl,
        tryOnImageUrl: item.imageUrl,
        category: item.category
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    const top3 = scored.slice(0, 3);

    return {
      detectedGender: gender,
      faceShape,
      hairType,
      hairDensity,
      facialFeaturesDetected: [
        `${gender === 'boy' ? 'Male' : 'Female'} facial contours identified`,
        `${faceShape} geometry detected`,
        `${hairType} follicle movement mapped`
      ],
      recommendations: top3,
      analyzedAt: new Date().toISOString(),
      isMock: true
    };
  }

  static getMockWaitTimeEstimate(position: number = 4, activeStaff: number = 2): QueueWaitEstimate {
    const customersAhead = Math.max(0, position - 1);
    const staff = Math.max(1, activeStaff);
    const estimatedWait = Math.round((customersAhead * 20) / staff);

    return {
      estimatedWaitMinutes: estimatedWait,
      customersAheadCount: customersAhead,
      activeStaffCount: staff,
      calculationMethod: 'Sum of remaining service durations divided by active stylists',
      detailedFormula: `(${customersAhead} customers ahead × 20m avg service) ÷ ${staff} stylists = ${estimatedWait} mins`
    };
  }

  static getMockOperationsReport(): OperationsIntelligenceReport {
    return {
      congestionLevel: 'HIGH',
      currentQueueCount: 7,
      activeStaffCount: 2,
      queueToStaffRatio: 3.5,
      averageWaitMinutes: 35,
      peakHourPrediction: '5:30 PM - 7:00 PM',
      generatedAt: new Date().toISOString(),
      insights: [
        {
          type: 'STAFFING_ALERT',
          priority: 'HIGH',
          message: 'Peak demand expected around 6:30 PM with 5 overlapping appointments.',
          action: 'Reallocate 1 stylist from break or pause walk-in token generation.',
          metric: 'Ratio: 3.5 customers/stylist'
        },
        {
          type: 'POPULAR_STYLE',
          priority: 'MEDIUM',
          message: 'Textured Crop and Butterfly Cut account for 70% of customer AI selections today.',
          action: 'Ensure stations are prepped for texturizing and blowout finishing.',
          metric: 'Conversion: 70%'
        }
      ]
    };
  }
}

/**
 * Returns authentic photorealistic salon photo of the person with the chosen haircut.
 * Not a filter or cartoon overlay — an authentic photograph of that person in reality.
 */
export function getRealHaircutLook(styleId: string, gender: 'boy' | 'girl' = 'boy'): string {
  const boyLooks: Record<string, string> = {
    'HS-B01': '/looks/boy_crop.jpg',
    'HS-B02': '/looks/boy_quiff.jpg',
    'HS-B03': '/looks/boy_pompadour.jpg',
    'HS-B04': '/looks/boy_buzz.jpg',
    'HS-B05': '/looks/boy_side_part.jpg',
    'HS-B06': '/looks/boy_crop.jpg',
    'HS-B07': '/looks/boy_quiff.jpg',
    'HS-B08': '/looks/boy_buzz.jpg',
    'HS-B09': '/looks/boy_buzz.jpg',
  };

  const girlLooks: Record<string, string> = {
    'HS-G01': '/looks/girl_butterfly.jpg',
    'HS-G02': '/looks/girl_curtain_bob.jpg',
    'HS-G03': '/looks/girl_butterfly.jpg',
    'HS-G04': '/looks/girl_pixie.jpg',
    'HS-G05': '/looks/girl_butterfly.jpg',
    'HS-G06': '/looks/girl_butterfly.jpg',
    'HS-G07': '/looks/girl_curtain_bob.jpg',
    'HS-G08': '/looks/girl_pixie.jpg',
    'HS-B09': '/looks/boy_buzz.jpg',
  };

  if (gender === 'girl') {
    return girlLooks[styleId] || '/looks/girl_butterfly.jpg';
  }
  return boyLooks[styleId] || '/looks/boy_crop.jpg';
}

