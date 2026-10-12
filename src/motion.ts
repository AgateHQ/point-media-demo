export const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

export function reducedMotionPreference() {
  return window.matchMedia(reducedMotionQuery);
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia(reducedMotionQuery).matches;
}

export function motionDelay(milliseconds: number) {
  return prefersReducedMotion() ? 0 : milliseconds;
}
