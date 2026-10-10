# FS CODING website — homepage (Stages 1–3, reviewed)

Static site: open `index.html` or deploy the folder to any static host (Netlify, GitHub Pages, Vercel, Cloudflare Pages).

## Configure
Edit `CONFIG` at the top of `js/main.js`:
- `email`, `whatsapp` (country code + number, e.g. `201024665271`)
- `formEndpoint` — see below
- `socials` — add `{ label, url }` objects. Nothing is shown until you add real URLs (no dead links).

## Contact form — is it connected to a backend?
**Not by default.** With `formEndpoint: ''` the form validates, then opens WhatsApp with the message pre-filled. It does not store or email anything, and the page says so next to the submit button (the button reads "Send via WhatsApp").

To send real submissions by email:
1. Create a free endpoint at Formspree, Web3Forms or Getform and copy its URL.
2. Paste it into `CONFIG.formEndpoint`.

The form then POSTs the data with `fetch`, the note and button change to "Send message", and the page shows success only when the service answers `2xx`; on failure it shows an error and keeps the user's text.

## Social/preview assets
`assets/images/og-image.png` is the share image. Most platforms need an absolute URL, so after you know your domain change the `og:image` content to `https://YOUR-DOMAIN/assets/images/og-image.png` and add `og:url`.

## Structure
`css/style.css` design system · `js/main.js` nav, form, config · `js/animations.js` GSAP, particles, cursor · `assets/` logo, favicon, touch icon, OG image.

## Motion & accessibility
All motion is disabled under `prefers-reduced-motion` (CSS animations, GSAP, particles, cursor, magnetic buttons). Content is visible if GSAP fails to load. Keyboard: skip link, visible focus, Esc closes the mobile menu.

## Not built yet
`services.html`, `projects.html`, `about.html`, `contact.html`, `404.html` (Stage 4). Navigation currently uses same-page anchors, which all resolve.# FSCODING
