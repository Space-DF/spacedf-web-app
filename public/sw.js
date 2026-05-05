const SUPPORTED_LOCALES = ['en', 'vi']

function pickLocaleFromClients(clientList) {
  for (const client of clientList) {
    try {
      const path = new URL(client.url).pathname
      const m = /^\/(en|vi)(?:\/|$)/.exec(path)
      if (m && SUPPORTED_LOCALES.includes(m[1])) return m[1]
    } catch {
      continue
    }
  }
  return 'en'
}

function extractDeviceAndSpace(payload) {
  const deviceId = payload.device_id ?? payload.data?.device_id
  const spaceSlug = payload.data?.space_slug
  return {
    deviceId: deviceId ?? '',
    spaceSlug: spaceSlug ?? '',
  }
}

/** Path after locale; middleware adds /{locale}/{org}/… from subdomain. */
function buildSpaceDevicePath(locale, spaceSlug, deviceId) {
  const params = new URLSearchParams({ device_id: deviceId })
  const slug = String(spaceSlug).replace(/^\/+/, '')
  return `/${locale}/spaces/${encodeURIComponent(slug)}?${params.toString()}`
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      let data = {}
      try {
        data = event.data ? event.data.json() : {}
      } catch {
        data = {}
      }

      const title = data.title || 'New notification'
      const body = data.message ?? data.body ?? ''
      const { deviceId, spaceSlug } = extractDeviceAndSpace(data)

      let notificationData = {}
      if (deviceId && spaceSlug) {
        notificationData = { device_id: deviceId, space_slug: spaceSlug }
      } else if (typeof data.url === 'string' && data.url) {
        notificationData = { url: data.url }
      }

      const options = {
        body,
        icon: data.icon || '/favicon.ico',
        badge: data.badge || '/favicon.ico',
        data: notificationData,
        requireInteraction: true,
      }

      try {
        await self.registration.showNotification(title, options)
      } catch (err) {
        console.error('[sw] showNotification failed', err)
      }
    })()
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const raw = event.notification.data
  let data = {}
  if (raw && typeof raw === 'object') {
    data = raw
  } else if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      data = {}
    }
  }

  event.waitUntil(
    (async () => {
      const clientList = await clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      let url = '/'
      if (typeof data.url === 'string' && data.url) {
        url = data.url
      } else if (data.device_id && data.space_slug) {
        const locale = pickLocaleFromClients(clientList)
        url = buildSpaceDevicePath(locale, data.space_slug, data.device_id)
      }

      const scopeOrigin = new URL(self.registration.scope).origin
      for (const client of clientList) {
        if (!('focus' in client)) continue
        try {
          if (new URL(client.url).origin !== scopeOrigin) continue
          if ('navigate' in client) {
            await client.navigate(url)
            return client.focus()
          }
        } catch {
          continue
        }
      }
      return clients.openWindow(url)
    })()
  )
})
