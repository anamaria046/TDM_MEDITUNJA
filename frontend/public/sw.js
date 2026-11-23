// Incrementa la versión cuando cambie el shell de la aplicación.
const VERSION = "v2";
const CACHE_PREFIX = "meditunja-";
const SHELL_CACHE = `${CACHE_PREFIX}shell-${VERSION}`;
const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/offline.css",
  "/manifest.webmanifest",
  "/logo-meditunja.png",
  "/fonts/Sora.ttf",
  "/fonts/Roboto-Regular.ttf"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(SHELL_ASSETS);

    // La entrada y el CSS del build de Vite tienen nombres con hash; se leen
    // del HTML para guardar el shell real sin codificar nombres de build aquí.
    const html = await (await cache.match("/index.html")).text();
    const assets = [...html.matchAll(/(?:src|href)="(\/[^"?#]+\.(?:js|css))"/g)]
      .map(([, asset]) => asset);
    await Promise.allSettled(assets.map((asset) => cache.add(asset)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith(CACHE_PREFIX) && key !== SHELL_CACHE)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Las respuestas de autenticación, citas, transporte y afiliación pueden
  // contener información personal; siempre se solicitan directamente a la red.
  if (url.pathname === "/api" || url.pathname.startsWith("/api/")) return;

  event.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic" && request.method === "GET") {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    if (request.mode === "navigate") {
      return (await cache.match("/offline.html")) ||
        (await cache.match("/index.html")) || Response.error();
    }
    return Response.error();
  }
}
