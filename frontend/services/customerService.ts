import {
  SalonService,
  Hairstyle,
  SalonStaff,
  QueueToken,
  Appointment,
  Notification,
  Feedback,
  QueueStatus
} from '../types';
import { salonService } from './salonService';
import { getApiBaseUrl } from './apiConfig';

export interface ICustomerService {
  getServices(category?: string): Promise<SalonService[]>;
  getHairstyles(): Promise<Hairstyle[]>;
  getStaff(): Promise<SalonStaff[]>;
  joinQueue(data: {
    salonId: string;
    serviceId?: string;
    serviceName?: string;
    serviceDurationMinutes?: number;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    staffId?: string;
    selectedHairstyleId?: string;
  }): Promise<QueueToken>;
  getToken(tokenId: string): Promise<QueueToken | null>;
  cancelToken(tokenId: string): Promise<boolean>;
  getNotifications(customerId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;
  submitFeedback(feedback: Feedback): Promise<boolean>;
  rateAppointment(appointmentId: string, rating: number, feedback?: string, userId?: string): Promise<boolean>;
  getAppointments(customerId?: string): Promise<Appointment[]>;
  addAppointment(data: Partial<Appointment>): Promise<Appointment>;
  cancelAppointment(appointmentId: string): Promise<boolean>;
  markAppointmentLate(appointmentId: string): Promise<any>;
  createAppointment(data: {
    salonId: string;
    serviceId?: string;
    serviceName?: string;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    staffId?: string;
    appointmentDate: string;
    appointmentTime: string;
  }): Promise<Appointment>;
  advanceDemoQueue(tokenId: string): Promise<{ token: QueueToken; notification?: Notification }>;
  resetDemoQueue(): Promise<QueueToken | null>;
  getLiveQueueBoard(salonId: string): Promise<{
    salonId: string;
    currentServingTokenNumber?: number | null;
    lastCalledTokenNumber?: number | null;
    nextAvailableTokenNumber?: number;
    totalWaiting: number;
    activeStylistsCount: number;
    activeQueue: any[];
  } | null>;
}

const STORAGE_KEY_TOKEN = 'salonflow_active_token';
const STORAGE_KEY_NOTIFS = 'salonflow_notifications';
const STORAGE_KEY_APPOINTMENTS = 'salonflow_appointments';

function cleanLegacyDemoStorage() {
  if (typeof window === 'undefined') return;
  try {
    const rawToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (rawToken && (rawToken.includes('tok-108-demo') || rawToken.includes('108-demo'))) {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }

    const rawAppts = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    if (rawAppts) {
      const parsed = JSON.parse(rawAppts);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(
          (a: any) =>
            a.id !== 'apt-108-live' &&
            a.id !== 'apt-109-scheduled' &&
            a.id !== 'apt-105-completed' &&
            a.customerId !== 'usr-customer-001'
        );
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(cleaned));
        }
      }
    }

    const rawNotifs = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (rawNotifs && rawNotifs.includes('notif-01')) {
      localStorage.removeItem(STORAGE_KEY_NOTIFS);
    }
  } catch (e) {
    console.warn('Could not clean legacy demo data:', e);
  }
}

const toUuidOrNull = (id?: string): string | null => {
  if (!id) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? id : null;
};

export class MockCustomerService implements ICustomerService {
  constructor() {
    cleanLegacyDemoStorage();
  }

