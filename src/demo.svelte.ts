import { publications, stories, nextPublicationId, legacyPublicationIds } from './data';

export interface State {
  paid: boolean;
  balance: number;
  position: number;
  visited: Record<string, string[]>;
  reward: boolean;
  screen: 'reader' | 'complete' | 'network';
  expanded: Record<string, string[]>;
  publication: string;
}
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}
export type SheetKind = 'discover' | 'network' | 'wallet' | 'install';
const storageKey = 'the-point-demo-v3';
export const fresh = (): State => ({ paid: true, balance: 100, position: 0, visited: {}, reward: false, screen: 'reader', expanded: {}, publication: 'the-scoop' });

function isStoryMap(value: unknown): value is Record<string, string[]> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && Object.values(value).every(ids => Array.isArray(ids) && ids.every(id => typeof id === 'string'));
}
function restore(): State {
  try {
    const s = JSON.parse(localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey) || 'null');
    if (s && typeof s.publication === 'string') s.publication = legacyPublicationIds[s.publication] || s.publication;
    if (s && isStoryMap(s.visited) && isStoryMap(s.expanded)) {
      for (const field of ['visited', 'expanded']) {
        for (const [oldId, newId] of Object.entries(legacyPublicationIds)) {
          if (s[field][oldId]) {
            s[field][newId] = [...new Set([...(s[field][newId] || []), ...s[field][oldId]])];
            delete s[field][oldId];
          }
        }
      }
    }
    if (s && typeof s.paid === 'boolean' && typeof s.reward === 'boolean'
      && Number.isFinite(s.balance) && Number.isInteger(s.position) && s.position >= 0 && s.position <= 8
      && isStoryMap(s.visited) && isStoryMap(s.expanded)
      && ['cover', 'reader', 'complete', 'network'].includes(s.screen)
      && publications.some(p => p.id === s.publication)) {
      // Older saved editions may still point to the removed opening cover.
      if (s.screen === 'cover') {
        s.screen = 'reader';
        s.position = 0;
      }
      if (s.screen === 'network') s.screen = 'reader';
      if (s.screen === 'complete') {
        if (new Set(s.visited[s.publication] || []).size === 8) {
          s.publication = nextPublicationId(s.publication);
          s.position = 0;
        }
        s.screen = 'reader';
      }
      return s;
    }
  } catch { /* Storage may be unavailable in a private browser session. */ }
  return fresh();
}

export const demo = $state({
  data: restore(),
  sheet: null as SheetKind | null,
  discoverIndex: 0,
  installPrompt: null as BeforeInstallPromptEvent | null,
  installed: false,
  toast: { message: '', visible: false, anchor: undefined as DOMRect | undefined },
  walletChange: { amount: '', kind: '' as '' | 'spent' | 'received' },
});
demo.discoverIndex = Math.max(0, publications.findIndex(p => p.id === demo.data.publication));

export function currentPub() { return publications.find(p => p.id === demo.data.publication)!; }
export function getStories() { return currentPub().storyOrder.map(i => stories[i]); }
export function storyIndex() { return demo.data.position > 4 ? demo.data.position - 1 : demo.data.position; }
export function pubVisited() { return demo.data.visited[demo.data.publication] || []; }
export function pubExpanded() { return demo.data.expanded[demo.data.publication] || []; }
export function persist() {
  const json = JSON.stringify(demo.data);
  try { localStorage.setItem(storageKey, json); } catch { /* Fall back to session storage. */ }
  try { sessionStorage.setItem(storageKey, json); } catch { /* Reading still works without storage. */ }
}
export function mark() {
  if (demo.data.screen === 'reader' && demo.data.position !== 4) {
    const id = getStories()[storyIndex()]?.id;
    if (id && !pubVisited().includes(id)) {
      demo.data.visited[demo.data.publication] ||= [];
      demo.data.visited[demo.data.publication].push(id);
    }
  }
  persist();
}
mark();

