import { flushSync } from 'svelte';

export type TurnDirection = 'forward' | 'backward';
interface EditionTurn {
  apply: () => void;
  finish: () => void;
  transition?: ViewTransition;
  animation?: Animation;
}
let activeTurn: EditionTurn | undefined;

function setTurnCanvas() {
  const shell = document.querySelector('.publication-shell');
  if (shell) document.documentElement.style.setProperty('--edition-turn-canvas', getComputedStyle(shell).backgroundColor);
}

export function resetReaderScroll() {
  document.querySelector<HTMLElement>('.reader')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

// Commit a pending capture before calculating the next destination. Rapid swipes
// still count individually; an obsolete transition never replays its update.
export function settleEditionTurn() {
  const turn = activeTurn;
  if (!turn) return;
  turn.apply();
  turn.transition?.skipTransition();
  turn.animation?.cancel();
  turn.finish();
}

export function turnEdition(update: () => void, direction: TurnDirection, animate = true): Promise<void> {
  settleEditionTurn();
  let applied = false;
  const apply = () => {
    if (applied) return;
    applied = true;
    // The new reader must mount at the top, not inherit the previous story's
    // end position and trigger its scroll-to-unlock or collection timers.
    resetReaderScroll();
    flushSync(update);
    resetReaderScroll();
    if (document.documentElement.dataset.editionTurn) setTurnCanvas();
  };
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!animate || motion.matches) {
    apply();
    return Promise.resolve();
  }

  const turn: EditionTurn = {
    apply,
    finish: () => {
      motion.removeEventListener('change', stopMotion);
      if (activeTurn !== turn) return;
      activeTurn = undefined;
      delete document.documentElement.dataset.editionTurn;
      document.documentElement.style.removeProperty('--edition-turn-canvas');
    },
  };
  const stopMotion = () => { if (motion.matches && activeTurn === turn) settleEditionTurn(); };
  activeTurn = turn;
  motion.addEventListener('change', stopMotion);

  const revealCard = () => {
    apply();
    // Older browsers get a small card reveal. Never transform the article
    // itself: that would make the fixed unlock footer move with its content.
    const card = document.querySelector<HTMLElement>('.reader .edition-card:not(.card-compact), .reader .sponsored-visual, .reader .completion');
    if (!card?.animate) { turn.finish(); return; }
    turn.animation = card.animate([
      { opacity: 0, transform: `translateX(${direction === 'forward' ? 24 : -24}px)` },
      { opacity: 1, transform: 'translateX(0)' },
    ], { duration: 360, easing: 'cubic-bezier(.22, 1, .36, 1)' });
    turn.animation.finished.then(turn.finish, turn.finish);
  };

  if (typeof document.startViewTransition !== 'function') {
    revealCard();
    return Promise.resolve();
  }
  document.documentElement.dataset.editionTurn = direction;
  setTurnCanvas();
  try {
    // Only the viewport snapshots animate. One live reader means one set of
    // payment/reward timers, even while the old article is fading away.
    turn.transition = document.startViewTransition(apply);
    turn.transition.ready.catch(() => { /* Skipping an interrupted turn is normal. */ });
    turn.transition.finished.then(turn.finish, turn.finish);
    return turn.transition.updateCallbackDone.then(() => {}, () => { apply(); });
  } catch {
    delete document.documentElement.dataset.editionTurn;
    document.documentElement.style.removeProperty('--edition-turn-canvas');
    revealCard();
    return Promise.resolve();
  }
}
