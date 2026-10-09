# Point Media Demo — Product TODO

## Product north star

Turn the app from a beautiful article demo into a daily reading ritual with progression, discovery, and reward.

> Every edition should feel like a small, satisfying journey that ends with a reward and opens a door to the next one.

## 1. Make the reading journey feel intentional

- [x] Add a clear “Today’s journey” progress state: `1 of 8`, `3 of 8`, `8 of 8`.
- [x] Make each article feel like a collectible card in a daily set.
- [x] Add subtle transitions between articles so the reader feels they are moving through an edition.
- [x] Introduce a “You’re halfway through” moment at article 4.
- [ ] Make the final article feel like a finish line rather than just the next swipe.

The journey indicator now stays beneath the masthead while reading, distinguishes the current and previously opened stories, keeps the partner moment outside the eight-article count, and unlocks the ninth bonus preview at completion. It follows each publication’s palette, supports screen-reader announcements and reduced motion, and reflows for enlarged text. Returning to the app preserves the bonus page.

Articles now have numbered press-card covers with publication colours and typography. Finishing the full article earns a persistent collection stamp and a check in the journey. “Your set” opens an eight-card collection with photographs, earned states, and links to revisit stories. Collections stay separate for each publication; opening the collection or revisiting an unlocked story adds no charge. Existing saves retain their wallet and progress, with an empty collection until cards are earned.

Story changes now have a short, directional handoff: the next story arrives from the right and the previous one from the left. The masthead, journey, and unlock footer remain anchored, and each publication keeps its own paper colour throughout the transition. Swipes, arrow keys, automatic advancement, and the bonus page share the same navigation behaviour. Rapid navigation commits each destination without leaving duplicate readers or payment timers behind; the new reader mounts at the top. Reduced motion is immediate, older browsers get a light card reveal, and sheet navigation keeps its existing transition. Verified across all six publications at desktop and mobile widths, including 320px and enlarged text, plus automatic collection, single charges/rewards, interruption, and browser fallbacks.

Article four is now the halfway chapter. Its closing checkpoint has a half-filled seal, four earned card stamps, a preview of the second-half topics, and a reminder of the secret preview at the finish. “You’re halfway through” is earned only after the first four full stories are collected; jumping ahead never fabricates reading progress. A freshly earned milestone pauses automatic advancement and reveals the checkpoint below the sticky journey, leaving Continue, swipes, and arrow keys available. Saved and revisited milestones stay earned without replaying the celebration or adding charges. Each publication uses its own typography, colours, and story order. Reduced motion, collection-dialog focus, small screens, enlarged text, unavailable web fonts, and the existing partner reward have been verified.

## 2. Turn completion into a real reward screen

- [ ] Make the 9th/8 moment feel like a deliberate completion celebration.
- [ ] Add an animated completion ring that fills from 0 to 100%.
- [ ] Add a “Perfect edition” badge.
- [ ] Add XP earned for reading, unlocking, and completing.
- [ ] Add a streak flame with a small history of recent reading days.
- [ ] Make the “Next edition unlocked” card feel slightly secretive.
- [ ] Consider a shareable completion card.
- [ ] Keep the tone editorial and premium rather than overly game-like.

## 3. Add a reading identity

- [ ] Show lightweight reading insights such as “You tend to finish culture stories first.”
- [ ] Show average reading session length.
- [ ] Show weekly story totals.
- [ ] Show the reader’s current streak and regular-reader status.
- [ ] Explore a reading personality label, such as “The Curious Catch-up.”
- [ ] Surface this lightly through the wallet or profile rather than building a heavy dashboard.

## 4. Make the secret preview more desirable

- [ ] Blur or partially obscure the preview image.
- [ ] Show only a headline fragment or teaser before reveal.
- [ ] Add “Available tomorrow” or “Next edition unlocked.”
- [ ] Let the reader tap to reveal a little more.
- [ ] Give each publication a distinct preview treatment.
- [ ] Consider a “Save this preview” interaction.
- [ ] Make the preview feel like opening a sealed envelope.

## 5. Build a coherent gamification system

