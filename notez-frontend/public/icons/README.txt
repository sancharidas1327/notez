Place your app icons here before deploying:

  icon-192.png  — 192×192 px  (required)
  icon-512.png  — 512×512 px  (required)

Quick way to make them:
1. Open Canva or Figma
2. Create a square canvas (512×512)
3. Purple background (#7c3aed) + white octopus emoji 🐙
4. Export as PNG
5. Resize to 192×192 for the second file

These are referenced in vite.config.js (PWA manifest) and index.html.
Without them the PWA install prompt won't show, but the app still works.
