/**
 * Push Notification & Audio Chime Service for Queue Tracking
 * Integrates Web Notifications API and Web Audio API synthesizer.
 */

export interface PushOptions {
  title: string;
  body: string;
  tag?: string;
  icon?: string;
  soundType?: 'alert' | 'urgent';
  onClick?: () => void;
}

class PushNotificationService {
  private hasRequested: boolean = false;

  /**
   * Check if the browser supports the Notifications API
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Current notification permission state
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Request permission from the user to display native browser notifications
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    try {
      this.hasRequested = true;
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return false;
    }
  }

  /**
   * Play a pleasant synthesized audio chime (C5 -> E5 -> G5)
   */
  playChime(type: 'alert' | 'urgent' = 'alert'): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Resume if audio context is suspended
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      if (type === 'urgent') {
        // Urgent 3-tone chime for CALLED turn
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880.00, now + 0.12); // A5
        osc.frequency.setValueAtTime(1174.66, now + 0.24); // D6
      } else {
        // Welcoming 3-tone chime for 2 numbers away
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.24); // G5
      }

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch (e) {
      // Audio context might need user interaction gesture
      console.warn('Audio chime playback muted or prevented:', e);
    }
  }

  /**
   * Dispatch a native browser push notification accompanied by an audio alert
   */
  async notify(options: PushOptions): Promise<boolean> {
    // 1. Play audio chime alert
    this.playChime(options.soundType || 'alert');

    // 2. Dispatch browser notification if permitted
    if (!this.isSupported()) return false;

    if (Notification.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return false;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        badge: '/favicon.ico',
        requireInteraction: options.soundType === 'urgent',
      });

      notification.onclick = () => {
        window.focus();
        if (options.onClick) {
          options.onClick();
        }
        notification.close();
      };

      return true;
    } catch (e) {
      console.warn('Failed to display browser push notification:', e);
      return false;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
