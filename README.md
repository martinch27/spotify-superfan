# Spotify SuperFan — clickable prototype

Landing-page prototype for presenting the **SuperFan tier** concept — a new conversion layer for Spotify that monetizes the most loyal listeners.

## About the project

Spotify already owns the data on who listens to whom and how much (Super Listeners = 2% of an artist's MAL). The SuperFan tier leverages that structural advantage: targeted push to the top 1% of listeners with an offer to subscribe directly to exclusive content.

In the prototype:

1. Spotify interface opens with Martin's library
2. After ~0.7s — popup "You're in the top 1% of Playboi Carti fans" with the offer to become a SuperFan
3. CTA → Carti's locked profile feed (audio, photo, video, drops, posts — all behind a paywall)
4. Tap any post → checkout pre-filled at $4.99 with Apple Pay
5. → Success screen with exclusive perks

## Local run

Open `index.html` in a browser — it's a static site, no build step.

## Structure

- `index.html` — all screens (home, profile, tiers, checkout, success) and the popup
- `styles.css` — Spotify-mobile-styled design
- `app.js` — screen navigation and popup logic
- `qr.html` + `qr.png` — projector-ready QR page pointing at the live demo

## Deploy

Hosted on GitHub Pages. Pushing to `main` triggers an automatic rebuild.