  private getLocalToken(): QueueToken | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed?.tokenId === 'tok-108-demo' || parsed?.tokenNumber === 108) {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private saveLocalToken(token: QueueToken | null) {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(STORAGE_KEY_TOKEN, JSON.stringify(token));
    } else {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  }

  private getLocalNotifs(): Notification[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_NOTIFS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveLocalNotifs(notifs: Notification[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
  }

  private getLocalAppointments(): Appointment[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
      if (!raw) return [];
      const list = JSON.parse(raw);
      return Array.isArray(list)
        ? list.filter(
            (a: any) =>
              a.id !== 'apt-108-live' &&
              a.id !== 'apt-109-scheduled' &&
              a.id !== 'apt-105-completed'
          )
        : [];
    } catch {
      return [];
    }
  }

  private saveLocalAppointments(appts: Appointment[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(appts));
  }

  async getAppointments(customerId?: string): Promise<Appointment[]> {
    const list = this.getLocalAppointments();
    if (!customerId) return list;
    return list.filter((a) => a.customerId === customerId);
  }

  async addAppointment(data: Partial<Appointment>): Promise<Appointment> {
    const list = this.getLocalAppointments();
    const newApt: Appointment = {
      id: data.id || 'apt-' + Date.now(),
      customerId: data.customerId || 'usr-cust-01',
      customerName: data.customerName || 'Customer',
      customerPhone: data.customerPhone || '',
      salonId: data.salonId || 'sl-baner-01',
      salonName: data.salonName || 'SalonFlow Studio',
      salonAddress: data.salonAddress || '',
      salonArea: data.salonArea || '',
      serviceId: data.serviceId || 'srv-01',
      serviceName: data.serviceName || 'Haircut & Styling',
      servicePrice: data.servicePrice || 650,
      serviceDuration: data.serviceDuration || 30,
      staffId: data.staffId || 'stf-01',
      staffName: data.staffName || data.stylistName || 'Vikram Joshi',
      stylistName: data.stylistName || data.staffName || 'Vikram Joshi',
      staffAvatar: data.staffAvatar,
      appointmentDate: data.appointmentDate || new Date().toISOString().split('T')[0],
      appointmentTime: data.appointmentTime || '10:00 AM',
      status: (data.status as any) || 'CONFIRMED',
      lateTimestamp: data.lateTimestamp,
      cancellationFee: data.cancellationFee,
      rating: data.rating,
      feedback: data.feedback,
      source: (data.source as any) || 'ONLINE',
      bookingType: data.bookingType || 'SCHEDULED',
      tokenNumber: data.tokenNumber,
      paymentMethod: data.paymentMethod || 'Pay at Counter',
      paymentStatus: data.paymentStatus || 'PENDING_AT_COUNTER',
      notes: data.notes || '',
      createdAt: data.createdAt || new Date().toISOString(),
    };
    const updated = [newApt, ...list.filter((a) => a.id !== newApt.id)];
    this.saveLocalAppointments(updated);
    return newApt;
  }

  async cancelAppointment(appointmentId: string): Promise<boolean> {
    const list = this.getLocalAppointments();
    const updated = list.map((a) => (a.id === appointmentId ? { ...a, status: 'CANCELLED' as const } : a));
    this.saveLocalAppointments(updated);
    return true;
  }

  async markAppointmentLate(appointmentId: string): Promise<any> {
    const list = this.getLocalAppointments();
    const nowIso = new Date().toISOString();
    const updated = list.map((a) =>
      a.id === appointmentId ? { ...a, status: 'LATE' as const, lateTimestamp: nowIso } : a
    );
    this.saveLocalAppointments(updated);
    return { status: 'LATE', lateTimestamp: nowIso };
  }

  async rateAppointment(appointmentId: string, rating: number, feedback?: string): Promise<boolean> {
    const apts = this.getLocalAppointments();
    const updated = apts.map((a) => (a.id === appointmentId ? { ...a, rating, feedback } : a));
    this.saveLocalAppointments(updated);
    return true;
  }

  async getServices(category?: string): Promise<SalonService[]> {
    return [];
  }

  async getHairstyles(): Promise<Hairstyle[]> {
    return [];
  }

  async getStaff(): Promise<SalonStaff[]> {
    return [];
  }

  async joinQueue(data: {
    salonId: string;
    serviceId?: string;
    serviceName?: string;
    serviceDurationMinutes?: number;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    staffId?: string;
    selectedHairstyleId?: string;
  }): Promise<QueueToken> {
    const realSalons = await salonService.getSalons();
    const salon = realSalons.find((sl) => sl.id === data.salonId);

    // Call Backend API to join real live queue
    try {
      const payload: any = {
        salonId: toUuidOrNull(data.salonId),
        customerName: (data.customerName || 'Customer').trim(),
        customerPhone: data.customerPhone || '9876543210',
        serviceName: data.serviceName || 'Haircut & Styling',
        serviceDurationMinutes: data.serviceDurationMinutes || 25,
        source: 'ONLINE',
      };
      if (data.serviceId) payload.serviceId = toUuidOrNull(data.serviceId);
      if (data.staffId) payload.staffId = toUuidOrNull(data.staffId);
      if (data.customerId) payload.userId = toUuidOrNull(data.customerId);

      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/queue/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json && json.data) {
        const d = json.data;
        const confirmed: QueueToken = {
          tokenId: d.id ? String(d.id) : ('tok-' + Date.now()),
          tokenNumber: d.tokenNumber,
          position: d.position || 1,
          estimatedWait: d.estimatedWaitMinutes ?? 15,
          status: d.status || 'WAITING',
          salonId: d.salonId || data.salonId,
          salonName: salon?.name || 'Salon',
          customerId: d.userId || data.customerId || '',
          serviceId: d.serviceId || data.serviceId || '',
          serviceName: d.serviceName || data.serviceName || 'Haircut & Styling',
          servicePrice: 0,
          staffId: d.staffId,
          staffName: d.staffName,
          queueDate: d.queueDate || new Date().toISOString().split('T')[0],
          createdAt: d.joinedAt || new Date().toISOString(),
          stationNumber: 1,
          selectedHairstyleId: data.selectedHairstyleId,
        };
        this.saveLocalToken(confirmed);
        return confirmed;
      }
    } catch (err) {
      console.warn('Backend /api/queue/join failed, falling back to local token:', err);
    }

    const fallbackToken: QueueToken = {
      tokenId: 'tok-' + Date.now(),
      id: 'tok-' + Date.now(),
      tokenNumber: (salon?.totalWaiting || 0) + 1,
      position: Math.max(1, (salon?.totalWaiting || 0) + 1),
      estimatedWait: salon?.currentWaitMinutes || 15,
      status: 'WAITING',
      salonId: data.salonId,
      salonName: salon?.name || 'Salon',
      customerId: data.customerId || '',
      serviceId: data.serviceId || '',
      serviceName: data.serviceName || 'Haircut & Styling',
      servicePrice: 0,
      staffId: data.staffId,
      queueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      stationNumber: 1,
      selectedHairstyleId: data.selectedHairstyleId,
    };

    this.saveLocalToken(fallbackToken);
    return fallbackToken;
  }

  async getLiveQueueBoard(salonId: string): Promise<{
    salonId: string;
    currentServingTokenNumber?: number | null;
    lastCalledTokenNumber?: number | null;
    nextAvailableTokenNumber?: number;
    totalWaiting: number;
    activeStylistsCount: number;
    activeQueue: any[];
  } | null> {
    try {
      const cleanId = toUuidOrNull(salonId) || salonId;
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/queue/live/${cleanId}`);
      const json = await res.json();
      if (json && json.data) {
        return json.data;
      }
    } catch (e) {
      console.warn('Failed to fetch live queue board from backend:', e);
    }
    return null;
  }

  async getToken(tokenId: string): Promise<QueueToken | null> {
    return this.getLocalToken();
  }

  async cancelToken(tokenId: string): Promise<boolean> {
    const current = this.getLocalToken();
    if (current && (current.tokenId === tokenId || current.id === tokenId || current.tokenNumber?.toString() === tokenId)) {
      current.status = 'CANCELLED';
      this.saveLocalToken(current);
    }
    return true;
  }

  async getNotifications(customerId: string): Promise<Notification[]> {
    return this.getLocalNotifs();
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const notifs = this.getLocalNotifs().map((n) => (n.id === id ? { ...n, isRead: true } : n));
    this.saveLocalNotifs(notifs);
  }

  async submitFeedback(feedback: Feedback): Promise<boolean> {
    return true;
  }

  async createAppointment(data: {
    salonId: string;
    serviceId?: string;
    serviceName?: string;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    staffId?: string;
    appointmentDate: string;
    appointmentTime: string;
  }): Promise<Appointment> {
    return this.addAppointment(data);
  }

  async advanceDemoQueue(tokenId: string): Promise<{ token: QueueToken; notification?: Notification }> {
    const current = this.getLocalToken();
    if (!current) {
      throw new Error('No active queue token found');
    }
    let nextStatus: QueueStatus = current.status;
    let nextPos = current.position;
    let nextWait = current.estimatedWait;

    if (current.status === 'WAITING') {
      if (current.position > 1) {
        nextPos = current.position - 1;
        nextWait = Math.max(0, current.estimatedWait - 10);
      } else {
        nextStatus = 'CALLED';
        nextPos = 0;
        nextWait = 0;
      }
    } else if (current.status === 'CALLED') {
      nextStatus = 'IN_SERVICE';
    } else if (current.status === 'IN_SERVICE') {
      nextStatus = 'COMPLETED';
    }

    const updated: QueueToken = {
      ...current,
      status: nextStatus,
      position: nextPos,
      estimatedWait: nextWait,
    };
    this.saveLocalToken(updated);
    return { token: updated };
  }

  async resetDemoQueue(): Promise<QueueToken | null> {
    this.saveLocalToken(null);
    return null;
  }
}

export class ApiCustomerService implements ICustomerService {
  private fallback: MockCustomerService;

  constructor() {
    this.fallback = new MockCustomerService();
  }

  private getApiUrl(endpoint: string): string {
    const base = getApiBaseUrl();
    return base ? `${base}${endpoint}` : endpoint;
  }

  async getServices(category?: string): Promise<SalonService[]> {
    try {
      const res = await fetch(this.getApiUrl('/api/services'), {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
        if (!category || category === 'All') return list;
        return list.filter((s: SalonService) => s.category === category);
      }
    } catch {
      // ignore
    }
    return this.fallback.getServices(category);
  }

  async getHairstyles(): Promise<Hairstyle[]> {
    try {
      const res = await fetch(this.getApiUrl('/api/styles/specific'), {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        return list.map((item: any) => ({
          id: item.id || item.code,
          name: item.name,
          description: item.description || '',
          imageUrl: item.imageUrl || '',
          category: item.styleTypeName || 'Hairstyles',
          suitableFaceShapes: item.suitableFaceShapes ? item.suitableFaceShapes.split(',') : [],
          suitableHairTypes: item.suitableHairTypes ? item.suitableHairTypes.split(',') : [],
          mappedServiceId: item.styleTypeId,
        }));
      }
    } catch {
      // ignore
    }
    return this.fallback.getHairstyles();
  }

  async getStaff(): Promise<SalonStaff[]> {
    try {
      const res = await fetch(this.getApiUrl('/api/staff'), {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        return list.map((st: any) => ({
          id: st.id,
          name: st.name,
          salonId: st.salonId,
          specialization: st.specialization || 'Barber & Stylist',
          status: st.status || 'AVAILABLE',
          avatarUrl: st.profileImage || '',
          rating: 5.0,
        }));
      }
    } catch {
      // ignore
    }
    return this.fallback.getStaff();
  }

  async joinQueue(data: {
    salonId: string;
    serviceId?: string;
    serviceName?: string;
    serviceDurationMinutes?: number;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    staffId?: string;
    selectedHairstyleId?: string;
  }): Promise<QueueToken> {
    try {
      const payload = {
        salonId: toUuidOrNull(data.salonId),
        customerName: data.customerName || 'Customer',
        customerPhone: data.customerPhone || '',
        userId: toUuidOrNull(data.customerId),
        serviceId: toUuidOrNull(data.serviceId),
        serviceName: data.serviceName,
        serviceDurationMinutes: data.serviceDurationMinutes || 30,
        staffId: toUuidOrNull(data.staffId),
        source: 'ONLINE',
      };

      const res = await fetch(this.getApiUrl('/api/queue/join'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        const tokenData = json.data || json;
        const mappedToken: QueueToken = {
          tokenId: tokenData.id || `tok-${Date.now()}`,
          tokenNumber: tokenData.tokenNumber || 1,
          position: tokenData.position || 1,
          estimatedWait: tokenData.estimatedWaitMinutes || 0,
          status: tokenData.status || 'WAITING',
          salonId: tokenData.salonId || data.salonId,
          salonName: tokenData.salonName || '',
          customerId: tokenData.userId || data.customerId || '',
          serviceId: tokenData.serviceId || data.serviceId || '',
          serviceName: tokenData.serviceName || data.serviceName || '',
          servicePrice: 0,
          staffId: tokenData.staffId || data.staffId,
          staffName: tokenData.staffName,
          queueDate: tokenData.queueDate || new Date().toISOString().split('T')[0],
          createdAt: tokenData.joinedAt || new Date().toISOString(),
          stationNumber: tokenData.stationNumber,
          selectedHairstyleId: data.selectedHairstyleId,
        };
        this.fallback['saveLocalToken'](mappedToken);
        return mappedToken;
      }
    } catch (err) {
      console.warn('Backend /api/queue/join notice:', err);
    }
    return this.fallback.joinQueue(data);
  }

  async getToken(tokenId: string): Promise<QueueToken | null> {
    if (!tokenId) return null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(tokenId)) {
      try {
        const res = await fetch(this.getApiUrl(`/api/queue/token/${tokenId}`));
        if (res.ok) {
          const json = await res.json();
          const t = json.data || json;
          if (t && t.tokenNumber) {
            return {
              tokenId: t.id,
              tokenNumber: t.tokenNumber,
              position: t.position || 1,
              estimatedWait: t.estimatedWaitMinutes || 0,
              status: t.status || 'WAITING',
              salonId: t.salonId,
              customerId: t.userId,
              serviceId: t.serviceId,
              serviceName: t.serviceName,
              servicePrice: 0,
              staffId: t.staffId,
              staffName: t.staffName,
              queueDate: t.queueDate,
              createdAt: t.joinedAt,
            };
          }
        }
      } catch {
        // ignore
      }
    }
    return this.fallback.getToken(tokenId);
  }

  async cancelToken(tokenId: string): Promise<boolean> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(tokenId)) {
      try {
        const res = await fetch(this.getApiUrl(`/api/queue/${tokenId}/cancel`), {
          method: 'PUT',
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          this.fallback['saveLocalToken'](null);
          return true;
        }
      } catch {
        // ignore
      }
    }
    return this.fallback.cancelToken(tokenId);
  }

  async getNotifications(customerId: string): Promise<Notification[]> {
    if (!customerId) return [];
    try {
      const res = await fetch(this.getApiUrl(`/api/notifications/${customerId}`));
      if (res.ok) {
        const json = await res.json();
        return Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
      }
    } catch {
      // ignore
    }
    return this.fallback.getNotifications(customerId);
  }

  async markNotificationAsRead(id: string): Promise<void> {
    try {
      await fetch(this.getApiUrl(`/api/notifications/${id}/read`), { method: 'PUT' });
    } catch {
      // ignore
    }
    await this.fallback.markNotificationAsRead(id);
  }

  async submitFeedback(feedback: Feedback): Promise<boolean> {
    try {
      const res = await fetch(this.getApiUrl('/api/feedback'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(feedback),
      });
      if (res.ok) return true;
    } catch {
      // ignore
    }
    return this.fallback.submitFeedback(feedback);
  }

  async rateAppointment(appointmentId: string, rating: number, feedback?: string, userId?: string): Promise<boolean> {
    try {
      const cleanUserId = toUuidOrNull(userId);
      const res = await fetch(this.getApiUrl(`/api/appointments/${appointmentId}/rating`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          userId: cleanUserId,
          rating,
          feedback,
          message: feedback,
        }),
      });
      if (res.ok) {
        await this.fallback.rateAppointment(appointmentId, rating, feedback);
        return true;
      }
    } catch (err) {
      console.warn('Failed to submit appointment rating to backend:', err);
    }
    return this.fallback.rateAppointment(appointmentId, rating, feedback);
  }

  async createAppointment(data: {
    salonId: string;
    serviceId?: string;
    serviceName?: string;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    staffId?: string;
    appointmentDate: string;
    appointmentTime: string;
  }): Promise<Appointment> {
    try {
      const payload = {
        salonId: toUuidOrNull(data.salonId),
        customerId: toUuidOrNull(data.customerId),
        userId: toUuidOrNull(data.customerId),
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        serviceId: toUuidOrNull(data.serviceId),
        serviceName: data.serviceName,
        staffId: toUuidOrNull(data.staffId),
        appointmentDate: data.appointmentDate,
        appointmentTime: data.appointmentTime,
        bookingSource: 'ONLINE',
      };
      const res = await fetch(this.getApiUrl('/api/appointments'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        const item = json.data || json;
        return this.fallback.addAppointment({
          id: item.id,
          salonId: item.salonId || data.salonId,
          customerId: item.userId || data.customerId,
          serviceId: item.serviceId || data.serviceId,
          serviceName: item.serviceName || data.serviceName,
          servicePrice: item.servicePrice || 0,
          staffId: item.staffId || data.staffId,
          staffName: item.staffName,
          appointmentDate: item.appointmentDate || data.appointmentDate,
          appointmentTime: item.appointmentTime || data.appointmentTime,
          status: item.status || 'CONFIRMED',
          source: item.bookingSource || 'ONLINE',
          createdAt: item.createdAt || new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Backend /api/appointments create failed, using local store:', err);
    }
    return this.fallback.createAppointment(data);
  }

  async getAppointments(customerId?: string): Promise<Appointment[]> {
    let lookup = customerId;
    if (!lookup && typeof window !== 'undefined') {
      lookup = localStorage.getItem('salonflow_customer_phone') || undefined;
    }

    if (lookup) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const endpoint = uuidRegex.test(lookup)
        ? `/api/appointments/user/${lookup}`
        : `/api/appointments/phone/${encodeURIComponent(lookup)}`;

      try {
        const res = await fetch(this.getApiUrl(endpoint), {
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : null);
          if (items && items.length > 0) {
            const mapped: Appointment[] = items.map((a: any) => ({
              id: a.id,
              customerId: a.userId || a.customerId || lookup,
              customerName: a.customerName,
              customerPhone: a.customerPhone,
              salonId: a.salonId,
              salonName: a.salonName || 'Salon',
              salonAddress: a.salonAddress || '',
              salonArea: a.salonArea || '',
              serviceId: a.serviceId,
              serviceName: a.serviceName || 'Haircut & Styling',
              servicePrice: a.servicePrice || 0,
              serviceDuration: a.serviceDurationMinutes || 30,
              staffId: a.staffId,
              staffName: a.staffName,
              appointmentDate: a.appointmentDate,
              appointmentTime: a.appointmentTime,
              status: a.status || 'CONFIRMED',
              source: a.bookingSource || 'ONLINE',
              bookingType: 'SCHEDULED',
              tokenNumber: a.queueTokenNumber || a.tokenNumber,
              rating: a.rating,
              feedback: a.feedback,
              lateTimestamp: a.lateTimestamp,
              cancellationFee: a.cancellationFee,
              createdAt: a.createdAt,
            }));
            return mapped;
          }
        }
      } catch (err) {
        console.warn('Appointments API fetch notice:', err);
      }
    }
    return this.fallback.getAppointments(customerId);
  }

  async addAppointment(data: Partial<Appointment>): Promise<Appointment> {
    try {
      let apptDate = data.appointmentDate;
      if (!apptDate || apptDate === 'Today') {
        apptDate = new Date().toISOString().split('T')[0];
      } else if (apptDate === 'Tomorrow') {
        const tom = new Date();
        tom.setDate(tom.getDate() + 1);
        apptDate = tom.toISOString().split('T')[0];
      }

      if (data.customerPhone && typeof window !== 'undefined') {
        localStorage.setItem('salonflow_customer_phone', data.customerPhone);
      }

      const payload = {
        salonId: toUuidOrNull(data.salonId),
        userId: toUuidOrNull(data.customerId),
        customerId: toUuidOrNull(data.customerId),
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        serviceId: toUuidOrNull(data.serviceId),
        serviceName: data.serviceName,
        servicePrice: data.servicePrice,
        serviceDurationMinutes: data.serviceDuration,
        staffId: toUuidOrNull(data.staffId),
        staffName: data.staffName,
        appointmentDate: apptDate,
        appointmentTime: data.appointmentTime,
        bookingSource: data.source || 'ONLINE',
      };
      const res = await fetch(this.getApiUrl('/api/appointments'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        const item = json.data || json;
        return this.fallback.addAppointment({ ...data, id: item.id, appointmentDate: apptDate });
      }
    } catch (err) {
      console.warn('Add appointment backend call notice:', err);
    }
    return this.fallback.addAppointment(data);
  }

  async cancelAppointment(appointmentId: string): Promise<boolean> {
    try {
      const res = await fetch(this.getApiUrl(`/api/appointments/${appointmentId}/status?status=CANCELLED`), {
        method: 'PUT',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        return this.fallback.cancelAppointment(appointmentId);
      }
    } catch {
      // ignore
    }
    return this.fallback.cancelAppointment(appointmentId);
  }

  async markAppointmentLate(appointmentId: string): Promise<any> {
    try {
      const res = await fetch(this.getApiUrl(`/api/appointments/${appointmentId}/late`), {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        await this.fallback.markAppointmentLate(appointmentId);
        return json.data || json;
      }
    } catch {
      // ignore
    }
    return this.fallback.markAppointmentLate(appointmentId);
  }

  advanceDemoQueue(tokenId: string) {
    return this.fallback.advanceDemoQueue(tokenId);
  }

  resetDemoQueue() {
    return this.fallback.resetDemoQueue();
  }

  async getLiveQueueBoard(salonId: string): Promise<{
    salonId: string;
    currentServingTokenNumber?: number | null;
    lastCalledTokenNumber?: number | null;
    nextAvailableTokenNumber?: number;
    totalWaiting: number;
    activeStylistsCount: number;
    activeQueue: any[];
  } | null> {
    try {
      const cleanId = toUuidOrNull(salonId) || salonId;
      const res = await fetch(this.getApiUrl(`/api/queue/live/${cleanId}`), {
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch live queue board from backend API:', e);
    }
    return this.fallback.getLiveQueueBoard(salonId);
  }
}

// Global exported adapter instance
export const customerService: ICustomerService = new ApiCustomerService();
