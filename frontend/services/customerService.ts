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
import { 
  DEMO_SERVICES, 
  DEMO_HAIRSTYLES, 
  DEMO_STAFF, 
  INITIAL_DEMO_TOKEN, 
  INITIAL_NOTIFICATIONS,
  INITIAL_DEMO_APPOINTMENTS
} from './mockData';
import { salonService } from './salonService';

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
    if (typeof window === 'undefined') return INITIAL_DEMO_TOKEN;
    const raw = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TOKEN, JSON.stringify(INITIAL_DEMO_TOKEN));
      return INITIAL_DEMO_TOKEN;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_DEMO_TOKEN;
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
    if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  private saveLocalNotifs(notifs: Notification[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
  }

  private getLocalAppointments(): Appointment[] {
    if (typeof window === 'undefined') return INITIAL_DEMO_APPOINTMENTS;
    const raw = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(INITIAL_DEMO_APPOINTMENTS));
      return INITIAL_DEMO_APPOINTMENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_DEMO_APPOINTMENTS;
    }
  }

  private saveLocalAppointments(appts: Appointment[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(appts));
  }

  async getAppointments(customerId?: string): Promise<Appointment[]> {
    await new Promise((r) => setTimeout(r, 150));
    const list = this.getLocalAppointments();
    if (!customerId) return list;
    return list.filter((a) => a.customerId === customerId || a.customerId === 'usr-customer-001');
  }

  async addAppointment(data: Partial<Appointment>): Promise<Appointment> {
    await new Promise((r) => setTimeout(r, 150));
    const list = this.getLocalAppointments();
    const newApt: Appointment = {
      id: 'apt-' + Date.now(),
      customerId: data.customerId || 'usr-customer-001',
      salonId: data.salonId || 'salon-pune-01',
      salonName: data.salonName || 'SalonFlow Studio & Lounge',
      salonAddress: data.salonAddress || 'Lane 7, Koregaon Park, Pune, Maharashtra 411001',
      salonArea: data.salonArea || 'Koregaon Park',
      serviceId: data.serviceId || 'srv-02',
      serviceName: data.serviceName || 'Skin Fade & Textured Crop',
      servicePrice: data.servicePrice || 599,
      serviceDuration: data.serviceDuration || 35,
      staffId: data.staffId || 'stf-01',
      staffName: data.staffName || 'Vikram Joshi (Master Stylist)',
      staffAvatar: data.staffAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      appointmentDate: data.appointmentDate || new Date().toISOString().split('T')[0],
      appointmentTime: data.appointmentTime || '04:30 PM',
      status: 'CONFIRMED',
      source: 'ONLINE',
      bookingType: data.bookingType || 'WALK_IN',
      tokenNumber: data.tokenNumber || 108,
      paymentMethod: data.paymentMethod || 'Pay at Salon Counter',
      paymentStatus: data.paymentStatus || 'PENDING_AT_COUNTER',
      createdAt: new Date().toISOString(),
    };

    const updated = [newApt, ...list];
    this.saveLocalAppointments(updated);
    return newApt;
  }

  async cancelAppointment(appointmentId: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 150));
    const list = this.getLocalAppointments();
    const updated = list.map((a) => (a.id === appointmentId ? { ...a, status: 'CANCELLED' as const } : a));
    this.saveLocalAppointments(updated);
    return true;
  }

  async getServices(category?: string): Promise<SalonService[]> {
    await new Promise((r) => setTimeout(r, 200));
    if (!category || category === 'All') return DEMO_SERVICES;
    return DEMO_SERVICES.filter((s) => s.category === category);
  }

  async getHairstyles(): Promise<Hairstyle[]> {
    await new Promise((r) => setTimeout(r, 200));
    return DEMO_HAIRSTYLES;
  }

  async getStaff(): Promise<SalonStaff[]> {
    await new Promise((r) => setTimeout(r, 200));
    return DEMO_STAFF;
  }

  async joinQueue(data: {
    salonId: string;
    serviceId: string;
    customerId: string;
    staffId?: string;
    selectedHairstyleId?: string;
  }): Promise<QueueToken> {
    const realSalons = await salonService.getSalons();
    const salon = realSalons.find((sl) => sl.id === data.salonId) || realSalons[0] || {
      id: data.salonId,
      name: 'Salon',
      address: 'Pune',
      phone: '',
      city: 'Pune',
      pincode: '',
      area: 'Pune',
      imageUrl: '',
      salonDescription: '',
      openingTime: '09:00 AM',
      closingTime: '09:00 PM',
      status: 'OPEN',
      rating: 4.9,
      reviewCount: 1,
      currentWaitMinutes: 15,
      totalWaiting: 1,
      createdAt: ''
    };
    const service = DEMO_SERVICES.find((s) => s.id === data.serviceId) || DEMO_SERVICES[1];
    const staff = DEMO_STAFF.find((st) => st.id === data.staffId) || DEMO_STAFF[0];
    const hairstyle = DEMO_HAIRSTYLES.find((h) => h.id === data.selectedHairstyleId);

    const nextTokenNumber = 108; // Winning demo canonical number
    const newToken: QueueToken = {
      tokenId: 'tok-' + Date.now(),
      tokenNumber: nextTokenNumber,
      position: Math.max(1, (salon.totalWaiting || 3) + 1),
      estimatedWait: salon.currentWaitMinutes || 24, // Matches LLD section 8 contract
      status: 'WAITING',
      salonId: salon.id,
      salonName: salon.name,
      customerId: data.customerId,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      staffId: staff.id,
      staffName: staff.name,
      queueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      stationNumber: 3,
      selectedHairstyleId: hairstyle?.id,
      selectedHairstyleName: hairstyle?.name,
    };

    this.saveLocalToken(newToken);

    // Trigger initial confirmation notification
    const notifs = this.getLocalNotifs();
    const newNotif: Notification = {
      id: 'notif-' + Date.now(),
      userId: data.customerId,
      title: `Token #${newToken.tokenNumber} Confirmed!`,
      message: `You are in line at position #${newToken.position}. Estimated wait: ${newToken.estimatedWait} minutes.`,
      type: 'BOOKING_CONFIRMED',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/queue',
    };
    this.saveLocalNotifs([newNotif, ...notifs]);

    return newToken;
  }

  async getToken(tokenId: string): Promise<QueueToken | null> {
    await new Promise((r) => setTimeout(r, 100));
    const current = this.getLocalToken();
    if (!current) return null;
    return current;
  }

  async cancelToken(tokenId: string): Promise<boolean> {
    const current = this.getLocalToken();
    if (current && current.tokenId === tokenId) {
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
    await new Promise((r) => setTimeout(r, 400));
    console.log('Customer feedback received:', feedback);
    return true;
  }

  async createAppointment(data: {
    salonId: string;
    serviceId: string;
    customerId: string;
    staffId?: string;
    appointmentDate: string;
    appointmentTime: string;
  }): Promise<Appointment> {
    await new Promise((r) => setTimeout(r, 400));
    const service = DEMO_SERVICES.find((s) => s.id === data.serviceId);
    const staff = DEMO_STAFF.find((st) => st.id === data.staffId);

    const appt: Appointment = {
      id: 'appt-' + Date.now(),
      customerId: data.customerId,
      salonId: data.salonId,
      serviceId: data.serviceId,
      serviceName: service?.name || 'Custom Grooming',
      staffId: data.staffId,
      staffName: staff?.name || 'Assigned Stylist',
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      status: 'CONFIRMED',
      source: 'ONLINE',
      createdAt: new Date().toISOString(),
    };

    const notifs = this.getLocalNotifs();
    const newNotif: Notification = {
      id: 'notif-' + Date.now(),
      userId: data.customerId,
      title: 'Appointment Confirmed',
      message: `Your booking for ${appt.serviceName} on ${appt.appointmentDate} at ${appt.appointmentTime} is confirmed.`,
      type: 'BOOKING_CONFIRMED',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/queue',
    };
    this.saveLocalNotifs([newNotif, ...notifs]);

    return appt;
  }

  // Winning demo step controller
  async advanceDemoQueue(tokenId: string): Promise<{ token: QueueToken; notification?: Notification }> {
    const current = this.getLocalToken() || INITIAL_DEMO_TOKEN;
    let newNotif: Notification | undefined = undefined;

    if (current.status === 'WAITING') {
      if (current.position > 2) {
        // Step 1: Advance from 4 to 2 ("2 customers away")
        current.position = 2;
        current.estimatedWait = 12;
        newNotif = {
          id: 'notif-' + Date.now(),
          userId: current.customerId,
          title: '2 Customers Away!',
          message: 'The stylist will be ready for you shortly. Please stay nearby Station 3.',
          type: 'TURN_APPROACHING',
          isRead: false,
          createdAt: new Date().toISOString(),
          actionUrl: '/queue',
        };
      } else if (current.position === 2) {
        // Step 2: Customer called
        current.position = 0;
        current.estimatedWait = 0;
        current.status = 'CALLED';
        newNotif = {
          id: 'notif-' + Date.now(),
          userId: current.customerId,
          title: "It's Your Turn! (Token #" + current.tokenNumber + ")",
          message: 'Please proceed to Station 3. Stylist Vikram Joshi is ready for you.',
          type: 'TURN_CALLED',
          isRead: false,
          createdAt: new Date().toISOString(),
          actionUrl: '/queue',
        };
      }
    } else if (current.status === 'CALLED') {
      // Step 3: Service started
      current.status = 'IN_SERVICE';
    } else if (current.status === 'IN_SERVICE') {
      // Step 4: Service completed
      current.status = 'COMPLETED';
      newNotif = {
        id: 'notif-' + Date.now(),
        userId: current.customerId,
        title: 'Service Completed',
        message: 'We hope you loved your new haircut! Please take 15 seconds to leave your feedback.',
        type: 'COMPLETED',
        isRead: false,
        createdAt: new Date().toISOString(),
        actionUrl: '/feedback',
      };
    }

    this.saveLocalToken(current);

    if (newNotif) {
      const notifs = this.getLocalNotifs();
      this.saveLocalNotifs([newNotif, ...notifs]);
    }

    return { token: current, notification: newNotif };
  }

  async resetDemoQueue(): Promise<QueueToken> {
    const fresh = { ...INITIAL_DEMO_TOKEN };
    this.saveLocalToken(fresh);
    this.saveLocalNotifs(INITIAL_NOTIFICATIONS);
    return fresh;
  }
}

