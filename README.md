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

On iOS, open the hosted HTTPS URL in Safari, tap Share, then Add to Home Screen. On Android, use the in-app Install app control or the browser's install prompt/menu. The installed demo launches full screen, works after its first successful load, and keeps its state on the device.

Svelte 5 + Vite + TypeScript; localStorage retains the demo state between launches, with sessionStorage as a fallback. Reset demo restores the initial £1 balance. No payment service, backend, or account integration is used. Photography credits are in public/PHOTO-CREDITS.txt.

## Structure

`src/App.svelte` composes the publication shell. The article reader, scroll unlock footer, discovery deck, wallet sheets, and notifications live in `src/components/`. Shared reactive demo state and reading/payment actions are in `src/demo.svelte.ts`; publication and story helpers are in `src/data.ts`. `src/style.css` retains the publication themes.

The six publication names, taglines, and palettes are defined in `src/data.ts`. Wordmarks and icons use the SVGs in `public/newspaper-logos/`. The previous four publication IDs migrate to the new brands when saved state loads, keeping the wallet and article progress.

Articles use a responsive newspaper layout with publication-specific headline fonts, paper colours, bylines, photo captions, and pull quotes. Swipe left or right to move between articles. The fixed 20p footer tracks reading progress through the 75% preview before opening the remaining text.

Every publication opens directly on its first article. The masthead and First article button return there; older saved cover screens also resume on the first article.

Wallet updates and article unlocking update the existing components. The reader remounts only when navigating to another story, publication, or screen. Existing saved progress uses the same storage key.

Run `npm run check` for Svelte and TypeScript diagnostics. `npm run build` runs those checks before generating the static site.

## Performance

Photos use responsive WebP variants at 480, 960, and 1920 pixels, with the original JPEGs as a fallback. Generated assets have content hashes and live in `public/images/optimized/`; `src/image-assets.json` maps each photo to its variants. If photographs change, install Pillow in your Python environment and run `python3 scripts/optimize-images.py`. These files are checked in, so normal builds do not require Python.

Wallet sheets and the discovery deck load on demand. Background videos load when visible, pause when the page or article is hidden, and use the photograph when reduced motion or data saving is enabled. Scroll geometry refreshes on layout changes rather than every scroll frame. Content-hashed scripts and photos use the service worker cache without repeated background downloads.