- [ ] Define a small, consistent set of progress signals: articles read, editions completed, current streak, longest streak, XP, badges, and wallet rewards.
- [ ] Add badge definitions and earning rules.
- [ ] Add a badge gallery or achievement history.
- [ ] Avoid counters that do not connect to meaningful reader behavior.

### Badge ideas

- [ ] First Edition
- [ ] Perfect Edition
- [ ] Three-Day Run
- [ ] Weekend Reader
- [ ] Across the Network
- [ ] Early Bird
- [ ] Night Owl

## 6. Add better motion and feedback

- [ ] Establish a consistent motion language for the app.
- [ ] Animate progress segments when an article is completed.
- [ ] Improve wallet charge and reward moments.
- [ ] Animate the completion badge as it settles into place.
- [ ] Animate streak and XP values when they change.
- [ ] Reveal the preview card with a gentle masked animation.
- [ ] Respect `prefers-reduced-motion` for every new interaction.

## 7. Make publications feel more distinct

- [ ] Give each publication its own typography treatment.
- [ ] Define distinct editorial vocabulary for each publication.
- [ ] Give each completion screen its own accent patterns.
- [ ] Add publication-specific achievement badges.
- [ ] Improve publication logos and header lockups.
- [ ] Make switching publications feel like entering a different world.

## 8. Create an elegant network home

- [ ] Evolve the network sheet into a central discovery view.
- [ ] Place the current edition at the centre of the network.
- [ ] Arrange other publications around it.
- [ ] Show unread, in-progress, and complete states.
- [ ] Give completed publications a subtle progress ring.
- [ ] Allow jumping between editions without losing progress.
- [ ] Explore a suggested “daily route” through the network.

## 9. Improve the wallet story

- [ ] Show where rewards came from.
- [ ] Show spending on full-article unlocks.
- [ ] Show partner rewards earned during the edition.
- [ ] Add a simple weekly balance timeline.
- [ ] Use language like “Your reading balance.”
- [ ] Make the economics transparent and reassuring.

## 10. Add premium editorial details

- [ ] Improve article metadata and timestamps.
- [ ] Add “Why this is in your edition” explanations where useful.
- [ ] Add a smooth reading-time indicator.
- [ ] Add a tiny publication-specific end mark.
- [ ] Improve loading, empty, and error states.
- [ ] Add a subtle daily greeting based on time of day.
- [ ] Add “Continue where you left off.”
- [ ] Refine the copy throughout the app so every line feels intentional.

## 11. Make the first 30 seconds exceptional

- [ ] Communicate immediately that this is a daily edition.
- [ ] Explain that it contains eight stories.
- [ ] Explain that stories unlock progressively.
- [ ] Explain that reading earns progress and occasional rewards.
- [ ] Make the wider publication network discoverable.
- [ ] Refine the opening cover so the ritual is clear without instructions.

## 12. Add a reading receipt

- [ ] Add a polished post-edition reading receipt rather than a generic dashboard.
- [ ] Show today’s completion score.
- [ ] Show articles read.
- [ ] Show time spent.
- [ ] Show rewards earned.
- [ ] Show newly unlocked badges.
- [ ] Show current streak.
- [ ] Show the next-edition preview.

## Recommended implementation order

- [ ] Perfect the completion screen.
- [ ] Add XP, streak history, badges, and a completion score.
- [ ] Improve article-to-article transitions and progress feedback.
- [ ] Upgrade the network into a publication discovery experience.
- [ ] Make the secret preview more interactive.
- [ ] Refine the wallet and reward explanation.
- [ ] Add richer first-use and return-user experiences.
- [ ] Finish with motion polish, accessibility, performance, and responsive QA.

## Quality bar

- [ ] The product feels editorial and premium, not like a generic gamified dashboard.
- [ ] Every new interaction has a clear purpose.
- [ ] Progress and rewards are understandable without explanation.
- [ ] The experience works beautifully on mobile and desktop.
- [ ] Text remains readable at increased browser zoom.
- [ ] New motion has reduced-motion alternatives.
- [ ] The app remains fast and resilient on slower connections.
