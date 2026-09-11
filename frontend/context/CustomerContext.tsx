'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, QueueToken, Notification, Hairstyle, Appointment } from '../types';
import { customerService } from '../services/customerService';
import { authService, AuthResponse } from '../services/authService';

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
      const appts = await customerService.getAppointments(user?.id);
      setAppointments(appts);
    } catch (e) {
      console.error('Failed to load appointments:', e);
    }
  };

  const refreshState = async () => {
    try {
      const token = await customerService.getToken('active');
      setActiveToken(token);
      await refreshAppointments();
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
    const interval = setInterval(() => {
      refreshState();
    }, 10000);
    return () => clearInterval(interval);
  }, [user]);

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
    const customerId = user ? user.id : 'usr-guest-' + Date.now();
    const token = await customerService.joinQueue({
      salonId: salonId || 'salon-pune-01',
      serviceId,
      customerId,
      staffId,
      selectedHairstyleId: hairstyleId,
    });
    setActiveToken(token);
    await refreshState();
    return token;
  };

  const addAppointment = async (data: Partial<Appointment>) => {
    const newApt = await customerService.addAppointment({
      ...data,
      customerId: user ? user.id : 'usr-customer-001',
    });
    setAppointments((prev) => [newApt, ...prev]);
    return newApt;
  };

  const cancelAppointment = async (id: string) => {
    await customerService.cancelAppointment(id);
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' as const } : a)));
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
