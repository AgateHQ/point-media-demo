import { publications, stories, legacyPublicationIds } from './data';
import { settleEditionTurn, turnEdition } from './editionNavigation';

export interface State {
  paid: boolean;
  balance: number;
  position: number;
  visited: Record<string, string[]>;
  reward: boolean;
  screen: 'reader' | 'complete' | 'network';
  expanded: Record<string, string[]>;
  collected: Record<string, string[]>;
  readingDays: string[];
  publication: string;
}
export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}
export type SheetKind = 'discover' | 'network' | 'wallet' | 'install' | 'collection';
const storageKey = 'the-point-demo-v3';
function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function localDay(offset: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}
function starterReadingDays() { return [-3, -2, -1].map(offset => localDateKey(localDay(offset))); }
export const fresh = (): State => ({ paid: true, balance: 100, position: 0, visited: {}, reward: false, screen: 'reader', expanded: {}, collected: {}, readingDays: starterReadingDays(), publication: 'the-scoop' });

function isStoryMap(value: unknown): value is Record<string, string[]> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && Object.values(value).every(ids => Array.isArray(ids) && ids.every(id => typeof id === 'string'));
}
function isReadingDays(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(day => typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day));
}
function restore(): State {
  try {
    const s = JSON.parse(localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey) || 'null');
    const hadReadingDays = isReadingDays(s?.readingDays);
    if (s && !hadReadingDays) s.readingDays = starterReadingDays();
    if (s && typeof s.publication === 'string') s.publication = legacyPublicationIds[s.publication] || s.publication;
    if (s && isStoryMap(s.visited) && isStoryMap(s.expanded)) {
      // Existing saves keep their reading progress; cards are earned from here on.
      s.collected = isStoryMap(s.collected) ? s.collected : {};
      for (const field of ['visited', 'expanded', 'collected']) {
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
      && isStoryMap(s.visited) && isStoryMap(s.expanded) && isReadingDays(s.readingDays)
      && ['cover', 'reader', 'complete', 'network'].includes(s.screen)
      && publications.some(p => p.id === s.publication)) {
      // Older saved editions may still point to the removed opening cover.
      if (s.screen === 'cover') {
        s.screen = 'reader';
        s.position = 0;
      }
      if (s.screen === 'network') s.screen = 'reader';
      // Keep the bonus page after reload; incomplete older states resume reading.
      if (s.screen === 'complete' && !publications.find(p => p.id === s.publication)!.storyOrder
        .every(i => s.visited[s.publication]?.includes(stories[i].id))) s.screen = 'reader';
      s.readingDays = [...new Set(s.readingDays)].sort().slice(-366);
      // Preserve the previous demo's established streak when upgrading a save
      // that is already sitting on today's completed edition.
      if (!hadReadingDays && s.screen === 'complete') s.readingDays.push(localDateKey());
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
export function pubCollected() { return demo.data.collected[demo.data.publication] || []; }
export const xpRules = { unlock: 2, fullRead: 8, editionComplete: 20 } as const;
export interface EditionXpSummary {
  unlockCount: number;
  fullReadCount: number;
  unlockXp: number;
  fullReadXp: number;
  completionXp: number;
  total: number;
}
export function editionXp(publicationId = demo.data.publication): EditionXpSummary {
  const publication = publications.find(item => item.id === publicationId);
  if (!publication) return { unlockCount: 0, fullReadCount: 0, unlockXp: 0, fullReadXp: 0, completionXp: 0, total: 0 };
  const ids = publication.storyOrder.map(index => stories[index].id);
  const expanded = new Set(demo.data.expanded[publicationId] || []);
  const collected = new Set(demo.data.collected[publicationId] || []);
  const visited = new Set(demo.data.visited[publicationId] || []);
  const unlockCount = ids.filter(id => expanded.has(id)).length;
  const fullReadCount = ids.filter(id => collected.has(id)).length;
  const unlockXp = unlockCount * xpRules.unlock;
  const fullReadXp = fullReadCount * xpRules.fullRead;
  const completionXp = ids.every(id => visited.has(id)) ? xpRules.editionComplete : 0;
  return { unlockCount, fullReadCount, unlockXp, fullReadXp, completionXp, total: unlockXp + fullReadXp + completionXp };
}
export function networkXp() { return publications.reduce((total, publication) => total + editionXp(publication.id).total, 0); }
export interface RecentReadingDay { key: string; label: string; date: string; read: boolean; today: boolean; }
function addTodayToReadingHistory() {
  const today = localDateKey();
  if (demo.data.readingDays.includes(today)) return false;
  demo.data.readingDays.push(today);
  demo.data.readingDays = [...new Set(demo.data.readingDays)].sort().slice(-366);
  return true;
}
export function readingStreak() {
  const read = new Set(demo.data.readingDays);
  const cursor = localDay(0);
  if (!read.has(localDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!read.has(localDateKey(cursor))) return 0;
  }
  let streak = 0;
  while (read.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
export function recentReadingHistory(length = 7): RecentReadingDay[] {
  const read = new Set(demo.data.readingDays);
  const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
  return Array.from({ length }, (_, index) => {
    const offset = index - length + 1;
    const day = localDay(offset);
    const key = localDateKey(day);
    return { key, label: offset === 0 ? 'Today' : weekday.format(day), date: String(day.getDate()), read: read.has(key), today: offset === 0 };
  });
}
export function halfwayProgress() {
  const edition = getStories();
  const target = Math.ceil(edition.length / 2);
  const collected = pubCollected();
  const firstHalf = edition.slice(0, target);
  const count = firstHalf.filter(story => collected.includes(story.id)).length;
  return { firstHalf, secondHalf: edition.slice(target), collected, count, target, total: edition.length, reached: count === target };
}
export function collect(id: string) {
  if (demo.data.screen !== 'reader' || demo.data.position === 4 || getStories()[storyIndex()]?.id !== id
    || !pubExpanded().includes(id) || pubCollected().includes(id)) return;
  demo.data.collected[demo.data.publication] ||= [];
  demo.data.collected[demo.data.publication].push(id);
  persist();
}
export function openStory(id: string) {
  settleEditionTurn();
  const index = getStories().findIndex(story => story.id === id);
  if (index < 0) return;
  const position = index >= 4 ? index + 1 : index;
  const direction = demo.data.screen === 'complete' || position < demo.data.position ? 'backward' : 'forward';
  const animate = !demo.sheet && (demo.data.screen !== 'reader' || position !== demo.data.position);
  return turnEdition(() => {
    demo.data.position = position;
    demo.data.screen = 'reader';
    demo.sheet = null;
    mark();
  }, direction, animate);
}
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
  settleEditionTurn();
  if (kind === 'discover') demo.discoverIndex = Math.max(0, publications.findIndex(p => p.id === demo.data.publication));
  demo.sheet = kind;
}
export function home() {
  return openStory(getStories()[0].id);
}
export function start() {
  return turnEdition(() => { demo.data.paid = true; demo.data.screen = 'reader'; mark(); }, 'forward', false);
}
export function selectPublication(id: string, close = true) {
  if (!publications.some(p => p.id === id)) return;
  // Publication discovery already has its own sheet transition.
  return turnEdition(() => {
    demo.data.publication = id;
    demo.discoverIndex = publications.findIndex(p => p.id === id);
    demo.data.position = 0;
    demo.data.screen = 'reader';
    if (close) demo.sheet = null;
    mark();
  }, 'forward', false);
}
export function move(delta: number) {
  settleEditionTurn();
  if (demo.data.screen !== 'reader') return;
  if (delta < 0 && demo.data.position === 0) return;
  let position = Math.max(0, Math.min(8, demo.data.position + delta));
  let screen: State['screen'] = 'reader';
  if (delta > 0 && demo.data.position === 8) {
    if (pubVisited().length === 8) {
      screen = 'complete';
    } else {
      const missing = getStories().findIndex(st => !pubVisited().includes(st.id));
      position = missing >= 4 ? missing + 1 : missing;
    }
  }
  if (position === demo.data.position && screen === demo.data.screen) return;
  const direction = screen === 'complete' || position > demo.data.position ? 'forward' : 'backward';
  return turnEdition(() => {
    demo.data.position = position;
    demo.data.screen = screen;
    if (screen === 'complete' && addTodayToReadingHistory()) persist();
    mark();
  }, direction, !demo.sheet);
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
  turnEdition(() => {
    demo.sheet = null;
    demo.data = fresh();
    demo.discoverIndex = 0;
    mark();
  }, 'forward', false);
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
    { name: 'navigate_demo_story', description: 'Move to the next or previous story in the automatic demo reading flow. Articles open and simulated 20p charges happen as the reader scrolls.', inputSchema: { type: 'object', properties: { direction: { type: 'string', enum: ['next', 'previous'] } }, required: ['direction'], additionalProperties: false }, annotations: { readOnlyHint: false }, execute: async (input: unknown) => {
      const value = input as { direction?: unknown };
      if (!value || !['next', 'previous'].includes(String(value.direction))) throw new Error('Direction must be next or previous');
      if (demo.data.screen !== 'reader') throw new Error('Open the edition reader first');
      await move(value.direction === 'next' ? 1 : -1);
      return { screen: demo.data.screen, position: demo.data.position, visited: pubVisited().length };
    } },
  ];
  for (const tool of tools) { try { Promise.resolve(context.registerTool(tool)).catch(() => {}); } catch { /* Optional browser API. */ } }
  return () => tools.forEach(tool => context.unregisterTool?.(tool.name));
}
