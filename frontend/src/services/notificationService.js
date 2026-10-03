import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

// Synthesize an audible chime using Web Audio API
export const playNotificationSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    const now = ctx.currentTime

    // First tone (D5 ~ 587.33 Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now)
    gain1.gain.setValueAtTime(0.25, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.35)

    // Second tone (A5 ~ 880 Hz)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, now + 0.12)
    gain2.gain.setValueAtTime(0.3, now + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.12)
    osc2.stop(now + 0.55)
  } catch (e) {
    console.warn('AudioContext notification chime warning:', e)
  }
}

// Vibrate device (for mobile browsers / Android)
export const vibrateDevice = (pattern = [150, 80, 150]) => {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  } catch (e) {}
}

/**
 * Request Notification Permissions for Mobile App and Chrome / Browser
 */
export const requestNotificationPermission = async () => {
  let granted = false

  // 1. Mobile App (Capacitor Android Native)
  if (Capacitor.isNativePlatform()) {
    try {
      const perm = await LocalNotifications.requestPermissions()
      granted = perm.display === 'granted'
      return granted
    } catch (err) {
      console.warn('Capacitor LocalNotifications request permission error:', err)
    }
  }

  // 2. Desktop Chrome & Mobile Browsers
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const permission = await Notification.requestPermission()
      granted = permission === 'granted'
    } catch (err) {
      console.warn('Web Notification request permission error:', err)
    }
  }

  return granted
}

/**
 * Check if notifications are currently permitted
 */
export const isNotificationPermissionGranted = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.checkPermissions()
      return status.display === 'granted'
    } catch (e) {
      return false
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission === 'granted'
  }

  return false
}

// In-app listener subscribers (for top heads-up banner)
const inAppListeners = new Set()
export const subscribeInAppNotification = (cb) => {
  inAppListeners.add(cb)
  return () => inAppListeners.delete(cb)
}

/**
 * Pop Notification on Chrome & Mobile App
 * @param {Object} options
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body message
 * @param {string} [options.icon] - Icon URL
 * @param {any} [options.data] - Custom payload data
 * @param {string} [options.tag] - Grouping tag
 * @param {Function} [options.onClick] - Callback when user clicks the notification
 */
export const popNotification = async ({
  title = 'Aparaitech Alert',
  body = '',
  icon = '/favicon.png',
  data = {},
  tag = 'aparaitech-notif',
  onClick = null
}) => {
  // Always trigger sound & vibration
  playNotificationSound()
  vibrateDevice()

  // Always broadcast to in-app heads-up banner
  inAppListeners.forEach(cb => {
    try {
      cb({ title, body, data, onClick, timestamp: Date.now() })
    } catch (e) {}
  })

  // 1. If Native Android (Capacitor App) -> Pop Android status bar & heads-up alert
  if (Capacitor.isNativePlatform()) {
    try {
      const notifId = Math.floor(Math.random() * 2147483647)
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title,
            body,
            schedule: { at: new Date(Date.now() + 100) },
            sound: 'beep.wav',
            iconColor: '#2563eb',
            vibration: true,
            extra: data
          }
        ]
      })
      return true
    } catch (err) {
      console.warn('LocalNotifications.schedule error:', err)
    }
  }

  // 2. If Chrome / Web Browser -> Pop OS/Browser Notification
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        // Try Service Worker registration first for rich notification
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration && registration.showNotification) {
            await registration.showNotification(title, {
              body,
              icon,
              badge: icon,
              vibrate: [200, 100, 200],
              data: { ...data, timestamp: Date.now() },
              tag: tag + '-' + Date.now(),
              renotify: true
            })
            return true
          }
        }

        // Standard Web Notification fallback
        const notif = new Notification(title, {
          body,
          icon,
          badge: icon,
          tag: tag + '-' + Date.now()
        })

        notif.onclick = () => {
          window.focus()
          notif.close()
          if (onClick) onClick()
        }
        return true
      } catch (err) {
        console.warn('new Notification error:', err)
      }
    } else if (Notification.permission === 'default') {
      // Prompt user to enable
      requestNotificationPermission().then(granted => {
        if (granted) {
          popNotification({ title, body, icon, data, tag, onClick })
        }
      })
    }
  }

  return false
}
