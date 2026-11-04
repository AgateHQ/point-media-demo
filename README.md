# The Point

Interactive news demo with a Payload CMS editorial backend. The reader's stories, payments, rewards, and network titles are fictional.

## Run

Use Node.js 24.22.1 or newer (`.node-version` is provided).

npm install
npm run dev

The reader runs at http://localhost:5173 and the CMS at http://localhost:3000/admin. The reader's development server also proxies `/admin` and `/api` to the CMS, so http://localhost:5173/admin works too. No login or first-user setup is required: everyone uses a shared editor identity and can create, edit, and delete content.

`npm run dev:web` and `npm run dev:cms` start either app independently. SQLite is created automatically in `cms/data/payload.db`; uploaded files are stored in `cms/media/`. Both survive restarts and are ignored by Git.

## Editorial workflow

1. Open **Publications**, create a publication, and enter its name, headline, and uploaded logo. Media uploads ask for a description / alt text.
2. Save the publication, then use **Add new** in its **Editions** section. The publication is filled in automatically. Set the start and end dates; the edition is named from those dates. The end cannot precede the start.
3. Add articles inside the edition. Each has a title, a Lexical rich-text body (formatting toolbar, headings, links, lists, quotes, and inline images), and a main image or video URL.
4. Collapse article rows and drag their handles into reading order, then save the edition. The array order returned by the API is the reading order. Articles belong to that edition rather than a separate shared article library.

**Articles & editions** is the main editorial workspace. Article writing is the main panel, with publication and dates in the edition details sidebar. Article fields open immediately; use **Collapse All** when arranging the reading order.

Save a new edition once, then click **Live preview** above the articles to open Payload’s split-screen reader while you write. Unsaved headlines, rich text, images, video links, publication selection, dates, and article ordering update automatically. Mobile, tablet, desktop, and responsive sizes are available. The reader follows the article you edit, preserves its scroll position while typing, and shows full article text without simulated charges or automatic page turns. Live changes stay in memory; click **Save** to store them. **Hide live preview** returns to the full editor.

To test the saved edition’s reading experience, save it and click **Saved preview** above the articles (or **Preview** next to Save). This opens a new tab at `/preview/editions/<id>` using the same Svelte reader, layouts, and components as the root demo. It includes swipe/arrow-key navigation, directional transitions, the reading journey, simulated 20p edition unlocking and wallet top-ups, story cards and collections, halfway and finish moments, completion XP/streaks, and publication discovery. Article counts, milestone copy, and navigation adapt to the saved edition's length. Rich text, uploaded images, video links, the publication logo/headline, and the edition date come from Payload.

Preview wallet/progress use a separate localStorage key for each edition and never change `the-point-demo-v3`. The preview toolbar offers **Reset preview**, **This edition**, **Refresh**, and **Edit edition**; save changes in the editor, then refresh to load them. Discovery includes the existing demo publications so network interactions and the completion bonus remain available. Empty and future editions can also be previewed. Installation and service-worker registration stay with the root demo, so editorial previews do not overwrite its offline app.

In development, the preview loads the reader from the same host on Vite port 5173; run `npm run dev` for both apps. Set `READER_DEV_ORIGIN` in `cms/.env` if Vite is on another port/host. A CMS production build bundles the same reader and its assets into `cms/public/reader/`, so production previews work without a Vite server.

The CMS is independent of the existing reader's demo dataset in `src/data.ts` and `src/stories.json`; saving editorial content does not yet replace the demo's eight-story editions or payment/collection state.

Payload exposes the content at `/api/publications`, `/api/editions`, and `/api/media`. For example, `/api/editions?where[publication][equals]=1&sort=-startDate&depth=1` returns a publication's editions with their ordered articles and populated media. The publication response also includes its related editions through a join field. Delete a publication's editions before deleting the publication.

## Build

npm run build
npm run preview

`npm run build` checks/builds the static reader and the CMS. Set `PAYLOAD_SECRET` in `cms/.env` first (see `cms/.env.example`), or supply it in the build environment. `npm run start:cms` serves the production CMS build on port 3000. `npm run preview` only serves the static reader. For a reader-only build, use `npm run build:web`; the GitHub Pages workflow uses this command because Pages cannot run Payload.

`npm run check` checks both apps. `npm run test:cms` checks the content workflow against an isolated temporary SQLite database, plus variable-length reader navigation, rich-text preview trimming, and media/link handling. The CMS regenerates its admin import map automatically before development startup and production builds. `npm run cms:generate` regenerates Payload types and the admin import map after changing fields or editor features. If an already-running dev server reports a missing custom component after an edit, refresh the admin; restarting `npm run dev` will regenerate the map before Next.js loads it.

## Later hosting on Fly.io

The CMS uses Next.js with standalone output. Include `cms/public/` (including the generated `reader/` assets) and `.next/static/` when packaging the standalone server. When deploying, provide a persistent volume for both SQLite and uploads, for example `DATABASE_URL=file:/data/payload.db` and `MEDIA_DIR=/data/media`, plus a stable `PAYLOAD_SECRET`. Keep this SQLite setup on one app machine; scaling to multiple machines would require shared database/media storage. Generate/apply Payload database migrations for production schema changes (development currently pushes schema changes automatically). Fly deployment is not configured in this change.

