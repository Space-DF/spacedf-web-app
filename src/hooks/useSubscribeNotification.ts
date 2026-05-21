'use client'

import { LOCAL_STORAGE_KEYS } from '@/constants'
import { useCallback, useEffect, useState } from 'react'

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from(Array.from(rawData).map((c) => c.charCodeAt(0)))
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return ''
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(buffer))))
}

const subscribeNotification = async (
  subscription: PushSubscription
): Promise<void> => {
  const body = {
    endpoint: subscription.endpoint,
    p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
    auth: arrayBufferToBase64(subscription.getKey('auth')),
  }
  const response = await fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error('Failed to subscribe to notifications')
  }
  return response.json()
}

export const useSubscribeNotification = () => {
  const [supported, setSupported] = useState(false)
  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'PushManager' in window)
  }, [])
  const registerServiceWorker = useCallback(async () => {
    if (!supported || !vapidPublicKey) return
    let permission = Notification.permission
    if (permission === 'default') {
      permission = await Notification.requestPermission()
    }
    if (permission !== 'granted') return
    try {
      await navigator.serviceWorker.register('/sw.js')
      const registration = await navigator.serviceWorker.ready

      const existing = await registration.pushManager.getSubscription()
      const storedEndpoint = localStorage.getItem(
        LOCAL_STORAGE_KEYS.NOTIF_PERMISSION_KEY
      )

      if (existing) {
        if (existing.endpoint === storedEndpoint) {
          return
        }
        await subscribeNotification(existing)
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.NOTIF_PERMISSION_KEY,
          existing.endpoint
        )
        return
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey!),
      })

      await subscribeNotification(subscription)
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.NOTIF_PERMISSION_KEY,
        subscription.endpoint
      )
    } catch (error) {
      console.error('Failed to register service worker or subscribe:', error)
    }
  }, [supported])

  return { supported, registerServiceWorker }
}
