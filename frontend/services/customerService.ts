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

export interface ICustomerService {
  getServices(category?: string): Promise<SalonService[]>;
  getHairstyles(): Promise<Hairstyle[]>;
  getStaff(): Promise<SalonStaff[]>;
  joinQueue(data: {
    salonId: string;
    serviceId: string;
    customerId: string;
    staffId?: string;
    selectedHairstyleId?: string;
  }): Promise<QueueToken>;
  getToken(tokenId: string): Promise<QueueToken | null>;
  cancelToken(tokenId: string): Promise<boolean>;
  getNotifications(customerId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;
  submitFeedback(feedback: Feedback): Promise<boolean>;
  getAppointments(customerId?: string): Promise<Appointment[]>;
  addAppointment(data: Partial<Appointment>): Promise<Appointment>;
  cancelAppointment(appointmentId: string): Promise<boolean>;
  createAppointment(data: {
    salonId: string;
    serviceId: string;
    customerId: string;
    staffId?: string;
    appointmentDate: string;
    appointmentTime: string;
  }): Promise<Appointment>;
  // Demo simulation helper
  advanceDemoQueue(tokenId: string): Promise<{ token: QueueToken; notification?: Notification }>;
  resetDemoQueue(): Promise<QueueToken>;
}

const STORAGE_KEY_TOKEN = 'salonflow_active_token';
const STORAGE_KEY_NOTIFS = 'salonflow_notifications';
const STORAGE_KEY_APPOINTMENTS = 'salonflow_appointments';

export class MockCustomerService implements ICustomerService {
  private getLocalToken(): QueueToken | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
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
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
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
    const raw = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
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
      id: `apt-${Date.now()}`,
      salonId: data.salonId || 'sl-baner-01',
      serviceId: data.serviceId || 'srv-01',
      customerId: data.customerId || 'usr-cust-01',
      staffId: data.staffId || 'stf-01',
      appointmentDate: data.appointmentDate || 'Today',
      appointmentTime: data.appointmentTime || '16:00',
      status: (data.status as any) || 'CONFIRMED',
      source: (data.source as any) || 'ONLINE',
      customerName: data.customerName || 'Customer',
      customerPhone: data.customerPhone || '',
      serviceName: data.serviceName || 'Haircut & Styling',
      servicePrice: data.servicePrice || 650,
      stylistName: data.stylistName || 'Stylist',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };
    const updated = [newApt, ...list];
    this.saveLocalAppointments(updated);
    return newApt;
  }

  async createAppointment(data: {
    salonId: string;
    serviceId: string;
    customerId: string;
    staffId?: string;
    appointmentDate: string;
    appointmentTime: string;
  }): Promise<Appointment> {
    return this.addAppointment({
      salonId: data.salonId,
      serviceId: data.serviceId,
      customerId: data.customerId,
      staffId: data.staffId,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      status: 'CONFIRMED',
      source: 'ONLINE',
    });
  }

  async cancelAppointment(appointmentId: string): Promise<boolean> {
    const list = this.getLocalAppointments();
    const updated = list.map((a) => (a.id === appointmentId ? { ...a, status: 'CANCELLED' as const } : a));
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
    serviceId: string;
    customerId: string;
    staffId?: string;
    selectedHairstyleId?: string;
  }): Promise<QueueToken> {
    const token: QueueToken = {
      id: `tok-${Date.now()}`,
      tokenId: `tok-${Date.now()}`,
      tokenNumber: Math.floor(Math.random() * 900) + 100,
      salonId: data.salonId,
      serviceId: data.serviceId,
      customerId: data.customerId,
      staffId: data.staffId,
      customerName: 'Customer',
      customerPhone: '',
      serviceName: 'Service',
      servicePrice: 650,
      status: 'WAITING',
      position: 1,
      estimatedWait: 15,
      createdAt: new Date().toISOString(),
    };
    this.saveLocalToken(token);
    return token;
  }

  async getToken(tokenId: string): Promise<QueueToken | null> {
    return this.getLocalToken();
  }

  async cancelToken(tokenId: string): Promise<boolean> {
    const current = this.getLocalToken();
    if (current && (current.id === tokenId || current.tokenId === tokenId)) {
      this.saveLocalToken({ ...current, status: 'CANCELLED' });
    }
    return true;
  }

  async getNotifications(customerId: string): Promise<Notification[]> {
    return this.getLocalNotifs();
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const notifs = this.getLocalNotifs();
    const updated = notifs.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    this.saveLocalNotifs(updated);
  }

  async submitFeedback(feedback: Feedback): Promise<boolean> {
    return true;
  }

  async advanceDemoQueue(tokenId: string): Promise<{ token: QueueToken; notification?: Notification }> {
    const current = this.getLocalToken();
    if (!current) {
      throw new Error('No active token found');
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

  async resetDemoQueue(): Promise<QueueToken> {
    const fresh: QueueToken = {
      id: `tok-${Date.now()}`,
      tokenId: `tok-${Date.now()}`,
      tokenNumber: 101,
      salonId: 'sl-baner-01',
      serviceId: 'srv-01',
      customerId: 'usr-cust-01',
      customerName: 'Customer',
      serviceName: 'Haircut & Styling',
      servicePrice: 650,
      status: 'WAITING',
      position: 1,
      estimatedWait: 15,
      createdAt: new Date().toISOString(),
    };
    this.saveLocalToken(fresh);
    return fresh;
  }
}

export class ApiCustomerService implements ICustomerService {
  private baseUrl: string;
  private fallback: MockCustomerService;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.137.199:8081';
    this.fallback = new MockCustomerService();
  }

  async getServices(category?: string): Promise<SalonService[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/services`);
      if (!res.ok) return [];
      const json = await res.json();
      const list: SalonService[] = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
      if (!category || category === 'All') return list;
      return list.filter((s) => s.category === category);
    } catch {
      return [];
    }
  }

  async getHairstyles(): Promise<Hairstyle[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/styles/specific`);
      if (res.ok) {
        const json = await res.json();
        return Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
      }
      return [];
    } catch {
      return [];
    }
  }

  async getStaff(): Promise<SalonStaff[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/staff`);
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
    } catch {
      return [];
    }
  }

  async joinQueue(data: {
    salonId: string;
    serviceId: string;
    customerId: string;
    staffId?: string;
    selectedHairstyleId?: string;
  }): Promise<QueueToken> {
    try {
      const res = await fetch(`${this.baseUrl}/api/queue/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Join queue API failed');
      const json = await res.json();
      const token = json.data || json;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_TOKEN, JSON.stringify(token));
      }
      return token;
    } catch (err) {
      console.warn('Backend /api/queue/join error, using local session.', err);
      return this.fallback.joinQueue(data);
    }
  }

  async getToken(tokenId: string): Promise<QueueToken | null> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!tokenId || tokenId === 'active' || !uuidRegex.test(tokenId)) {
      return this.fallback.getToken(tokenId);
    }
    try {
      const res = await fetch(`${this.baseUrl}/api/queue/token/${tokenId}`);
      if (!res.ok) return this.fallback.getToken(tokenId);
      const json = await res.json();
      return json.data || json;
    } catch {
      return this.fallback.getToken(tokenId);
    }
  }

  async cancelToken(tokenId: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/queue/${tokenId}/cancel`, { method: 'PUT' });
      this.fallback.cancelToken(tokenId);
      return res.ok;
    } catch {
      return this.fallback.cancelToken(tokenId);
    }
  }

  async getNotifications(customerId: string): Promise<Notification[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/notifications/${customerId}`);
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
    } catch {
      return [];
    }
  }

  async markNotificationAsRead(id: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/notifications/${id}/read`, { method: 'PUT' });
    } catch {
      await this.fallback.markNotificationAsRead(id);
    }
  }

  async submitFeedback(feedback: Feedback): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });
      return res.ok;
    } catch {
      return this.fallback.submitFeedback(feedback);
    }
  }

  async createAppointment(data: {
    salonId: string;
    serviceId: string;
    customerId: string;
    staffId?: string;
    appointmentDate: string;
    appointmentTime: string;
  }): Promise<Appointment> {
    try {
      const res = await fetch(`${this.baseUrl}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Appointment API failed');
      const json = await res.json();
      return json.data || json;
    } catch {
      return this.fallback.createAppointment(data);
    }
  }

  async getAppointments(customerId?: string): Promise<Appointment[]> {
    try {
      const url = customerId 
        ? `${this.baseUrl}/api/appointments/customer/${customerId}`
        : `${this.baseUrl}/api/appointments`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
      }
      return [];
    } catch {
      return [];
    }
  }

  async addAppointment(data: Partial<Appointment>): Promise<Appointment> {
    try {
      const res = await fetch(`${this.baseUrl}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data || json;
      }
      return this.fallback.addAppointment(data);
    } catch {
      return this.fallback.addAppointment(data);
    }
  }

  async cancelAppointment(appointmentId: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/appointments/${appointmentId}/cancel`, { method: 'PUT' });
      this.fallback.cancelAppointment(appointmentId);
      return res.ok;
    } catch {
      return this.fallback.cancelAppointment(appointmentId);
    }
  }

  advanceDemoQueue(tokenId: string) {
    return this.fallback.advanceDemoQueue(tokenId);
  }

  resetDemoQueue() {
    return this.fallback.resetDemoQueue();
  }
}

// Global exported adapter instance
export const customerService: ICustomerService = new ApiCustomerService();
