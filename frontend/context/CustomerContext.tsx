'use client';

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, QueueToken, Notification, Hairstyle, Appointment } from '../types';
import { customerService } from '../services/customerService';
import { authService, AuthResponse } from '../services/authService';
import { queueWebSocket } from '../services/websocketService';
import { pushNotificationService } from '../services/pushNotificationService';

interface CustomerContextType {
  user: User | null;
  isLoggedIn: boolean;
  activeToken: QueueToken | null;
  notifications: Notification[];
  unreadNotifCount: number;
  selectedHairstyle: Hairstyle | null;
  isLoadingToken: boolean;
  appointments: Appointment[];
  setSelectedHairstyle: (style: Hairstyle | null) => void;
  refreshState: () => Promise<void>;
  refreshAppointments: () => Promise<void>;
  advanceDemoQueue: () => Promise<void>;
  resetDemoQueue: () => Promise<void>;
  cancelActiveToken: () => Promise<void>;
  markNotifAsRead: (id: string) => Promise<void>;
  markAllNotifsAsRead: () => Promise<void>;
  clearAllNotifications: () => void;
  joinLiveQueue: (serviceId: string, staffId?: string, hairstyleId?: string, salonId?: string) => Promise<QueueToken>;
  addAppointment: (data: Partial<Appointment>) => Promise<Appointment>;
  cancelAppointment: (id: string) => Promise<void>;
  rateAppointment: (id: string, rating: number, feedback?: string) => Promise<boolean>;
  updateUserProfile: (updatedData: Partial<User>) => Promise<AuthResponse>;
  clearActiveToken: () => void;
  loginUser: (emailOrPhone: string, password: string) => Promise<AuthResponse>;
  registerUser: (data: {
    name: string;
    email: string;
    phone: string;
    dob?: string;
    gender?: string;
    password: string;
    confirmPassword?: string;
  }) => Promise<AuthResponse>;
  logoutUser: () => void;
  requestNotificationPermission: () => Promise<boolean>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeToken, setActiveToken] = useState<QueueToken | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedHairstyle, setSelectedHairstyle] = useState<Hairstyle | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState<boolean>(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const current = authService.getCurrentUser();
    setUser(current);
  }, []);

  const refreshAppointments = async () => {
    try {
      const storedPhone = typeof window !== 'undefined' ? localStorage.getItem('salonflow_customer_phone') : null;
      const lookupKey = user?.id || user?.phone || storedPhone || undefined;
      const appts = await customerService.getAppointments(lookupKey);
      setAppointments(appts);
    } catch (e) {
      console.error('Failed to load appointments:', e);
    }
  };

  const refreshState = async () => {
    try {
      const token = await customerService.getToken('active');
      setActiveToken(token);
      if (user) {
        const notifs = await customerService.getNotifications(user.id);
        setNotifications(notifs);
      }
    } catch (err) {
      console.error('Failed to load customer state:', err);
    } finally {
      setIsLoadingToken(false);
    }
  };

  useEffect(() => {
    refreshState();
  }, [user]);

  const notifiedThresholdsRef = useRef<Set<string>>(new Set());

  const checkAndTriggerPushAlert = (token: QueueToken, lastCalledNum?: number | null) => {
    if (!token || !token.tokenId) return;

    // 1. Proximity: 2 Numbers Away Alert
    const isTwoAway =
      token.position === 2 ||
      (typeof lastCalledNum === 'number' &&
        typeof token.tokenNumber === 'number' &&
        token.tokenNumber - lastCalledNum === 2);

    const pos2Key = `${token.tokenId}_pos2`;
    if (isTwoAway && token.status === 'WAITING' && !notifiedThresholdsRef.current.has(pos2Key)) {
      notifiedThresholdsRef.current.add(pos2Key);

      pushNotificationService.notify({
        title: "You're 2 Numbers Away!",
        body: `Token #${token.tokenNumber} is only 2 turns away! Please get ready and head towards ${token.salonName || 'the salon'}.`,
        tag: `pos2-${token.tokenId}`,
        soundType: 'alert',
        onClick: () => {
          if (typeof window !== 'undefined') {
            window.location.href = '/queue';
          }
        },
      });

      const inAppNotif: Notification = {
        id: `notif-pos2-${Date.now()}`,
        userId: token.customerId || 'user',
        title: "You're 2 Numbers Away!",
        message: `Token #${token.tokenNumber} is only 2 turns away in the live queue. Please arrive at the styling lounge.`,
        type: 'TURN_APPROACHING',
        isRead: false,
        createdAt: new Date().toISOString(),
        actionUrl: '/queue',
      };
      setNotifications((prev) => [inAppNotif, ...prev]);
    }

    // 2. Proximity: 1 Number Away Alert (Next in Line)
    const isOneAway =
      token.position === 1 ||
      (typeof lastCalledNum === 'number' &&
        typeof token.tokenNumber === 'number' &&
        token.tokenNumber - lastCalledNum === 1);

    const pos1Key = `${token.tokenId}_pos1`;
    if (isOneAway && token.status === 'WAITING' && !notifiedThresholdsRef.current.has(pos1Key)) {
      notifiedThresholdsRef.current.add(pos1Key);

      pushNotificationService.notify({
        title: "You're Next in Line!",
        body: `Token #${token.tokenNumber} is next! Please stand by the styling area.`,
        tag: `pos1-${token.tokenId}`,
        soundType: 'alert',
        onClick: () => {
          if (typeof window !== 'undefined') {
            window.location.href = '/queue';
          }
        },
      });

      const inAppNotif: Notification = {
        id: `notif-pos1-${Date.now()}`,
        userId: token.customerId || 'user',
        title: "You're Next in Line!",
        message: `Token #${token.tokenNumber} is up next! Only 1 turn left. Please be ready near your styling chair.`,
        type: 'TURN_APPROACHING',
        isRead: false,
        createdAt: new Date().toISOString(),
        actionUrl: '/queue',
      };
      setNotifications((prev) => [inAppNotif, ...prev]);
    }

    // 3. Chair Ready / CALLED Alert
    const calledKey = `${token.tokenId}_called`;
    if (token.status === 'CALLED' && !notifiedThresholdsRef.current.has(calledKey)) {
      notifiedThresholdsRef.current.add(calledKey);

      pushNotificationService.notify({
        title: `It's Your Turn! Token #${token.tokenNumber} Called!`,
        body: `Your styling chair is ready at ${token.salonName || 'the salon'}. Please proceed directly to your stylist!`,
        tag: `called-${token.tokenId}`,
        soundType: 'urgent',
        onClick: () => {
          if (typeof window !== 'undefined') {
            window.location.href = '/queue';
          }
        },
      });

      const inAppNotif: Notification = {
        id: `notif-called-${Date.now()}`,
        userId: token.customerId || 'user',
        title: 'Styling Chair Ready!',
        message: `Token #${token.tokenNumber} has been called! Your stylist is waiting at your chair.`,
        type: 'TURN_CALLED',
        isRead: false,
        createdAt: new Date().toISOString(),
        actionUrl: '/queue',
      };
      setNotifications((prev) => [inAppNotif, ...prev]);
    }
  };

  // Real-time WebSocket listener: updates active token instantly without polling or REST calls
  useEffect(() => {
    const sId = activeToken?.salonId;
    if (!sId) return;

    const unsubSalon = queueWebSocket.subscribeToSalon(sId, (board) => {
      if (activeToken && Array.isArray(board.activeQueue)) {
        const match = board.activeQueue.find(
          (t: any) =>
            t.tokenNumber === activeToken.tokenNumber ||
            t.id === activeToken.tokenId ||
            t.tokenId === activeToken.tokenId
        );
        if (match) {
          const updatedToken: QueueToken = {
            ...activeToken,
            position: match.position ?? activeToken.position,
            status: match.status ?? activeToken.status,
            estimatedWait: match.estimatedWait ?? match.estimatedWaitMinutes ?? activeToken.estimatedWait,
          };
          setActiveToken(updatedToken);
          checkAndTriggerPushAlert(updatedToken, board.lastCalledTokenNumber);
        } else if (
          typeof board.currentServingTokenNumber === 'number' &&
          typeof activeToken.tokenNumber === 'number' &&
          activeToken.tokenNumber < board.currentServingTokenNumber
        ) {
          setActiveToken((prev) =>
            prev ? { ...prev, status: 'COMPLETED', position: 0, estimatedWait: 0 } : null
          );
        }
      }
    });

    return () => {
      if (unsubSalon) unsubSalon();
    };
  }, [activeToken?.salonId, activeToken?.tokenNumber, activeToken?.tokenId]);

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const loginUser = async (emailOrPhone: string, password: string): Promise<AuthResponse> => {
    const res = await authService.login(emailOrPhone, password);
    if (res.success && res.user) {
      setUser(res.user);
      await refreshState();
    }
    return res;
  };

  const registerUser = async (data: {
    name: string;
    email: string;
    phone: string;
    dob?: string;
    gender?: string;
    password: string;
    confirmPassword?: string;
  }): Promise<AuthResponse> => {
    const res = await authService.register(data);
    if (res.success && res.user) {
      setUser(res.user);
      await refreshState();
    }
    return res;
  };

  const logoutUser = () => {
    authService.logout();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const advanceDemoQueue = async () => {
    if (!activeToken) return;
    const result = await customerService.advanceDemoQueue(activeToken.tokenId);
    setActiveToken(result.token);
    checkAndTriggerPushAlert(result.token);
    await refreshState();
  };

  const resetDemoQueue = async () => {
    notifiedThresholdsRef.current.clear();
    const token = await customerService.resetDemoQueue();
    setActiveToken(token);
    await refreshState();
  };

  const cancelActiveToken = async () => {
    if (!activeToken) return;
    notifiedThresholdsRef.current.clear();
    await customerService.cancelToken(activeToken.tokenId);
    await refreshState();
  };

  const markNotifAsRead = async (id: string) => {
    await customerService.markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotifsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('salonflow_notifications');
      if (stored) {
        try {
          const list = JSON.parse(stored);
          const updated = list.map((n: any) => ({ ...n, isRead: true }));
          localStorage.setItem('salonflow_notifications', JSON.stringify(updated));
        } catch {}
      }
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('salonflow_notifications');
    }
  };

  const joinLiveQueue = async (serviceId: string, staffId?: string, hairstyleId?: string, salonId?: string) => {
    // Request notification permission smoothly when joining queue
    pushNotificationService.requestPermission().catch(() => {});

    const customerId = user ? user.id : undefined;
    const token = await customerService.joinQueue({
      salonId: salonId || '',
      serviceId,
      customerId,
      customerName: user?.name,
      customerPhone: user?.phone,
      staffId,
      selectedHairstyleId: hairstyleId,
    });
    setActiveToken(token);
    checkAndTriggerPushAlert(token);
    await refreshState();
    return token;
  };

  const addAppointment = async (data: Partial<Appointment>) => {
    if (data.customerPhone && typeof window !== 'undefined') {
      localStorage.setItem('salonflow_customer_phone', data.customerPhone);
    }
    const newApt = await customerService.addAppointment({
      ...data,
      customerId: user ? user.id : data.customerId,
      customerName: user ? user.name : data.customerName,
      customerPhone: user ? user.phone : data.customerPhone,
    });
    setAppointments((prev) => [newApt, ...prev.filter((a) => a.id !== newApt.id)]);
    return newApt;
  };

  const cancelAppointment = async (id: string) => {
    await customerService.cancelAppointment(id);
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' as const } : a)));
  };

  const rateAppointment = async (id: string, rating: number, feedback?: string) => {
    const success = await customerService.rateAppointment(id, rating, feedback, user?.id);
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, rating, feedback } : a))
    );
    return success;
  };

  const updateUserProfile = async (updatedData: Partial<User>): Promise<AuthResponse> => {
    if (!user) {
      return { success: false, error: 'No active member session found' };
    }
    try {
      const res = await authService.updateProfile(user.id, updatedData);
      if (res.success && res.user) {
        setUser(res.user);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('storage'));
        }
      }
      return res;
    } catch (err: any) {
      console.error('Failed to sync profile update:', err);
      return {
        success: false,
        error: err?.message || 'Failed to update profile due to connection error',
      };
    }
  };

  const clearActiveToken = () => {
    setActiveToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('salonflow_active_token');
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        activeToken,
        notifications,
        unreadNotifCount,
        selectedHairstyle,
        isLoadingToken,
        appointments,
        setSelectedHairstyle,
        refreshState,
        refreshAppointments,
        advanceDemoQueue,
        resetDemoQueue,
        cancelActiveToken,
        markNotifAsRead,
        markAllNotifsAsRead,
        clearAllNotifications,
        joinLiveQueue,
        addAppointment,
        cancelAppointment,
        rateAppointment,
        updateUserProfile,
        clearActiveToken,
        loginUser,
        registerUser,
        logoutUser,
        requestNotificationPermission: () => pushNotificationService.requestPermission(),
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = (): CustomerContextType => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};
