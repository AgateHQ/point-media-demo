const storageKey = 'the-point-newsletters-v1';

function restoreSubscriptions(): string[] {
  for (const kind of ['localStorage', 'sessionStorage']) {
    try {
      const storage = kind === 'localStorage' ? localStorage : sessionStorage;
      const saved = JSON.parse(storage.getItem(storageKey) || 'null');
      if (Array.isArray(saved)) return [...new Set(saved.filter((id): id is string => typeof id === 'string'))];
    } catch { /* Try the other browser storage. */ }
  }
  return [];
}

export const newsletterState = $state({ subscriptions: restoreSubscriptions() });

function persistSubscriptions() {
  const saved = JSON.stringify(newsletterState.subscriptions);
  try { localStorage.setItem(storageKey, saved); } catch { /* Use session storage when local storage is unavailable. */ }
  try { sessionStorage.setItem(storageKey, saved); } catch { /* Keep the subscription for this visit. */ }
}

export function subscribeToNewsletter(publicationId: string) {
  if (newsletterState.subscriptions.includes(publicationId)) return;
  newsletterState.subscriptions.push(publicationId);
  persistSubscriptions();
}

export function resetNewsletters() {
  newsletterState.subscriptions = [];
  persistSubscriptions();
}