Admin access and content writes are intentionally open, including in production. The custom `open-editor` strategy in `cms/collections/Editors.ts` supplies the shared identity; the collection access rules in `cms/collections/access.ts` permit public CRUD. Replace those together when authentication becomes necessary.

## Phone demo

This is configured as an installable PWA for easier demos.

On iOS, open the hosted HTTPS URL in Safari, tap Share, then Add to Home Screen. On Android, use the in-app Install app control or the browser's install prompt/menu. The installed demo launches full screen, works after its first successful load, and keeps its state on the device.

Svelte 5 + Vite + TypeScript; localStorage retains the demo state between launches, with sessionStorage as a fallback. Reset demo restores the initial £1 balance. The reader uses no payment service or account integration. Photography credits are in public/PHOTO-CREDITS.txt.

## Structure

`src/App.svelte` composes the publication shell. The article reader, scroll unlock footer, discovery deck, wallet sheets, and notifications live in `src/components/`. Shared reactive demo state and reading/payment actions are in `src/demo.svelte.ts`; publication and story helpers are in `src/data.ts`. `src/style.css` retains the publication themes.

The six publication names, taglines, and palettes are defined in `src/data.ts`. Wordmarks and icons use the SVGs in `public/newspaper-logos/`. The previous four publication IDs migrate to the new brands when saved state loads, keeping the wallet and article progress.

Articles use a responsive newspaper layout with publication-specific headline fonts, paper colours, bylines, photo captions, and pull quotes. Swipe left or right to move between articles. The fixed 20p footer tracks reading progress through a 75% article preview before unlocking all eight full articles in that publication's edition for one charge. Subsequent articles and revisits open in full without another charge; each publication's edition is purchased separately. The wallet shows editions unlocked and actual unlock spending. Older article purchases carry over to the full edition without a new charge, preserving the balance, historical spending, and reading progress.

The sticky “Today’s journey” indicator follows the current article from 1 of 8 to 8 of 8 and highlights previously opened stories. Finishing the edition unlocks the ninth bonus preview, shown as 9 / 8. The same `EditionJourney.svelte` component stays mounted across navigation, uses publication colours, and provides screen-reader announcements and a layout for enlarged text. Saved completion screens remain on the bonus page after reload.

The partner moment is paused with `partnerMomentEnabled = false` in `src/demo.svelte.ts`. Navigation skips it in both directions, and saves on that moment resume at the next article. Its content, styling, and reward logic remain available for reuse; previously earned credits stay in the wallet and receipt. Set the flag to `true` to restore it.

Each article has a numbered `EditionCard.svelte` cover. Reaching the end of an unlocked full article collects its card once, records it in the publication's `collected` map, and marks the journey segment with a check. The reader's “Your set” button and the completion page open `EditionCollection.svelte` inside the existing dialog, showing all eight cards and allowing readers to revisit a story. Opening the collection makes no wallet transaction; previously unlocked stories remain unlocked when revisited. Older saves preserve their wallet, visited stories, and unlocks, starting with no cards collected.

Article four closes with `HalfwayMoment.svelte`: a collection seal, four card stamps, and the topics in that publication's second half. Shared `halfwayProgress()` derives the milestone from the first four collected cards, not visits or unlocks. A newly earned milestone pauses automatic advancement so the reader can continue by button, swipe, or arrow key. If needed, it reveals the checkpoint below the sticky masthead and journey; reduced motion makes that adjustment immediate. Revisits and restored saves retain the milestone without replaying its celebration, and normal auto-advancement resumes on those revisits. No new wallet transaction or storage schema is introduced.

Every publication opens directly on its first article. The masthead and First article button return there; older saved cover screens also resume on the first article.

Wallet updates and edition unlocking update the existing components. The reader remounts only when navigating to another story, publication, or screen. Existing saved progress uses the same storage key.

`src/editionNavigation.ts` gives story changes a 360ms directional handoff, using viewport view-transition snapshots while the masthead, journey, and unlock footer stay anchored. Only one live reader is mounted, and scroll resets before the next reader starts its unlock/collection timers. Rapid navigation commits pending destinations once and skips obsolete motion. Browsers without the API use a small card-only reveal; reduced motion navigates immediately, including when the preference changes mid-turn. Publication and collection sheets retain their own navigation treatment. Optional browser model tools await the destination update before reporting its state.

Run `npm run check:web` for Svelte and TypeScript diagnostics. `npm run build:web` runs those checks before generating the static site.

## Performance

Photos use responsive WebP variants at 480, 960, and 1920 pixels, with the original JPEGs as a fallback. Generated assets have content hashes and live in `public/images/optimized/`; `src/image-assets.json` maps each photo to its variants. If photographs change, install Pillow in your Python environment and run `python3 scripts/optimize-images.py`. These files are checked in, so normal builds do not require Python.

Wallet sheets and the discovery deck load on demand. Background videos load when visible, pause when the page or article is hidden, and use the photograph when reduced motion or data saving is enabled. Scroll geometry refreshes on layout changes rather than every scroll frame. Content-hashed scripts and photos use the service worker cache without repeated background downloads.
