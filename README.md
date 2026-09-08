# NEXVERSE V0.3

Interactive mobile-first prototype for an AI entertainment network.

## Included
- WATCH: vertical AI short-video concept feed
- WATCH engagement: autoplay, 65% visibility view counting, and persistent likes
- PLAY: AI game discovery cards and instant-play CTA
- NEX RUNNER: an in-site canvas game with keyboard and touch controls
- ENTER WORLD: opens NEX RUNNER directly from AI World #001
- MARKET: AI art / character / world / game marketplace concept
- CREATE: upload-first creator flow
- PROFILE: NEX balance, collection, achievements
- Interactive bottom navigation
- Mobile responsive layout

## Run locally

```bash
python3 -m http.server 3000
```

Then open http://localhost:3000

## Verify

The dependency-free integration test covers the full WATCH → ENTER WORLD → PLAY
→ PLAY NOW → NEX RUNNER → GAME OVER → RETRY → WATCH flow, including the
existing video, view-count, and like behavior.

```bash
node tests/app.integration.test.cjs
node --check app.js
```

## Next build step
Connect Supabase for Auth/Postgres and Cloudflare R2 for media, then replace the
prototype's local engagement state with server-backed tracking.
