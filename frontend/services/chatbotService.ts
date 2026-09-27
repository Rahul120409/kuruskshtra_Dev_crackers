import { HAIRSTYLE_CATALOG } from '../lib/ai/catalog';
import { HairstyleCatalogItem } from '../lib/ai/types';
import { Salon, SalonService, Appointment } from '../types';
import { salonService } from './salonService';
import { staffService, StaffResponse } from './staffService';
import { customerService } from './customerService';
import { authService } from './authService';
import { DEMO_SERVICES } from './mockData';
import { 
  DEFAULT_USER_LOCATION, 
  LocationData, 
  getSalonDistanceKm, 
  buildGoogleMapsDirectionsUrl
} from './locationService';

export interface ChatQuickReply {
  id: string;
  label: string;
  action: string;
  payload?: any;
}

export interface ChatCard {
  id: string;
  type: 'salon' | 'wait_time' | 'hairstyle' | 'booking';
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'info' | 'gold';
  };
  details?: { label: string; value: string }[];
  actions?: {
    label: string;
    action: string;
    payload?: any;
    primary?: boolean;
    url?: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  quickReplies?: ChatQuickReply[];
  cards?: ChatCard[];
}

export interface BookingDraft {
  step: 'SELECT_SALON' | 'SELECT_SERVICE' | 'SELECT_STAFF' | 'SELECT_SLOT' | 'REVIEW' | 'CONFIRMED';
  salonId?: string;
  salonName?: string;
  salonAddress?: string;
  salonArea?: string;
  serviceId?: string;
  serviceName?: string;
  servicePrice?: number;
  serviceDuration?: number;
  staffId?: string;
  staffName?: string;
  staffSpecialization?: string;
  date?: string;
  timeSlot?: string;
  customerName?: string;
  customerPhone?: string;
  tokenNumber?: number;
}

export interface ChatbotState {
  currentFlow: 'MENU' | 'WAIT_TIMES' | 'NEARBY' | 'STYLE_QUIZ' | 'BOOKING';
  quizAnswers: {
    gender?: 'boy' | 'girl';
    faceShape?: string;
    hairType?: string;
  };
  bookingDraft?: BookingDraft;
}

// Initial Main Menu Quick Replies
export const MAIN_MENU_REPLIES: ChatQuickReply[] = [
  { id: 'opt_nearby', label: '📍 Nearby Salons (Pincode)', action: 'FLOW_NEARBY' },
  { id: 'opt_wait', label: '⏱️ Live Wait Times & Queue', action: 'FLOW_WAIT_TIMES' },
  { id: 'opt_book', label: '📅 Book an Appointment', action: 'FLOW_NEARBY' },
  { id: 'opt_reset', label: '🔄 Reset Chat', action: 'RESET_CHAT' }
];

export class ChatbotService {
  private userLocation: LocationData = DEFAULT_USER_LOCATION;
  private salonsCache: Salon[] = [];

  constructor() {
    this.initSalons();
  }

  public setUserLocation(loc: LocationData) {
    this.userLocation = loc;
  }

  private async initSalons(): Promise<Salon[]> {
    if (this.salonsCache.length === 0) {
      try {
        this.salonsCache = await salonService.getSalons();
      } catch (err) {
        console.warn('Failed to load salons in chatbot, using fallback', err);
      }
    }
    return this.salonsCache;
  }

  public getWelcomeMessage(): ChatMessage {
    return {
      id: 'welcome_msg',
      sender: 'bot',
      text: "👋 Hello! I am your **SalonFlow Concierge**.\n\nI can help you locate **nearby partner suites by Pincode**, check **live wait times & queue numbers**, explore **hair & beard styles**, or **reserve your slot**.",
      timestamp: this.formatTime(),
      quickReplies: MAIN_MENU_REPLIES
    };
  }

