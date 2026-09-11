export type FaceShape = 'Oval' | 'Round' | 'Square' | 'Heart' | 'Diamond' | 'Oblong';

export type HairType = 'Straight' | 'Wavy' | 'Curly' | 'Coily';

export type HairDensity = 'Thin' | 'Medium' | 'Thick';

export interface HairstyleCatalogItem {
  id: string; // e.g. "HS-B01" or "HS-G01"
  name: string; // e.g. "Textured Crop" or "Butterfly Cut"
  targetGender: 'boy' | 'girl' | 'unisex';
  description: string;
  category: 'Short' | 'Medium' | 'Long' | 'Fade' | 'Classic' | 'Modern' | 'Layered';
  imageUrl: string;
  suitableFaceShapes: FaceShape[];
  suitableHairTypes: HairType[];
  suitableHairDensities: HairDensity[];
  baseServiceId?: string; // Links to salon service table
  maintenanceLevel: 'Low' | 'Medium' | 'High';
  stylingTips?: string;
}

export interface HairstyleRecommendation {
  hairstyleId: string;
  name: string;
  matchScore: number; // 0 - 100
  reason: string;
  imageUrl?: string;
  tryOnImageUrl?: string; // Image of the user/model wearing this exact haircut
  category?: string;
  targetGender?: 'boy' | 'girl' | 'unisex';
}

export interface AIRecommendationResponse {
  detectedGender: 'boy' | 'girl';
  faceShape: FaceShape;
  hairType: HairType;
  hairDensity: HairDensity;
  facialFeaturesDetected?: string[];
  recommendations: HairstyleRecommendation[];
  userPhotoUrl?: string; // Original uploaded face
  analyzedAt?: string;
  isMock?: boolean;
}

export interface QueueCustomerItem {
  tokenId: string;
  tokenNumber: number;
  serviceId?: string;
  serviceName?: string;
  durationMinutes: number;
  assignedStaffId?: string;
  status: 'WAITING' | 'CALLED' | 'IN_SERVICE' | 'COMPLETED';
}

export interface WaitTimeCalculationInput {
  queueAhead: QueueCustomerItem[];
  activeStaffCount: number;
  stylistCapacityMultiplier?: number;
  averageHistoricalDurationMinutes?: number;
}

export interface QueueWaitEstimate {
  estimatedWaitMinutes: number;
  customersAheadCount: number;
  activeStaffCount: number;
  calculationMethod: string;
  detailedFormula: string;
}

export type CongestionLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface CongestionInsight {
  type: 'STAFFING_ALERT' | 'WAIT_WARNING' | 'POPULAR_STYLE' | 'CAPACITY_OPTIMIZATION';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  action: string;
  metric?: string;
}

export interface OperationsIntelligenceReport {
  congestionLevel: CongestionLevel;
  currentQueueCount: number;
  activeStaffCount: number;
  queueToStaffRatio: number;
  averageWaitMinutes: number;
  peakHourPrediction: string;
  insights: CongestionInsight[];
  generatedAt: string;
}

export interface VirtualPreviewRequest {
  selfieBase64?: string;
  selfieUrl?: string;
  hairstyleId: string;
  hairColor?: 'Natural' | 'Jet Black' | 'Espresso Brown' | 'Honey Blonde' | 'Platinum Ash';
}

export interface VirtualPreviewResponse {
  hairstyleId: string;
  hairstyleName: string;
  category?: string;
  previewImageUrl: string;
  tryOnImageUrl: string;
  originalUserImageUrl?: string;
  hairColor: string;
  status: 'SUCCESS' | 'FALLBACK';
  message: string;
  matchScore?: number;
  stylingTips?: string;
}

export interface GenerateUserLookRequest {
  userImageBase64?: string;
  userImageUrl?: string;
  hairstyleId: string;
  hairColor?: string;
  gender?: 'boy' | 'girl';
}

export interface GenerateUserLookResponse {
  originalImageUrl: string;
  generatedLookImageUrl: string;
  hairstyleName: string;
  hairstyleId: string;
  hairColor: string;
  stylingTips: string;
  status: 'SUCCESS' | 'SYNTHESIZED';
}

