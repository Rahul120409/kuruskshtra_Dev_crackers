import { QueueCustomerItem, QueueWaitEstimate, WaitTimeCalculationInput } from './types';

// Standard fallback durations per service category in minutes
export const SERVICE_DEFAULT_DURATIONS: Record<string, number> = {
  'SRV-HAIRCUT-01': 25,
  'SRV-STYLING-02': 35,
  'SRV-BEARD-03': 15,
  'SRV-COLOR-04': 60,
  'DEFAULT': 20
};

export class WaitTimeEngine {
  /**
   * Calculates the estimated wait time in minutes for a customer at a given position or with a specific queue slice ahead.
   * LLD Formula:
   * Estimated Wait = (Sum of remaining durations of customers ahead) / (Active Staff Capacity)
   */
  static calculateWaitTime(input: WaitTimeCalculationInput): QueueWaitEstimate {
    const {
      queueAhead,
      activeStaffCount,
      stylistCapacityMultiplier = 1.0,
      averageHistoricalDurationMinutes
    } = input;

    // Safety checks
    const effectiveStaff = Math.max(1, activeStaffCount);
    const effectiveMultiplier = Math.max(0.5, stylistCapacityMultiplier);
    const effectiveCapacity = effectiveStaff * effectiveMultiplier;

    if (!queueAhead || queueAhead.length === 0) {
      return {
        estimatedWaitMinutes: 0,
        customersAheadCount: 0,
        activeStaffCount: effectiveStaff,
        calculationMethod: 'Zero customers ahead',
        detailedFormula: '0 min wait (No customers ahead in queue)'
      };
    }

    // Calculate sum of durations
    let totalMinutesAhead = 0;
    const durationBreakdown: string[] = [];

    for (const customer of queueAhead) {
      // Determine duration: explicit duration -> historical average -> category lookup -> fallback
      let duration = customer.durationMinutes;
      if (!duration || duration <= 0) {
        if (averageHistoricalDurationMinutes && averageHistoricalDurationMinutes > 0) {
          duration = averageHistoricalDurationMinutes;
        } else if (customer.serviceId && SERVICE_DEFAULT_DURATIONS[customer.serviceId]) {
          duration = SERVICE_DEFAULT_DURATIONS[customer.serviceId];
        } else {
          duration = SERVICE_DEFAULT_DURATIONS['DEFAULT'];
        }
      }

      // If customer is already IN_SERVICE, estimate remaining time as 50% on average
      if (customer.status === 'IN_SERVICE') {
        duration = Math.max(5, Math.round(duration * 0.5));
      }

      totalMinutesAhead += duration;
      durationBreakdown.push(`${customer.serviceName || customer.serviceId || 'Token #' + customer.tokenNumber} (${duration}m)`);
    }

    // Apply the authoritative formula: Total Duration / Staff Capacity
    const rawWait = totalMinutesAhead / effectiveCapacity;
    const roundedWait = Math.max(1, Math.round(rawWait));

    const breakdownSummary = durationBreakdown.slice(0, 4).join(' + ') +
      (durationBreakdown.length > 4 ? ` + ${durationBreakdown.length - 4} more` : '');

    return {
      estimatedWaitMinutes: roundedWait,
      customersAheadCount: queueAhead.length,
      activeStaffCount: effectiveStaff,
      calculationMethod: 'Sum of remaining durations of customers ahead ÷ available staff capacity',
      detailedFormula: `(${breakdownSummary} = ${totalMinutesAhead}m) ÷ ${effectiveCapacity.toFixed(1)} staff capacity = ${roundedWait} mins`
    };
  }

  /**
   * Fast calculation helper based only on numerical position & staff count
   */
  static estimateByPosition(
    position: number,
    activeStaff: number = 2,
    avgServiceMinutes: number = 22
  ): QueueWaitEstimate {
    const customersAhead = Math.max(0, position - 1);
    const staff = Math.max(1, activeStaff);

    if (customersAhead === 0) {
      return {
        estimatedWaitMinutes: 0,
        customersAheadCount: 0,
        activeStaffCount: staff,
        calculationMethod: 'At front of queue',
        detailedFormula: '0 mins (Next to be served)'
      };
    }

    const totalMinutes = customersAhead * avgServiceMinutes;
    const wait = Math.max(1, Math.round(totalMinutes / staff));

    return {
      estimatedWaitMinutes: wait,
      customersAheadCount: customersAhead,
      activeStaffCount: staff,
      calculationMethod: 'Linear position estimate based on average service time',
      detailedFormula: `(${customersAhead} customers ahead × ${avgServiceMinutes}m) ÷ ${staff} stylists = ${wait} mins`
    };
  }
}
