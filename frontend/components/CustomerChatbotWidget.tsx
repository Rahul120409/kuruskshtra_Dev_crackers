'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Clock,
  Calendar,
  Scissors,
  MapPin,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronRight,
  ExternalLink,
  Bot,
  User,
  ArrowRight,
  CheckCircle2,
  Navigation,
  Phone,
  CreditCard,
  Store,
  Smartphone,
  Banknote,
  ShieldCheck,
  QrCode,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { 
  chatbotService, 
  ChatMessage, 
  ChatQuickReply, 
  ChatCard, 
  ChatbotState, 
  MAIN_MENU_REPLIES 
} from '../services/chatbotService';
import { LocationData, DEFAULT_USER_LOCATION } from '../services/locationService';
import { Salon } from '../types';
import { useCustomer } from '../context/CustomerContext';
import { customerService } from '../services/customerService';

interface CustomerChatbotWidgetProps {
  userLocation?: LocationData;
  onOpenBookingModal?: (salon?: Salon) => void;
}

export function CustomerChatbotWidget({ 
  userLocation = DEFAULT_USER_LOCATION,
  onOpenBookingModal 
}: CustomerChatbotWidgetProps) {
  const router = useRouter();
  const { user, addAppointment, refreshAppointments } = useCustomer();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [hasUnread, setHasUnread] = useState<boolean>(true);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [chatbotState, setChatbotState] = useState<ChatbotState>({
    currentFlow: 'MENU',
    quizAnswers: {}
  });

  // Payment Modal Window State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentDraft, setPaymentDraft] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'COUNTER' | 'UPI' | 'CARD'>('COUNTER');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync user location to service
  useEffect(() => {
    if (userLocation) {
      chatbotService.setUserLocation(userLocation);
    }
  }, [userLocation]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcome = chatbotService.getWelcomeMessage();
      setMessages([welcome]);
      // Trigger live network fetch from backend /api/chatbot
      fetch('/api/chatbot')
        .then(res => res.json())
        .then(data => {
          if (data && data.message) {
            setMessages([data.message]);
          }
        })
        .catch(err => console.warn('Chatbot live welcome fetch:', err));
    }
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleOpenToggle = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  const handleResetChat = () => {
    const welcome = chatbotService.getWelcomeMessage();
    const welcomeWithReset: ChatMessage = {
      ...welcome,
      id: `welcome_${Date.now()}`,
      quickReplies: [
        { id: 'opt_nearby', label: '📍 Nearby Salons (Pincode)', action: 'FLOW_NEARBY' },
        { id: 'opt_wait', label: '⏱️ Live Wait Times & Queue', action: 'FLOW_WAIT_TIMES' },
        { id: 'opt_book', label: '📅 Book an Appointment', action: 'FLOW_NEARBY' },
        { id: 'opt_reset', label: '🔄 Reset Chat', action: 'RESET_CHAT' },
      ],
    };
    setMessages([welcomeWithReset]);
    setChatbotState({ currentFlow: 'MENU', quizAnswers: {} });
    setPaymentDraft(null);
    setIsPaymentModalOpen(false);
    setPaymentSuccessData(null);
    setIsProcessingPayment(false);

    fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'RESET_CHAT', payload: {}, state: {} }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.message) {
          setMessages([data.message]);
        }
      })
      .catch((err) => console.warn('Chatbot live reset fetch:', err));
  };

  const handleCompletePayment = async () => {
    if (!paymentDraft) return;
    setIsProcessingPayment(true);

    // Simulate payment gateway delay (1.2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const txnId = 'TXN_' + Math.floor(1000000000 + Math.random() * 9000000000);
    const methodName =
      selectedPaymentMethod === 'COUNTER'
        ? 'Salon Counter'
        : selectedPaymentMethod === 'UPI'
        ? 'UPI Payment'
        : 'Credit Card';

    const paymentStatus: 'PENDING_AT_COUNTER' | 'PAID' = selectedPaymentMethod === 'COUNTER' ? 'PENDING_AT_COUNTER' : 'PAID';

    // 1. FREQUENT QUEUE API: Officially join queue & book token ONLY AFTER payment
    let officiallyBookedToken = Number(paymentDraft.estimatedTokenNumber || paymentDraft.tokenNumber || 37);
    try {
      const joinRes = await fetch('/api/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salonId: paymentDraft.salonId || '889f71a0-9bb5-45e8-b2dc-344cfbb96472',
          customerName: user?.name || paymentDraft.customerName || 'Rahul Sharma',
          customerPhone: user?.phone || paymentDraft.customerPhone || '9876543210',
          userId: user?.id,
          serviceId: paymentDraft.serviceId,
          serviceName: paymentDraft.serviceName || 'lower fade',
          serviceDurationMinutes: Number(paymentDraft.serviceDuration) || 45,
          staffId: paymentDraft.staffId,
          source: 'ONLINE',
        }),
      });
      if (joinRes.ok) {
        const queueResult = await joinRes.json();
        if (queueResult?.data?.tokenNumber) {
          officiallyBookedToken = queueResult.data.tokenNumber;
        }
      }
    } catch (qErr) {
      console.warn('Frequent Queue Join API notice:', qErr);
    }

    // 2. Persist appointment with officially booked token
    const appointmentPayload = {
      salonId: paymentDraft.salonId || 'salon-pune-01',
      salonName: paymentDraft.salonName || 'Nexuss',
      salonAddress: paymentDraft.salonAddress || 'High Street, Baner, Pune',
      salonArea: paymentDraft.salonArea || 'High Street',
      serviceId: paymentDraft.serviceId || 'srv-02',
      serviceName: paymentDraft.serviceName || 'lower fade',
      servicePrice: Number(paymentDraft.servicePrice) || 650,
      serviceDuration: Number(paymentDraft.serviceDuration) || 45,
      staffId: paymentDraft.staffId || 'stf-01',
      staffName: paymentDraft.staffName || 'rohini',
      appointmentDate: paymentDraft.date || new Date().toISOString().split('T')[0],
      appointmentTime: paymentDraft.timeSlot || '04:30 PM',
      tokenNumber: officiallyBookedToken,
      paymentMethod: methodName,
      paymentStatus: paymentStatus,
      status: 'CONFIRMED' as const,
      bookingType: 'WALK_IN' as const,
      notes: `Booked via SalonFlow Concierge Chatbot • Token #${officiallyBookedToken} • Txn ID: ${txnId}`,
    };

    try {
      if (addAppointment) {
        await addAppointment(appointmentPayload);
      }
      await customerService.addAppointment(appointmentPayload);
      if (refreshAppointments) {
        await refreshAppointments();
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('appointmentAdded', { detail: appointmentPayload }));
      }
    } catch (err) {
      console.warn('Failed saving appointment via context, using customerService fallback:', err);
      await customerService.addAppointment(appointmentPayload);
    }

    setPaymentSuccessData({
      txnId,
      methodName,
      paymentStatus,
      tokenNumber: officiallyBookedToken,
      appointment: appointmentPayload,
    });
    setIsProcessingPayment(false);

    // Send backend BOOK_CONFIRM update so the chatbot displays the confirmation bubble
    try {
      const confirmRes = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BOOK_CONFIRM',
          payload: {
            ...paymentDraft,
            tokenNumber: officiallyBookedToken,
            paymentMethod: methodName,
            paymentStatus: paymentStatus,
            transactionId: txnId,
          },
          state: chatbotState,
        }),
      });
      if (confirmRes.ok) {
        const json = await confirmRes.json();
        if (json && json.message) {
          setMessages((prev) => [...prev, json.message]);
          if (json.newState) setChatbotState(json.newState);
        }
      }
    } catch (e) {
      console.warn('Backend confirmation message notice:', e);
    }
  };

  const handleQuickReply = async (reply: ChatQuickReply) => {
    // 1. Append user click as user bubble
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: reply.label,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // 2. Intercept direct navigation, reset, and modal actions
    if (reply.action === 'RESET_CHAT') {
      setIsTyping(false);
      handleResetChat();
      return;
    }

    if (reply.action === 'NAV_AI_STUDIO') {
      setTimeout(() => {
        setIsTyping(false);
        router.push('/ai-recommend');
      }, 500);
      return;
    }

    if (reply.action === 'NAV_APPOINTMENTS') {
      setTimeout(() => {
        setIsTyping(false);
        router.push('/appointments');
      }, 300);
      return;
    }

    if (reply.action === 'TRIGGER_PAYMENT_MODAL' || reply.action === 'OPEN_PAYMENT_MODAL') {
      setTimeout(() => {
        setIsTyping(false);
        const draft = reply.payload || chatbotState.bookingDraft;
        setPaymentDraft(draft);
        setSelectedPaymentMethod('COUNTER');
        setPaymentSuccessData(null);
        setIsProcessingPayment(false);
        setIsPaymentModalOpen(true);
      }, 350);
      return;
    }

    if (reply.action === 'TRIGGER_BOOKING_MODAL') {
      setTimeout(() => {
        setIsTyping(false);
        if (onOpenBookingModal) {
          onOpenBookingModal();
        } else {
          router.push('/booking');
        }
      }, 400);
      return;
    }

    // 3. Process action in service with natural simulated latency
    setTimeout(async () => {
      const { message, newState } = await chatbotService.handleAction(
        reply.action, 
        reply.payload, 
        chatbotState
      );
      setMessages(prev => [...prev, message]);
      setChatbotState(newState);
      setIsTyping(false);
    }, 450);
  };

  const handleSendText = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    // 1. Append user message
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // 2. Service process
    setTimeout(async () => {
      const { message, newState } = await chatbotService.handleUserText(text, chatbotState);
      setMessages(prev => [...prev, message]);
      setChatbotState(newState);
      setIsTyping(false);
    }, 500);
  };

  const handleCardAction = (action: string, payload?: any, url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (action === 'NAV_AI_STUDIO') {
      router.push('/ai-recommend');
      return;
    }

    if (action === 'NAV_APPOINTMENTS') {
      router.push('/appointments');
      return;
    }

    if (action === 'TRIGGER_PAYMENT_MODAL' || action === 'OPEN_PAYMENT_MODAL') {
      const draft = payload || chatbotState.bookingDraft;
      setPaymentDraft(draft);
      setSelectedPaymentMethod('COUNTER');
      setPaymentSuccessData(null);
      setIsProcessingPayment(false);
      setIsPaymentModalOpen(true);
      return;
    }

    if (action === 'OPEN_BOOKING_SALON') {
      handleQuickReply({
        id: `card_act_sal_${Date.now()}`,
        label: '📅 Book this Salon',
        action: 'BOOK_WITH_SALON',
        payload: payload
      });
      return;
    }

    if (action === 'OPEN_BOOKING_STYLE') {
      handleQuickReply({
        id: `card_act_sty_${Date.now()}`,
        label: '📅 Book this Cut',
        action: 'BOOK_WITH_STYLE',
        payload: payload
      });
      return;
    }

    // Otherwise pass to action handler
    handleQuickReply({
      id: `card_act_${Date.now()}`,
      label: action,
      action: action,
      payload: payload
    });
  };

  const renderMessageContent = (text: string, isUser: boolean) => {
    if (isUser) {
      return <span>{text}</span>;
    }

    const isBookingPass = text.includes('Haircut / Service') && (text.includes('Pass & Payment') || text.includes('Date & Time Slot'));

    if (isBookingPass) {
      const lines = text.split('\n');
      return (
        <div className="space-y-1 font-sans text-xs sm:text-sm">
          {lines.map((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) {
              return <div key={idx} className="h-2" />;
            }

            const isSectionHeader = [
              'HAIRCUT / SERVICE',
              'Haircut / Service',
              'HAIR STYLIST',
              'Hair Stylist',
              'DATE & TIME SLOT',
              'Date & Time Slot',
              'PASS & PAYMENT',
              'Pass & Payment'
            ].includes(trimmed);

            if (isSectionHeader) {
              return (
                <div
                  key={idx}
                  className="text-amber-600 dark:text-amber-400 font-bold text-[11px] uppercase tracking-wider pt-2 border-t border-slate-200 dark:border-slate-800/80 first:border-t-0 first:pt-0"
                >
                  {trimmed}
                </div>
              );
            }

            if (trimmed.startsWith('Token Status:')) {
              return (
                <div key={idx} className="mt-1 flex items-center gap-2">
                  <span className="inline-block bg-amber-500/15 border border-amber-500/40 text-amber-700 dark:text-amber-300 font-mono font-bold px-2.5 py-1 rounded-lg text-xs tracking-wide">
                    {trimmed}
                  </span>
                </div>
              );
            }

            if (trimmed.startsWith('Official Token:') || trimmed.startsWith('Your Token:') || trimmed.startsWith('Token #')) {
              const isOfficial = trimmed.startsWith('Official Token:');
              return (
                <div key={idx} className="mt-1 flex items-center gap-2">
                  <span className="inline-block bg-amber-500/15 border border-amber-500/50 text-amber-600 dark:text-amber-400 font-mono font-black px-3 py-1 rounded-lg text-sm sm:text-base tracking-wide shadow-xs">
                    {trimmed}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {isOfficial ? '✓ Active Live Pass' : 'Verified Active Pass'}
                  </span>
                </div>
              );
            }

            if (idx === 0) {
              return (
                <div key={idx} className="font-black text-slate-900 dark:text-white text-sm sm:text-base tracking-tight flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>{trimmed}</span>
                </div>
              );
            }

            if (trimmed === '•') {
              return (
                <div key={idx} className="text-slate-400 dark:text-slate-500 text-xs">
                  •
                </div>
              );
            }

            return (
              <div key={idx} className="text-slate-700 dark:text-slate-200">
                {trimmed}
              </div>
            );
          })}
        </div>
      );
    }

    // Standard text formatting: Render markdown **bold** nicely without ugly asterisks
    return (
      <div className="whitespace-pre-line text-slate-800 dark:text-slate-200">
        {text.split('\n').map((line, lineIdx) => {
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <React.Fragment key={lineIdx}>
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              })}
              {lineIdx < text.split('\n').length - 1 && '\n'}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`fixed z-50 font-sans flex flex-col items-end transition-all duration-300 ${
      isOpen ? 'bottom-3 right-3 sm:bottom-6 sm:right-6' : 'bottom-6 right-6'
    }`}>
      
      {/* 1. EXPANDABLE CHATBOT WINDOW (Covers at least half the window: 52vw width, 86vh height) */}
      {isOpen && (
        <div className={`mb-3 rounded-2xl bg-white/95 dark:bg-[#11141e]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] text-slate-900 dark:text-white flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 transition-all ${
          isMaximized 
            ? 'w-[calc(100vw-1.5rem)] md:w-[85vw] lg:w-[80vw] h-[88vh]' 
            : 'w-[calc(100vw-1.5rem)] md:w-[52vw] lg:w-[52vw] h-[85vh] max-h-[88vh]'
        }`}>
          
          {/* Header */}
          <div className="bg-slate-50/90 dark:bg-[#0c0e16]/95 border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 text-white font-black flex items-center justify-center shadow-md shadow-amber-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-50 dark:border-[#0c0e16]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">SalonFlow Concierge</span>
                  <span className="text-[9px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">AI</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Online
                  </span>
                  <span>•</span>
                  <span>Live Wait Times &amp; Styles</span>
                </div>
              </div>
            </div>

            {/* Actions: Reset, Maximize/Restore & Close */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleResetChat}
                className="px-2 py-1 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer flex items-center gap-1 text-[10px] sm:text-[11px] font-bold"
                title="Reset conversation"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Chat</span>
              </button>
              <button
                onClick={() => setIsMaximized(prev => !prev)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer hidden sm:inline-flex"
                title={isMaximized ? "Restore half-screen size" : "Expand window"}
              >
                {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleOpenToggle}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Close chatbot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs bg-slate-50/40 dark:bg-transparent">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Sender Tag & Timestamp */}
                <div className="flex items-center gap-1 text-[9px] text-slate-400 dark:text-slate-500 mb-1 px-1">
                  {msg.sender === 'bot' ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold">AI Concierge</span>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400 font-bold">You</span>
                  )}
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[92%] leading-relaxed text-xs sm:text-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white font-semibold shadow-md shadow-amber-500/15 rounded-br-none'
                      : 'bg-white dark:bg-[#151928] text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800/90 shadow-sm rounded-bl-none'
                  }`}
                >
                  {renderMessageContent(msg.text, msg.sender === 'user')}
                </div>

                {/* Optional Cards (Salons, Wait Times, Hairstyles in 2-column grid for wide half-screen) */}
                {msg.cards && msg.cards.length > 0 && (
                  <div className="w-full mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {msg.cards.map((card) => (
                      <div
                        key={card.id}
                        className="bg-white dark:bg-[#0c0e16] border border-slate-200 dark:border-slate-800/90 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-amber-500/50 dark:hover:border-amber-500/40 transition-all space-y-2.5"
                      >
                        {/* Title & Badge (Text-Only Header) */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
                              {card.type === 'wait_time' && <Clock className="w-3.5 h-3.5 text-amber-500" />}
                              {card.type === 'salon' && <MapPin className="w-3.5 h-3.5 text-emerald-500" />}
                              {card.type === 'hairstyle' && <Scissors className="w-3.5 h-3.5 text-amber-500" />}
                              <span>{card.title}</span>
                            </div>
                            {card.subtitle && (
                              <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{card.subtitle}</div>
                            )}
                          </div>

                          {card.badge && (
                            <span
                              className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded shrink-0 ${
                                card.badge.variant === 'success'
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                  : card.badge.variant === 'gold'
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                  : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'
                              }`}
                            >
                              {card.badge.text}
                            </span>
                          )}
                        </div>

                        {/* Details Grid */}
                        {card.details && card.details.length > 0 && (
                          <div className="grid grid-cols-1 gap-1 text-[11px] bg-slate-50 dark:bg-[#06080e] p-2.5 rounded-lg border border-slate-200/70 dark:border-slate-800/60">
                            {card.details.map((d, i) => {
                              const isToken = d.label.toLowerCase().includes('token');
                              return (
                                <div
                                  key={i}
                                  className={`flex items-center justify-between ${
                                    isToken
                                      ? 'bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30 my-0.5'
                                      : 'text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  <span className={isToken ? 'text-amber-600 dark:text-amber-400 font-bold uppercase text-[9px] tracking-wider' : 'text-slate-500 dark:text-slate-400 font-medium'}>
                                    {d.label}:
                                  </span>
                                  <span className={`font-semibold text-right ${isToken ? 'text-amber-600 dark:text-amber-400 font-mono font-black tracking-wide text-xs sm:text-sm' : 'text-slate-900 dark:text-white'}`}>
                                    {d.value}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Actions */}
                        {card.actions && card.actions.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-1">
                            {card.actions.map((act, i) => (
                              <button
                                key={i}
                                onClick={() => handleCardAction(act.action, act.payload, act.url)}
                                className={`flex-1 py-2 px-2.5 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all ${
                                  act.primary
                                    ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white shadow-sm shadow-amber-500/20 active:scale-[0.99]'
                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                <span>{act.label}</span>
                                {act.url ? <ExternalLink className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Reply Chips attached to message */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-full">
                    {msg.quickReplies.map((qr) => (
                      <button
                        key={qr.id}
                        onClick={() => handleQuickReply(qr)}
                        className="py-1.5 px-3 rounded-full bg-slate-100 hover:bg-amber-500/15 dark:bg-[#151928] dark:hover:bg-amber-500/20 text-slate-700 hover:text-amber-700 dark:text-slate-200 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700/80 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs hover:border-amber-500/40 active:scale-95"
                      >
                        <span>{qr.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white dark:bg-[#151928] text-slate-600 dark:text-slate-400 px-3 py-2 rounded-xl w-fit border border-slate-200 dark:border-slate-800 text-[11px] shadow-xs">
                <Bot className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                <span>Concierge is searching real-time data...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Menu Footer Bar */}
          <div className="px-3 py-2 bg-slate-100/90 dark:bg-[#0c0e16] border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px] text-slate-500 dark:text-slate-400 shrink-0 scrollbar-none">
            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 text-[9px]">MENU:</span>
            <button
              onClick={handleResetChat}
              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold shrink-0 cursor-pointer shadow-xs transition-colors flex items-center gap-1"
              title="Reset conversation"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Chat</span>
            </button>
            <button
              onClick={() => handleQuickReply({ id: 'qm_wait', label: '⏱️ Wait Times', action: 'FLOW_WAIT_TIMES' })}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              ⏱️ Wait Times
            </button>
            <button
              onClick={() => handleQuickReply({ id: 'qm_book', label: '📅 Booking', action: 'FLOW_BOOKING' })}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              📅 Book
            </button>
            <button
              onClick={() => handleQuickReply({ id: 'qm_quiz', label: '✂️ Style Quiz', action: 'FLOW_STYLE_QUIZ' })}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              ✂️ Style Quiz
            </button>
            <button
              onClick={() => handleQuickReply({ id: 'qm_salons', label: '📍 Nearby', action: 'FLOW_NEARBY' })}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold shrink-0 cursor-pointer shadow-xs transition-colors"
            >
              📍 Nearby
            </button>
          </div>

          {/* Input Box with Mobile Auto-Zoom Protection (strictly text-base sm:text-sm) */}
          <form
            onSubmit={handleSendText}
            className="p-3 bg-white dark:bg-[#0c0e16] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about wait times, styles, salons..."
              className="flex-1 bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 disabled:opacity-40 text-white font-bold flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 shadow-md shadow-amber-500/25"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* 2. FLOATING LAUNCHER BUTTON */}
      <button
        onClick={handleOpenToggle}
        className={`group relative flex items-center gap-2.5 px-5 py-3.5 rounded-full font-bold text-xs shadow-2xl transition-all duration-300 cursor-pointer min-h-[48px] ${
          isOpen
            ? 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white border border-slate-700 shadow-slate-900/40'
            : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-[0.98]'
        }`}
        title="Open AI Concierge Chatbot"
      >
        {/* Animated Luxury Glow Ring when closed */}
        {!isOpen && (
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 opacity-75 blur-md animate-pulse -z-10" />
        )}

        {/* Icon */}
        <div className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="w-5 h-5 text-slate-200" />
          ) : (
            <MessageCircle className="w-5 h-5 text-white" />
          )}

          {/* Unread indicator */}
          {!isOpen && hasUnread && (
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-rose-500 border-2 border-white dark:border-slate-950 animate-ping" />
          )}
        </div>

        {/* Text Label */}
        <span className="uppercase tracking-wider font-extrabold text-xs">
          {isOpen ? 'Close Concierge' : 'Ask AI Concierge'}
        </span>

        {/* Small sparkle */}
        {!isOpen && (
          <Sparkles className="w-4 h-4 text-amber-200 animate-bounce ml-0.5" />
        )}
      </button>

      {/* 3. PAYMENT MODAL WINDOW */}
      {isPaymentModalOpen && paymentDraft && (
        <div className="fixed inset-0 z-[9999] bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#11141e] border border-slate-200 dark:border-amber-500/40 rounded-3xl w-full max-w-md shadow-2xl dark:shadow-amber-500/10 p-6 sm:p-7 relative overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 text-slate-900 dark:text-white">
            
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-white font-black shadow-lg shadow-amber-500/25">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {paymentSuccessData ? 'Booking Confirmed' : 'Select Payment Method'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {paymentSuccessData ? 'Your pass is active and registered' : 'SalonFlow Secure Payment Gateway'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setPaymentSuccessData(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs relative z-10">
              {paymentSuccessData ? (
                /* SUCCESS VIEW */
                <div className="py-4 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/20 animate-bounce">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">Payment Successful!</h4>
                    <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                      {paymentSuccessData.methodName === 'Salon Counter' ? 'Payment scheduled at salon counter upon arrival' : 'Digital Payment Verified & Completed'}
                    </p>
                  </div>

                  {/* Booking Receipt Card */}
                  <div className="bg-slate-50 dark:bg-[#070a12] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-left space-y-2.5 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/80">
                      <span className="text-slate-500 dark:text-slate-400">Transaction ID</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-bold text-[11px]">{paymentSuccessData.txnId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Salon</span>
                      <span className="text-slate-900 dark:text-white font-bold">{paymentDraft.salonName} ({paymentDraft.salonArea || 'Pune'})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Service</span>
                      <span className="text-slate-900 dark:text-white font-bold">{paymentDraft.serviceName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Stylist</span>
                      <span className="text-slate-900 dark:text-white font-bold">{paymentDraft.staffName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Official Token</span>
                      <span className="text-amber-600 dark:text-amber-400 font-mono font-black text-sm">Token #{paymentSuccessData.tokenNumber || paymentDraft.tokenNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Queue Status</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Officially Booked & Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Payment Mode</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{paymentSuccessData.methodName}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/80">
                      <span className="text-slate-500 dark:text-slate-400">Total Amount</span>
                      <span className="text-slate-900 dark:text-white font-mono font-black text-sm">₹{paymentDraft.servicePrice || 650}</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    🎉 Your appointment and official token have been booked and are now visible in the <strong>Appointments</strong> tab.
                  </div>
                </div>
              ) : (
                /* PAYMENT SELECTION VIEW */
                <>
                  {/* Summary Box */}
                  <div className="bg-slate-50 dark:bg-[#070a12] border border-slate-200 dark:border-amber-500/25 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-mono font-black text-amber-600 dark:text-amber-400 tracking-wider">Appointment Summary</div>
                      <div className="text-slate-900 dark:text-white font-bold text-sm mt-0.5">{paymentDraft.salonName} • {paymentDraft.serviceName}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                        Stylist: <span className="text-slate-800 dark:text-slate-200 font-semibold">{paymentDraft.staffName}</span> • Token: <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">⏳ Issued upon Payment</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Total Due</div>
                      <div className="text-xl font-mono font-black text-amber-600 dark:text-amber-400">₹{paymentDraft.servicePrice || 650}</div>
                    </div>
                  </div>

                  {/* Payment Note about token locking */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                    ℹ️ <strong>Payment Required to Lock Token:</strong> Your official live queue token number will be generated and confirmed once you select a payment method below.
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider px-1">
                      Choose Payment Method:
                    </div>

                    {/* Option 1: Salon Counter */}
                    <div
                      onClick={() => setSelectedPaymentMethod('COUNTER')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        selectedPaymentMethod === 'COUNTER'
                          ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                          : 'bg-white dark:bg-[#070a12] border-slate-200 dark:border-slate-800 hover:border-amber-500/50'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${
                        selectedPaymentMethod === 'COUNTER' ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white font-black shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        <Store className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Salon Counter</span>
                          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                            Pay at Venue
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Pay in Cash, Card, or UPI directly at the salon front desk upon arrival.
                        </p>
                      </div>
                    </div>

                    {/* Option 2: UPI Payment */}
                    <div
                      onClick={() => setSelectedPaymentMethod('UPI')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                        selectedPaymentMethod === 'UPI'
                          ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                          : 'bg-white dark:bg-[#070a12] border-slate-200 dark:border-slate-800 hover:border-amber-500/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${
                          selectedPaymentMethod === 'UPI' ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white font-black shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">UPI Payment (GPay, PhonePe, Paytm)</span>
                            <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                              Instant
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            Pay instantly using your favorite UPI app or UPI ID.
                          </p>
                        </div>
                      </div>

                      {selectedPaymentMethod === 'UPI' && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                          <div className="flex items-center justify-between text-xs bg-slate-100 dark:bg-[#0c1220] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400 font-mono">UPI ID:</span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">salonflow@okhdfcbank</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px] border border-slate-200 dark:border-slate-700 shadow-xs">GPay</span>
                            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px] border border-slate-200 dark:border-slate-700 shadow-xs">PhonePe</span>
                            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px] border border-slate-200 dark:border-slate-700 shadow-xs">Paytm</span>
                            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[11px] border border-slate-200 dark:border-slate-700 shadow-xs">BHIM</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Option 3: Credit Card */}
                    <div
                      onClick={() => setSelectedPaymentMethod('CARD')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                        selectedPaymentMethod === 'CARD'
                          ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                          : 'bg-white dark:bg-[#070a12] border-slate-200 dark:border-slate-800 hover:border-amber-500/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${
                          selectedPaymentMethod === 'CARD' ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white font-black shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Credit / Debit Card</span>
                            <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30">
                              Secure
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            Visa, MasterCard, RuPay, and American Express.
                          </p>
                        </div>
                      </div>

                      {selectedPaymentMethod === 'CARD' && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                          <div className="bg-slate-100 dark:bg-[#0c1220] p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                            <div className="flex justify-between text-slate-700 dark:text-slate-300 font-mono">
                              <span>Card:</span>
                              <span className="text-slate-900 dark:text-white font-bold tracking-widest">•••• •••• •••• 4242</span>
                            </div>
                            <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                              <span>Cardholder: Rahul Sharma</span>
                              <span>Exp: 12/28 • CVV: •••</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2.5 relative z-10">
              {paymentSuccessData ? (
                <>
                  <button
                    onClick={() => {
                      setIsPaymentModalOpen(false);
                      setPaymentSuccessData(null);
                      router.push('/appointments');
                    }}
                    className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.99] transition-all cursor-pointer min-h-[48px]"
                  >
                    <span>📋 View in Appointments Tab</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsPaymentModalOpen(false);
                      setPaymentSuccessData(null);
                    }}
                    className="py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm cursor-pointer transition-colors min-h-[48px]"
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm cursor-pointer transition-colors min-h-[48px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompletePayment}
                    disabled={isProcessingPayment}
                    className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[48px]"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>
                          {selectedPaymentMethod === 'COUNTER'
                            ? `Confirm & Pay at Counter (₹${paymentDraft.servicePrice || 650})`
                            : `Pay ₹${paymentDraft.servicePrice || 650} & Confirm Booking`}
                        </span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