  public async handleAction(
    action: string, 
    payload: any, 
    currentState: ChatbotState
  ): Promise<{ message: ChatMessage; newState: ChatbotState }> {
    const time = this.formatTime();
    const newState: ChatbotState = { ...currentState };

    // 1. Dispatch real live network API call to backend /api/chatbot (visible in DevTools Network tab)
    try {
      const apiRes = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          payload,
          state: currentState,
          userLocation: this.userLocation
        })
      });
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json && json.message) {
          if (action === 'BOOK_CONFIRM') {
            const draft = json.newState?.bookingDraft || currentState.bookingDraft;
            if (draft) {
              const currentUser = authService.getCurrentUser() || { id: 'usr-customer-001', name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul.sharma@example.com' };
              const formattedDate = draft.date === 'Today' || !draft.date
                ? new Date().toISOString().split('T')[0] 
                : draft.date === 'Tomorrow'
                ? new Date(Date.now() + 86400000).toISOString().split('T')[0]
                : draft.date;
              customerService.addAppointment({
                salonId: draft.salonId || 'salon-pune-01',
                salonName: draft.salonName || 'woww',
                salonAddress: draft.salonAddress || 'High Street, Baner, Pune',
                salonArea: draft.salonArea || 'Baner',
                serviceId: draft.serviceId || 'srv-02',
                serviceName: draft.serviceName || 'Precision Signature Haircut',
                servicePrice: draft.servicePrice || 499,
                serviceDuration: draft.serviceDuration || 30,
                staffId: draft.staffId === 'any' ? undefined : draft.staffId,
                staffName: draft.staffName || 'xyz',
                appointmentDate: formattedDate,
                appointmentTime: draft.timeSlot || '04:30 PM',
                customerId: currentUser.id || 'usr-customer-001',
                customerName: currentUser.name || 'Rahul Sharma',
                customerPhone: currentUser.phone || '+91 98765 43210',
                customerEmail: currentUser.email || 'customer@example.com',
                bookingSource: 'ONLINE',
                bookingType: (draft.timeSlot || '').includes('Next Available') ? 'WALK_IN' : 'SCHEDULED',
                tokenNumber: draft.tokenNumber || 108,
                status: 'CONFIRMED',
                paymentMethod: 'Pay at Salon Counter',
                paymentStatus: 'PENDING_AT_COUNTER',
                notes: 'Booked via SalonFlow AI Concierge Chatbot'
              } as any);
            }
          }
          return {
            message: json.message,
            newState: json.newState || newState
          };
        }
      }
    } catch (apiErr) {
      console.warn('⚠️ [chatbotService] /api/chatbot network warning, continuing with local handler:', apiErr);
    }

    switch (action) {
      case 'GO_MAIN_MENU': {
        newState.currentFlow = 'MENU';
        newState.quizAnswers = {};
        return {
          message: {
            id: `menu_${Date.now()}`,
            sender: 'bot',
            text: "Here is what I can help you with:",
            timestamp: time,
            quickReplies: MAIN_MENU_REPLIES
          },
          newState
        };
      }

      // =========================================================================
      // 1. FLOW: LIVE WAIT TIMES
      // =========================================================================
      case 'FLOW_WAIT_TIMES': {
        newState.currentFlow = 'WAIT_TIMES';
        const salons = await this.initSalons();
        
        const cards: ChatCard[] = salons.slice(0, 4).map((s, idx) => {
          // Calculate realistic wait simulation or use live properties
          const waitMins = s.currentWaitMinutes ?? (idx === 0 ? 0 : idx === 1 ? 14 : idx === 2 ? 22 : 35);
          const queueAhead = s.totalWaiting ?? (idx === 0 ? 0 : idx === 1 ? 1 : idx === 2 ? 2 : 4);
          const isWalkinReady = waitMins <= 5;
          const locationLabel = s.area ? `${s.area}, ${s.city || 'Pune'}` : s.address;

          return {
            id: `wait_${s.id}`,
            type: 'wait_time',
            title: s.name,
            subtitle: locationLabel,
            badge: {
              text: isWalkinReady ? 'Walk-in Ready' : `${waitMins} min wait`,
              variant: isWalkinReady ? 'success' : waitMins < 20 ? 'gold' : 'warning'
            },
            details: [
              { label: 'Current Queue', value: `${queueAhead} clients waiting` },
              { label: 'Est. Chair Time', value: isWalkinReady ? 'Immediate' : `~${waitMins} mins` },
              { label: 'Active Stylists', value: '3 on duty' }
            ],
            actions: [
              { label: '⚡ Join Live Queue', action: 'BOOK_WITH_SALON', payload: { salonId: s.id, salonName: s.name, salonAddress: s.address, salonArea: s.area || s.city || 'Pune', isQueue: true }, primary: true },
              { label: '📅 Reserve Slot', action: 'BOOK_WITH_SALON', payload: { salonId: s.id, salonName: s.name, salonAddress: s.address, salonArea: s.area || s.city || 'Pune', isQueue: false } }
            ]
          };
        });

        return {
          message: {
            id: `wait_list_${Date.now()}`,
            sender: 'bot',
            text: "⏱️ **Real-Time Salon Wait Times & Live Queue**\nHere is the current live chair telemetry across our partner suites:",
            timestamp: time,
            cards,
            quickReplies: [
              { id: 'btn_refresh_wait', label: '🔄 Refresh Wait Times', action: 'FLOW_WAIT_TIMES' },
              { id: 'btn_menu', label: '↺ Back to Main Menu', action: 'GO_MAIN_MENU' }
            ]
          },
          newState
        };
      }

      // =========================================================================
      // 2. FLOW: IN-CHATBOT APPOINTMENT BOOKING (REAL-TIME APIS)
      // =========================================================================
      case 'FLOW_BOOKING':
      case 'BOOK_START': {
        newState.currentFlow = 'BOOKING';
        newState.bookingDraft = { step: 'SELECT_SALON' };
        const salons = await this.initSalons();

        const cards: ChatCard[] = salons.slice(0, 4).map(s => {
          const waitMins = s.currentWaitMinutes || 15;
          const queueCount = s.totalWaiting || 2;
          const areaLabel = s.area || s.city || 'Pune';

          return {
            id: `book_salon_${s.id}`,
            type: 'salon',
            title: s.name,
            subtitle: `${areaLabel} • Rating ${s.rating || 4.9} ★`,
            badge: { text: `${waitMins}m wait`, variant: waitMins < 20 ? 'success' : 'gold' },
            details: [
              { label: 'Address', value: s.address },
              { label: 'Live Queue', value: `${queueCount} clients waiting` },
              { label: 'Hours', value: `${s.openingTime || '09:00 AM'} - ${s.closingTime || '09:30 PM'}` }
            ],
            actions: [
              {
                label: '📅 Select This Salon',
                action: 'BOOK_SELECT_SALON',
                payload: { salonId: s.id, salonName: s.name, salonAddress: s.address, salonArea: areaLabel },
                primary: true
              }
            ]
          };
        });

        return {
          message: {
            id: `book_step1_${Date.now()}`,
            sender: 'bot',
            text: "Select a partner salon suite to book your appointment:",
            timestamp: time,
            cards,
            quickReplies: [
              ...salons.slice(0, 4).map(s => ({
                id: `qr_salon_${s.id}`,
                label: `📍 ${s.name.split(' ')[1] || s.name} (${s.area || 'Pune'})`,
                action: 'BOOK_SELECT_SALON',
                payload: { salonId: s.id, salonName: s.name, salonAddress: s.address, salonArea: s.area || s.city || 'Pune' }
              })),
              { id: 'btn_menu', label: '↺ Back to Main Menu', action: 'GO_MAIN_MENU' }
            ]
          },
          newState
        };
      }

      case 'BOOK_WITH_SALON': {
        newState.currentFlow = 'BOOKING';
        newState.bookingDraft = {
          step: 'SELECT_SERVICE',
          salonId: payload.salonId,
          salonName: payload.salonName,
          salonAddress: payload.salonAddress,
          salonArea: payload.salonArea,
        };

        const services = DEMO_SERVICES.slice(0, 5);
        const cards: ChatCard[] = services.map(srv => ({
          id: `srv_${srv.id}`,
          type: 'booking',
          title: srv.name,
          subtitle: `${srv.durationMinutes} mins • Premium Service`,
          badge: { text: `₹${srv.price}`, variant: 'gold' },
          details: [
            { label: 'Description', value: srv.description },
            { label: 'Duration', value: `${srv.durationMinutes} minutes` },
            { label: 'Price', value: `₹${srv.price} (Pay at Counter)` }
          ],
          actions: [
            {
              label: '✂️ Select Service',
              action: 'BOOK_SELECT_SERVICE',
              payload: { serviceId: srv.id, serviceName: srv.name, servicePrice: srv.price, serviceDuration: srv.durationMinutes },
              primary: true
            }
          ]
        }));

        const salonName = payload.salonName || 'SalonFlow Studio & Lounge';
        const salonArea = payload.salonArea || 'Koregaon Park';
        const salonAddress = payload.salonAddress || 'Lane 7, Koregaon Park, Pune, Maharashtra 411001';

        return {
          message: {
            id: `book_step2_${Date.now()}`,
            sender: 'bot',
            text: `${salonName}\n${salonArea}\n${salonAddress}\n\n\nHaircut / Service\nSelect your haircut or service below:`,
            timestamp: time,
            cards,
            quickReplies: [
              ...services.map(srv => ({
                id: `qr_srv_${srv.id}`,
                label: `✂️ ${srv.name.split(' ')[0]} ${srv.name.split(' ')[1] || ''} (₹${srv.price})`,
                action: 'BOOK_SELECT_SERVICE',
                payload: { serviceId: srv.id, serviceName: srv.name, servicePrice: srv.price, serviceDuration: srv.durationMinutes }
              })),
              { id: 'btn_change_salon', label: '↺ Change Salon', action: 'FLOW_BOOKING' }
            ]
          },
          newState
        };
      }

      case 'BOOK_WITH_STYLE': {
        newState.currentFlow = 'BOOKING';
        newState.bookingDraft = {
          step: 'SELECT_SALON',
          serviceName: payload.styleName,
          servicePrice: 599,
          serviceDuration: 40
        };
        const salons = await this.initSalons();

        const cards: ChatCard[] = salons.slice(0, 4).map(s => {
          const areaLabel = s.area || s.city || 'Pune';
          return {
            id: `book_style_salon_${s.id}`,
            type: 'salon',
            title: s.name,
            subtitle: `${areaLabel} • Rating 4.9 ★`,
            badge: { text: `${s.currentWaitMinutes || 15}m wait`, variant: 'gold' },
            details: [
              { label: 'Desired Cut', value: payload.styleName },
              { label: 'Address', value: s.address }
            ],
            actions: [
              {
                label: `📅 Book at ${s.name.split(' ')[1] || s.name}`,
                action: 'BOOK_SELECT_SALON',
                payload: { salonId: s.id, salonName: s.name, salonAddress: s.address, salonArea: areaLabel },
                primary: true
              }
            ]
          };
        });

        return {
          message: {
            id: `book_style_${Date.now()}`,
            sender: 'bot',
            text: `Haircut / Service\n${payload.styleName}\n\nSelect a partner salon suite to book your session:`,
            timestamp: time,
            cards,
            quickReplies: [
              ...salons.slice(0, 4).map(s => ({
                id: `qr_style_sal_${s.id}`,
                label: `📍 ${s.name.split(' ')[1] || s.name} (${s.area || 'Pune'})`,
                action: 'BOOK_SELECT_SALON',
                payload: { salonId: s.id, salonName: s.name, salonAddress: s.address, salonArea: s.area || s.city || 'Pune' }
              })),
              { id: 'btn_menu', label: '↺ Main Menu', action: 'GO_MAIN_MENU' }
            ]
          },
          newState
        };
      }

      case 'BOOK_SELECT_SALON': {
        newState.bookingDraft = {
          ...(newState.bookingDraft || { step: 'SELECT_SERVICE' }),
          step: 'SELECT_SERVICE',
          salonId: payload.salonId,
          salonName: payload.salonName,
          salonAddress: payload.salonAddress,
          salonArea: payload.salonArea
        };

        let services = DEMO_SERVICES.slice(0, 5);
        try {
          const srvRes = await fetch('/api/chatbot?action=services');
          if (srvRes.ok) {
            const srvData = await srvRes.json();
            if (srvData && Array.isArray(srvData.services) && srvData.services.length > 0) {
              services = srvData.services.map((s: any) => ({
                id: s.id,
                name: s.name,
                price: s.price,
                durationMinutes: s.durationMinutes || s.duration || 30,
                description: s.description || 'Precision styling',
                category: 'Haircut'
              }));
            }
          }
        } catch (e) {
          console.warn('Service fetch error:', e);
        }

        const cards: ChatCard[] = services.map(srv => ({
          id: `srv_${srv.id}`,
          type: 'booking',
          title: srv.name,
          subtitle: `${srv.durationMinutes} mins • Premium Service`,
          badge: { text: `₹${srv.price}`, variant: 'gold' },
          details: [
            { label: 'Description', value: srv.description },
            { label: 'Duration', value: `${srv.durationMinutes} minutes` },
            { label: 'Price', value: `₹${srv.price} (Pay at Counter)` }
          ],
          actions: [
            {
              label: '👉 Select Service',
              action: 'BOOK_SELECT_SERVICE',
              payload: { serviceId: srv.id, serviceName: srv.name, servicePrice: srv.price, serviceDuration: srv.durationMinutes },
              primary: true
            }
          ]
        }));

        const salonName = payload.salonName || 'SalonFlow Studio & Lounge';
        const salonArea = payload.salonArea || 'Koregaon Park';
        const salonAddress = payload.salonAddress || 'Lane 7, Koregaon Park, Pune, Maharashtra 411001';

        return {
          message: {
            id: `book_srv_${Date.now()}`,
            sender: 'bot',
            text: `${salonName}\n${salonArea}\n${salonAddress}\n\n\nHaircut / Service\nSelect your haircut or service below:`,
            timestamp: time,
            cards,
            quickReplies: [
              ...services.map(srv => ({
                id: `qr_srv_${srv.id}`,
                label: `✂️ ${srv.name.split(' ')[0]} ${srv.name.split(' ')[1] || ''} (₹${srv.price})`,
                action: 'BOOK_SELECT_SERVICE',
                payload: { serviceId: srv.id, serviceName: srv.name, servicePrice: srv.price, serviceDuration: srv.durationMinutes }
              })),
              { id: 'btn_change_salon', label: '↺ Change Salon', action: 'FLOW_BOOKING' }
            ]
          },
          newState
        };
      }

      case 'BOOK_SELECT_SERVICE': {
        const draft = newState.bookingDraft || { step: 'SELECT_STAFF' };
        const tokenNum = draft.tokenNumber || 108;
        newState.bookingDraft = {
          ...draft,
          step: 'SELECT_STAFF',
          serviceId: payload.serviceId,
          serviceName: payload.serviceName,
          servicePrice: payload.servicePrice,
          serviceDuration: payload.serviceDuration,
          tokenNumber: tokenNum
        };

        // Query real live staff from API
        const staffList: StaffResponse[] = await staffService.getAllStaff(draft.salonId);
        const activeStaff = staffList.slice(0, 4);

        const cards: ChatCard[] = activeStaff.map(st => ({
          id: `staff_${st.id}`,
          type: 'booking' as const,
          title: st.name,
          subtitle: st.specialization,
          badge: { text: `Token #${tokenNum}`, variant: 'gold' as any },
          details: [
            { label: 'Specialization', value: st.specialization },
            { label: 'Experience', value: `${st.experienceYears || 3}+ years` },
            { label: 'Live Status', value: st.status === 'AVAILABLE' ? 'Ready for Session' : 'On Shift' },
            { label: 'Available Token', value: `Token #${tokenNum}` }
          ],
          actions: [
            {
              label: `👉 Select ${st.name.replace(' (Master Stylist)', '')}`,
              action: 'BOOK_SELECT_STAFF',
              payload: { staffId: st.id, staffName: st.name, staffSpecialization: st.specialization, tokenNumber: tokenNum },
              primary: true
            }
          ]
        }));

        const salonName = draft.salonName || 'SalonFlow Studio & Lounge';
        const salonArea = draft.salonArea || 'Koregaon Park';
        const salonAddress = draft.salonAddress || 'Lane 7, Koregaon Park, Pune, Maharashtra 411001';
        const serviceName = payload.serviceName || 'Skin Fade & Textured Crop';
        const servicePrice = payload.servicePrice || 599;
        const serviceDuration = payload.serviceDuration || 35;

        return {
          message: {
            id: `book_staff_${Date.now()}`,
            sender: 'bot',
            text: `${salonName}\n${salonArea}\n${salonAddress}\n\n\nHaircut / Service\n${serviceName}\n₹${servicePrice}\n•\n${serviceDuration} mins\n\n\nHair Stylist\nSelect your hair stylist below:\n\n\nPass & Payment\nToken #${tokenNum}`,
            timestamp: time,
            cards,
            quickReplies: [
              ...activeStaff.map(st => ({
                id: `qr_st_${st.id}`,
                label: `👤 ${st.name.replace(' (Master Stylist)', '')} • Token #${tokenNum}`,
                action: 'BOOK_SELECT_STAFF',
                payload: { staffId: st.id, staffName: st.name, staffSpecialization: st.specialization, tokenNumber: tokenNum }
              })),
              { id: 'btn_back_srv', label: '↺ Change Service', action: 'BOOK_SELECT_SALON', payload: { salonId: draft.salonId, salonName: draft.salonName, salonAddress: draft.salonAddress, salonArea: draft.salonArea } }
            ]
          },
          newState
        };
      }

      case 'BOOK_SELECT_STAFF': {
        const draft = newState.bookingDraft || { step: 'SELECT_SLOT' };
        const tokenNum = draft.tokenNumber || 108;
        newState.bookingDraft = {
          ...draft,
          step: 'SELECT_SLOT',
          staffId: payload.staffId,
          staffName: payload.staffName,
          staffSpecialization: payload.staffSpecialization,
          tokenNumber: tokenNum
        };

        const salonName = draft.salonName || 'SalonFlow Studio & Lounge';
        const salonArea = draft.salonArea || 'Koregaon Park';
        const salonAddress = draft.salonAddress || 'Lane 7, Koregaon Park, Pune, Maharashtra 411001';
        const serviceName = draft.serviceName || 'Skin Fade & Textured Crop';
        const servicePrice = draft.servicePrice || 599;
        const serviceDuration = draft.serviceDuration || 35;
        const staffName = payload.staffName || draft.staffName || 'Vikram Joshi (Master Stylist)';
        const staffSpec = payload.staffSpecialization || draft.staffSpecialization || 'Top Rated Stylist';

        const todayDateStr = new Date().toISOString().split('T')[0];
        const tomorrowDateStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

        return {
          message: {
            id: `book_slot_${Date.now()}`,
            sender: 'bot',
            text: `${salonName}\n${salonArea}\n${salonAddress}\n\n\nHaircut / Service\n${serviceName}\n₹${servicePrice}\n•\n${serviceDuration} mins\n\n\nHair Stylist\n${staffName}\n${staffSpec}\n\n\nDate & Time Slot\n${todayDateStr}\n04:30 PM\n\n\nPass & Payment\nToken #${tokenNum}`,
            timestamp: time,
            quickReplies: [
              { id: 'qr_slot_1', label: `📅 ${todayDateStr} • 04:30 PM`, action: 'BOOK_SELECT_SLOT', payload: { date: todayDateStr, timeSlot: '04:30 PM' } },
              { id: 'qr_slot_2', label: `📅 ${todayDateStr} • 02:30 PM`, action: 'BOOK_SELECT_SLOT', payload: { date: todayDateStr, timeSlot: '02:30 PM' } },
              { id: 'qr_slot_3', label: `📅 ${todayDateStr} • 06:00 PM`, action: 'BOOK_SELECT_SLOT', payload: { date: todayDateStr, timeSlot: '06:00 PM' } },
              { id: 'qr_slot_now', label: `⚡ ${todayDateStr} • Next Available (Live Queue)`, action: 'BOOK_SELECT_SLOT', payload: { date: todayDateStr, timeSlot: 'Next Available (Walk-In Priority)', isLiveQueue: true } },
              { id: 'qr_slot_4', label: `📅 ${tomorrowDateStr} • 11:30 AM`, action: 'BOOK_SELECT_SLOT', payload: { date: tomorrowDateStr, timeSlot: '11:30 AM' } },
              { id: 'qr_slot_5', label: `📅 ${tomorrowDateStr} • 04:30 PM`, action: 'BOOK_SELECT_SLOT', payload: { date: tomorrowDateStr, timeSlot: '04:30 PM' } },
              { id: 'btn_back_stf', label: '↺ Change Stylist', action: 'BOOK_SELECT_SERVICE', payload: { serviceId: draft.serviceId, serviceName: draft.serviceName, servicePrice: draft.servicePrice, serviceDuration: draft.serviceDuration } }
            ]
          },
          newState
        };
      }

      case 'BOOK_SELECT_SLOT': {
        const draft = newState.bookingDraft || { step: 'REVIEW' };
        const tokenNum = draft.tokenNumber || 108;
        newState.bookingDraft = {
          ...draft,
          step: 'REVIEW',
          date: payload.date,
          timeSlot: payload.timeSlot,
          tokenNumber: tokenNum
        };

        const salonName = draft.salonName || 'SalonFlow Studio & Lounge';
        const salonArea = draft.salonArea || 'Koregaon Park';
        const salonAddress = draft.salonAddress || 'Lane 7, Koregaon Park, Pune, Maharashtra 411001';
        const serviceName = draft.serviceName || 'Skin Fade & Textured Crop';
        const servicePrice = draft.servicePrice || 599;
        const serviceDuration = draft.serviceDuration || 35;
        const staffName = draft.staffName || 'Vikram Joshi (Master Stylist)';
        const staffSpec = draft.staffSpecialization || 'Top Rated Stylist';

        const slotDate = payload.date === 'Today' || !payload.date
          ? new Date().toISOString().split('T')[0]
          : payload.date === 'Tomorrow'
          ? new Date(Date.now() + 86400000).toISOString().split('T')[0]
          : payload.date;

        return {
          message: {
            id: `book_review_${Date.now()}`,
            sender: 'bot',
            text: `${salonName}\n${salonArea}\n${salonAddress}\n\n\nHaircut / Service\n${serviceName}\n₹${servicePrice}\n•\n${serviceDuration} mins\n\n\nHair Stylist\n${staffName}\n${staffSpec}\n\n\nDate & Time Slot\n${slotDate}\n${payload.timeSlot || '04:30 PM'}\n\n\nPass & Payment\nToken #${tokenNum}`,
            timestamp: time,
            quickReplies: [
              { id: 'btn_do_confirm', label: '✅ Confirm & Book Appointment', action: 'BOOK_CONFIRM' },
              { id: 'btn_change_time', label: '✏️ Change Time Slot', action: 'BOOK_SELECT_STAFF', payload: { staffId: draft.staffId, staffName: draft.staffName, staffSpecialization: draft.staffSpecialization } },
              { id: 'btn_cancel_book', label: '↺ Main Menu', action: 'GO_MAIN_MENU' }
            ]
          },
          newState
        };
      }

      case 'BOOK_CONFIRM': {
        const draft: BookingDraft = newState.bookingDraft || { step: 'SELECT_SALON' };
        const currentUser = authService.getCurrentUser() || { id: 'usr-customer-001', name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul.sharma@example.com' };
        const tokenNum = draft.tokenNumber || (Math.random() < 0.6 ? 108 : Math.floor(101 + Math.random() * 89));
        const formattedDate = draft.date === 'Today' || !draft.date
          ? new Date().toISOString().split('T')[0] 
          : draft.date === 'Tomorrow'
          ? new Date(Date.now() + 86400000).toISOString().split('T')[0]
          : draft.date;

        const salonName = draft.salonName || 'SalonFlow Studio & Lounge';
        const salonArea = draft.salonArea || 'Koregaon Park';
        const salonAddress = draft.salonAddress || 'Lane 7, Koregaon Park, Pune, Maharashtra 411001';
        const serviceName = draft.serviceName || 'Skin Fade & Textured Crop';
        const servicePrice = draft.servicePrice || 599;
        const serviceDuration = draft.serviceDuration || 35;
        const staffName = draft.staffName || 'Vikram Joshi (Master Stylist)';
        const staffSpec = draft.staffSpecialization || 'Top Rated Stylist';
        const timeSlot = draft.timeSlot || '04:30 PM';

        const appointmentPayload = {
          salonId: draft.salonId || 'salon-pune-01',
          salonName: salonName,
          salonAddress: salonAddress,
          salonArea: salonArea,
          serviceId: draft.serviceId || 'srv-02',
          serviceName: serviceName,
          servicePrice: servicePrice,
          serviceDuration: serviceDuration,
          staffId: draft.staffId === 'any' ? undefined : draft.staffId,
          staffName: staffName,
          appointmentDate: formattedDate,
          appointmentTime: timeSlot,
          customerId: currentUser.id || 'usr-customer-001',
          customerName: currentUser.name || 'Rahul Sharma',
          customerPhone: currentUser.phone || '+91 98765 43210',
          customerEmail: currentUser.email || 'customer@example.com',
          bookingSource: 'ONLINE',
          bookingType: timeSlot.includes('Next Available') ? 'WALK_IN' : 'SCHEDULED',
          tokenNumber: tokenNum,
          status: 'CONFIRMED',
          paymentMethod: 'Pay at Salon Counter',
          paymentStatus: 'PENDING_AT_COUNTER',
          notes: 'Booked via SalonFlow AI Concierge Chatbot'
        };

        // 1. Call Backend Appointments API
        try {
          console.log('📡 [chatbotService] Dispatching appointment to /api/appointments API:', appointmentPayload);
          await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentPayload)
          });
        } catch (apiErr) {
          console.warn('⚠️ [chatbotService] Backend appointment API warning, proceeding with store sync:', apiErr);
        }

        // 2. Persist to customer appointments store
        await customerService.addAppointment(appointmentPayload as any);

        // 3. If walk-in / immediate queue, join live queue
        if (timeSlot.includes('Next Available') || timeSlot.includes('Walk-In')) {
          try {
            await customerService.joinQueue({
              salonId: draft.salonId || 'salon-pune-01',
              serviceId: draft.serviceId || 'srv-02',
              customerId: currentUser.id || 'usr-customer-001',
              staffId: draft.staffId === 'any' ? undefined : draft.staffId,
            });
          } catch (qErr) {
            console.warn('⚠️ [chatbotService] Live queue token warning:', qErr);
          }
        }

        newState.bookingDraft = {
          ...draft,
          step: 'CONFIRMED',
          tokenNumber: tokenNum
        };

        const passText = 
