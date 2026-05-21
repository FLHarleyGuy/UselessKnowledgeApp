# Useless Knowledge

A loud, installable fact browser built as a PWA. No backend, no build step, no dependencies.

## Why this exists

Most "learn something every day" apps are either too heavy (accounts, subscriptions, feeds) or too passive (notifications you swipe away). This is a deliberate alternative: a single-file app that sits on your home screen, opens instantly, and puts one fact in front of you with enough context that it actually sticks.

The facts aren't trivia for its own sake. Each one has a "why it matters" line and a quiz prompt, so you can actually test whether you retained it. The goal is useful knowledge disguised as useless trivia.

## What it is technically

A self-contained PWA — one HTML file, one JSON file, a service worker, and a manifest. No framework, no npm, no build process. The entire app is readable by a human in an afternoon.

Facts live in `facts.json`. Each fact has:
- `id` — unique integer
- `category` — one of the defined category keys
- `fact` — the one-liner
- `why` — why it's actually useful
- `quizPrompt` / `quizAnswer` — for quiz mode
- `image` / `imageAlt` — optional visual (SVG or PNG, lives in `images/`)
- `tags` — freeform array for future filtering

## Run locally

```
python -m http.server 8080
```

Open `http://localhost:8080` in Chrome. The app requires a server (not `file://`) because of the service worker and `fetch()` call.

## Deploy

The app lives at `labs.justinache.com/useless-knowledge/` via SFTP to IONOS. It is also mirrored to GitHub Pages at `flharleyguy.github.io/UselessKnowledgeApp/`.

When deploying, push `index.html`, `facts.json`, `sw.js`, and `manifest.json`. Images and icons only need updating if they changed.

## Adding facts

Open `facts.json` and append a new object following the existing schema. Use the next available `id`. After adding facts, redeploy — the service worker cache name should be bumped if you want existing installs to pick up new content immediately.

## Versioning

This project uses semantic versioning: `Major.Minor.Patch`

**Patch (x.x.1):** Bug fixes, text corrections, asset swaps, SW cache bumps with no user-visible feature change.

**Minor (x.1.x):** New feature, new UI mode, significant content expansion (adding a batch of facts), new category, behavioral change that users would notice.

**Major (2.x.x):** Fundamental redesign of what the app does or how it works — a different core interaction model, complete visual overhaul, or architectural change.

The version is defined once in `index.html` as `APP_VERSION` and rendered into the header badge at runtime. The SW cache version (`useless-knowledge-vN`) is a separate internal counter and does not need to match the app version — it only needs to increment when you want to bust cached installs.

## Version history

### v1.4.1 (2026-05-18)
- `facts.json` loads bypass browser HTTP cache and reject empty/malformed data before rendering
- Service worker cache bumped to `useless-knowledge-v6`
- `facts.json` service-worker fetches now time out and always return a real response, so the app falls back instead of freezing on "Loading facts..."

### v1.3 (2026-05-17)
- Version badge now renders from `APP_VERSION` constant — single source of truth
- Facts expanded to 99
- SW cache bumped to v3 to resolve stale-cache loading issue on labs

### v1.2
- Streak system (daily visit tracking, streak counter in header)
- Share button (Web Share API with clipboard fallback)

### v1.1
- Category filter strip
- Quiz mode (quiz prompt + reveal answer)
- Image support on facts

### v1.0
- Initial release: fact browser, PREV / RANDOM / NEXT navigation, fallback facts, service worker for offline use
