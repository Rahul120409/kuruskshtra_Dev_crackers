import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { getApiBaseUrl } from './apiConfig';

export interface LiveQueueBoardData {
  salonId: string;
  salonName?: string;
  currentServingTokenNumber?: number | null;
  currentServingCustomer?: string | null;
  lastCalledTokenNumber?: number | null;
  nextAvailableTokenNumber?: number;
  totalWaiting: number;
  activeStylistsCount: number;
  activeQueue: any[];
}

function getWebSocketUrl(): string {
  if (typeof window === 'undefined') return '';
  
  const hostname = window.location.hostname || 'localhost';
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

  // 1. If running locally on localhost or 127.0.0.1, connect directly to localhost:8081
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${proto}//localhost:8081/ws-queue`;
  }
  
  // 2. If configured via NEXT_PUBLIC_API_BASE_URL (e.g. http://192.168.137.218:8081)
  const httpBase = getApiBaseUrl();
  if (httpBase) {
    if (httpBase.startsWith('https://')) {
      return httpBase.replace('https://', 'wss://') + '/ws-queue';
    } else if (httpBase.startsWith('http://')) {
      return httpBase.replace('http://', 'ws://') + '/ws-queue';
    }
  }
  
  // 3. Fallback to current browser hostname on port 8081
  return `${proto}//${hostname}:8081/ws-queue`;
}

class QueueWebSocketManager {
  private client: Client | null = null;
  private isConnecting: boolean = false;
  private subscriptions: Map<string, Set<(data: LiveQueueBoardData) => void>> = new Map();
  private activeStompSubs: Map<string, StompSubscription> = new Map();
  private statusListeners: Set<(connected: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initClient();
    }
  }

  public isConnected(): boolean {
    return Boolean(this.client && this.client.connected);
  }

  public getBrokerUrl(): string {
    return getWebSocketUrl();
  }

  public onStatusChange(callback: (connected: boolean) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.isConnected());
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private notifyStatus(connected: boolean) {
    this.statusListeners.forEach(cb => {
      try { cb(connected); } catch {}
    });
  }

  public reconnect() {
    if (this.client) {
      try {
        this.client.deactivate();
        setTimeout(() => this.initClient(), 300);
      } catch (e) {
        console.warn('Reconnecting WebSocket client:', e);
      }
    }
  }

  private initClient() {
    const brokerURL = getWebSocketUrl();
    if (!brokerURL) return;

    console.log('🔌 [WebSocket STOMP] Initializing STOMP client to:', brokerURL);

    this.client = new Client({
      brokerURL,
      reconnectDelay: 2000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('📡 [STOMP DEBUG]', str);
      },
      onWebSocketError: (event) => {
        console.error('❌ [WebSocket STOMP] WebSocket transport error:', event);
      },
      onConnect: () => {
        console.log('✅ [WebSocket STOMP] Connected successfully to queue broker:', brokerURL);
        this.isConnecting = false;
        this.notifyStatus(true);
        // IMPORTANT: Clear stale subscription maps so new session sends fresh SUBSCRIBE frames
        this.activeStompSubs.clear();
        this.subscriptions.forEach((callbacks, topic) => {
          this.subscribeToStompTopic(topic);
        });
      },
      onDisconnect: () => {
        console.log('🔌 [WebSocket STOMP] Disconnected');
        this.activeStompSubs.clear();
        this.notifyStatus(false);
      },
      onStompError: (frame) => {
        console.warn('⚠️ [WebSocket STOMP] Broker error:', frame.headers['message'], frame.body);
      },
      onWebSocketClose: () => {
        console.log('🔌 [WebSocket STOMP] WebSocket closed. Ready for reconnect.');
        this.activeStompSubs.clear();
        this.notifyStatus(false);
      },
    });

    try {
      this.client.activate();
    } catch (e) {
      console.warn('Failed to activate STOMP client:', e);
    }
  }

  private subscribeToStompTopic(topic: string) {
    if (!this.client || !this.client.connected) return;
    if (this.activeStompSubs.has(topic)) return;

    try {
      console.log('📡 [WebSocket STOMP] Subscribing to topic:', topic);
      const sub = this.client.subscribe(topic, (message: IMessage) => {
        try {
          const parsed = JSON.parse(message.body) as LiveQueueBoardData;
          console.log('⚡ [WebSocket STOMP] Real-time queue update received for:', topic, {
            salonId: parsed.salonId,
            nextAvailable: parsed.nextAvailableTokenNumber,
            currentServing: parsed.currentServingTokenNumber,
            lastCalled: parsed.lastCalledTokenNumber,
            totalWaiting: parsed.totalWaiting
          });
          const callbacks = this.subscriptions.get(topic);
          if (callbacks) {
            callbacks.forEach((cb) => {
              try {
                cb(parsed);
              } catch (err) {
                console.error('Error in queue socket callback:', err);
              }
            });
          }
        } catch (e) {
          console.warn('Could not parse STOMP message body:', message.body, e);
        }
      });
      this.activeStompSubs.set(topic, sub);
    } catch (err) {
      console.warn('Failed to subscribe to STOMP topic:', topic, err);
    }
  }

  public subscribe(topic: string, callback: (data: LiveQueueBoardData) => void): () => void {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }
    this.subscriptions.get(topic)!.add(callback);

    if (!this.client) {
      this.initClient();
    } else if (this.client.connected) {
      this.subscribeToStompTopic(topic);
    } else if (!this.client.active) {
      this.client.activate();
    }

    return () => {
      const set = this.subscriptions.get(topic);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.subscriptions.delete(topic);
          const activeSub = this.activeStompSubs.get(topic);
          if (activeSub) {
            try {
              activeSub.unsubscribe();
            } catch {}
            this.activeStompSubs.delete(topic);
          }
        }
      }
    };
  }

  public subscribeToSalon(salonId: string, callback: (data: LiveQueueBoardData) => void): () => void {
    if (!salonId) return () => {};
    const topic = `/topic/salon/${salonId}/queue`;
    return this.subscribe(topic, callback);
  }

  public subscribeToGlobal(callback: (data: LiveQueueBoardData) => void): () => void {
    return this.subscribe('/topic/queue/live', callback);
  }
}

export const queueWebSocket = new QueueWebSocketManager();