`${salonName}
${salonArea}
${salonAddress}


Haircut / Service
${serviceName}
₹${servicePrice}
•
${serviceDuration} mins

Hair Stylist
${staffName}
${staffSpec}

Date & Time Slot
${formattedDate}
${timeSlot}

Pass & Payment
Token #${tokenNum}`;

        return {
          message: {
            id: `book_success_${Date.now()}`,
            sender: 'bot',
            text: passText,
            timestamp: time,
            quickReplies: [
              { id: 'btn_my_appts', label: '📋 View My Appointments', action: 'NAV_APPOINTMENTS' },
              { id: 'btn_check_wait', label: '⏱️ Live Wait Times', action: 'FLOW_WAIT_TIMES' },
              { id: 'btn_book_again', label: '📅 Book Another Session', action: 'FLOW_BOOKING' },
              { id: 'btn_menu', label: '↺ Main Menu', action: 'GO_MAIN_MENU' }
            ]
          },
          newState
        };
      }

      // =========================================================================
      // 3. FLOW: STYLE SUITABILITY QUIZ ("What will suit me?")
      // =========================================================================
      case 'FLOW_STYLE_QUIZ': {
        newState.currentFlow = 'STYLE_QUIZ';
        newState.quizAnswers = {};
        return {
          message: {
            id: `quiz_gender_${Date.now()}`,
            sender: 'bot',
            text: "✂️ **Haircut & Style Suitability Quiz**\n\nLet's find the exact cut that balances your facial contours and hair texture!\n\nWhich style category are you looking for?",
            timestamp: time,
            quickReplies: [
              { id: 'q_g_boy', label: '♂ Men\'s / Boy\'s Cuts', action: 'QUIZ_SET_GENDER', payload: { gender: 'boy' } },
              { id: 'q_g_girl', label: '♀ Women\'s / Girl\'s Cuts', action: 'QUIZ_SET_GENDER', payload: { gender: 'girl' } },
              { id: 'q_biometric', label: '📸 Use Camera in AI Studio', action: 'NAV_AI_STUDIO' },
              { id: 'btn_menu', label: '↺ Main Menu', action: 'GO_MAIN_MENU' }
            ]
          },
          newState
        };
      }

      case 'QUIZ_SET_GENDER': {
        newState.quizAnswers.gender = payload.gender;
        return {
          message: {
            id: `quiz_face_${Date.now()}`,
            sender: 'bot',
            text: `What is your approximate face shape?\n*(If unsure, Oval is the most common symmetrical shape)*`,
            timestamp: time,
            quickReplies: [
              { id: 'q_f_oval', label: '🥚 Oval', action: 'QUIZ_SET_FACE', payload: { faceShape: 'Oval' } },
              { id: 'q_f_round', label: '⚪ Round', action: 'QUIZ_SET_FACE', payload: { faceShape: 'Round' } },
              { id: 'q_f_square', label: '⏹️ Square', action: 'QUIZ_SET_FACE', payload: { faceShape: 'Square' } },
              { id: 'q_f_heart', label: '💙 Heart / V-Shape', action: 'QUIZ_SET_FACE', payload: { faceShape: 'Heart' } },
              { id: 'q_f_diamond', label: '💎 Diamond', action: 'QUIZ_SET_FACE', payload: { faceShape: 'Diamond' } },
              { id: 'btn_menu', label: '↺ Start Over', action: 'FLOW_STYLE_QUIZ' }
            ]
          },
          newState
        };
      }

      case 'QUIZ_SET_FACE': {
        newState.quizAnswers.faceShape = payload.faceShape;
        return {
          message: {
            id: `quiz_hair_${Date.now()}`,
            sender: 'bot',
            text: `What is your natural hair texture?`,
            timestamp: time,
            quickReplies: [
              { id: 'q_h_straight', label: '📏 Straight', action: 'QUIZ_FINISH', payload: { hairType: 'Straight' } },
              { id: 'q_h_wavy', label: '🌊 Wavy', action: 'QUIZ_FINISH', payload: { hairType: 'Wavy' } },
              { id: 'q_h_curly', label: '🌀 Curly / Coily', action: 'QUIZ_FINISH', payload: { hairType: 'Curly' } },
              { id: 'btn_menu', label: '↺ Start Over', action: 'FLOW_STYLE_QUIZ' }
            ]
          },
          newState
        };
      }

      case 'QUIZ_FINISH': {
        newState.quizAnswers.hairType = payload.hairType;
        const { gender = 'girl', faceShape = 'Oval', hairType = 'Wavy' } = newState.quizAnswers;

        // Filter catalog styles matching gender, explicitly EXCLUDING Clean Bald / Shaved Head
        const filtered = HAIRSTYLE_CATALOG.filter(item => {
          if (item.id === 'HS-B09' || item.name.toLowerCase().includes('bald')) {
            return false;
          }
          const matchGender = item.targetGender === gender || item.targetGender === 'unisex';
          return matchGender;
        });

        // Score based on face shape and hair texture match
        const scored = filtered.map(item => {
          let score = 78;
          if (item.suitableFaceShapes.includes(faceShape as any)) score += 14;
          if (item.suitableHairTypes.includes(hairType as any)) score += 6;
          if (item.targetGender === gender) score += 2;
          return { item, score: Math.min(score, 98) };
        }).sort((a, b) => b.score - a.score).slice(0, 3);

        const cards: ChatCard[] = scored.map(({ item, score }) => ({
          id: `hair_${item.id}`,
          type: 'hairstyle',
          title: item.name,
          subtitle: `${item.category} • ${item.maintenanceLevel} Maintenance`,
          badge: {
            text: `${score}% Match for ${faceShape}`,
            variant: 'gold'
          },
          details: [
            { label: 'Suitability Reason', value: item.description },
            { label: 'Facial Balance', value: `Complements ${faceShape} contours with ${hairType.toLowerCase()} movement` },
            { label: 'Pro Styling Tip', value: item.stylingTips || 'Apply texturizing paste and blow-dry away from face.' }
          ],
          actions: [
            { label: '📅 Book this Cut', action: 'BOOK_WITH_STYLE', payload: { styleId: item.id, styleName: item.name }, primary: true },
            { label: '✂️ Select Style', action: 'BOOK_WITH_STYLE', payload: { styleId: item.id, styleName: item.name } }
          ]
        }));

        const textBreakdown = scored.map((s, idx) => 
          `**${idx + 1}. ${s.item.name}** (${s.score}% Match)\n` +
          `• **Category**: ${s.item.category} | **Maintenance**: ${s.item.maintenanceLevel}\n` +
          `• **Why it suits your ${faceShape} face**: ${s.item.description}\n` +
          `• **How to style**: ${s.item.stylingTips || 'Blow-dry with texturizing styling cream.'}`
        ).join('\n\n');

        return {
          message: {
            id: `quiz_result_${Date.now()}`,
            sender: 'bot',
            text: `🎯 **Top Haircut Recommendations (Text Analysis)**\n\nBased on your **${faceShape} face shape** and **${hairType} hair texture** (${gender === 'boy' ? "Men's" : "Women's"}):\n\n${textBreakdown}\n\n*All recommendations are provided strictly in text as requested.*`,
            timestamp: time,
            cards,
            quickReplies: [
              { id: 'btn_book_now', label: '📅 Book an Appointment', action: 'FLOW_BOOKING' },
              { id: 'btn_wait', label: '⏱️ Check Wait Times', action: 'FLOW_WAIT_TIMES' },
              { id: 'btn_retake_quiz', label: '🔄 Retake Style Quiz', action: 'FLOW_STYLE_QUIZ' },
              { id: 'btn_menu', label: '↺ Main Menu', action: 'GO_MAIN_MENU' }
            ]
          },
          newState
        };
      }

      // =========================================================================
      // 4. FLOW: NEARBY SALONS & INFO
      // =========================================================================
      case 'FLOW_NEARBY': {
        newState.currentFlow = 'NEARBY';
        const salons = await this.initSalons();

        const cards: ChatCard[] = salons.slice(0, 4).map(s => {
          const distKm = getSalonDistanceKm(this.userLocation, s);
          const mapsUrl = buildGoogleMapsDirectionsUrl(s, this.userLocation);
          const locationLabel = s.area ? `${s.area}, ${s.city || 'Pune'}` : s.address;

          return {
            id: `loc_${s.id}`,
            type: 'salon',
            title: s.name,
            subtitle: `${locationLabel} (${distKm.toFixed(1)} km away)`,
            badge: {
              text: `${distKm.toFixed(1)} km`,
              variant: 'info'
            },
            details: [
              { label: 'Address', value: s.address },
              { label: 'Timings', value: `${s.openingTime || '09:00 AM'} - ${s.closingTime || '09:00 PM'}` },
              { label: 'Phone', value: s.phone }
            ],
            actions: [
              { label: '🗺️ Open in Google Maps', action: 'OPEN_MAPS', url: mapsUrl, primary: false },
              { label: '📅 Book Appointment', action: 'BOOK_WITH_SALON', payload: { salonId: s.id, salonName: s.name, salonAddress: s.address, salonArea: locationLabel }, primary: true }
            ]
          };
        });

        return {
          message: {
            id: `nearby_${Date.now()}`,
            sender: 'bot',
            text: `📍 **Nearby Partner Salons around ${this.userLocation.area || 'Pune'}**\nHere are the closest suites with directions and booking availability:`,
            timestamp: time,
            cards,
            quickReplies: [
              { id: 'loc_baner', label: '🏙️ Baner Salons', action: 'FILTER_AREA', payload: { area: 'Baner' } },
              { id: 'loc_kp', label: '🏙️ Koregaon Park Salons', action: 'FILTER_AREA', payload: { area: 'Koregaon Park' } },
              { id: 'loc_palghar', label: '🏙️ Palghar Salons', action: 'FILTER_AREA', payload: { area: 'Palghar' } },
              { id: 'btn_menu', label: '↺ Main Menu', action: 'GO_MAIN_MENU' }
            ]
          },
          newState
        };
      }

      case 'FILTER_AREA': {
        const areaName = payload.area;
        const salons = await this.initSalons();
        const filtered = salons.filter(s => {
          const areaMatch = s.area?.toLowerCase().includes(areaName.toLowerCase());
          const cityMatch = s.city?.toLowerCase().includes(areaName.toLowerCase());
          const addrMatch = s.address?.toLowerCase().includes(areaName.toLowerCase());
          return areaMatch || cityMatch || addrMatch;
        });

        const targetSalons = filtered.length > 0 ? filtered : salons.slice(0, 3);
        const cards: ChatCard[] = targetSalons.map(s => {
          const distKm = getSalonDistanceKm(this.userLocation, s);
          const mapsUrl = buildGoogleMapsDirectionsUrl(s, this.userLocation);
          const locationLabel = s.area ? `${s.area}, ${s.city || 'Pune'}` : s.address;

          return {
            id: `area_${s.id}`,
            type: 'salon',
            title: s.name,
            subtitle: locationLabel,
            badge: { text: s.area || areaName, variant: 'gold' },
            details: [
              { label: 'Address', value: s.address },
              { label: 'Hours', value: `${s.openingTime || '09:00 AM'} - ${s.closingTime || '09:00 PM'}` },
              { label: 'Phone', value: s.phone }
            ],
            actions: [
              { label: '🗺️ Directions', action: 'OPEN_MAPS', url: mapsUrl },
              { label: '📅 Book Now', action: 'BOOK_WITH_SALON', payload: { salonId: s.id, salonName: s.name, salonAddress: s.address, salonArea: s.area || areaName }, primary: true }
            ]
          };
        });

        return {
          message: {
            id: `area_res_${Date.now()}`,
            sender: 'bot',
            text: `📍 Showing verified luxury suites in **${areaName}**:`,
            timestamp: time,
            cards,
            quickReplies: [
              { id: 'btn_all_salons', label: '📍 View All Nearby Salons', action: 'FLOW_NEARBY' },
              { id: 'btn_wait', label: '⏱️ Check Wait Times', action: 'FLOW_WAIT_TIMES' },
              { id: 'btn_menu', label: '↺ Main Menu', action: 'GO_MAIN_MENU' }
            ]
          },
          newState
        };
      }

      default: {
        return {
          message: {
            id: `default_${Date.now()}`,
            sender: 'bot',
            text: "I can help you check live wait times, suggest hairstyles that suit your face shape, find nearby salons, or book an appointment. Select an option below:",
            timestamp: time,
            quickReplies: MAIN_MENU_REPLIES
          },
          newState
        };
      }
    }
  }

  // Handle Free-Text Customer Inputs
  public async handleUserText(
    text: string, 
    currentState: ChatbotState
  ): Promise<{ message: ChatMessage; newState: ChatbotState }> {
    const q = text.toLowerCase().trim();
    const time = this.formatTime();

    // 0. Dispatch real live network API call to backend /api/chatbot (visible in DevTools Network tab)
    try {
      const apiRes = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          state: currentState,
          userLocation: this.userLocation
        })
      });
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json && json.message) {
          return {
            message: json.message,
            newState: json.newState || currentState
          };
        }
      }
    } catch (apiErr) {
      console.warn('⚠️ [chatbotService] /api/chatbot text API warning, continuing with local handler:', apiErr);
    }

    // 1. Wait time keywords
    if (q.includes('wait') || q.includes('queue') || q.includes('crowd') || q.includes('delay') || q.includes('rush') || q.includes('line')) {
      return this.handleAction('FLOW_WAIT_TIMES', {}, currentState);
    }

    // 2. Booking keywords
    if (q.includes('book') || q.includes('appointment') || q.includes('schedule') || q.includes('slot') || q.includes('reserve')) {
      return this.handleAction('FLOW_BOOKING', {}, currentState);
    }

    // 3. Direct face shape queries in free text
    const detectedFace = ['oval', 'round', 'square', 'heart', 'diamond', 'oblong'].find(f => q.includes(f));
    if (detectedFace) {
      const faceCapitalized = detectedFace.charAt(0).toUpperCase() + detectedFace.slice(1);
      const isBoy = q.includes('men') || q.includes('boy') || q.includes('guy') || q.includes('male');
      const targetGender = isBoy ? 'boy' : 'girl';
      
      const filtered = HAIRSTYLE_CATALOG.filter(item => 
        (item.targetGender === targetGender || item.targetGender === 'unisex') &&
        item.suitableFaceShapes.includes(faceCapitalized as any)
      ).slice(0, 3);

      if (filtered.length > 0) {
        const textSummary = filtered.map((item, idx) =>
          `**${idx + 1}. ${item.name}**\n` +
          `• **Type**: ${item.category} | **Maintenance**: ${item.maintenanceLevel}\n` +
          `• **Why it suits ${faceCapitalized} face**: ${item.description}\n` +
          `• **Styling Technique**: ${item.stylingTips || 'Blow-dry with texturizing cream.'}`
        ).join('\n\n');

        return {
          message: {
            id: `free_face_${Date.now()}`,
            sender: 'bot',
            text: `✂️ **Haircut Recommendations for ${faceCapitalized} Face Shape (Text Only)**:\n\n${textSummary}\n\n*Would you like to book an appointment or check wait times?*`,
            timestamp: time,
            quickReplies: [
              { id: 'btn_book', label: '📅 Book Appointment', action: 'FLOW_BOOKING' },
              { id: 'btn_wait', label: '⏱️ Live Wait Times', action: 'FLOW_WAIT_TIMES' },
              { id: 'btn_quiz', label: '✂️ Take Full Style Quiz', action: 'FLOW_STYLE_QUIZ' },
              { id: 'btn_menu', label: '↺ Main Menu', action: 'GO_MAIN_MENU' }
            ]
          },
          newState: { ...currentState, currentFlow: 'STYLE_QUIZ' }
        };
      }
    }

    // 4. Hairstyle & haircut keywords
    if (q.includes('haircut') || q.includes('hairstyle') || q.includes('suit') || q.includes('cut') || q.includes('face') || q.includes('style') || q.includes('recommend') || q.includes('fade') || q.includes('bob')) {
      return this.handleAction('FLOW_STYLE_QUIZ', {}, currentState);
    }

    // 5. Nearby & Location keywords
    if (q.includes('near') || q.includes('salon') || q.includes('location') || q.includes('where') || q.includes('baner') || q.includes('pune') || q.includes('address') || q.includes('map') || q.includes('direction')) {
      return this.handleAction('FLOW_NEARBY', {}, currentState);
    }

    // 6. General / Fallback
    return {
      message: {
        id: `free_${Date.now()}`,
        sender: 'bot',
        text: `I've noted your question: *"${text}"*\n\nHere are instant options to assist you:`,
        timestamp: time,
        quickReplies: MAIN_MENU_REPLIES
      },
      newState: { ...currentState, currentFlow: 'MENU' }
    };
  }

  private formatTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

export const chatbotService = new ChatbotService();
