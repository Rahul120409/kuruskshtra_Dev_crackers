'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, QueueToken, Notification, Hairstyle, Appointment } from '../types';
import { customerService } from '../services/customerService';
import { authService, AuthResponse } from '../services/authService';
import { queueWebSocket } from '../services/websocketService';

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
  joinLiveQueue: (serviceId: string, staffId?: string, hairstyleId?: string, salonId?: string) => Promise<QueueToken>;
  addAppointment: (data: Partial<Appointment>) => Promise<Appointment>;
  cancelAppointment: (id: string) => Promise<void>;
  markAppointmentLate: (id: string) => Promise<void>;
  rateAppointment: (id: string, rating: number, feedback?: string) => Promise<boolean>;
  updateUserProfile: (updatedData: Partial<User>) => Promise<void>;
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
          setActiveToken((prev) =>
            prev
              ? {
                  ...prev,
                  position: match.position ?? prev.position,
                  status: match.status ?? prev.status,
                  estimatedWait: match.estimatedWait ?? match.estimatedWaitMinutes ?? prev.estimatedWait,
                }
              : null
          );
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
    await refreshState();
  };

  const resetDemoQueue = async () => {
    const token = await customerService.resetDemoQueue();
    setActiveToken(token);
    await refreshState();
  };

  const cancelActiveToken = async () => {
    if (!activeToken) return;
    await customerService.cancelToken(activeToken.tokenId);
    await refreshState();
  };

  const markNotifAsRead = async (id: string) => {
    await customerService.markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const joinLiveQueue = async (serviceId: string, staffId?: string, hairstyleId?: string, salonId?: string) => {
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

  const markAppointmentLate = async (id: string) => {
    const updated = await customerService.markAppointmentLate(id);
    const nowIso = new Date().toISOString();
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: 'LATE' as const, lateTimestamp: updated?.lateTimestamp || nowIso }
          : a
      )
    );
  };

  const rateAppointment = async (id: string, rating: number, feedback?: string) => {
    const success = await customerService.rateAppointment(id, rating, feedback, user?.id);
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, rating, feedback } : a))
    );
    return success;
  };

  const updateUserProfile = async (updatedData: Partial<User>) => {
    if (!user) return;
    const updated: User = { ...user, ...updatedData };
    setUser(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('salonflow_user', JSON.stringify(updated));
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
        joinLiveQueue,
        addAppointment,
        cancelAppointment,
        markAppointmentLate,
        rateAppointment,
        updateUserProfile,
        clearActiveToken,
        loginUser,
        registerUser,
        logoutUser,
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
