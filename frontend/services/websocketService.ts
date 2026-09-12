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
  const httpBase = getApiBaseUrl();
  
  if (httpBase.startsWith('https://')) {
    return httpBase.replace('https://', 'wss://') + '/ws-queue';
  } else if (httpBase.startsWith('http://')) {
    return httpBase.replace('http://', 'ws://') + '/ws-queue';
  }
  
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.hostname}:8081/ws-queue`;
}

class QueueWebSocketManager {
  private client: Client | null = null;
  private isConnecting: boolean = false;
  private subscriptions: Map<string, Set<(data: LiveQueueBoardData) => void>> = new Map();
  private activeStompSubs: Map<string, StompSubscription> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initClient();
    }
  }

  private initClient() {
    const brokerURL = getWebSocketUrl();
    if (!brokerURL) return;

    this.client = new Client({
      brokerURL,
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg) => {
        if (process.env.NODE_ENV === 'development') {
          // Keep console tidy, comment out in production
        }
      },
      onConnect: () => {
        this.isConnecting = false;
        // Re-subscribe all active topics
        this.subscriptions.forEach((callbacks, topic) => {
          this.subscribeToStompTopic(topic);
        });
      },
      onDisconnect: () => {
        this.activeStompSubs.clear();
      },
      onStompError: (frame) => {
        console.warn('STOMP broker error:', frame.headers['message'], frame.body);
      },
      onWebSocketClose: () => {
        this.activeStompSubs.clear();
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
      const sub = this.client.subscribe(topic, (message: IMessage) => {
        try {
          const parsed = JSON.parse(message.body) as LiveQueueBoardData;
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

    if (this.client && this.client.connected) {
      this.subscribeToStompTopic(topic);
    } else if (this.client && !this.client.active) {
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
