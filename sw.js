// sw.js — Useless Knowledge PWA Service Worker v3
// Handles: caching for offline use
// v2 changes: facts.json removed from APP_SHELL (large file, changes weekly);
//             network-first strategy for facts.json so data is always fresh.
// v3 changes: facts.json requests always resolve to a real Response, even when
//             network and cache both miss, so the page can fall back cleanly.

const CACHE_NAME = "useless-knowledge-v6";
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
  