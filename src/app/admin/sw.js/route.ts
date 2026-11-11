import { NextResponse } from "next/server";

const ADMIN_SW_SCRIPT = `/* AKHIL FOODS Admin-Only Service Worker (Scoped strictly to /admin) */
const CACHE_NAME = "akhil-admin-shell-v1";
const OFFLINE_URL = "/admin-offline.html";
const SHELL_ASSETS = [
  "/admin-offline.html",
  "/admin-manifest.webmanifest",
  "/admin-icon-192.png",
  "/admin-icon-512.png",
  "/admin-icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("akhil-admin-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // NEVER intercept or cache API calls, orders, or customer data
  if (url.pathname.startsWith("/api/")) return;

  // Serve cached static admin shell icons/manifest/offline page
  if (SHELL_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }

  // Only handle navigation inside /admin scope; do not affect customer pages
  if (url.pathname !== "/admin" && !url.pathname.startsWith("/admin/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedOffline = await caches.match(OFFLINE_URL);
        if (cachedOffline) return cachedOffline;
        return new Response("No internet", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      })
    );
  }
});
`;

export async function GET() {
  return new NextResponse(ADMIN_SW_SCRIPT, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Service-Worker-Allowed": "/admin",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
