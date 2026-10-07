import { useEffect, useRef } from 'react'

/**
 * Universal Real-Time Event Types for HRMS Synchronization
 */
export const SYNC_EVENTS = {
  DATA_ASSIGNED: 'DATA_ASSIGNED',               // Admin assigned leads to employees
  LEAD_STATUS_UPDATED: 'LEAD_STATUS_UPDATED',   // Lead call status or remarks changed
  TASK_ASSIGNED: 'TASK_ASSIGNED',               // Software sprint task created/assigned
  TASK_UPDATED: 'TASK_UPDATED',                 // Sprint task status/comment changed
  LEAVE_UPDATED: 'LEAVE_UPDATED',               // Leave applied, approved, or rejected
  DAILY_REPORT_SUBMITTED: 'DAILY_REPORT_SUBMITTED', // Daily report submitted
  ATTENDANCE_UPDATED: 'ATTENDANCE_UPDATED',     // Check-in or Check-out recorded
  CONVERSION_UPDATED: 'CONVERSION_UPDATED',     // Conversion entry added or finalized
  MESSAGE_SENT: 'MESSAGE_SENT'                  // New leadership message sent
}

const CHANNEL_NAME = 'aparaitech_hrms_sync_bus'
const STORAGE_KEY = 'aparaitech_sync_event'

// Shared BroadcastChannel instance (if supported)
let broadcastChannel = null
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME)
  } catch (err) {
    console.warn('[SyncHub] BroadcastChannel initialization failed:', err)
  }
}

/**
 * Broadcast an event across all tabs, windows, and active components instantly
 * @param {string} type - Event type from SYNC_EVENTS
 * @param {object} payload - Optional event data payload
 */
export const emitSyncEvent = (type, payload = {}) => {
  const eventData = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    payload,
    timestamp: Date.now()
  }

  // 1. Post to BroadcastChannel (Instant sub-millisecond cross-tab communication)
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(eventData)
    } catch (e) {
      console.warn('[SyncHub] postMessage error:', e)
    }
  }

  // 2. Post to localStorage for cross-tab compatibility
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventData))
  } catch (e) {
    // Ignore storage quota or disabled storage errors
  }

  // 3. Dispatch to local window event bus (for same-window components)
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('aparaitech_sync', { detail: eventData }))
    } catch (e) {}
  }
}

/**
 * Subscribe to real-time sync events
 * @param {Function} callback - Function receiving (eventData)
 * @param {Array<string>} [eventTypes] - Optional list of event types to filter by
 * @returns {Function} Unsubscribe function
 */
export const subscribeSyncEvents = (callback, eventTypes = null) => {
  if (typeof window === 'undefined') return () => {}

  const seenIds = new Set()
  const handleEvent = (eventData) => {
    if (!eventData || !eventData.type) return
    // Prevent duplicate firing from multiple channels for the same event ID
    if (eventData.id) {
      if (seenIds.has(eventData.id)) return
      seenIds.add(eventData.id)
      if (seenIds.size > 200) {
        const first = seenIds.values().next().value
        seenIds.delete(first)
      }
    }

    if (!eventTypes || eventTypes.includes(eventData.type)) {
      try {
        callback(eventData)
      } catch (err) {
        console.error('[SyncHub] Error in event listener callback:', err)
      }
    }
  }

  // Listener 1: BroadcastChannel
  const onBcMessage = (event) => {
    handleEvent(event.data)
  }
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', onBcMessage)
  }

  // Listener 2: localStorage storage event (triggers in other tabs)
  const onStorage = (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue)
        handleEvent(parsed)
      } catch (e) {}
    }
  }
  window.addEventListener('storage', onStorage)

  // Listener 3: Local CustomEvent (triggers in current tab)
  const onCustom = (event) => {
    if (event.detail) {
      handleEvent(event.detail)
    }
  }
  window.addEventListener('aparaitech_sync', onCustom)

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', onBcMessage)
    }
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('aparaitech_sync', onCustom)
  }
}

/**
 * React Hook for automatic data refresh (Polling + Focus/Visibility + Sync Events)
 * @param {Function} callback - Async/sync function to reload data
 * @param {object} options
 * @param {number} [options.intervalMs=5000] - Polling interval in ms (0 to disable interval)
 * @param {Array<string>} [options.eventTypes=[]] - Sync events that trigger immediate reload
 * @param {boolean} [options.onFocus=true] - Reload immediately when window regains focus
 * @param {boolean} [options.enabled=true] - Whether auto-refresh is active
 * @param {number} [options.minThrottleMs=1000] - Minimum delay between consecutive reloads
 */
export const useAutoRefresh = (callback, {
  intervalMs = 5000,
  eventTypes = [],
  onFocus = true,
  enabled = true,
  minThrottleMs = 1000
} = {}) => {
  const lastRunRef = useRef(0)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) return

    const triggerReload = (meta = {}) => {
      const now = Date.now()
      if (now - lastRunRef.current < minThrottleMs) return
      lastRunRef.current = now
      try {
        callbackRef.current(meta)
      } catch (err) {
        console.error('[useAutoRefresh] Trigger callback error:', err)
      }
    }

    // 1. Polling Interval
    let intervalId = null
    if (intervalMs && intervalMs > 0) {
      intervalId = setInterval(() => {
        // Only run polling if document is visible or polling actively
        if (typeof document === 'undefined' || document.visibilityState === 'visible') {
          triggerReload({ reason: 'interval' })
        }
      }, intervalMs)
    }

    // 2. Tab Focus & Visibility Change Handler
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && onFocus) {
        triggerReload({ reason: 'visibility' })
      }
    }
    const handleFocus = () => {
      if (onFocus) {
        triggerReload({ reason: 'focus' })
      }
    }

    if (onFocus && typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus)
      document.addEventListener('visibilitychange', handleVisibility)
    }

    // 3. Real-Time Sync Event Subscription
    let unsubscribeSync = null
    if (eventTypes && eventTypes.length > 0) {
      unsubscribeSync = subscribeSyncEvents((eventData) => {
        triggerReload({ reason: 'sync-event', event: eventData })
      }, eventTypes)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
      if (onFocus && typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus)
        document.removeEventListener('visibilitychange', handleVisibility)
      }
      if (unsubscribeSync) unsubscribeSync()
    }
  }, [intervalMs, onFocus, enabled, minThrottleMs, JSON.stringify(eventTypes)])
}
