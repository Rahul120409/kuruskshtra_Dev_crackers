import {
  CongestionInsight,
  CongestionLevel,
  OperationsIntelligenceReport,
  QueueCustomerItem
} from './types';
import { WaitTimeEngine } from './waitTimeEngine';

export interface CongestionAnalysisInput {
  currentQueue: QueueCustomerItem[];
  activeStaffCount: number;
  upcomingAppointmentsCount?: number;
  popularHairstyleId?: string;
  popularHairstyleName?: string;
  currentTime?: string; // e.g. "17:45"
}

export class CongestionEngine {
  /**
   * Evaluates queue pressure, staffing balance, and scheduled load to generate an Operations Intelligence Report.
   * LLD Section 11: Honestly labeled as an Operations Intelligence Engine.
   */
  static analyzeOperations(input: CongestionAnalysisInput): OperationsIntelligenceReport {
    const {
      currentQueue,
      activeStaffCount,
      upcomingAppointmentsCount = 0,
      popularHairstyleId = 'HS01',
      popularHairstyleName = 'Textured Crop Fade',
      currentTime
    } = input;

    const waitingQueue = currentQueue.filter(q => q.status === 'WAITING' || q.status === 'CALLED');
    const queueCount = waitingQueue.length;
    const staffCount = Math.max(1, activeStaffCount);
    const ratio = parseFloat((queueCount / staffCount).toFixed(2));

    // Calculate wait estimate using wait time engine
    const waitEstimate = WaitTimeEngine.calculateWaitTime({
      queueAhead: waitingQueue,
      activeStaffCount: staffCount
    });

    // Determine Congestion Level
    let level: CongestionLevel = 'LOW';
    if (ratio >= 4.0 || waitEstimate.estimatedWaitMinutes >= 50) {
      level = 'CRITICAL';
    } else if (ratio >= 2.5 || waitEstimate.estimatedWaitMinutes >= 30) {
      level = 'HIGH';
    } else if (ratio >= 1.5 || waitEstimate.estimatedWaitMinutes >= 15) {
      level = 'MODERATE';
    }

    const insights: CongestionInsight[] = [];

    // 1. Staffing / Congestion Insight
    if (level === 'CRITICAL') {
      insights.push({
        type: 'STAFFING_ALERT',
        priority: 'CRITICAL',
        message: `Severe queue bottleneck detected: ${queueCount} customers waiting for ${staffCount} stylists (${ratio}x ratio).`,
        action: 'Immediately reassign on-call staff to active stations and temporarily restrict new walk-in token generation.',
        metric: `Ratio: ${ratio} cust/staff`
      });
    } else if (level === 'HIGH') {
      insights.push({
        type: 'STAFFING_ALERT',
        priority: 'HIGH',
        message: `High congestion building up with ${queueCount} customers in queue. Estimated wait is ${waitEstimate.estimatedWaitMinutes} minutes.`,
        action: 'Recall available stylists from scheduled breaks or route short services to dedicated quick-trim chairs.',
        metric: `Wait: ${waitEstimate.estimatedWaitMinutes}m`
      });
    } else if (level === 'MODERATE') {
      insights.push({
        type: 'CAPACITY_OPTIMIZATION',
        priority: 'MEDIUM',
        message: `Queue is operating at healthy capacity (${ratio}x ratio). Service throughput is optimal.`,
        action: 'Monitor incoming appointments to prevent peak-time overflow.',
        metric: `Load: ${Math.round(ratio * 35)}%`
      });
    } else {
      insights.push({
        type: 'CAPACITY_OPTIMIZATION',
        priority: 'LOW',
        message: 'Low queue volume. Staff availability is high with minimal customer waiting time.',
        action: 'Open for promotional walk-in bookings or assign staff to station sanitization and prep.',
        metric: 'Capacity: High'
      });
    }

    // 2. Predictive Peak Demand Window (LLD Example: "Peak demand expected around 6:30 PM")
    const predictedPeak = upcomingAppointmentsCount >= 4
      ? '6:00 PM - 7:30 PM'
      : (queueCount >= 5 ? '5:30 PM - 7:00 PM' : '7:00 PM - 8:30 PM');

    if (upcomingAppointmentsCount >= 3) {
      insights.push({
        type: 'WAIT_WARNING',
        priority: 'HIGH',
        message: `Peak demand expected around ${predictedPeak}. ${upcomingAppointmentsCount} booked appointments scheduled to arrive soon.`,
        action: 'Reserve at least 2 stylists exclusively for confirmed appointments to prevent walk-in scheduling collisions.',
        metric: `${upcomingAppointmentsCount} Bookings`
      });
    }

    // 3. Hairstyle / Inventory Demand Insight
    insights.push({
      type: 'POPULAR_STYLE',
      priority: 'MEDIUM',
      message: `"${popularHairstyleName}" (${popularHairstyleId}) is today's top customer selection from AI recommendations.`,
      action: 'Ensure styling stations are stocked with texturizing clay and scissors are freshly sharpened.',
      metric: 'Top AI Pick'
    });

    return {
      congestionLevel: level,
      currentQueueCount: queueCount,
      activeStaffCount: staffCount,
      queueToStaffRatio: ratio,
      averageWaitMinutes: waitEstimate.estimatedWaitMinutes,
      peakHourPrediction: predictedPeak,
      insights,
      generatedAt: new Date().toISOString()
    };
  }
}
