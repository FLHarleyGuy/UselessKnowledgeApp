// sw.js — Useless Knowledge PWA Service Worker v3
// Handles: caching for offline use
// v2 changes: facts.json removed from APP_SHELL (large file, changes weekly);
//             network-first strategy for facts.json so data is always fresh.
// v3 changes: facts.json requests always resolve to a real Response, even when
//             network and cache both miss, so the page can fall back cleanly.
// v7 cache bump: clears stale v6 cache which held a truncated facts.json.

const CACHE_NAME = "useless-knowledge-v7";
const FACTS_TIMEOUT_MS = 6000;

// App shell: only the files needed to render the UI frame.
// facts.json is intentionally excluded — it is large (54KB), updated weekly,
// and including it caused a race condition with the page's own fetch on install.
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./images/memphis-bg.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isFacts = url.pathname.endsWith("/facts.json");

  if (isFacts) {
    // Network-first for facts.json: always try the server first so users
    // get the latest weekly batch. Fall back to cache if offline. If both
    // miss, return a real error response so the page can use fallback facts.
    event.respondWith(
      fetchWithTimeout(event.request, FACTS_TIMEOUT_MS)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => {
            return cached || new Response("facts unavailable", {
              status: 503,
              statusText: "Facts unavailable",
              headers: { "Content-Type": "text/plain; charset=utf-8" }
            });
          })
        )
    );
  } else {
    // Cache-first for everything else (app shell).
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        });
      })
    );
  }
});

function fetchWithTimeout(request, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(req