let toastTimer = 0;
let walletTimer = 0;
export function walletAnchor() { return document.querySelector('.wallet-button')?.getBoundingClientRect(); }
export function notify(message: string, anchor?: DOMRect) {
  window.clearTimeout(toastTimer);
  demo.toast = { message, visible: true, anchor };
  toastTimer = window.setTimeout(() => { demo.toast.visible = false; }, 3000);
}
export function showWalletChange(amount: string, kind: 'spent' | 'received') {
  window.clearTimeout(walletTimer);
  demo.walletChange = { amount, kind };
  walletTimer = window.setTimeout(() => { demo.walletChange = { amount: '', kind: '' }; }, 1250);
}
export function openSheet(kind: SheetKind) {
  if (kind === 'discover') demo.discoverIndex = Math.max(0, publications.findIndex(p => p.id === demo.data.publication));
  demo.sheet = kind;
}
export function home() {
  demo.data.screen = 'reader';
  demo.data.position = 0;
  mark();
  window.scrollTo(0, 0);
}
export function start() { demo.data.paid = true; demo.data.screen = 'reader'; mark(); }
export function selectPublication(id: string, close = true) {
  if (!publications.some(p => p.id === id)) return;
  demo.data.publication = id;
  demo.discoverIndex = publications.findIndex(p => p.id === id);
  demo.data.position = 0;
  demo.data.screen = 'reader';
  if (close) demo.sheet = null;
  mark();
}
export function move(delta: number) {
  if (demo.data.screen !== 'reader') return;
  if (delta < 0 && demo.data.position === 0) return;
  if (delta > 0 && demo.data.position === 8) {
    if (pubVisited().length === 8) {
      demo.data.publication = nextPublicationId(demo.data.publication);
      demo.data.position = 0;
    } else {
      const missing = getStories().findIndex(st => !pubVisited().includes(st.id));
      demo.data.position = missing >= 4 ? missing + 1 : missing;
    }
  } else demo.data.position = Math.max(0, Math.min(8, demo.data.position + delta));
  mark();
}
export function topup() {
  demo.data.balance += 100;
  persist();
  showWalletChange('+£1', 'received');
  notify('£1 added to your balance', walletAnchor());
}
export function ensureBalance() {
  if (demo.data.balance >= 20) return false;
  demo.data.balance += 100;
  persist();
  showWalletChange('+£1', 'received');
  notify('Demo wallet topped up automatically', walletAnchor());
  return true;
}
export function expand(id: string) {
  if (demo.data.screen !== 'reader' || demo.data.position === 4 || getStories()[storyIndex()]?.id !== id || pubExpanded().includes(id)) return;
  ensureBalance();
  demo.data.expanded[demo.data.publication] ||= [];
  demo.data.expanded[demo.data.publication].push(id);
  demo.data.balance -= 20;
  persist();
  showWalletChange('-20p', 'spent');
  notify('20p deducted · Full article unlocked', walletAnchor());
}
export function claim() {
  if (demo.data.screen !== 'reader' || demo.data.position !== 4 || demo.data.reward) return;
  demo.data.reward = true;
  demo.data.balance += 10;
  persist();
  showWalletChange('+10p', 'received');
  notify('10p added to your wallet. Nice.', walletAnchor());
}
export function reset() {
  demo.sheet = null;
  demo.data = fresh();
  demo.discoverIndex = 0;
  mark();
  notify('Fresh edition. Balance reset to £1.00.');
}
export const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const isSafari = () => isIos() && /safari/i.test(navigator.userAgent) && !/crios|fxios|edgios|opios/i.test(navigator.userAgent);
export const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
export function canInstall() { return !demo.installed && !isStandalone() && (isIos() || /android/i.test(navigator.userAgent) || Boolean(demo.installPrompt)); }
export async function install() {
  if (demo.installPrompt) {
    const prompt = demo.installPrompt;
    demo.installPrompt = null;
    await prompt.prompt();
    await prompt.userChoice;
  } else openSheet('install');
}

export function registerModelTools() {
  interface ModelContext { registerTool(tool: { name: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean }; execute: (input: unknown) => unknown }): void | Promise<void>; unregisterTool?(name: string): void; }
  const context = (document as Document & { modelContext?: ModelContext }).modelContext;
  if (!context) return () => {};
  const tools = [
    { name: 'read_demo_edition', description: 'Read the current fictional edition progress, automatically opened articles, rewards, and simulated wallet balance.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true }, execute: () => ({ ...$state.snapshot(demo.data), visited: [...pubVisited()] }) },
    { name: 'navigate_demo_story', description: 'Move to the next or previous story in the automatic demo reading flow. Articles open and simulated 20p charges happen as the reader scrolls.', inputSchema: { type: 'object', properties: { direction: { type: 'string', enum: ['next', 'previous'] } }, required: ['direction'], additionalProperties: false }, annotations: { readOnlyHint: false }, execute: (input: unknown) => {
      const value = input as { direction?: unknown };
      if (!value || !['next', 'previous'].includes(String(value.direction))) throw new Error('Direction must be next or previous');
      if (demo.data.screen !== 'reader') throw new Error('Open the edition reader first');
      move(value.direction === 'next' ? 1 : -1);
      return { screen: demo.data.screen, position: demo.data.position, visited: pubVisited().length };
    } },
  ];
  for (const tool of tools) { try { Promise.resolve(context.registerTool(tool)).catch(() => {}); } catch { /* Optional browser API. */ } }
  return () => tools.forEach(tool => context.unregisterTool?.(tool.name));
}
