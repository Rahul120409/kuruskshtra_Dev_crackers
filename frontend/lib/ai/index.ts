export * from './types';
export * from './catalog';
export * from './mockAiService';
export * from './geminiVisionService';
export * from './waitTimeEngine';
export * from './congestionEngine';

// Unified AI Service facade matching LLD Mock Adapter Strategy (Section 16)
import { GeminiVisionService, VisionAnalysisOptions } from './geminiVisionService';
import { MockAIService } from './mockAiService';
import { WaitTimeEngine } from './waitTimeEngine';
import { CongestionEngine, CongestionAnalysisInput } from './congestionEngine';
import {
  AIRecommendationResponse,
  QueueWaitEstimate,
  OperationsIntelligenceReport,
  WaitTimeCalculationInput
} from './types';

export const aiService = {
  /**
   * Primary recommendation entrypoint: Calls Vision LLM API with auto-fallback to mock
   */
  analyzeHairstyle: (options: VisionAnalysisOptions): Promise<AIRecommendationResponse> => {
    return GeminiVisionService.analyzeSelfie(options);
  },

  /**
   * Pure mock entrypoint: Instant response for testing without keys or network
   */
  getMockAnalysis: (presetKey: string = 'demo-hero'): AIRecommendationResponse => {
    return MockAIService.getMockRecommendations(presetKey);
  },

  /**
   * Queue wait-time recalculator (LLD Section 11)
   */
  calculateWaitTime: (input: WaitTimeCalculationInput): QueueWaitEstimate => {
    return WaitTimeEngine.calculateWaitTime(input);
  },

  /**
   * Owner operations & congestion intelligence (LLD Section 11)
   */
  analyzeOperations: (input: CongestionAnalysisInput): OperationsIntelligenceReport => {
    return CongestionEngine.analyzeOperations(input);
  }
};
