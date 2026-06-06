// Kilo service worker — installability + offline support.
//
// Strategy:
//   - Page navigations: network-first, falling back to a cached offline page
//     when the device is offline. This never serves stale pages while online.
//   - Next.js build assets (/_next/static, content-hashed + immutable):
//     cache-first for instant repeat loads.
//   - Everything else (RSC payloads, API, auth): left untouched so dynamic
//     data is always fresh.
//
// Push handlers are included so the app is ready for web push once a backend
// (VAPID keys + subscription storage) is wired up.

const VERSION = "v1";
const OFFLINE_URL = "/offline";
const PRECACHE = `kilo-precache-${VERSION}`;
const RUNTIME = `kilo-runtime-${VERSION}`;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PRECACHE).then((cache) => cache.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== PRECACHE && key !== RUNTIME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Page navigations: network-first with an offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          const cache = await caches.open(PRECACHE);
          const cached = await cache.match(OFFLINE_URL);
          return cached ?? Response.error();
        }
      })()
    );
    return;
  }

  // Immutable build assets: cache-first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME);
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })()
    );
  }
});

// --- Web push (ready for a future backend) ---------------------------------

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Kilo", body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? "Kilo", {
      body: payload.body,
      icon: payload.icon ?? "/icon-192",
      badge: "/icon-192",
      data: { url: payload.url ?? "/dashboard" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url ?? "/dashboard";

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of clientList) {
        if (client.url.includes(target) && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })()
  );
});
