/**
 * Operator Dossier service worker — offline-first app shell.
 *
 * Strategy:
 *  - Navigations (HTML): network-first, fall back to the cached shell so the
 *    vault UI boots offline (data itself lives in IndexedDB).
 *  - Same-origin static assets (JS/CSS/fonts/images): cache-first.
 *  - /api/* : network-only with a JSON offline fallback (never cached, so
 *    mutations/queries can't serve stale data).
 *
 * Bump CACHE_VERSION on every release that changes cached assets.
 */
const CACHE_VERSION = "dossier-shell-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;

self.addEventListener("install", event => {
  // Pre-cache nothing heavy — populate lazily on first fetch so install is
  // instant even on slow networks.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(key => key.startsWith("dossier-shell-v") && key !== SHELL_CACHE && key !== ASSET_CACHE)
          .map(key => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

function offlineJson() {
  return new Response(JSON.stringify({ offline: true }), {
    status: 503,
    headers: { "content-type": "application/json" },
  });
}

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;
  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;

  // API: never cache; fail fast with JSON when offline.
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(request).catch(() => offlineJson())
    );
    return;
  }

  // Navigations: network-first with shell fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(SHELL_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(request);
          if (cached) return cached;
          const shell = await caches.match("/");
          if (shell) return shell;
          return new Response("Offline — холболт тасарсан байна.", {
            status: 503,
            headers: { "content-type": "text/plain; charset=utf-8" },
          });
        }
      })()
    );
    return;
  }

  // Static assets: cache-first.
  event.respondWith(
    (async () => {
      const cached = await caches.match(request, { ignoreSearch: false });
      if (cached) return cached;
      try {
        const fresh = await fetch(request);
        if (fresh.ok && (fresh.type === "basic" || fresh.type === "default")) {
          const cache = await caches.open(ASSET_CACHE);
          cache.put(request, fresh.clone());
        }
        return fresh;
      } catch {
        return caches.match(request);
      }
    })()
  );
});
