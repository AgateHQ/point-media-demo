# The Point

Frontend-only interactive news demo. All stories, payments, rewards, and network titles are fictional.

## Run

npm install
npm run dev

## Build

npm run build
npm run preview

## Phone demo

This is configured as an installable PWA for easier demos.

On iOS, open the hosted URL in Safari, tap Share, then Add to Home Screen. On Android, use the in-app Install app control or the browser's install prompt/menu.

Vite + TypeScript; localStorage retains the demo state between launches, with sessionStorage as a fallback. Reset demo restores the initial £1 balance. No payment service, backend, or account integration is used. Photography credits are in public/PHOTO-CREDITS.txt.
