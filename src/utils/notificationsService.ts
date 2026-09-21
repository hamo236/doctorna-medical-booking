// Notification and Reminder Service for Doctorna (دكتورنا)
// Manages Web Push, Browser Desktop Notifications, Sound chimes, and LocalStorage preferences

export interface NotificationPreferences {
  browserNotificationsEnabled: boolean;
  appointmentReminders24h: boolean;
  appointmentReminders2h: boolean;
  queueAlerts: boolean;
  medicationReminders: boolean;
  soundEnabled: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  browserNotificationsEnabled: false,
  appointmentReminders24h: true,
  appointmentReminders2h: true,
  queueAlerts: true,
  medicationReminders: true,
  soundEnabled: true,
};

const STORAGE_KEY = 'doctorna_notification_preferences';

export const getNotificationPreferences = (): NotificationPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

export const saveNotificationPreferences = (prefs: NotificationPreferences): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save notification preferences', e);
  }
};

export const requestBrowserNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  return false;
};

// Play a pleasant web audio chime for medical alerts
export const playNotificationChime = (): void => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Smooth dual chime
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, now); // A4
    osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch (e) {
    console.warn('Audio chime could not be played:', e);
  }
};

export const triggerLocalNotification = (title: string, body: string, iconUrl?: string): void => {
  const prefs = getNotificationPreferences();
  
  if (prefs.soundEnabled) {
    playNotificationChime();
  }

  if (prefs.browserNotificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: iconUrl || '/favicon.ico',
        dir: 'rtl',
        lang: 'ar',
      });
    } catch (e) {
      console.warn('Browser notification error:', e);
    }
  }
};
