import { demo, move, openSheet } from './demo.svelte';

export function readerIsAtBottom() {
  const reader = document.querySelector<HTMLElement>('.reader');
  return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8
    && (!reader || reader.scrollTop + reader.clientHeight >= reader.scrollHeight - 8);
}

export function readerGestures(node: HTMLElement) {
  type Start = { x: number; y: number; id?: number; atBottom: boolean };
  let pointer: Start | null = null;
  let touch: Start | null = null;
  let lastSwipeAt = 0;
  const canStart = (target: EventTarget | null) => !demo.sheet && target instanceof Element
    && !!target.closest('.reader') && !target.closest('button,a,input,select,textarea,dialog,.article-network-strip');
  const finish = (origin: Start, x: number, y: number) => {
    const dx = x - origin.x, dy = y - origin.y;
    const absX = Math.abs(dx), absY = Math.abs(dy);
    if (demo.data.screen !== 'reader' && demo.data.screen !== 'complete') return;
    if (absX >= Math.max(36, Math.min(56, window.innerWidth * .12)) && absX > absY * 1.12) {
      move(dx < 0 ? 1 : -1); lastSwipeAt = Date.now();
    } else if (dy < -Math.max(48, Math.min(68, window.innerHeight * .08)) && absY > absX * 1.12
      && (demo.data.screen === 'complete' || origin.atBottom)) {
      openSheet('network'); lastSwipeAt = Date.now();
    }
  };
  const down = (e: PointerEvent) => {
    if (!canStart(e.target)) return;
    pointer = { x: e.clientX, y: e.clientY, id: e.pointerId, atBottom: readerIsAtBottom() };
    try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch { /* Native scroll can cancel capture. */ }
  };
  const up = (e: PointerEvent) => {
    if (!pointer || e.pointerId !== pointer.id) return;
    const origin = pointer; pointer = null;
    finish(origin, e.clientX, e.clientY);
  };
  const pointerCancel = () => { pointer = null; };
  const touchCancel = () => { touch = null; };
  const touchStart = (e: TouchEvent) => {
    if (Date.now() - lastSwipeAt < 450 || !canStart(e.target) || e.touches.length !== 1) return;
    touch = { x: e.touches[0].clientX, y: e.touches[0].clientY, atBottom: readerIsAtBottom() };
  };
  const touchEnd = (e: TouchEvent) => {
    const origin = touch; touch = null;
    if (!origin || Date.now() - lastSwipeAt < 450) return;
    const end = e.changedTouches[0];
    if (end) finish(origin, end.clientX, end.clientY);
  };
  node.addEventListener('pointerdown', down, { passive: true });
  node.addEventListener('pointerup', up, { passive: true });
  node.addEventListener('pointercancel', pointerCancel, { passive: true });
  node.addEventListener('touchstart', touchStart, { passive: true });
  node.addEventListener('touchend', touchEnd, { passive: true });
  node.addEventListener('touchcancel', touchCancel, { passive: true });
  return { destroy() {
    node.removeEventListener('pointerdown', down); node.removeEventListener('pointerup', up);
    node.removeEventListener('pointercancel', pointerCancel); node.removeEventListener('touchstart', touchStart);
    node.removeEventListener('touchend', touchEnd); node.removeEventListener('touchcancel', touchCancel);
  } };
}