export class ApiCustomerService implements ICustomerService {
  private baseUrl: string;
  private fallback: MockCustomerService;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.137.199:8080';
    this.fallback = new MockCustomerService();
  }

  async getServices(category?: string): Promise<SalonService[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/services`);
      if (!res.ok) throw new Error('API fetch failed');
      const data: SalonService[] = await res.json();
      if (!category || category === 'All') return data;
      return data.filter((s) => s.category === category);
    } catch (err) {
      return this.fallback.getServices(category);
    }
  }

  async getHairstyles(): Promise<Hairstyle[]> {
    return this.fallback.getHairstyles();
  }

  async getStaff(): Promise<SalonStaff[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/staff`);
      if (!res.ok) throw new Error('API fetch failed');
      return await res.json();
    } catch {
      return this.fallback.getStaff();
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
      return await res.json();
    } catch (err) {
      console.warn('Backend /api/queue/join unavailable, using MockCustomerService fallback.', err);
      return this.fallback.joinQueue(data);
    }
  }

  async getToken(tokenId: string): Promise<QueueToken | null> {
    try {
      const res = await fetch(`${this.baseUrl}/api/queue/token/${tokenId}`);
      if (!res.ok) throw new Error('Get token API failed');
      return await res.json();
    } catch {
      return this.fallback.getToken(tokenId);
    }
  }

  async cancelToken(tokenId: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/queue/${tokenId}/cancel`, { method: 'PUT' });
      if (!res.ok) throw new Error('Cancel failed');
      return true;
    } catch {
      return this.fallback.cancelToken(tokenId);
    }
  }

  async getNotifications(customerId: string): Promise<Notification[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/notifications/${customerId}`);
      if (!res.ok) throw new Error('Notifs failed');
      return await res.json();
    } catch {
      return this.fallback.getNotifications(customerId);
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
      return await res.json();
    } catch {
      return this.fallback.createAppointment(data);
    }
  }

  async getAppointments(customerId?: string): Promise<Appointment[]> {
    return this.fallback.getAppointments(customerId);
  }

  async addAppointment(data: Partial<Appointment>): Promise<Appointment> {
    return this.fallback.addAppointment(data);
  }

  async cancelAppointment(appointmentId: string): Promise<boolean> {
    return this.fallback.cancelAppointment(appointmentId);
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
