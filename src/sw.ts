/// <reference lib="webworker" />
declare let self: ServiceWorkerGlobalScope;

import { precacheAndRoute } from "workbox-precaching";

// Precache semua aset build (dari injectManifest) - ini yang bikin app tetap kebuka offline.
// Fallback ke [] kalau self.__WB_MANIFEST belum ke-inject (misal saat testing di `npm run dev`,
// manifest cuma ke-generate saat `npm run build`) - tanpa ini akan error
// "Cannot read properties of undefined (reading 'length')".
precacheAndRoute(self.__WB_MANIFEST || []);

// Terima push dari server (Supabase Edge Function), tampilkan sebagai notifikasi asli HP
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json() as {
    title: string;
    body: string;
    url?: string;
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url ?? "/" },
    }),
  );
});

// Kalau notifikasi diklik, buka/fokus ke app di URL yang relevan
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string })?.url ?? "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
